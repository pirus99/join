/**
 * @fileoverview Notification interfaces and enums for the Join application
 */

/**
 * Enumeration of available notification types
 * @enum {string}
 */
export enum NotificationType {
    /** Success notification type */
    SUCCESS = 'success',
    /** Error notification type */
    ERROR = 'error',
    /** Warning notification type */
    WARNING = 'warning',
}

/**
 * Enumeration of available notification positions on screen
 * @enum {string}
 */
export enum NotificationPosition {
    /** Position notification at top-right of screen */
    TOP_RIGHT = 'top-right',
    /** Position notification at top-left of screen */
    TOP_LEFT = 'top-left',
    /** Position notification at bottom-left of screen */
    BOTTOM_LEFT = 'bottom-left',
    /** Position notification at bottom-right of screen */
    BOTTOM_RIGHT = 'bottom-right',
}

/**
 * Interface representing a notification in the Join application
 * @interface Notification
 */
export interface Notification {
    /** The message text to display */
    message: string;
    /** The type/style of notification */
    type: NotificationType;
    /** Where to position the notification on screen */
    position: NotificationPosition;
    /** How long to display the notification in milliseconds */
    duration: number;
}
