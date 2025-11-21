/**
 * @fileoverview Service for extracting initial letters from contact names
 */

import { Injectable } from '@angular/core';

/**
 * Service for generating initial letters from contact information
 * @injectable
 */
@Injectable({
  providedIn: 'root',
})
export class InitialLettersService {
  /**
   * Creates an instance of InitialLettersService
   */
  constructor() {}
  
  /**
   * Extracts and returns the first letters of first and last name
   * @param {any} contact - Contact object containing firstName and lastName properties
   * @returns {String} Concatenated uppercase initials (e.g., "JD" for "John Doe")
   */
  getInitialLetters(contact: any): String {
    let firstNameInitial = contact.firstName.charAt(0).toUpperCase();
    let lastNameInitial = contact.lastName.charAt(0).toUpperCase();

    return firstNameInitial + lastNameInitial;
  }
}
