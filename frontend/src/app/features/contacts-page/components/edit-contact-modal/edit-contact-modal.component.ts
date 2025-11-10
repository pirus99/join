/**
 * @fileoverview Modal component to edit an existing contact.
 */

import { Component, Input, Output, EventEmitter, Renderer2, inject } from '@angular/core';
import { Contact } from '../../../../shared/interfaces/contact';
import { ContactsService } from '../../../../shared/services/firebase/contacts.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ColoredProfilePipe } from '../../../../shared/pipes/colored-profile.pipe';
import { InitialLettersService } from '../../../../shared/services/get-initial-letters.service';
import { SVGInlineService } from '../../../../shared/services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ContactsCommunicationService } from '../../services/contacts-communication.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { NotificationPosition, NotificationType } from '../../../../shared/interfaces/notification';

@Component({
    selector: 'app-edit-contact-modal',
    standalone: true,
    imports: [ButtonComponent, CommonModule, FormsModule, ColoredProfilePipe],
    templateUrl: './edit-contact-modal.component.html',
    styleUrls: ['./edit-contact-modal.component.scss'],
})
export class EditContactModalComponent {
    /**
     * Sanitized inline SVG content for the close icon.
     */
    svgContent!: SafeHtml;

    /**
     * Contact to preload into the form when the modal opens.
     */
    @Input() contactToEdit!: Contact;

    /**
     * Emits when the modal is closed.
     */
    @Output() close = new EventEmitter<void>();

    /**
     * Emits when the delete confirmation modal should be opened.
     */
    @Output() deleteModal = new EventEmitter<void>();

    /**
     * Whether the modal is currently mounted/open.
     */
    isOpen = false;

    /**
     * Whether the slide-in animation state is active.
     */
    isSlide = false;

    /**
     * Service handling contact persistence (e.g., Firebase).
     */
    contactsService = inject(ContactsService);

    /**
     * Service to display in-app notifications.
     */
    notificationService = inject(NotificationService);

    /**
     * Full name field bound to the form, used to split into first/last names.
     */
    fullName = '';

    /**
     * Path to the close icon SVG asset.
     */
    iconSrc = 'assets/icons/close.svg';

    /**
     * Working copy of the contact being edited. Set in openModal().
     */
    contact: Contact | null = null;

    /**
     * Communication service to publish the currently selected contact id.
     */
    contactComService: ContactsCommunicationService = inject(ContactsCommunicationService);

    /**
     * Creates the component and registers a global pointerdown listener
     * to close the modal when clicking outside of it.
     * @param initialLettersService Service to compute initials for the avatar.
     * @param svgService Service to fetch inline SVG content.
     * @param sanitizer Angular DomSanitizer to trust loaded SVG safely.
     * @param renderer Angular Renderer2 used to register the global event listener.
     */
    constructor(
        public initialLettersService: InitialLettersService,
        private svgService: SVGInlineService,
        private sanitizer: DomSanitizer,
        private renderer: Renderer2
    ) {
        this.renderer.listen('window', 'pointerdown', (event) => {
            const modal = document.querySelector('.modal');
            if (this.isOpen && modal && !modal.contains(event.target as Node)) {
                this.closeModal();
            }
        });
    }

    /**
     * Initializes form state and preloads the close icon as inline SVG.
     * If an input contact is provided, pre-populates the full name field.
     */
    ngOnInit() {
        if (this.contactToEdit) {
            this.fullName = `${this.contactToEdit.firstName} ${this.contactToEdit.lastName}`;
        }

        if (this.iconSrc) {
            this.svgService.getInlineSVG(this.iconSrc).subscribe({
                next: (svg: string) => {
                    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
                },
                error: (err) => console.error('SVG load error:', err),
            });
        }
    }

    /**
     * Computes initials live from the current full name input.
     * @returns Initials derived from the full name.
     */
    get liveInitials(): string {
        let [firstName = '', lastName = ''] = (this.fullName || '').split(' ');
        return String(this.initialLettersService.getInitialLetters({ firstName, lastName }));
    }

    /**
     * Opens the modal and seeds the form with the provided contact data.
     * @param contactData Contact to edit.
     */
    openModal(contactData: Contact) {
        this.contact = { ...contactData };
        this.fullName = `${contactData.firstName} ${contactData.lastName}`;
        this.isOpen = true;
        setTimeout(() => {
            this.isSlide = true;
        }, 25);
    }

    /**
     * Validates form data, splits the full name into first/last names,
     * and delegates to saveContact().
     * @param form Template-driven form reference.
     * @returns Promise that resolves when validation completes.
     */
    async checkSaveContact(form: NgForm) {
        if (!this.contact) {
            console.error('No contact loaded');
            this.notificationService.pushNotification(
                'Error loading Contact!',
                NotificationType.ERROR,
                NotificationPosition.TOP_RIGHT
            );
            return;
        }
        if (form.invalid) {
            return;
        }

        const nameParts = this.fullName.trim().split(' ');
        this.contact.firstName = nameParts[0];
        this.contact.lastName = nameParts.slice(1).join(' ');

        this.saveContact();
    }

    /**
     * Persists the current contact changes and shows a notification.
     * Also updates the shared selected contact id and closes the modal.
     * @returns Promise that resolves when the contact is updated.
     */
    async saveContact() {
        if (this.contact) {
            try {
                await this.contactsService.updateContact(this.contact, this.contact.id);
                this.closeModal();
                this.contactComService.setContactId(this.contact.id);
                this.notificationService.pushNotification(
                    'Contact updated successfully!',
                    NotificationType.SUCCESS,
                    NotificationPosition.TOP_RIGHT
                );
            } catch (error) {
                console.error('Update failed:', error);
                this.notificationService.pushNotification(
                    'Error updating Contact!',
                    NotificationType.ERROR,
                    NotificationPosition.TOP_RIGHT
                );
            }
        }
    }

    /**
     * Emits a delete request and closes the edit modal.
     */
    deleteContact() {
        this.deleteModal.emit();
        this.closeModal();
    }

    /**
     * Closes the modal with a slide-out animation.
     */
    closeModal() {
        this.isSlide = false;
        setTimeout(() => {
            this.isOpen = false;
        }, 600);
    }
}
