/**
 * @fileoverview Login page component containing login forms and navigation.
 */

import { Component, Input, inject } from '@angular/core';
import { LogInComponent } from './log-in/log-in.component';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../shared/services/app-login-service.service';

/**
 * Login page wrapper component with animation support.
 * Hosts the LogInComponent and controls page-level transitions.
 * @component
 */
@Component({
    selector: 'app-log-in-page',
    imports: [LogInComponent, CommonModule, ButtonComponent, RouterLink],
    templateUrl: './log-in-page.component.html',
    styleUrl: './log-in-page.component.scss',
})
export class LogInPageComponent {
    /**
     * Whether to play the intro slide animation on page load.
     * Provided by the parent route/view.
     */
    @Input() animate: boolean = false;

    /**
     * Whether to apply a fade transition on page load.
     * Provided by the parent route/view.
     */
    @Input() fade: boolean = false;

    /**
     * Controls visibility of the sign-up form in the nested login component.
     */
    signUpShow: boolean = false;

    /**
     * App-level login/navigation service.
     */
    logInService = inject(LoginService);

    /**
     * Closes the login page and shows the router outlet (navigates away).
     */
    closeLogIn() {
        this.logInService.showRouter();
    }
}
