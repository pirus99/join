/**
 * @fileoverview Contacts service for managing contact data using Firebase Firestore
 */

import { inject, Injectable, OnDestroy } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { Contact } from '../../interfaces/contact';

/**
 * Service for managing contacts using Firebase Firestore
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class ContactsService implements OnDestroy {
  /** Unsubscribe function for contacts listener */
  unsubContacts;

  /** Contacts organized by first name initial */
  contacts: { [initial: string]: Contact[] } = {};

  /** Firestore instance */
  firestore: Firestore = inject(Firestore);
  
  /** First name property (legacy, consider removing if unused) */
  firstName: any;

  /**
   * Creates an instance of ContactsService and subscribes to contacts
   */
  constructor() {
    this.unsubContacts = this.subContactsList();
  }
  
  /**
   * Cleanup subscriptions when service is destroyed
   */
  ngOnDestroy(): void {
    this.unsubContacts();
  }

  /**
   * Subscribes to the contacts collection and organizes them by initial
   * @returns {Function} Unsubscribe function
   */
  subContactsList() {
    return onSnapshot(this.getContactsRef(), (list) => {
      this.contacts = {};

      let initials: string[] = [];

      list.forEach((el) => {
        const tmpContact = this.setContactObject(el.data(), el.id);
        const initial: string = tmpContact.firstName.charAt(0).toUpperCase();
        if (!initials.includes(initial)) {
          initials.push(initial);
        }
      });

      initials.sort();

      initials.forEach((initial) => {
        this.contacts[initial] = [];
      });

      list.forEach((el) => {
        const contact = this.setContactObject(el.data(), el.id);
        const initial: string = contact.firstName.charAt(0).toUpperCase();

        this.contacts[initial].push(contact);
        // this.contacts.push(this.setContactObject(el.data(), el.id));
      });
    });
  }

  /**
   * Gets reference to the contacts collection in Firestore
   * @returns {CollectionReference} Reference to contacts collection
   */
  getContactsRef() {
    return collection(this.firestore, 'contacts');
  }

  /**
   * Converts Firestore document data to a Contact object
   * @param {any} obj - Firestore document data
   * @param {string} id - Document ID
   * @returns {Contact} Formatted contact object
   */
  setContactObject(obj: any, id: string): Contact {
    return {
      id: id,
      firstName: obj.firstName || '',
      lastName: obj.lastName || '',
      email: obj.email || '',
      phoneNumber: obj.phoneNumber || '',
    };
  }

  /**
   * Finds a contact by ID from the organized contacts object
   * @param {string} id - Contact ID to search for
   * @returns {Contact | undefined} Found contact or undefined
   */
  getContactById(id: string) {
    for (const [initial, contacts] of Object.entries(this.contacts)) {
      let result = contacts.find((contact) => contact.id === id);
      if (result) return result;
    }
    return undefined;
  }

  /**
   * Retrieves all contacts from Firestore
   * @returns {Promise<Contact[]>} Promise resolving to array of contacts
   */
  async getContacts() {
    let currentContacts: Contact[] = [];
    const snapshot = await getDocs(this.getContactsRef());
    snapshot.forEach((doc) => {
      currentContacts.push(this.setContactObject(doc.data(), doc.id));
    });

    return currentContacts;
  }

  /**
   * Deletes a contact from Firestore
   * @param {string} contactId - ID of contact to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   */
  async deleteContact(contactId: string) {
    await deleteDoc(doc(this.firestore, 'contacts', contactId));
  }

  /**
   * Updates an existing contact in the Firestore database.
   * @param {object} contact - An object containing the updated contact fields.
   * @param {string} id - The unique ID of the contact to update.
   * @throws Will throw an error if the contact ID is not provided.
   * @returns {Promise<void>} A Promise that resolves when the update is complete.
   */
  async updateContact(contact: {}, id: string) {
    if (!id) {
      throw new Error('Contact ID is required');
    }
    const contactRef = doc(this.firestore, 'contacts', id);
    await updateDoc(contactRef, contact);
  }

  /**
   * Adds a new contact to Firestore database
   * @param {Contact} contact - Contact object to add (ID will be auto-generated)
   * @returns {Promise<void>} Promise that resolves when contact is added
   */
  async addContactToDatabase(contact: Contact) {
    let contactWithoutId = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
    };
    await addDoc(this.getContactsRef(), contactWithoutId);
  }
}
