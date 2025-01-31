import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthUser, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

const AUTH_USER_KEY = '@auth_user';

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistUser = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        console.log('[AuthContext] Updated user data in storage');
      } else {
        await AsyncStorage.removeItem(AUTH_USER_KEY);
        console.log('[AuthContext] Cleared user data from storage');
      }
    } catch (error) {
      console.error('[AuthContext] Error persisting user:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      try {
        // Set up Firebase auth listener first
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;

          console.log('[AuthContext] Auth state changed. User:', firebaseUser?.email);
          
          if (firebaseUser) {
            // If Firebase has a user, update storage and state
            const userData = firebaseUser as AuthUser;
            await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
            console.log('[AuthContext] User data stored in AsyncStorage');
            setUser(userData);
          } else {
            // Clear storage and state when user is null
            await AsyncStorage.removeItem(AUTH_USER_KEY);
            console.log('[AuthContext] User data cleared from AsyncStorage');
            setUser(null);
          }
          
          if (mounted) {
            setIsLoading(false);
          }
        });

        // Try to get stored user while waiting for Firebase
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedUser && mounted) {
          const userData = JSON.parse(storedUser) as AuthUser;
          console.log('[AuthContext] Restored user from storage:', userData.email);
          setUser(userData);
        }
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        // Clear any potentially corrupted data
        await AsyncStorage.removeItem(AUTH_USER_KEY);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('[AuthContext] Cleaning up auth context...');
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Debug current auth state
  useEffect(() => {
    const now = Date.now();
    console.log('[AuthContext] Auth state updated:', {
      isLoading,
      isAuthenticated: !!user,
      userEmail: user?.email,
      userVerified: user?.emailVerified,
      hasToken: !!user?.stsTokenManager?.accessToken,
      tokenExpiration: user?.stsTokenManager?.expirationTime 
        ? new Date(user.stsTokenManager.expirationTime).toISOString()
        : 'none',
      tokenValid: user?.stsTokenManager?.expirationTime 
        ? user.stsTokenManager.expirationTime > now
        : false
    });
  }, [user, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}