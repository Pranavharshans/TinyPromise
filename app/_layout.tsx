import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/auth';
import { HabitProvider } from '../contexts/habit';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

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
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, segments, isLoading, user]);
}

// Root layout wrapper with auth protection
function RootLayoutNav() {
  const { isLoading } = useAuth();

  useProtectedRoute();

  useEffect(() => {
    if (!isLoading) {
      console.log('[Navigation] Auth initialized, hiding splash screen...');
      // Hide splash screen once auth is initialized
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="verify" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="dashboard"
        options={{
          gestureEnabled: false,
          headerShown: false
        }}
      />
      <Stack.Screen
        name="add-habit"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical'
        }}
      />
    </Stack>
  );
}

// Root layout with providers
export default function RootLayout() {
  console.log('[Navigation] Initializing root layout...');
  return (
    <AuthProvider>
      <HabitProvider>
        <RootLayoutNav />
      </HabitProvider>
    </AuthProvider>
  );
}
