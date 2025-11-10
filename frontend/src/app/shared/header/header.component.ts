/**
 * @fileoverview Header component with navigation and user profile functionality
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { LoginService } from '../services/app-login-service.service';
import { UserService } from '../services/firebase/user.service';

/**
 * Application header component with help navigation and user profile
 * @component
 */
@Component({
    selector: 'app-header',
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy {
    /**
     * Whether the header's flex menu (profile/actions) is open.
     */
    activeFlex = false;

    /**
     * Whether the "Help" navigation entry is currently active.
     */
    helpActive = false;

    /**
     * Whether a user is logged in (affects header UI).
     */
    loggedIn = false;

    /**
     * Initials derived from the current user's display name.
     */
    NameInitial: string | null = null;

    /**
     * App-level login/navigation state service.
     */
    loginService = inject(LoginService);

    /**
     * User/authentication service exposing the current user observable.
     */
    userService = inject(UserService);

    /**
     * Composite subscription container for cleanup on destroy.
     */
    private subscriptions = new Subscription();

    /**
     * Creates the Header component and subscribes to router navigation events
     * to update active nav states (e.g., Help).
     * @param router Angular Router used to listen for navigation events.
     */
    constructor(private router: Router) {
        const navEndSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.resetActives();
                const currentUrl = event.urlAfterRedirects;
                if (currentUrl.startsWith('/help')) {
                    this.helpActive = true;
                }
            });

        this.subscriptions.add(navEndSub);
    }

    /**
     * Initializes reactive state:
     * - Subscribes to login status changes.
     * - Subscribes to user changes and computes display initials.
     */
    ngOnInit() {
        const loginSub = this.loginService.actualLogin$.subscribe((isLoggedIn) => {
            this.loggedIn = isLoggedIn;
        });

        const userSub = this.userService.user$.subscribe((user) => {
            const nameArray = user?.displayName ? user.displayName.split(' ') : [];
            this.NameInitial =
                nameArray.length > 1 ? `${nameArray[0][0]}${nameArray[1][0]}` : nameArray[0]?.charAt(0) ?? null;
        });

        this.subscriptions.add(loginSub);
        this.subscriptions.add(userSub);
    }

    /**
     * Lifecycle hook: cleans up all subscriptions.
     */
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    /**
     * Resets all header navigation active flags.
     */
    resetActives() {
        this.helpActive = false;
    }

    /**
     * Toggles the visibility of the header menu (profile/actions).
     */
    toggleMenu() {
        this.activeFlex = !this.activeFlex;
    }
}
