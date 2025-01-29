import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('[Home] Checking auth state:', {
      isAuthenticated,
      isLoading,
      userEmail: user?.email,
      userVerified: user?.emailVerified
    });

    if (!isLoading) {
      if (isAuthenticated) {
        console.log('[Home] User is authenticated, redirecting...');
        if (!user?.emailVerified) {
          router.replace('/verify');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [isLoading, isAuthenticated, user]);

  // Don't render anything while checking auth state
  if (isLoading || isAuthenticated) {
    console.log('[Home] Loading or authenticated, showing empty view');
    return <View style={styles.container} />;
  }

  console.log('[Home] Rendering landing page');
  return (
    <View style={styles.container}>
      <View style={styles.background}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>

      <View style={styles.topSection}>
        <Text style={styles.title}>TinyPromise</Text>
        <Text style={styles.tagline}>Build habits, 3 days at a time</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            console.log('[Home] Navigating to onboarding');
            router.push('/onboarding');
          }}
        >
          <View style={styles.primaryButtonBg} />
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
        
        <Pressable 
          style={({pressed}) => [
            styles.outlineButton,
            pressed && styles.buttonPressed
          ]}
          onPress={() => {
            console.log('[Home] Navigating to auth');
            router.push('/auth');
          }}
        >
          <Text style={styles.outlineButtonText}>Login / Register</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    top: -50,
    right: -50,
  },
  dot2: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    top: 'auto',
    bottom: 100,
    left: -75,
  },
  dot3: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    top: '40%',
    right: -20,
  },
  topSection: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1F2937',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 20,
    color: '#6B7280',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  buttonContainer: {
    flex: 0.5,
    justifyContent: 'flex-start',
    gap: 24,
    paddingTop: 60,
  },
  primaryButton: {
    position: 'relative',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  primaryButtonBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#7C3AED',
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  outlineButton: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
  },
  outlineButtonText: {
    color: '#4F46E5',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});