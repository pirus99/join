/**
 * @fileoverview User interface definition 
 */

/**
 * Interface representing a User in the Join application
 * @interface User
 */
export interface User {
  /** Unique identifier for the User */
  id: string;
  /** User's first name */
  first_name: string;
  /** User's last name */
  last_name: string;
  /** Users email address */
  email: string;
  /** Username */
  username: string;
  /** Users token */
  token: string;
}
