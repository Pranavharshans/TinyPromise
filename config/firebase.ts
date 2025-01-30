import { initializeApp, FirebaseApp, FirebaseError } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

console.log('[Firebase] Initializing Firebase...');

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Auth
  auth = getAuth(app);

  // Initialize Firestore
  db = getFirestore(app);

  console.log('[Firebase] Firebase initialized with Firestore');
} catch (error) {
  const firebaseError = error as FirebaseError;
  
  if (firebaseError.code === 'auth/already-initialized') {
    console.log('[Firebase] Auth already initialized, using existing instance');
    app = initializeApp(firebaseConfig);
    auth = getAuth();
    db = getFirestore(app);
  } else {
    console.error('[Firebase] Initialization error:', error);
    throw error;
  }
}

export { app, auth, db };