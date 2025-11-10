/**
 * @fileoverview Authentication guard for protecting routes that require user authentication
 */

import { inject, Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { UserService } from '../services/firebase/user.service';
import { map } from 'rxjs';
import { LoginService } from '../services/app-login-service.service';

/**
 * Authentication guard function that protects routes from unauthenticated access
 * Checks if user is logged in and either allows access or redirects to login
 * @param {ActivatedRouteSnapshot} route - The activated route snapshot
 * @param {RouterStateSnapshot} state - The router state snapshot
 * @returns {Observable<boolean>} Observable that emits true if user is authenticated, false otherwise
 */
export const authGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService);
    const logIn = inject(LoginService);

    return userService.user$.pipe(
        map((user) => {
            if (user) {
                return true;
            } else {
                // trigger 'not logged in' notification
                logIn.resetState();
                logIn.verifyLogIn();
                return false;
            }
        })
    );
};
