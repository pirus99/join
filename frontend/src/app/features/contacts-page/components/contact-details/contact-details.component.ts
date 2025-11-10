/**
 * @fileoverview Contact details component that displays the selected contact,
 * provides edit/delete actions, loads inline SVG icons, and handles small action menu animations.
 */

import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { ContactsCommunicationService } from '../../services/contacts-communication.service';
import { ContactsService } from '../../../../shared/services/firebase/contacts.service';
import { Contact } from '../../../../shared/interfaces/contact';
import { ColoredProfilePipe } from '../../../../shared/pipes/colored-profile.pipe';
import { InitialLettersService } from '../../../../shared/services/get-initial-letters.service';
import { EditContactModalComponent } from '../edit-contact-modal/edit-contact-modal.component';
import { DeleteModalComponent } from '../../../../shared/delete-modal/delete-modal.component';
import { SVGInlineService } from '../../../../shared/services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

/**
 * Displays details for the currently selected contact and offers edit/delete actions.
 * Also loads and caches inline SVG icons for the action menu.
 * @component
 */
@Component({
    selector: 'app-contact-details',
    imports: [ColoredProfilePipe, EditContactModalComponent, DeleteModalComponent, ButtonComponent],
    templateUrl: './contact-details.component.html',
    styleUrl: './contact-details.component.scss',
    providers: [SVGInlineService],
})
export class ContactDetailsComponent implements OnInit {
    /**
     * Cache of sanitized inline SVG contents keyed by icon name.
     */
    svgContents: { [key: string]: SafeHtml } = {};

    /**
     * Communication service to receive the currently selected contact id.
     */
    contactComService = inject(ContactsCommunicationService);

    /**
     * Service providing access to contacts data.
     */
    contactsService = inject(ContactsService);

    /**
     * Latest selected contact id (naming includes $ for historical reasons; not an observable).
     */
    contactId$: string = '';

    /**
     * The contact currently displayed in the details view. Null if none selected.
     */
    currentContact?: Contact | null;

    /**
     * Whether the action menu is mounted/open.
     */
    actionMenuOpen: boolean = false;

    /**
     * Whether the action menu should play its slide/opacity animation.
     */
    animateActionMenu: boolean = false;

    /**
     * Emitted when the details panel should be closed (e.g., on mobile).
     */
    @Output() close = new EventEmitter<void>();

    /**
     * Icon definitions to load as inline SVGs.
     */
    icons = [
        { name: 'edit', src: './assets/icons/edit.svg' },
        { name: 'delete', src: './assets/icons/delete.svg' },
    ];

    /**
     * Reference to the edit contact modal component.
     */
    @ViewChild(EditContactModalComponent) editModal!: EditContactModalComponent;

    /**
     * Reference to the delete modal component.
     */
    @ViewChild(DeleteModalComponent) deleteModal!: DeleteModalComponent;

    /**
     * Service to compute initials for the profile avatar.
     */
    initialLettersService: InitialLettersService = inject(InitialLettersService);

    /**
     * Creates the component.
     * @param svgService Service to fetch inline SVG content.
     * @param sanitizer Angular DomSanitizer to trust loaded SVG safely.
     */
    constructor(private svgService: SVGInlineService, private sanitizer: DomSanitizer) {}

    /**
     * Subscribes to selected contact id changes and updates the details view.
     * Also preloads and sanitizes action menu icons.
     */
    ngOnInit(): void {
        this.contactComService.currentContactId$.subscribe((id) => {
            if (this.currentContact) {
                this.updateDetailDisplay(id, true);
                return;
            }
            this.updateDetailDisplay(id, false);
        });

        this.icons.forEach((icon) => {
            this.convertIcon(icon.name, icon.src);
        });
    }

    /**
     * Emits the close event to the parent component.
     */
    onClose() {
        this.close.emit();
    }

    /**
     * Updates the detail panel with the contact matching the provided id.
     * Optionally triggers a small transition when changing contacts.
     * @param id Contact id to display. Empty string clears the panel.
     * @param refresh If true, updates immediately without transition.
     */
    updateDetailDisplay(id: string, refresh: boolean): void {
        if (id === '') {
            this.currentContact = null;
            return;
        }
        if (refresh) {
            this.currentContact = this.contactsService.getContactById(id);
            return;
        }
        const detailsEl = document.querySelector('#contactDetails');
        if (detailsEl && this.currentContact) {
            detailsEl.classList.remove('slide-in');
            detailsEl.classList.add('fade-out');
            setTimeout(() => {
                detailsEl.classList.remove('fade-out');
                this.currentContact = this.contactsService.getContactById(id);
                detailsEl.classList.add('slide-in');
            }, 190);
        } else {
            this.currentContact = this.contactsService.getContactById(id);
            if (detailsEl) {
                detailsEl.classList.add('slide-in');
            }
        }
    }

    /**
     * Opens the action menu and starts its animation.
     */
    openActionMenu() {
        this.actionMenuOpen = true;
        setTimeout(() => {
            this.animateActionMenu = true;
        }, 10);
    }

    /**
     * Closes the action menu after its closing animation finishes.
     */
    closeActionMenu() {
        this.animateActionMenu = false;
        setTimeout(() => {
            this.actionMenuOpen = false;
        }, 300);
    }

    /**
     * Toggles the action menu open/close state.
     */
    toggleActionMenu() {
        if (!this.actionMenuOpen) {
            this.openActionMenu();
        } else {
            this.closeActionMenu();
        }
    }

    /**
     * Opens the edit modal for the current contact.
     */
    openEditModal() {
        if (this.currentContact) {
            this.editModal.openModal(this.currentContact);
        }
    }

    /**
     * Opens the delete confirmation modal for the current contact.
     */
    openDeleteModal() {
        if (this.currentContact) {
            this.deleteModal.deleteContactModal(this.currentContact);
        }
    }

    /**
     * Loads an SVG by URL, sanitizes it, and stores it under the given icon name.
     * @param iconName Key used to access the sanitized SVG content later.
     * @param iconSrc URL/path to the SVG file.
     */
    convertIcon(iconName: string, iconSrc: string): void {
        this.svgService.getInlineSVG(iconSrc).subscribe({
            next: (svg: string) => {
                this.svgContents[iconName] = this.sanitizer.bypassSecurityTrustHtml(svg);
            },
            error: (err) => console.error('SVG load error:', err),
        });
    }
}
