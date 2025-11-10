/**
 * @fileoverview delete modal.component
 */

import { Component, Input, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../interfaces/contact';
import { ContactsService } from '../services/firebase/contacts.service';
import { InitialLettersService } from '../services/get-initial-letters.service';
import { ColoredProfilePipe } from '../pipes/colored-profile.pipe';
import { ButtonComponent } from '../ui/button/button.component';
import { ContactsCommunicationService } from '../../features/contacts-page/services/contacts-communication.service';
import { TasksService } from '../services/firebase/tasks.service';
import { Task } from '../interfaces/task';
import { NotificationService } from '../services/notification.service';
import { NotificationPosition, NotificationType } from '../interfaces/notification';

@Component({
  selector: 'app-delete-modal',
  imports: [ButtonComponent, CommonModule, FormsModule, ColoredProfilePipe],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
})
export class DeleteModalComponent {
  @Input() contactToDelete!: Contact;
  @Input() deleteType: string = 'nothing';
  @Input() task!: Task;

  isOpen = false;
  slideIn = false;
  fullName = '';

  contactsService = inject(ContactsService);
  contactComService = inject(ContactsCommunicationService);
  contact = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  };

  tasksService = inject(TasksService);
  notificationService = inject(NotificationService)

  /**
   * Constructor for DeleteModalComponent.
   * 
   * @param initialLettersService - An instance of InitialLettersService.
   * @param renderer - An instance of Renderer2 used to listen for window pointerdown events.
   */
  constructor(
    public initialLettersService: InitialLettersService,
    private readonly renderer: Renderer2
  ) {
    this.renderer.listen('window', 'pointerdown', (event) => {
      const modal = document.querySelector('.modal');
      if (this.isOpen && modal && !modal.contains(event.target as Node)) {
        this.closeModal();
      }
    });
  }

  /**
   * Opens the delete modal with contact or task data.
   * 
   * @param {Contact} contactData - The contact object to display/delete in the modal.
   */
  deleteContactModal(contactData?: Contact) {
    this.deleteType = 'Contact';
    if (contactData) {
      this.contact = { ...contactData };
      this.fullName = `${contactData.firstName} ${contactData.lastName}`;
    } else if (this.contactToDelete) {
      this.contact = { ...this.contactToDelete };
      this.fullName = `${this.contact.firstName} ${this.contact.lastName}`;
    } else {
      console.error('No Contact to delete given. Modal stays closed.');
      return;
    }
    this.isOpen = true;
    setTimeout(() => {
      this.slideIn = true;
    }, 25);
  }

  /**
   * Opens the delete modal with task data.
   * 
   * @param {Task} task - The task ID to display/delete in the modal.
   */
  deleteTaskModal(task?: Task) {
    this.deleteType = 'Task';
    if (task) {
      this.task = task;
    } else if (!this.task) {
      console.error('No Contact to delete given. Modal stays closed.');
      return;
    }
    this.isOpen = true;
    setTimeout(() => {
      this.slideIn = true;
    }, 25);
  }

  /**
   * Deletes the selected contact.
   * 
   * @async
   */
  async deleteContact() {
    if (!this.contact?.id) {
      console.error('No contact to delete or missing id');
      return;
    }
    try {
      await this.contactsService.deleteContact(this.contact.id);
      this.contactComService.setContactId('');
      this.isOpen = false; // Close the modal after deletion
      this.notificationService.pushNotification('Deleted Contact successfully!', NotificationType.SUCCESS, NotificationPosition.TOP_RIGHT);
    } catch (error) {
      this.notificationService.pushNotification('Deleted Contact failed!', NotificationType.ERROR, NotificationPosition.TOP_RIGHT);
      console.error('Delete failed:', error);
    }
  }

  /**
   * Deletes the selected task.
   * 
   * @async
   */
  async deleteTask() {
    if (!this.task) {
      console.error('No task to delete or missing task id');
    }

    try {
      await this.tasksService.deleteTask(this.task.id);
      this.notificationService.pushNotification('Deleted Task successfully!', NotificationType.SUCCESS, NotificationPosition.TOP_RIGHT);
      this.isOpen = false;
    } catch (error) {
      this.notificationService.pushNotification('Deleted Task failed!', NotificationType.ERROR, NotificationPosition.TOP_RIGHT);
      console.error('Delete Failed for Task', error)
    }
  }

  /**
   * Deletes the selected contact or task.
   */
  deleteSelect() {
    if (this.deleteType === 'Contact') {
      this.deleteContact();
    } else if (this.deleteType === 'Task') {
      this.deleteTask();
    }
  }

  /**
   * Closes the delete modal.
   */
  closeModal() {
    this.slideIn = false;
    setTimeout(() => {
      this.isOpen = false;
    }, 250);
  }
}
