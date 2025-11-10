/**
 * @fileoverview Contacts page component for managing contact information.
 */

import { Component, inject, ViewChild } from '@angular/core';
import { ContactsListComponent } from './components/contacts-list/contacts-list.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CommonModule } from '@angular/common';
import { AddContactModalComponent } from './components/add-contact-modal/add-contact-modal.component';

import { ContactsService } from '../../shared/services/firebase/contacts.service';
import { FormsModule } from '@angular/forms';
import { EditContactModalComponent } from './components/edit-contact-modal/edit-contact-modal.component';

/**
 * Main contacts page component with contact list and details.
 * Hosts the contacts list, details view, and the "Add contact" modal.
 * @component
 */
@Component({
    selector: 'app-contacts-page',
    imports: [
        ContactsListComponent,
        ContactDetailsComponent,
        ButtonComponent,
        CommonModule,
        AddContactModalComponent,
        FormsModule,
    ],
    templateUrl: './contacts-page.component.html',
    styleUrl: './contacts-page.component.scss',
})
export class ContactsPageComponent {
    /**
     * Temporary contact model (can be used for template bindings if needed).
     */
    contact = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    };

    /**
     * Reference to the "Add contact" modal component.
     */
    @ViewChild(AddContactModalComponent) addModal!: AddContactModalComponent;

    /**
     * Whether the details drawer/panel is open (primarily for mobile).
     */
    isDetailOpen = false;

    /**
     * Service providing access to contacts data and persistence.
     */
    contactsService: ContactsService = inject(ContactsService);

    /**
     * Creates the ContactsPageComponent.
     */
    constructor() {}

    /**
     * Closes the contact details panel.
     */
    closeDetails() {
        this.isDetailOpen = false;
    }

    /**
     * Opens the contact details panel on small screens.
     * Uses a breakpoint of 993px to decide mobile/tablet behavior.
     */
    openDetails() {
        if (window.innerWidth < 993) {
            this.isDetailOpen = true;
        }
    }

    /**
     * Opens the "Add contact" modal dialog.
     */
    openAddContactModal() {
        this.addModal.openModal();
    }
}
