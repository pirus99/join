/**
 * @fileoverview User authentication service using Firebase Auth
 */

import { inject, Injectable } from '@angular/core';
import {
    Auth,
    browserSessionPersistence,
    createUserWithEmailAndPassword,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    user,
    User,
    getAuth,
    signInAnonymously
} from '@angular/fire/auth';
import { firstValueFrom, from, Observable } from 'rxjs';

/**
 * Service for user authentication and management using Firebase
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class UserService {
    /** Observable stream of the current user */
    user$: Observable<User | null>;

    /** Firebase Auth instance */
    auth = inject(Auth);

    /**
     * Creates an instance of UserService and sets up authentication persistence
     */
    constructor() {
        this.user$ = user(this.auth);
        this.auth.setPersistence(browserSessionPersistence).catch((e) => {
            console.error(e);
        });
    }

    /**
     * Logs in a user with email and password
     * Example usage:
     * this.userService.login(email, password).subscribe({
     *   next: () => {
     *     this.router.navigateByUrl('/summary');
     *   },
     *   error: (error) => {
     *     console.error("Login failed", error);
     *   }
     * })
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Observable<void>} Observable that completes when login is successful
     */
    login(email: string, password: string): Observable<void> {
        const promise = signInWithEmailAndPassword(this.auth, email, password).then((result) => {
            console.log('logged in', result.user);
        });
        return from(promise);
    }

    /**
     * Logs out the current user and clears session storage
     * @returns {Observable<void>} Observable that completes when logout is successful
     */
    logout(): Observable<void> {
        const promise = signOut(this.auth).then(() => {
            sessionStorage.clear();
        });
        return from(promise);
    }

    /**
     * Creates a new user account with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} displayName - User's display name
     * @returns {Observable<void>} Observable that completes when signup is successful
     */
    signUp(email: string, password: string, displayName: string): Observable<void> {
        const promise = createUserWithEmailAndPassword(this.auth, email, password).then(async (result) => {
            // Example
            const user = result.user;
            await updateProfile(user, { displayName })
            await result.user.reload()
            // trigger notification
            // ...
        });
        return from(promise);
    }

    /**
     * Logs in as a guest user anonymously
     * @returns {Promise<any>} Promise that resolves when guest login is successful
     */
    loginGuest() {
        const promise = signInAnonymously(this.auth).then(async (result) => {
            // Example
            const user = result.user;
            const displayName = 'Guest'
            await updateProfile(user, { displayName })
            await result.user.reload()
            // trigger notification
            // ...
        });
        return from(promise);
    }
}
