/**
 * @fileoverview Application routing configuration defining all routes and navigation
 */

import { Routes } from '@angular/router';
import { ContactsPageComponent } from './features/contacts-page/contacts-page.component';
import { PrivacyPolicyPageComponent } from './features/privacy-policy-page/privacy-policy-page.component';
import { LegalNoticePageComponent } from './features/legal-notice-page/legal-notice-page.component';
import { HelpPageComponent } from './features/help-page/help-page.component';
import { BoardPageComponent } from './features/board-page/board-page.component';
import { AddTaskPageComponent } from './features/add-task-page/add-task-page.component';
import { SummaryComponent } from './features/summary/summary.component';
import { authGuard } from './shared/guards/auth.guard';
import { LogoutComponent } from './shared/logout/logout.component';

/**
 * Application routes configuration
 * Defines all routes, components, and authentication requirements
 */
export const routes: Routes = [
    {
        path: '',
        component: SummaryComponent,
        canActivate: [authGuard],
    },
    {
        path: 'summary',
        component: SummaryComponent,
        canActivate: [authGuard],
    },
    {
        path: 'board',
        component: BoardPageComponent,
        canActivate: [authGuard],
    },
    {
        path: 'contacts',
        component: ContactsPageComponent,
        canActivate: [authGuard],
    },
    {
        path: 'addTask',
        component: AddTaskPageComponent,
        canActivate: [authGuard],
    },
    {
        path: 'privacy',
        component: PrivacyPolicyPageComponent,
    },
    {
        path: 'legal',
        component: LegalNoticePageComponent,
    },
    {
        path: 'help',
        component: HelpPageComponent,
    },
    {
        path: 'logout',
        component: LogoutComponent,
    }
];
