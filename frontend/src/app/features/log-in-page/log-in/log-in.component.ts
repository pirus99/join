/**
 * @fileoverview Login component providing sign-in, sign-up, and guest login flows.
 */

import { Component, EventEmitter, inject, Input, Output, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { UserService } from '../../../shared/services/firebase/user.service';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../../shared/services/app-login-service.service';
import { ContactsService } from '../../../shared/services/firebase/contacts.service';
import { Contact } from '../../../shared/interfaces/contact';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationType, NotificationPosition } from '../../../shared/interfaces/notification';

@Component({
    selector: 'app-log-in',
    imports: [FormsModule, ButtonComponent, RouterLink],
    templateUrl: './log-in.component.html',
    styleUrl: './log-in.component.scss',
})
export class LogInComponent {
    /**
     * Email input model for the login form.
     */
    logInEmail: any;

    /**
     * Password input model for the login form.
     */
    logInPassword: any;

    /**
     * Current input type for the login password field ('password' or 'text').
     */
    inputType: string = 'password';

    /**
     * Controls visibility of the sign-up form (shown in place of login).
     */
    @Input() signUpShow: boolean = false;

    /**
     * Name input model for the sign-up form.
     */
    signUpName: string = '';

    /**
     * Email input model for the sign-up form.
     */
    signUpEmail: string = '';

    /**
     * First password field model for the sign-up form.
     */
    signUpPassword1: string = '';

    /**
     * Current input type for the first sign-up password field.
     */
    inputTypePW1: string = 'password';

    /**
     * Second password (confirmation) field model for the sign-up form.
     */
    signUpPassword2: string = '';

    /**
     * Current input type for the second sign-up password field.
     */
    inputTypePW2: string = 'password';

    /**
     * Emits when the sign-up dialog should be closed.
     */
    @Output() signUpClose = new EventEmitter<void>();

    /**
     * General warning flag used to indicate validation errors in the UI.
     */
    warn: boolean = false;

    /**
     * Warning flag for missing privacy policy acceptance on sign-up.
     */
    warnSignUpPrivacy: boolean = false;

    /**
     * Tracks the privacy policy checkbox state for sign-up.
     */
    privacyCheckbox: boolean = false;

    /**
     * Contact object used to create an initial contact record after sign-up.
     */
    contact: Contact = {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    };

    /**
     * Auth/user service (login, signup, guest login).
     */
    userService = inject(UserService);

    /**
     * App-level login state service (e.g., guards/navigation).
     */
    logInService = inject(LoginService);

    /**
     * Contacts persistence service.
     */
    contactsService = inject(ContactsService);

    /**
     * In-app notification/toast service.
     */
    notificationService = inject(NotificationService);

    /**
     * Angular Router for navigation after authentication.
     */
    router = inject(Router);

    /**
     * Logs in a user with provided email and password.
     * Sets a warning flag on invalid input or failed authentication.
     * @param mail User email address.
     * @param pw User password.
     */
    logIn(mail: string, pw: string) {
        if (!mail || (!pw && new FormControl('logInForm'))) {
            this.warn = true;
            return;
        }
        this.userService.login(mail, pw).subscribe({
            next: () => {
                this.router.navigate(['/summary']);
                this.logInService.verifyLogIn();
            },
            error: (error) => {
                this.warn = true;
                console.error('something went wrong', error);
            },
        });
    }

    /**
     * Closes the sign-up form.
     */
    closeSignUp() {
        this.signUpClose.emit();
    }

    /**
     * Toggles the privacy checkbox state for sign-up.
     */
    toggleCheckBox() {
        this.privacyCheckbox = !this.privacyCheckbox;
        this.warnSignUpPrivacy = this.privacyCheckbox ? false : true;
    }

    /**
     * Signs up a new user with provided email, password, and name.
     * Validates form, privacy acceptance, and matching passwords.
     * Navigates to summary on success.
     * @param form Template-driven form reference.
     */
    signUp(form: NgForm) {
        if (form.invalid || !this.privacyCheckbox || this.signUpPassword1 !== this.signUpPassword2) {
            if (!this.privacyCheckbox) {
                this.warnSignUpPrivacy = true;
            } else if (this.signUpPassword1 !== this.signUpPassword2) {
                this.warn = true;
            }
            console.error('Form Validation failed');
            return;
        }
        this.userService.signUp(this.signUpEmail, this.signUpPassword1, this.signUpName).subscribe({
            next: () => {
                this.createContact();
                this.logInService.verifyLogIn();
                this.router.navigate(['/summary']);
            },
            error: (error) => {
                console.error('Database Error', error);
            },
        });
    }

    /**
     * Creates and persists a contact record for the newly registered user.
     * Derives first/last name from the display name.
     */
    async createContact() {
        const nameParts = this.signUpName.trim().split(' ');
        this.contact.firstName = nameParts.slice(0, 1).join('');
        this.contact.lastName = nameParts.slice(1).join('');

        this.contact.email = this.signUpEmail;
        this.contact.phoneNumber = 'No phone number added yet';
        // Note: This sets id using a subscription's toString(); consider retrieving the UID directly instead.
        this.contact.id = this.userService.user$.subscribe((user) => user?.uid).toString();
        try {
            await this.contactsService.addContactToDatabase(this.contact);
            this.notificationService.pushNotification(
                'Your account was created successfully!',
                NotificationType.SUCCESS,
                NotificationPosition.TOP_RIGHT
            );
        } catch (error) {
            console.error('Error adding contact:', error);
            this.notificationService.pushNotification(
                'Error adding contact for your User Account!',
                NotificationType.ERROR,
                NotificationPosition.TOP_RIGHT
            );
        }
    }

    /**
     * Logs in using a guest account and navigates to the summary on success.
     */
    loginGuest() {
        this.userService.loginGuest().subscribe({
            next: () => {
                this.logInService.verifyLogIn();
                this.router.navigate(['/summary']);
            },
            error: (error) => {
                this.notificationService.pushNotification(
                    'Error adding Guest Account!',
                    NotificationType.ERROR,
                    NotificationPosition.TOP_RIGHT
                );
                console.error('Database Error', error);
            },
        });
    }

    /**
     * Toggles visibility of the login password field.
     */
    togglePasswordVisibility() {
        if (this.inputType === 'password') {
            this.inputType = 'text';
        } else {
            this.inputType = 'password';
        }
    }

    /**
     * Toggles visibility of the first sign-up password field.
     */
    togglePasswordVisibilityPW1() {
        if (this.inputTypePW1 === 'password') {
            this.inputTypePW1 = 'text';
        } else {
            this.inputTypePW1 = 'password';
        }
    }

    /**
     * Toggles visibility of the second sign-up password field.
     */
    togglePasswordVisibilityPW2() {
        if (this.inputTypePW2 === 'password') {
            this.inputTypePW2 = 'text';
        } else {
            this.inputTypePW2 = 'password';
        }
    }
}
