import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/auth';
import { HabitProvider } from '../contexts/habit';
import { NotificationsProvider } from '../contexts/notifications';
import { BadgeProvider } from '../contexts/badges';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Root layout with providers
export default function RootLayout() {
  console.log('[Navigation] Initializing root layout...');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

// Content wrapped in providers
function RootLayoutContent() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      console.log('[Navigation] Auth initialized, hiding splash screen...');
      // Hide splash screen once auth is initialized
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

// Handle protected routes
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    const logState = () => {
      console.log('[Navigation] Current state:', {
        isAuthenticated,
        isLoading,
        userEmail: user?.email,
        userVerified: user?.emailVerified,
        currentSegments: segments,
        inAuthGroup: segments[0] === '(auth)',
        isVerification: segments[0] === 'verify'
      });
    };

    logState();

    if (isLoading) {
      console.log('[Navigation] Still loading, skipping navigation...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const isVerification = segments[0] === 'verify';

    console.log('[Navigation] Starting navigation check...');

    // Handle authentication flow
    if (!isAuthenticated) {
      console.log('[Navigation] User is not authenticated');
      // If not authenticated, redirect to auth unless already there
      if (!inAuthGroup) {
        console.log('[Navigation] Redirecting to auth page...');
        router.replace('/auth');
      }
    } else {
      console.log('[Navigation] User is authenticated');
      // If authenticated, handle verification and protected routes
      if (user && !user.emailVerified && !isVerification) {
        console.log('[Navigation] User needs email verification, redirecting...');
        router.replace('/verify');
      } else if (user?.emailVerified && (inAuthGroup || isVerification)) {
        console.log('[Navigation] User is verified, redirecting to dashboard...');
        router.replace('/(tabs)/');
      }
    }
  }, [isAuthenticated, segments, isLoading, user]);
}

// Root layout wrapper with auth protection
function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="verify" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          presentation: 'containedModal',
        }}
      />
      <Stack.Screen name="add-habit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="achievements" options={{ headerShown: true }} />
    </Stack>
  );
}
