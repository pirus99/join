/**
 * @fileoverview User authentication service using Firebase Auth
 */

import { inject, Injectable } from '@angular/core';
import { firstValueFrom, from, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { GlobalConfig } from '../../../global-config';
import { User as AuthUser } from '../../interfaces/user';
import { NotificationService } from '../notification.service';
import { NotificationType, NotificationPosition } from '../../../shared/interfaces/notification';

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

    emailFault: boolean = false;
    credentialFault: boolean = false;

    http = inject(HttpClient);

    notify = inject(NotificationService);

    /**
     * Creates an instance of UserService and sets up authentication persistence
     */
    constructor() {
        this.user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null;
    }

    /**
     * Logs in a user with email and password
     * 
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<AuthUser>} Observable that completes when login is successful
     */
    async login(email: string, password: string): Promise<AuthUser> {
        const response = await firstValueFrom(this.http.post<AuthUser>(GlobalConfig.apiUrl + this.apiEndpoint + 'login/', { 'username': email, 'password': password })).catch(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                this.notify.pushNotification('E-Mail or Password is incorrect', NotificationType.ERROR, NotificationPosition.BOTTOM_RIGHT, 8000);
                this.credentialFault = true;
                throw new Error('Invalid credentials');
            } else if (error instanceof HttpErrorResponse && error.status === 0) {
                this.notify.pushNotification('Cannot connect to server. Please try again later.', NotificationType.ERROR, NotificationPosition.BOTTOM_RIGHT, 8000);
                throw new Error('Cannot connect to server.');
            } else {
                throw error;
            }
        });
        const token = response.token;
        sessionStorage.setItem('authToken', token);
        GlobalConfig.token = token;
        this.user = response;
        sessionStorage.setItem('user', JSON.stringify(this.user));
        console.log('Login successful', response);
        return response
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
     * @returns {Promise<AuthUser>} Promise that completes when signup is successful
     */
    async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthUser> {
        console.log('Signing up user with', email, firstName, lastName);
        const response = await firstValueFrom(this.http.post<AuthUser>(GlobalConfig.apiUrl + this.apiEndpoint + 'registration/', { first_name: firstName, last_name: lastName, email: email, password: password })).catch(error => {
            if (error instanceof HttpErrorResponse && error.status === 400) {
                this.notify.pushNotification('Email has already created an account.', NotificationType.ERROR, NotificationPosition.BOTTOM_RIGHT, 8000);
                this.emailFault = true;
                throw new Error('email has already created account.');
            } else if (error instanceof HttpErrorResponse && error.status === 0) {
                this.notify.pushNotification('Cannot connect to server. Please try again later.', NotificationType.ERROR, NotificationPosition.BOTTOM_RIGHT, 8000);
                throw new Error('Cannot connect to server.');
            } else {
                throw error;
            }
        });
        const token = response.token;
        sessionStorage.setItem('authToken', token);
        GlobalConfig.token = token;
        this.user = response;
        sessionStorage.setItem('user', JSON.stringify(this.user));
        console.log('Sign up successful', response);
        return response
    }

    /**
     * Logs in as a guest user anonymously
     * @returns {Promise<any>} Promise that resolves when guest login is successful
     */
    loginGuest() {

    }
}
