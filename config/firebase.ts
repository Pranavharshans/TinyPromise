import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVjnAySP43bDBBv_cXFvXHo3CfrfDfN3k",
  authDomain: "tinypromise-cd639.firebaseapp.com",
  projectId: "tinypromise-cd639",
  storageBucket: "tinypromise-cd639.firebasestorage.app",
  messagingSenderId: "476978310673",
  appId: "1:476978310673:web:7493b1be5a7dbbdadd0bb0",
  measurementId: "G-EYNDN199DK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

export { app, auth };