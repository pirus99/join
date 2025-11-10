/**
 * @fileoverview Login service for managing login state and animations
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './firebase/user.service';

/**
 * Service for managing login state, navigation and animations
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class LoginService {
    /** BehaviorSubject for tracking actual login status */
    actualLoginSubject = new BehaviorSubject<boolean>(false);
    /** Observable stream for actual login status */
    actualLogin$ = this.actualLoginSubject.asObservable();

    /** BehaviorSubject for tracking login page visibility */
    loginPageSubject = new BehaviorSubject<boolean>(true);
    /** Observable stream for login page visibility */
    loginPage$ = this.loginPageSubject.asObservable();

    /** BehaviorSubject for tracking animation state */
    animateSubject = new BehaviorSubject<boolean>(false);
    /** Observable stream for animation state */
    animate$ = this.animateSubject.asObservable();

    /**
     * Creates an instance of LoginService
     * @param {UserService} userService - Injected user service for authentication
     */
    constructor(private userService: UserService) {}

    /**
     * Resets the login and animation states to their default values.
     * Login Page will be shown and actual login will be set to false.
     */
    resetState(): void {
        this.actualLoginSubject.next(false);
        this.loginPageSubject.next(true);
        this.animateSubject.next(false);
    }

    /**
     * Shows the router by hiding login Page and trigger Animations
     */
    showRouter() {
        this.loginPageSubject.next(false);
        this.animateSubject.next(false);
    }

    /**
     * Verifies if the user is logged in and updates the state accordingly.
     * Subscribes to the user$ observable from UserService to get user data.
     * Updates actualLoginSubject and animateSubject based on whether a user is present.
     */
    verifyLogIn(): void {
        this.userService.user$.subscribe((user) => {
            const isLoggedIn = !!user;
            this.actualLoginSubject.next(isLoggedIn);
            this.animateSubject.next(!isLoggedIn);
        });
    }
}
