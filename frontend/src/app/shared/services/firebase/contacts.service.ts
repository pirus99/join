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
import { GlobalConfig } from '../../../global-config';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

/**
 * Service for managing contacts using Firebase Firestore
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  /** Contacts organized by first name initial */
  contactsSubject = new BehaviorSubject<Contact[]>([]);

  contacts: { [initial: string]: Contact[] } = {};

  singleContact: Contact | undefined;

  /** Firestore instance */
  firestore: Firestore = inject(Firestore);

  /** First name property (legacy, consider removing if unused) */
  firstName: any;

  http = inject(HttpClient);

  /**
   * Creates an instance of ContactsService and subscribes to contacts
   */
  constructor() {
  }

  async getContacts() {
    const options = { headers: GlobalConfig.authHeader() };

    try {
      const response = await firstValueFrom(
        this.http.get<Contact[]>(GlobalConfig.apiUrl + GlobalConfig.apiEndpoint + 'contact/', options)
      );

      this.contactsSubject.next(response);
      this.sortContacts();
      return this.contactsSubject
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  }

  sortContacts() {
    let initial: string = '';
    let initials: string[] = [];
    let sortedContacts: { [initial: string]: Contact[] } = {};
    this.contactsSubject.value.forEach((contact) => {
      initial = contact.firstName.charAt(0).toUpperCase();
      if (!initials.includes(initial)) {
        initials.push(initial);
      }
      sortedContacts[initial] = sortedContacts[initial] || [];
      sortedContacts[initial].push(contact);
    });
    initials.sort();
    let organizedContacts: { [initial: string]: Contact[] } = {};
    for (let i = 0; i < initials.length; i++) {
      organizedContacts[initials[i]] = sortedContacts[initials[i]];
    }
    this.contacts = organizedContacts;
  }

  /**
   * Finds a contact by ID from the organized contacts object
   * @param {string} id - Contact ID to search for
   * @returns {Contact | undefined} Found contact or undefined
   */
  async getContactById(id: string) {
    const options = { headers: GlobalConfig.authHeader() };
    try {
      const response = await firstValueFrom(
        this.http.get<Contact>(GlobalConfig.apiUrl + GlobalConfig.apiEndpoint + 'contact/' + id + '/', options)
      );
      this.singleContact = response;
      return response;
    } catch (error) {
      console.error('Error fetching contact by ID:', error);
      throw error;
    }
  }

  /**
   * Deletes a contact from Firestore
   * @param {string} contactId - ID of contact to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   */
  async deleteContact(contactId: string) {
    const options = GlobalConfig.authHeader();

    try {
      await firstValueFrom(
        this.http.delete(GlobalConfig.apiUrl + GlobalConfig.apiEndpoint + 'contact/' + contactId + '/', { headers: options })
      );
      this.getContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Updates an existing contact in the Firestore database.
   * @param {object} contact - An object containing the updated contact fields.
   * @param {string} id - The unique ID of the contact to update.
   * @throws Will throw an error if the contact ID is not provided.
   * @returns {Promise<void>} A Promise that resolves when the update is complete.
   */
  async updateContact(contact: {}, id: string) {
    if (!id || contact === null) {
      throw new Error('Contact id is required');
    }
    const options = GlobalConfig.authHeader();
    try {
      await firstValueFrom(
        this.http.patch(GlobalConfig.apiUrl + GlobalConfig.apiEndpoint + 'contact/' + id + '/', contact, { headers: options })
      );
      this.getContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Adds a new contact to Firestore database
   * @param {Contact} contact - Contact object to add (ID will be auto-generated)
   * @returns {Promise<void>} Promise that resolves when contact is added
   */
  async addContactToDatabase(contact: Contact) {
    if (!contact) {
      throw new Error('Contact data is required');
    }
    const options = GlobalConfig.authHeader();
    try {
      await firstValueFrom(
        this.http.post(GlobalConfig.apiUrl + GlobalConfig.apiEndpoint + 'contact/', contact, { headers: options })
      );
      this.getContacts();
    } catch (error) {
      console.error('Error adding contact to database:', error);
      throw error;
    }
  }
}
