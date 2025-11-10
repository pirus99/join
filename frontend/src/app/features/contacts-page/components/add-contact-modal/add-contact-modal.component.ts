/**
 * @fileoverview Modal component for adding new contacts.
 */

import { Component, Output, EventEmitter, inject, Renderer2 } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactsService } from '../../../../shared/services/firebase/contacts.service';
import { Contact } from '../../../../shared/interfaces/contact';
import { InitialLettersService } from '../../../../shared/services/get-initial-letters.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationPosition, NotificationType } from '../../../../shared/interfaces/notification';

@Component({
    selector: 'app-add-contact-modal',
    standalone: true,
    imports: [ButtonComponent, CommonModule, FormsModule],
    templateUrl: './add-contact-modal.component.html',
    styleUrls: ['./add-contact-modal.component.scss'],
})
export class AddContactModalComponent {
    /**
     * Service to derive initials from a contact's first and last name.
     */
    initialLettersService = inject(InitialLettersService);

    /**
     * Emits when the modal is closed.
     */
    @Output() close = new EventEmitter<void>();

    /**
     * Whether the modal is currently open (mounted in the DOM).
     */
    isOpen = false;

    /**
     * Whether the slide-in animation state is active.
     */
    isSlide = false;

    /**
     * Full name typed in the form input, used to split into first and last name.
     */
    fullName = '';

    /**
     * The name displayed in the UI after form submit preview.
     */
    contactName = '';

    /**
     * Service handling persistence of contacts (e.g., Firebase).
     */
    contactsService = inject(ContactsService);

    /**
     * Service to display in-app notifications to the user.
     */
    notificationService = inject(NotificationService);

    /**
     * The contact model bound to the form inputs.
     */
    contact: Contact = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    };

    /**
     * Creates the component and registers a global pointerdown listener
     * to close the modal when the user clicks outside of it.
     * @param renderer Angular Renderer2 used to register the global event listener.
     */
    constructor(private renderer: Renderer2) {
        this.renderer.listen('window', 'pointerdown', (event) => {
            const modal = document.querySelector('.modal');
            if (this.isOpen && modal && !modal.contains(event.target as Node)) {
                this.closeModal();
            }
        });
    }

    /**
     * Opens the modal and triggers the slide-in animation.
     */
    openModal() {
        this.isOpen = true;
        setTimeout(() => {
            this.isSlide = true;
        }, 25);
    }

    /**
     * Closes the modal with a slide-out animation and clears the form afterwards.
     */
    closeModal() {
        this.isSlide = false;
        setTimeout(() => {
            this.isOpen = false;
            this.clearModalForm();
        }, 600);
    }

    /**
     * Handles the form submit event (intermediate step).
     * Stores the full name into a preview field when the form is valid.
     * @param form Angular template-driven form reference.
     */
    formSubmit(form: NgForm) {
        if (!form.valid) {
            return;
        }
        this.contactName = form.controls['fullName'].value;
    }

    /**
     * Creates a new contact using the form data.
     * Validates required fields, splits full name into first and last name,
     * persists the contact, closes the modal, and shows a notification.
     * @param form Angular template-driven form reference.
     * @returns Promise that resolves when the contact has been created.
     */
    async createContact(form: NgForm): Promise<void> {
        if (!this.fullName || !this.contact.email || !this.contact.phoneNumber) {
            console.warn('Pflichtfelder fehlen');
            return;
        }
        if (!form.valid) return;

        const nameParts = this.fullName.trim().split(' ');
        this.contact.firstName = nameParts.slice(0, 1).join('');
        this.contact.lastName = nameParts.slice(1).join('');

        try {
            await this.contactsService.addContactToDatabase(this.contact);
            this.closeModal();
            this.notificationService.pushNotification(
                'Contact added successfully!',
                NotificationType.SUCCESS,
                NotificationPosition.TOP_RIGHT
            );
        } catch (error) {
            console.error('Error adding contact!', error);
            this.notificationService.pushNotification(
                'Error adding contact!',
                NotificationType.ERROR,
                NotificationPosition.TOP_RIGHT
            );
        }
    }

    /**
     * Derives initials live from the full name input.
     * @returns Initials string computed from the current full name.
     */
    get liveInitials(): string {
        let [firstName = '', lastName = ''] = (this.fullName || '').split(' ');
        return String(this.initialLettersService.getInitialLetters({ firstName, lastName }));
    }

    /**
     * Normalizes name input by capitalizing each word and removing extra spaces.
     * @param event Input event from the name field.
     */
    onNameInput(event: Event) {
        let value = (event.target as HTMLInputElement).value;

        let parts = value.split(' ').filter((p) => p.length > 0);

        parts = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));

        this.fullName = parts.join(' ');
    }

    /**
     * Resets the modal form fields to their initial state.
     */
    clearModalForm() {
        this.fullName = '';
        this.contact = {
            id: '',
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
        };
    }
}
