/**
 * @fileoverview Contact interface definition for the Join application
 */

/**
 * Interface representing a contact in the Join application
 * @interface Contact
 */
export interface Contact {
  /** Unique identifier for the contact */
  id: string;
  /** Contact's first name */
  firstName: string;
  /** Contact's last name */
  lastName: string;
  /** Contact's email address */
  email: string;
  /** Contact's phone number */
  phoneNumber: string;
}
