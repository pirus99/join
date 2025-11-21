/**
 * @fileoverview Footer component with navigation icons and routing functionality
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SVGInlineService } from '../services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoginService } from '../services/app-login-service.service';
import { Subscription } from 'rxjs';

/**
 * Application footer component with navigation icons
 * @component
 */
@Component({
    selector: 'app-footer',
    imports: [CommonModule, RouterModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
})
export class FooterComponent {
    /**
     * Cache of sanitized inline SVG contents keyed by icon name.
     */
    svgContents: { [key: string]: SafeHtml } = {};

    /**
     * True when the "Contacts" tab is active.
     */
    contactsActive = false;

    /**
     * True when the "Summary" tab is active.
     */
    summaryActive = false;

    /**
     * True when the "Add Task" tab is active.
     */
    addTaskActive = false;

    /**
     * True when the "Board" tab is active.
     */
    boardActive = false;

    /**
     * Icon definitions to load as inline SVGs for the footer navigation.
     */
    icons = [
        { name: 'contacts', src: './assets/icons/contacts.svg' },
        { name: 'summary', src: './assets/icons/summary.svg' },
        { name: 'addTask', src: './assets/icons/add-task.svg' },
        { name: 'board', src: './assets/icons/board.svg' },
        { name: 'login', src: './assets/icons/login.svg' },
    ];

    /**
     * Whether a user is currently logged in (affects which icons/routes are shown).
     */
    loggedIn = false;

    /**
     * Composite subscription container for all subscriptions created by this component.
     * Allows centralized cleanup in ngOnDestroy (if implemented).
     */
    private subscriptions = new Subscription();

    /**
     * Creates the Footer component, subscribes to router navigation events to
     * update the active tab, and sets up services.
     * @param router Angular Router used to listen for navigation events.
     * @param svgService Service to fetch inline SVG content.
     * @param sanitizer Angular DomSanitizer used to safely render loaded SVGs.
     * @param loginService Service providing current login state.
     */
    constructor(
        private router: Router,
        private svgService: SVGInlineService,
        private sanitizer: DomSanitizer,
        private loginService: LoginService
    ) {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            const currentUrl = event.urlAfterRedirects;
            this.resetAllActives();
            if (currentUrl.startsWith('/contacts')) {
                this.contactsActive = true;
            } else if (currentUrl.startsWith('/summary')) {
                this.summaryActive = true;
            } else if (currentUrl.startsWith('/addTask')) {
                this.addTaskActive = true;
            } else if (currentUrl.startsWith('/board')) {
                this.boardActive = true;
            }
        });
    }

    /**
     * Resets all active tabs to false.
     */
    private resetAllActives() {
        this.contactsActive = false;
        this.summaryActive = false;
        this.addTaskActive = false;
        this.boardActive = false;
    }

    /**
     * Lifecycle hook: Preloads and sanitizes all footer icons and
     * subscribes to login state updates.
     */
    ngOnInit(): void {
        this.icons.forEach((icon) => {
            this.convertIcon(icon.name, icon.src);
        });

        const loginSub = this.loginService.actualLogin$.subscribe((isLoggedIn) => {
            this.loggedIn = isLoggedIn;
        });

        this.subscriptions.add(loginSub);
    }

    /**
     * Loads an SVG by URL, sanitizes it, and stores it by icon name.
     * @param iconName Key under which the sanitized SVG will be stored.
     * @param iconSrc URL/path to the SVG file to load.
     */
    convertIcon(iconName: string, iconSrc: string): void {
        this.svgService.getInlineSVG(iconSrc).subscribe({
            next: (svg: string) => {
                this.svgContents[iconName] = this.sanitizer.bypassSecurityTrustHtml(svg);
            },
            error: (err) => console.error('SVG load error:', err),
        });
    }
}
