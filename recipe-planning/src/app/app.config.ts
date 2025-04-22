import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyB3bIsN3VGy9SB8-PxayRp1rF9GaZVP5P0",
      authDomain: "recipe-planning-5da49.firebaseapp.com",
      projectId: "recipe-planning-5da49",
      storageBucket: "recipe-planning-5da49.firebasestorage.app",
      messagingSenderId: "1089005350580",
      appId: "1:1089005350580:web:0d43cf3ae601f23f85f1e1"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};