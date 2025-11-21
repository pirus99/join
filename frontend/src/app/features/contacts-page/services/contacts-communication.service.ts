/**
 * @fileoverview Contacts communication service for managing contact selection state
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing contact selection and communication between contact components
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class ContactsCommunicationService {
  /** BehaviorSubject for tracking the currently selected contact ID */
  contactId = new BehaviorSubject('');
  
  /** Observable stream for the current contact ID */
  currentContactId$ = this.contactId.asObservable();

  /**
   * Sets the currently selected contact ID
   * @param {string} value - The ID of the contact to select
   */
  setContactId(value: string) {
    this.contactId.next(value);
  }
  
  /**
   * Creates an instance of ContactsCommunicationService
   */
  constructor() {}
}
