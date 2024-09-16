import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() =>
        initializeApp({
          projectId: 'devremote2k',
          appId: '1:421260235007:web:42ba4978b4734d1c2a7cca',
          databaseURL: 'https://devremote2k-default-rtdb.firebaseio.com',
          storageBucket: 'devremote2k.appspot.com',
          apiKey: 'AIzaSyCytj0wRLznDyTrXUaC_R2JVHxnCuUTrHU',
          authDomain: 'devremote2k.firebaseapp.com',
          messagingSenderId: '421260235007',
          measurementId: 'G-6SG08DDZX9',
        })
      )
    ),
    importProvidersFrom(provideFirestore(() => getFirestore())),
  ],
};
