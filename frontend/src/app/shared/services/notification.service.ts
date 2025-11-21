/**
 * @fileoverview Notification service for managing notifications throughout the application
 */

import { Injectable } from '@angular/core';
import { Notification, NotificationPosition, NotificationType } from '../interfaces/notification';
import { BehaviorSubject } from 'rxjs';

/**
 * Service for managing and displaying notifications
 * @injectable
 */
@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    /** Default notification configuration */
    initialNotification: Notification = {
        message: '',
        type: NotificationType.SUCCESS,
        position: NotificationPosition.TOP_RIGHT,
        duration: 4000,
    };
    
    /** BehaviorSubject for current notification */
    notificationSubject = new BehaviorSubject<Notification>(this.initialNotification);
    
    /** Observable stream of notifications */
    notificationSubject$ = this.notificationSubject.asObservable();
    
    /**
     * Creates an instance of NotificationService
     */
    constructor() {}

    /**
     * Displays a new notification with specified parameters
     * @param {string} message - The message to display
     * @param {NotificationType} type - The type of notification (success, error, warning)
     * @param {NotificationPosition} position - Where to position the notification on screen
     * @param {number} duration - How long to display the notification in milliseconds (default: 4000)
     */
    pushNotification(message: string, type: NotificationType, position: NotificationPosition, duration: number = 4000) {
        const notification = { message: message, type: type, position: position, duration: duration };
        this.notificationSubject.next(notification);
    }
}
