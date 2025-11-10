/**
 * @fileoverview task card modal.component
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../interfaces/task';
import { Contact } from '../interfaces/contact';
import { ContactsService } from '../services/firebase/contacts.service';
import { InitialLettersService } from '../services/get-initial-letters.service';
import { ColoredProfilePipe } from '../pipes/colored-profile.pipe';
import {
  TaskCategory,
  TasksService,
  TaskPriority,
} from '../services/firebase/tasks.service';
import { SVGInlineService } from '../services/svg-inline.service';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { AddTaskComponent } from '../add-task/add-task.component';

/**
 * TaskCardModalComponent
 *
 * Displays detailed information about a single task inside a modal dialog.
 * Provides functionality to edit, delete, and manage subtasks.
 */
@Component({
  selector: 'app-task-card-modal',
  standalone: true,
  imports: [CommonModule, AddTaskComponent],
  templateUrl: './task-card-modal.component.html',
  styleUrls: ['./task-card-modal.component.scss'],
  providers: [ColoredProfilePipe, SVGInlineService],
})
export class TaskCardModalComponent implements OnInit {
  asEdit: boolean = false;
  selectedContacts: Contact[] = [];
  assignedContactsNames: string = '';

  isSlide: boolean = false;

  /**
   * Stores inline SVGs after sanitization.
   */
  svgContents: { [key: string]: SafeHtml } = {};

  /**
   * Icon definitions for modal actions.
   */
  icons = [
    { name: 'edit', src: './assets/icons/edit.svg' },
    { name: 'delete', src: './assets/icons/delete.svg' },
  ];

  /**
   * Icon paths for task priorities.
   */
  priorities = {
    low: './assets/icons/low.svg',
    medium: './assets/icons/medium.svg',
    high: './assets/icons/urgent.svg',
  };

  /**
   * The task displayed inside the modal.
   */
  @Input() task!: Task;

  /**
   * Event emitter to close the modal.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Event emitter triggered when a task is deleted.
   */
  @Output() delete = new EventEmitter<Task>();

  /**
   * Event emitter triggered when a task is edited.
   */
  @Output() edit = new EventEmitter<Task>();

  /**
   * Assigned contacts shown with initials, color and name.
   */
  assignedContacts: { initials: string; color: string; name: string }[] = [];

  // === Injected Services ===
  contactsService: ContactsService = inject(ContactsService);
  initialLetterService: InitialLettersService = inject(InitialLettersService);
  coloredProfilePipe: ColoredProfilePipe = inject(ColoredProfilePipe);
  tasksService: TasksService = inject(TasksService);
  svgService: SVGInlineService = inject(SVGInlineService);
  sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Flags used to identify task category.
   */
  taskTechnical: boolean = false;
  taskUserStory: boolean = false;
  taskCategory: string = '';

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads assigned contacts, determines task category and converts icons.
   */
  ngOnInit(): void {
    this.updateAssignedContacts();
    this.taskCategory = this.getTaskCategory();

    this.icons.forEach((icon) => {
      this.convertIcon(icon.name, icon.src);
    });
  }

  /**
   * Returns the SVG path of the current task's priority.
   * @returns {string} Path to the priority icon.
   */
  taskPriority(): string {
    if (this.task.priority === TaskPriority.LOW) return this.priorities.low;
    if (this.task.priority === TaskPriority.MEDIUM) return this.priorities.medium;
    if (this.task.priority === TaskPriority.HIGH) return this.priorities.high;
    return this.priorities.medium; // fallback
  }

  /**
   * Returns the human-readable label for the task priority.
   * @returns {string} Priority label.
   */
  getPriorityLabel(): string {
    if (this.task.priority === TaskPriority.LOW) return 'Low';
    if (this.task.priority === TaskPriority.MEDIUM) return 'Medium';
    if (this.task.priority === TaskPriority.HIGH) return 'Urgent';
    return 'Medium'; // fallback
  }

  /**
   * Updates the list of assigned contacts for this task.
   * Builds initials, color, and name for each assigned contact.
   */
  updateAssignedContacts(): void {
  this.assignedContacts = [];
  this.selectedContacts = [];

  if (!this.task || !this.task.assignedTo) return;

  for (let i = 0; i < this.task.assignedTo.length; i++) {
    const id = this.task.assignedTo[i];
    const contact: Contact | undefined = this.contactsService.getContactById(id);

    if (contact) {
      this.selectedContacts.push(contact);

      const initials: string = this.initialLetterService.getInitialLetters(contact).toString();
      const color: string = this.coloredProfilePipe.transform(contact.id);

      this.assignedContacts.push({
        initials,
        color,
        name: `${contact.firstName} ${contact.lastName}`,
      });
    }
    
  }

  this.getContactNames();
}

  /**
 * close the modal 
 * @param event - MouseEvent Klicks
 */
  onOutsideClick(event: MouseEvent) {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent && !modalContent.contains(event.target as Node)) {
      this.close.emit();
    }
  }

  /**
   * Toggles the completion state of a subtask and updates it in the database.
   * @param {number} index Index of the subtask in the list.
   */
  toggleSubtask(index: number) {
    const updatedSubtasks = [...this.task.subtasks];
    updatedSubtasks[index].done = !updatedSubtasks[index].done;

    this.tasksService.updateTask({ subtasks: updatedSubtasks }, this.task.id);

    this.task.subtasks = updatedSubtasks;
  }

  /**
   * Returns the category of the current task and sets flags accordingly.
   * @returns {string} Task category label.
   */
  getTaskCategory(): string {
    switch (this.task.category) {
      case TaskCategory.TECHNICAL_TASK:
        this.taskTechnical = true;
        this.taskUserStory = false;
        return 'Technical Task';
      case TaskCategory.USER_STORY:
        this.taskTechnical = false;
        this.taskUserStory = true;
        return 'User Story';
      default:
        this.taskTechnical = false;
        this.taskUserStory = false;
        return 'Default Task';
    }
  }

  getContactNames() {
    this.assignedContactsNames = '';
    for (let i = 0; i < this.selectedContacts.length; i++) {
      const name = `${this.selectedContacts[i].firstName} ${this.selectedContacts[i].lastName}, `;
      this.assignedContactsNames += name;
    }
  }

  /**
   * Converts an external SVG to inline HTML and sanitizes it.
   * @param {string} iconName Name to store the icon under.
   * @param {string} iconSrc Path to the SVG source file.
   */
  convertIcon(iconName: string, iconSrc: string): void {
    this.svgService.getInlineSVG(iconSrc).subscribe({
      next: (svg: string) => {
        this.svgContents[iconName] =
          this.sanitizer.bypassSecurityTrustHtml(svg);
      },
      error: (err) => console.error('SVG load error:', err),
    });
  }

  /**
   * Closes the modal by emitting the close event.
   */
  closeModal() {
    this.isSlide = false;
    setTimeout(() => {
      this.close.emit();
    }, 400);
  }

  openDeleteModal() {
    this.isSlide = false;
    setTimeout(() => {
      this.close.emit();
    }, 400);
    this.delete.emit(this.task);
  }
}
