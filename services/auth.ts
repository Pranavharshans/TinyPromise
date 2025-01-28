import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  EmailAuthProvider,
  UserCredential,
  AuthError 
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserCredential;
  needsVerification?: boolean;
}

export const authService = {
  // Register new user
  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      return {
        success: true,
        user: userCredential,
        needsVerification: true
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
      
      // Check if email is verified
      if (userCredential.user && !userCredential.user.emailVerified) {
        return {
          success: true,
          user: userCredential,
          needsVerification: true
        };
      }

      return {
        success: true,
        user: userCredential,
        needsVerification: false
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

  // Resend verification email
  async resendVerification(): Promise<AuthResponse> {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return {
          success: true
        };
      }
      return {
        success: false,
        error: 'No user is currently signed in'
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
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
};