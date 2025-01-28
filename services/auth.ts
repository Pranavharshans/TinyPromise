import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  UserCredential,
  AuthError 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserCredential;
}

export const authService = {
  // Register new user
  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Login existing user
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: userCredential
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Sign out user
  async logout(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return {
        success: true
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Convert Firebase error codes to user-friendly messages
  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register instead.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
};