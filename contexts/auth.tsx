import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthUser, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

const AUTH_USER_KEY = '@auth_user';

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to handle auth state
  useEffect(() => {
    let mounted = true;
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      try {
        // First try to get stored user
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        console.log('[AuthContext] Stored user data:', storedUser ? 'exists' : 'none');

        if (storedUser && mounted) {
          try {
            const userData = JSON.parse(storedUser) as AuthUser;
            console.log('[AuthContext] Successfully parsed stored user:', userData.email);

            // Check if the token is still valid
            const now = Date.now();
            if (userData.stsTokenManager?.expirationTime && userData.stsTokenManager.expirationTime > now) {
              console.log('[AuthContext] Found valid token, setting user state');
              setUser(userData);
            } else {
              console.log('[AuthContext] Token expired, clearing storage');
              await AsyncStorage.removeItem(AUTH_USER_KEY);
            }
          } catch (parseError) {
            console.error('[AuthContext] Error parsing stored user:', parseError);
            await AsyncStorage.removeItem(AUTH_USER_KEY);
          }
        }

        // Set up Firebase auth listener
        console.log('[AuthContext] Setting up Firebase auth state listener...');
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!mounted) return;

          console.log('[AuthContext] Auth state changed. User:', firebaseUser?.email);
          
          try {
            if (firebaseUser) {
              // If Firebase has a user, update storage and state
              const userData = firebaseUser as AuthUser;
              await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
              setUser(userData);
              console.log('[AuthContext] Updated user data in storage');
            } else {
              // If Firebase has no user but we have stored data, try to restore it
              const storedData = await AsyncStorage.getItem(AUTH_USER_KEY);
              if (storedData) {
                const parsedUser = JSON.parse(storedData) as AuthUser;
                const now = Date.now();
                if (parsedUser.stsTokenManager?.expirationTime && parsedUser.stsTokenManager.expirationTime > now) {
                  console.log('[AuthContext] Restoring user from storage');
                  setUser(parsedUser);
                } else {
                  console.log('[AuthContext] Stored token expired, clearing data');
                  await AsyncStorage.removeItem(AUTH_USER_KEY);
                  setUser(null);
                }
              } else {
                console.log('[AuthContext] No stored user data, setting null');
                setUser(null);
              }
            }
          } catch (error) {
            console.error('[AuthContext] Error handling auth state change:', error);
            await AsyncStorage.removeItem(AUTH_USER_KEY);
            setUser(null);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        });
      } catch (error) {
        console.error('[AuthContext] Auth initialization error:', error);
        if (mounted) {
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

  const value = {
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