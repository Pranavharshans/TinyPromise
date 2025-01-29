import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/auth';

const { width } = Dimensions.get('window');

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    console.log('[AuthScreen] Auth state:', {
      isAuthenticated,
      authLoading,
      userEmail: user?.email,
      userVerified: user?.emailVerified
    });

    if (!authLoading && isAuthenticated) {
      console.log('[AuthScreen] User is already authenticated, redirecting...');
      if (!user?.emailVerified) {
        router.replace('/verify');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log(`[AuthScreen] Attempting to ${isLogin ? 'login' : 'register'} with email:`, email);
    setLoading(true);
    try {
      const response = isLogin 
        ? await authService.login(email, password)
        : await authService.register(email, password);

      console.log('[AuthScreen] Auth response:', {
        success: response.success,
        needsVerification: response.needsVerification,
        error: response.error
      });

      if (response.success) {
        if (response.needsVerification) {
          console.log('[AuthScreen] Redirecting to verification page');
          router.replace('/verify');
        } else {
          console.log('[AuthScreen] Redirecting to dashboard');
          router.replace('/dashboard');
        }
      } else {
        console.log('[AuthScreen] Auth error:', response.error);
        Alert.alert('Error', response.error || 'An error occurred');
      }
    } catch (error) {
      console.error('[AuthScreen] Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything while checking auth state or if already authenticated
  if (authLoading || isAuthenticated) {
    console.log('[AuthScreen] Loading or authenticated, showing empty view');
    return <View style={styles.container} />;
  }

  console.log('[AuthScreen] Rendering auth form');
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Sign in to continue building habits'
              : 'Start your journey to better habits'
            }
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                <Text style={styles.eyeButtonText}>
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </Pressable>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <View style={styles.submitButtonBg} />
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity 
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchButton}
              disabled={loading}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 18,
  },
  submitButton: {
    position: 'relative',
    width: '100%',
    height: 56,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#7C3AED',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    color: '#6B7280',
  },
  switchButton: {
    padding: 4,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});