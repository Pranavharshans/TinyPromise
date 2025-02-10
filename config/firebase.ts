import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

console.log('[Firebase] Starting Firebase initialization...');

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] Firebase initialized successfully');
} catch (error: any) {
  if (error?.code === 'app/duplicate-app') {
    console.log('[Firebase] Firebase already initialized, getting existing app');
    app = initializeApp(firebaseConfig, 'TinyPromise');
  } else {
    console.error('[Firebase] Firebase initialization error:', error);
    throw error;
  }
}

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };