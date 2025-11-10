/**
 * @fileoverview Application configuration including Firebase setup and providers
 */

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

/**
 * Application configuration object containing all providers and services
 * Configures Firebase, routing, HTTP client, and other core services
 */
export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideHttpClient(),
        provideRouter(routes),
        provideFirestore(() => getFirestore()), provideFirebaseApp(() => 
            initializeApp({ 
                projectId: "join-6a1df", 
                appId: "1:685974552421:web:5f11617123c57f3ed12b8c", 
                storageBucket: "join-6a1df.firebasestorage.app", 
                apiKey: "AIzaSyBImEhp4RPrawZLLp6lLsVHua5qxIK0bNg", 
                authDomain: "join-6a1df.firebaseapp.com", 
                messagingSenderId: "685974552421",
            })), 
        provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
    ],
};
