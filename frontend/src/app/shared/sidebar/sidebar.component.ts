/**
 * @fileoverview Sidebar component with main navigation menu
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SVGInlineService } from '../services/svg-inline.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoginService } from '../services/app-login-service.service';
import { Subscription } from 'rxjs';

/**
 * Application sidebar navigation component
 * Loads and caches inline SVG icons and reacts to login state to adjust menu items.
 * @component
 */
@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
    providers: [SVGInlineService],
})
export class SidebarComponent implements OnDestroy {
    /**
     * Cache of sanitized inline SVG contents keyed by icon name.
     */
    svgContents: { [key: string]: SafeHtml } = {};

    /**
     * Whether a user is currently logged in (affects which links are shown).
     */
    loggedIn = false;

    /**
     * Icon definitions to load as inline SVGs for the sidebar navigation.
     */
    icons = [
        { name: 'contacts', src: './assets/icons/contacts.svg' },
        { name: 'summary', src: './assets/icons/summary.svg' },
        { name: 'addTask', src: './assets/icons/add-task.svg' },
        { name: 'board', src: './assets/icons/board.svg' },
        { name: 'login', src: './assets/icons/login.svg' },
    ];

    /**
     * App-level login state service.
     */
    loginService = inject(LoginService);

    /**
     * Composite subscription container for all subscriptions created by this component.
     * Ensures proper cleanup in ngOnDestroy.
     */
    private subscriptions = new Subscription();

    /**
     * Creates the Sidebar component.
     * @param router Angular Router (reserved for potential navigations).
     * @param svgService Service to fetch inline SVG content.
     * @param sanitizer Angular DomSanitizer used to safely render loaded SVGs.
     */
    constructor(private router: Router, private svgService: SVGInlineService, private sanitizer: DomSanitizer) {}

    /**
     * Lifecycle hook: preloads and sanitizes all sidebar icons and
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
     * Adds the subscription to the composite container for cleanup.
     * @param iconName Key under which the sanitized SVG will be stored.
     * @param iconSrc URL/path to the SVG file to load.
     */
    convertIcon(iconName: string, iconSrc: string): void {
        const svgSub = this.svgService.getInlineSVG(iconSrc).subscribe({
            next: (svg: string) => {
                this.svgContents[iconName] = this.sanitizer.bypassSecurityTrustHtml(svg);
            },
            error: (err) => console.error('SVG load error:', err),
        });

        this.subscriptions.add(svgSub);
    }

    /**
     * Lifecycle hook: cleans up all subscriptions.
     */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
