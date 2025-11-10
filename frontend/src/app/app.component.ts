/**
 * @fileoverview Main application component handling login flow and navigation
 */

import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ContactsService } from './shared/services/firebase/contacts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LogInPageComponent } from './features/log-in-page/log-in-page.component';
import { UserService } from './shared/services/firebase/user.service';
import { NotificationOutletComponent } from './shared/notification-outlet/notification-outlet/notification-outlet.component';
import { LoginService } from './shared/services/app-login-service.service';
import { Subscription } from 'rxjs';

/**
 * Root component of the Join application
 * Manages login state, navigation, and application-wide layout
 * @component
 */
@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
        CommonModule,
        FormsModule,
        HeaderComponent,
        SidebarComponent,
        FooterComponent,
        LogInPageComponent,
        NotificationOutletComponent,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
    /** Application title */
    title = 'join-mmc';

    /** Injected contacts service */
    contactsService: ContactsService = inject(ContactsService);
    
    /** Injected router service */
    router: Router = inject(Router);
    
    /** Injected login service */
    private LoginService: LoginService = inject(LoginService);

    /** Controls router visibility */
    showRouter: boolean = false;
    
    /** Controls login page display */
    loginPage: boolean = true;
    
    /** Tracks actual login status */
    actualLogin: boolean = false;
    
    /** Controls animation state */
    animate: boolean = false;
    
    /** Controls fade effect */
    fade: boolean = false;
    
    /** General show/hide control */
    show: boolean = false;

    /** Manages all component subscriptions */
    private subscriptions = new Subscription();

    /**
     * Component initialization
     * Verifies login state and sets up animation
     */
    ngOnInit() {
        this.LoginService.verifyLogIn();

        const loginPageSub = this.LoginService.loginPage$.subscribe((val) => (this.loginPage = val));
        this.subscriptions.add(loginPageSub);

        this.animateLogIn();
    }

    /**
     * Sets up login animation flow with proper timing
     * Manages transitions between login page and main application
     */
    animateLogIn() {
        setTimeout(() => {
            const animateSub = this.LoginService.animate$.subscribe((val) => {
                if (val) {
                    this.fade = false;
                    this.showRouter = false;
                    setTimeout(() => {
                        this.LoginService.loginPageSubject.next(true);
                        this.animate = true;
                    }, 300);
                } else {
                    this.fade = true;
                    this.animate = false;
                    this.showRouter = true;
                    setTimeout(() => {
                        this.show = true;
                        this.LoginService.loginPageSubject.next(false);
                    }, 280);
                }
            });
            this.subscriptions.add(animateSub);
        }, 500);
    }

    /**
     * Component cleanup
     * Unsubscribes from all active subscriptions
     */
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
