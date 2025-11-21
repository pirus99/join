/**
 * @fileoverview Notification outlet component for displaying system notifications
 */

import { Component } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationPosition } from '../../interfaces/notification';

/**
 * Component for displaying notifications in various positions on the screen
 * @component
 */
@Component({
    selector: 'notification-outlet',
    imports: [],
    templateUrl: './notification-outlet.component.html',
    styleUrl: './notification-outlet.component.scss',
})
export class NotificationOutletComponent {
    /**
     * Stack of active notification DOM elements currently displayed.
     * Used to position new notifications and rearrange remaining ones on removal.
     */
    private notifications: HTMLElement[] = [];

    /**
     * Subscription reference for the notification stream.
     * Unsubscribed in ngOnDestroy to avoid memory leaks.
     */
    notificationListener;

    /**
     * Subscribes to the NotificationService stream and renders incoming notifications.
     * Ignores empty messages.
     * @param notificationService Service emitting notifications to display.
     */
    constructor(private notificationService: NotificationService) {
        this.notificationListener = this.notificationService.notificationSubject$.subscribe((data) => {
            if (data.message === '') return;
            this.addNotification(data);
        });
    }

    /**
     * Renders a notification DOM element, positions it according to the chosen corner,
     * applies fade-in/out timing via CSS variables, and removes it after its duration.
     * Also triggers a layout update to keep spacing consistent for remaining notifications.
     * @param notificationData Notification payload including message, type, position, and duration.
     */
    addNotification(notificationData: Notification) {
        const { message, type, position, duration } = notificationData;
        const fadeInDuration = duration * 0.1;
        const fadeOutDuration = duration * 0.2;
        const visibleDuration = duration - fadeInDuration - fadeOutDuration;

        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.textContent = message;
        notification.setAttribute('data-position', position);
        notification.style.setProperty('--fade-in-duration', `${fadeInDuration}ms`);
        notification.style.setProperty('--fade-out-duration', `${fadeOutDuration}ms`);
        notification.style.setProperty('--fade-out-delay', `${visibleDuration + fadeInDuration}ms`);

        document.body.appendChild(notification);
        this.notifications.push(notification);

        switch (position) {
            case NotificationPosition.TOP_RIGHT:
                notification.style.top = `${20 + (this.notifications.length - 1) * 50}px`;
                notification.style.right = '20px';
                break;
            case NotificationPosition.TOP_LEFT:
                notification.style.top = `${20 + (this.notifications.length - 1) * 60}px`;
                notification.style.left = '20px';
                break;
            case NotificationPosition.BOTTOM_RIGHT:
                notification.style.bottom = `${20 + (this.notifications.length - 1) * 60}px`;
                notification.style.right = '20px';
                break;
            case NotificationPosition.BOTTOM_LEFT:
                notification.style.bottom = `${20 + (this.notifications.length - 1) * 60}px`;
                notification.style.left = '20px';
                break;
        }

        setTimeout(() => {
            notification.remove();
            this.notifications.splice(this.notifications.indexOf(notification), 1);
            this.rearangeNotifications();
        }, duration);
    }

    /**
     * Recomputes and applies the offset for each remaining notification
     * to keep the vertical spacing consistent after one is removed.
     * Positions are adjusted based on their stored corner (data-position).
     */
    private rearangeNotifications() {
        this.notifications.forEach((notification, index) => {
            const position = notification.getAttribute('data-position');
            switch (position) {
                case NotificationPosition.TOP_RIGHT:
                    notification.style.top = `${20 + index * 60}px`;
                    notification.style.right = '20px';
                    notification.style.left = '';
                    notification.style.bottom = '';
                    break;
                case NotificationPosition.TOP_LEFT:
                    notification.style.top = `${20 + index * 60}px`;
                    notification.style.left = '20px';
                    notification.style.right = '';
                    notification.style.bottom = '';
                    break;
                case NotificationPosition.BOTTOM_RIGHT:
                    notification.style.bottom = `${20 + index * 60}px`;
                    notification.style.right = '20px';
                    notification.style.left = '';
                    notification.style.top = '';
                    break;
                case NotificationPosition.BOTTOM_LEFT:
                    notification.style.bottom = `${20 + index * 60}px`;
                    notification.style.left = '20px';
                    notification.style.right = '';
                    notification.style.top = '';
                    break;
            }
        });
    }

    /**
     * Lifecycle hook: unsubscribes from the notification stream to prevent memory leaks.
     */
    ngOnDestroy() {
        this.notificationListener.unsubscribe();
    }
}
