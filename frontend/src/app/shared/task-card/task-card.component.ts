/**
 * @fileoverview Task card component that shows a compact task summary,
 * assignees, category, priority icon, and subtask progress, and emits open events.
 */

import { Component, inject, Input, OnInit, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../interfaces/task';
import { TaskCategory, TaskPriority } from '../services/firebase/tasks.service';
import { Contact } from '../interfaces/contact';
import { ContactsService } from '../services/firebase/contacts.service';
import { InitialLettersService } from '../services/get-initial-letters.service';
import { ColoredProfilePipe } from '../pipes/colored-profile.pipe';
import { TruncateStringPipe } from '../pipes/truncate-string.pipe';
import { TaskComService } from '../services/task-communication/task-com.service';

@Component({
    selector: 'app-task-card',
    standalone: true,
    imports: [CommonModule, TruncateStringPipe],
    templateUrl: './task-card.component.html',
    styleUrls: ['./task-card.component.scss'],
    providers: [ColoredProfilePipe, TruncateStringPipe],
})
export class TaskCardComponent implements OnInit {
    /**
     * Task data to render inside the card.
     */
    @Input() task!: Task;

    /**
     * Emits when the card should be opened (e.g., to show a modal).
     */
    @Output() open = new EventEmitter<Task>();

    /**
     * Priority icon asset paths keyed by logical priority.
     */
    priorities = {
        low: './assets/icons/low.svg',
        medium: './assets/icons/medium.svg',
        high: './assets/icons/urgent.svg',
    };

    /**
     * True if the task category is "Technical Task".
     */
    taskTechnical: boolean = false;

    /**
     * True if the task category is "User Story".
     */
    taskUserStory: boolean = false;

    /**
     * Human-readable task category label.
     */
    taskCategory: string = '';

    /**
     * List of assignee initials and their avatar color used by the template.
     */
    assignedInitials: { initials: String; color: String }[] = [];

    /**
     * Contacts lookup service (for assignee names).
     */
    contactsService: ContactsService = inject(ContactsService);

    /**
     * Service to compute initials from a contact model.
     */
    initialLetterService: InitialLettersService = inject(InitialLettersService);

    /**
     * Pipe used to compute a stable color from a contact id.
     */
    coloredProfilePipe: ColoredProfilePipe = inject(ColoredProfilePipe);

    /**
     * Service notifying when tasks change elsewhere (to refresh view state).
     */
    taskComService: TaskComService = inject(TaskComService);

    /**
     * Creates the component.
     */
    constructor() {}

    /**
     * Initializes derived view state (category label/flags, assignee initials)
     * and subscribes to task change events to keep the card up to date.
     */
    ngOnInit(): void {
        this.taskCategory = this.getTaskCategory();
        this.updateAssignedInitials();
        this.taskComService.taskChanged$.subscribe((val) => {
            this.taskCategory = this.getTaskCategory();
            this.updateAssignedInitials();
        });
    }

    /**
     * Emits the open event with the current task.
     */
    openModal() {
        this.open.emit(this.task);
    }

    /**
     * Builds the list of assignee initials and colors for display.
     * Safely handles missing task or empty assignees array.
     */
    updateAssignedInitials(): void {
        this.assignedInitials = [];

        if (!this.task || !this.task.assignedTo) {
            return;
        }

        for (let i = 0; i < this.task.assignedTo.length; i++) {
            const id = this.task.assignedTo[i];
            const contact: Contact | undefined = this.contactsService.getContactById(id);

            if (contact) {
                const initials: String = this.initialLetterService.getInitialLetters(contact);
                const color: String = this.coloredProfilePipe.transform(contact.id);
                this.assignedInitials.push({ initials: initials, color: color });
            } else {
                this.assignedInitials.push({ initials: '??', color: '#999' });
            }
        }
    }

    /**
     * Returns the icon path matching the task's priority.
     * @returns Priority icon asset path.
     */
    taskPriority(): string {
        if (this.task.priority == TaskPriority.LOW) return this.priorities.low;
        if (this.task.priority == TaskPriority.MEDIUM) return this.priorities.medium;
        if (this.task.priority == TaskPriority.HIGH) return this.priorities.high;
        return this.priorities.medium;
    }

    /**
     * Counts completed subtasks for progress display.
     * @returns Number of done subtasks.
     */
    subtasksDone(): number {
        let count = 0;
        if (!this.task || !this.task.subtasks) return 0;
        for (let i = 0; i < this.task.subtasks.length; i++) {
            if (this.task.subtasks[i].done) count++;
        }
        return count;
    }

    /**
     * Returns total number of subtasks.
     * @returns Subtasks total count.
     */
    subtasksTotal(): number {
        if (!this.task || !this.task.subtasks) return 0;
        return this.task.subtasks.length;
    }

    /**
     * Derives and sets category flags and returns the human-readable label.
     * @returns Category label string.
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
}
