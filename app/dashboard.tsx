import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/auth';
import { authService } from '../services/auth';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('[Dashboard] Auth state:', {
      isAuthenticated,
      isLoading,
      userEmail: user?.email,
      userVerified: user?.emailVerified
    });

    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('[Dashboard] User not authenticated, redirecting to auth...');
      router.replace('/auth');
    }
  }, [isAuthenticated, isLoading, user]);

  const handleSignOut = async () => {
    console.log('[Dashboard] Attempting to sign out...');
    try {
      const response = await authService.logout();
      console.log('[Dashboard] Sign out response:', response);
      
      if (response.success) {
        console.log('[Dashboard] Successfully signed out, redirecting...');
        router.replace('/');
      } else {
        console.error('[Dashboard] Sign out failed:', response.error);
        Alert.alert('Error', response.error || 'Failed to sign out');
      }
    } catch (error) {
      console.error('[Dashboard] Unexpected error during sign out:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  // Show loading state or redirect if not authenticated
  if (isLoading || !isAuthenticated) {
    console.log('[Dashboard] Loading or not authenticated, showing empty view');
    return <View style={styles.container} />;
  }

  console.log('[Dashboard] Rendering dashboard for user:', user?.email);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.message}>
          Your habits dashboard is coming soon!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 200,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    top: '40%',
    right: -20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signOutButton: {
    margin: 24,
    paddingVertical: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});