import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { initializeApp } from 'firebase/app';
import { AuthProvider, useAuth } from '../contexts/auth';
import { HabitProvider } from '../contexts/habit';
import { NotificationsProvider } from '../contexts/notifications';
import { BadgeProvider } from '../contexts/badges';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID
} from '@env';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};

function FirebaseInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    try {
      console.log('[Firebase] Initializing Firebase...');
      initializeApp(firebaseConfig);
      console.log('[Firebase] Firebase initialized successfully');
      setIsInitialized(true);
    } catch (error) {
      if ((error as any)?.code === 'app/duplicate-app') {
        console.log('[Firebase] Firebase already initialized');
        setIsInitialized(true);
      } else {
        console.error('[Firebase] Initialization error:', error);
      }
    }
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FirebaseInitializer>
        <AuthProvider>
          <RootLayoutContent />
        </AuthProvider>
      </FirebaseInitializer>
    </GestureHandlerRootView>
  );
}

function RootLayoutContent() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <NotificationsProvider>
      <BadgeProvider>
        <HabitProvider>
          <RootLayoutNav />
        </HabitProvider>
      </BadgeProvider>
    </NotificationsProvider>
  );
}

function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('[Navigation] Checking route:', segments.join('/'));

    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const isVerification = segments[0] === 'verify';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/auth');
      }
    } else {
      if (user && !user.emailVerified && !isVerification) {
        router.replace('/verify');
      } else if (user?.emailVerified && (inAuthGroup || isVerification)) {
        router.replace('/(tabs)/');
      }
    }
  }, [isAuthenticated, segments, isLoading, user]);
}

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}
