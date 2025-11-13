/**
 * @fileoverview User authentication service using Firebase Auth
 */

import { inject, Injectable } from '@angular/core';
import { firstValueFrom, from, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GlobalConfig } from '../../../global-config';
import { User as AuthUser } from '../../interfaces/user';

/**
 * Service for user authentication and management using Firebase
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class UserService {
    /** Observable stream of the current user */
    user: AuthUser | null = null;

    apiEndpoint: string = 'api/v1/auth/';
    loginEndpoint: string = 'login/'
    registerEndpoint: string = 'register/'

    http = inject(HttpClient);

    /**
     * Creates an instance of UserService and sets up authentication persistence
     */
    constructor() {
        this.user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null;
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
     * @returns {Promise<AuthUser>} Observable that completes when login is successful
     */
    async login(email: string, password: string): Promise<AuthUser> {
        try {
            const response = await firstValueFrom(this.http.post<AuthUser>(GlobalConfig.apiUrl + this.apiEndpoint + 'login/', { 'username': email, 'password': password }));
            const token = response.token;
            const id = response.id;
            sessionStorage.setItem('authToken', token);
            GlobalConfig.token = token;
            this.user = response;
            sessionStorage.setItem('user', JSON.stringify(this.user));
            console.log('Login successful', response);
            return response
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }    
    }

    /**
     * Logs out the current user and clears session storage
     */
    logout(): void {
        sessionStorage.clear();
        GlobalConfig.token = null;
    }

    /**
     * Creates a new user account with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {string} displayName - User's display name
     * @returns {Observable<void>} Observable that completes when signup is successful
     */
    async signUp(email: string, password: string, firstName: string, lastName: string) {
        try {
            console.log('Signing up user with', email, firstName, lastName);
            const response = await firstValueFrom(this.http.post<AuthUser>(GlobalConfig.apiUrl + this.apiEndpoint + 'registration/', { first_name: firstName, last_name: lastName, email: email, password: password }));
            const token = response.token;
            const id = response.id;
            sessionStorage.setItem('authToken', token);
            GlobalConfig.token = token;
            this.user = response;
            sessionStorage.setItem('user', JSON.stringify(this.user));
            console.log('Sign up successful', response);
            return response
        } catch (error) {
            console.error('Sign up failed', error);
            throw error;
        } 
    }

    /**
     * Logs in as a guest user anonymously
     * @returns {Promise<any>} Promise that resolves when guest login is successful
     */
    loginGuest() {
        
    }
}
