/**
 * @fileoverview assign contact input.component
 */

import {
  Component,
  inject,
  Renderer2,
  Output,
  Input,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../services/firebase/contacts.service';
import { Contact } from '../../interfaces/contact';
import { CommonModule } from '@angular/common';
import { ColoredProfilePipe } from '../../pipes/colored-profile.pipe';
import { InitialLettersService } from '../../services/get-initial-letters.service';

@Component({
  selector: 'app-assign-contact-input',
  imports: [FormsModule, CommonModule, ColoredProfilePipe],
  templateUrl: './assign-contact-input.component.html',
  styleUrl: './assign-contact-input.component.scss',
})
export class AssignContactInputComponent {
  @Input() preview: boolean = false;
  @Input() selectedContactsArray: Contact[] = [];

  @Input() taskAssignInput: any;
  contacts: Contact[] = [];
  @Output() selectedContacts: EventEmitter<Contact[]> = new EventEmitter<
    Contact[]
  >();
  searchArray: [] | any = [];
  filteredContacts: Contact[] = [];

  show = false;
  dNone: boolean = true;

  constructor(private renderer: Renderer2) {
    this.renderer.listen('window', 'pointerdown', (event) => {
      const wrapper = document.querySelector('#assignWrapper');
      if (this.show && wrapper && !wrapper.contains(event.target as Node)) {
        this.visibleFalse();
      }
    });
  }

  private contactsService: ContactsService = inject(ContactsService);
  public initialLettersService: InitialLettersService = inject(
    InitialLettersService
  );

  ngAfterViewInit() {
    this.loadContacts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reset']?.currentValue === true) {
      this.performReset();
    }
  }

  async loadContacts() {
    this.contacts = await this.contactsService.getContacts();
  }

  cleanupValue(searchInputValue?: string) {
    let searchValue: string | undefined;
    if (searchInputValue?.includes(', ')) {
      searchValue = searchInputValue?.substring(
        searchInputValue?.lastIndexOf(', ') + 2
      );
    }
    if (searchInputValue?.includes(',') || searchInputValue?.includes(', ') && searchInputValue?.includes(',')) {
      searchValue = searchInputValue?.substring(
        searchInputValue?.lastIndexOf(',') + 2
      );
    } 
    if (!searchInputValue?.includes(', ') && !searchInputValue?.includes(',')) {
      searchValue = searchInputValue?.replace(/,\s*$/, '');
    }
    return searchValue;
  }

  filterContacts(searchInputValue?: string) {
    let searchValue = this.cleanupValue(searchInputValue);

    if (!searchValue || searchValue.length < 1) {
      this.searchArray = this.displayAllContacts();
      return this.searchArray;
    }
    this.searchArray = this.displaySearchContacts(searchValue);

    return this.searchArray;
  }

  displayAllContacts() {
    this.searchArray = this.contacts.slice().sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return this.searchArray
  }

  displaySearchContacts(searchValue: string) {
    this.filteredContacts = this.contacts
      .filter((contact) => {
        const fullName =
          `${contact.firstName} ${contact.lastName}`.toLowerCase();
        return fullName.includes(searchValue.toLowerCase());
      })
      .sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

    return this.filteredContacts;
  }

  toggleContact(contact: Contact) {
    this.toggleContactStyle(contact);
    this.toggleContactSelection(contact);
  }

  toggleContactStyle(contact: Contact) {
    document
      .getElementById(`contactCard${contact.id}`)
      ?.classList.toggle('active');
    document
      .getElementById(`contactSelectBox${contact.id}`)
      ?.classList.toggle('active');
    document
      .getElementById(`contactSelectCheckWrap${contact.id}`)
      ?.classList.toggle('active');
  }

  setContactStyle(contact: Contact) {
    document
      .getElementById(`contactCard${contact.id}`)
      ?.classList.add('active');
    document
      .getElementById(`contactSelectBox${contact.id}`)
      ?.classList.add('active');
    document
      .getElementById(`contactSelectCheckWrap${contact.id}`)
      ?.classList.add('active');
  }

  removeContactStyle(contact: Contact) {
    document
      .getElementById(`contactCard${contact.id}`)
      ?.classList.remove('active');
    document
      .getElementById(`contactSelectBox${contact.id}`)
      ?.classList.remove('active');
    document
      .getElementById(`contactSelectCheckWrap${contact.id}`)
      ?.classList.remove('active');
  }

  toggleContactSelection(contact: Contact) {
    const index = this.selectedContactsArray.findIndex(
      (c: Contact) => c.id === contact.id
    );
    if (index > -1) {
      this.selectedContactsArray.splice(index, 1);
      this.taskAssignInput = this.selectedContactsArray
        .map((c: Contact) => c.firstName + ' ' + c.lastName + ',')
        .join(' ');
    } else {
      this.selectedContactsArray.push(contact);
      this.taskAssignInput = this.selectedContactsArray
        .map((c: Contact) => c.firstName + ' ' + c.lastName + ',')
        .join(' ');
    }
    this.selectedContacts.emit(this.selectedContactsArray);
  }

  toggleVisibility() {
    this.show ? this.visibleFalse() : this.visibleTrue();
  }

  visibleTrue() {
    this.dNone = false;
    setTimeout(() => {
      this.show = true;
    }, 50);
  }

  visibleFalse() {
    this.show = false;
    setTimeout(() => {
      this.dNone = true;
    }, 300);
  }

  performReset() {
    for (const contact of this.selectedContactsArray) {
      this.removeContactStyle(contact);
    }
    this.selectedContactsArray = [];
    this.taskAssignInput = null;
  }
}
