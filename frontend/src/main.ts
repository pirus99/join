/**
 * @fileoverview Main entry point for the Angular Join application
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Bootstrap the Angular application with the main AppComponent and configuration
 * Handles any bootstrap errors by logging them to console
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
