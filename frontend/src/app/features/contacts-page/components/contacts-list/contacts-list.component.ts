/**
 * @fileoverview Contacts list component that renders and groups contacts,
 * handles selection, and opens the "Add contact" modal.
 */

import { Component, EventEmitter, inject, OnChanges, OnInit, ViewChild, Output, SimpleChanges } from '@angular/core';
import { ContactsService } from '../../../../shared/services/firebase/contacts.service';
import { ContactsCommunicationService } from '../../services/contacts-communication.service';
import { ObjectToArrayPipe } from '../../../../shared/pipes/object-to-array.pipe';
import { ColoredProfilePipe } from '../../../../shared/pipes/colored-profile.pipe';
import { InitialLettersService } from '../../../../shared/services/get-initial-letters.service';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { AddContactModalComponent } from '../add-contact-modal/add-contact-modal.component';

@Component({
    selector: 'app-contacts-list',
    imports: [ObjectToArrayPipe, ColoredProfilePipe, ButtonComponent, AddContactModalComponent],
    templateUrl: './contacts-list.component.html',
    styleUrl: './contacts-list.component.scss',
})
export class ContactsListComponent {
    /**
     * Temporary contact model (used by UI bindings/templates if needed).
     */
    contact = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    };

    /**
     * Emits when a contact is selected from the list (e.g., to open details on mobile).
     */
    @Output() selectContact = new EventEmitter<void>();

    /**
     * Reference to the "Add contact" modal component.
     */
    @ViewChild(AddContactModalComponent) addModal!: AddContactModalComponent;

    /**
     * ID of the currently active/selected contact in the list.
     */
    activeContactId: string | null = null;

    /**
     * Service to derive initials for avatar placeholders.
     */
    initialLetterService: InitialLettersService = inject(InitialLettersService);

    /**
     * Creates the component.
     */
    constructor() {}

    /**
     * Dictionary of contacts grouped by their starting letter.
     * Key: uppercase letter; Value: array/list of contacts.
     */
    groupedContacts: any = {};

    /**
     * Service providing access to contacts data and persistence.
     */
    contactsService: ContactsService = inject(ContactsService);

    /**
     * Communication service used to broadcast the selected contact ID to other components.
     */
    contactsComService: ContactsCommunicationService = inject(ContactsCommunicationService);

    /**
     * Sets the active contact, publishes its ID through the communication service,
     * and emits a selection event for parent components.
     * @param id Selected contact ID.
     */
    openContactDetails(id: string) {
        this.activeContactId = id;
        this.contactsComService.setContactId(id);
        this.selectContact.emit();
    }

    /**
     * Opens the "Add contact" modal dialog.
     */
    openAddContactModal() {
        this.addModal.openModal();
    }
}
