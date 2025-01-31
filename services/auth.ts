import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  UserCredential,
  AuthError
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthUser } from '../types/auth';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserCredential;
  needsVerification?: boolean;
}

export const authService = {
  // Register new user
  async register(email: string, password: string): Promise<AuthResponse> {
    console.log('[AuthService] Attempting to register user:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        console.log('[AuthService] Verification email sent to:', email);
      }

      return {
        success: true,
        user: userCredential,
        needsVerification: true
      };
    } catch (error) {
      console.error('[AuthService] Registration error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Login existing user
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('[AuthService] Attempting to login user:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user && !userCredential.user.emailVerified) {
        console.log('[AuthService] User needs verification:', email);
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
      console.error('[AuthService] Login error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Sign out user
  async logout(): Promise<AuthResponse> {
    console.log('[AuthService] Attempting to logout user');
    try {
      await signOut(auth);
      console.log('[AuthService] User logged out');
      return {
        success: true
      };
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code)
      };
    }
  },

  // Resend verification email
  async resendVerification(): Promise<AuthResponse> {
    console.log('[AuthService] Attempting to resend verification email');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        console.log('[AuthService] Verification email sent');
        return {
          success: true
        };
      }
      console.log('[AuthService] No user to send verification to');
      return {
        success: false,
        error: 'No user is currently signed in'
      };
    } catch (error) {
      console.error('[AuthService] Verification email error:', error);
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