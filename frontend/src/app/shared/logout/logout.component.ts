/**
 * @fileoverview Logout component handling user logout functionality
 */

import { Component, inject, OnDestroy } from '@angular/core';
import { UserService } from '../services/firebase/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/app-login-service.service';
import { NotificationService } from '../services/notification.service';
import { NotificationPosition, NotificationType } from '../interfaces/notification';
import { Subscription } from 'rxjs';

/**
 * Component handling user logout process and navigation
 * @component
 */
@Component({
    selector: 'app-logout',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './logout.component.html',
    styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnDestroy {
    /**
     * Auth/user service used to perform the logout action.
     */
    private userService = inject(UserService);

    /**
     * App-level login state service to reset and verify state after logout.
     */
    private loginService = inject(LoginService);

    /**
     * In-app notification service to inform the user about logout status.
     */
    private notificationService = inject(NotificationService);

    /**
     * Angular Router used for navigation after logout.
     */
    private router = inject(Router);

    /**
     * Subscription to the logout observable for proper cleanup.
     */
    private logoutSubscription?: Subscription;

    /**
     * Flag indicating whether the user has been logged out successfully.
     */
    loggedOut: boolean = false;

    /**
     * Initiates the logout flow:
     * - Navigates to the root route
     * - Calls the user service logout
     * - Resets and verifies login state
     * - Shows a success notification
     */
    ngOnInit(): void {
        this.router.navigateByUrl('/');
        this.logoutSubscription = this.userService.logout().subscribe({
            next: () => {
                this.loggedOut = true;
                this.loginService.resetState();
                this.loginService.verifyLogIn();
                this.notificationService.pushNotification(
                    'Successfully logged out!',
                    NotificationType.SUCCESS,
                    NotificationPosition.BOTTOM_RIGHT
                );
            },
        });
    }

    /**
     * Cleans up subscriptions on component destruction.
     * @returns void
     */
    ngOnDestroy(): void {
        this.logoutSubscription?.unsubscribe();
    }
}
