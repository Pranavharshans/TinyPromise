import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebase';
import { authService } from '../services/auth';

export default function VerifyScreen() {
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();

  useEffect(() => {
    checkVerification();
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const checkVerification = async () => {
    // Reload user to get latest verification status
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      setIsVerified(true);
      router.replace('/dashboard');
    }
  };

  const handleResend = async () => {
    if (countdown > 0) {
      Alert.alert('Please wait', 'You can request a new email after the countdown.');
      return;
    }

    const response = await authService.resendVerification();
    if (response.success) {
      setCountdown(60);
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } else {
      Alert.alert('Error', response.error || 'Failed to send verification email');
    }
  };

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response.success) {
      router.replace('/');
    } else {
      Alert.alert('Error', response.error || 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification email to:
        </Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
        
        <Text style={styles.instruction}>
          Please check your inbox and click the verification link to continue.
        </Text>

        <TouchableOpacity
          style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
          onPress={handleResend}
          disabled={countdown > 0}
        >
          <Text style={[styles.resendButtonText, countdown > 0 && styles.resendButtonTextDisabled]}>
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 24,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  resendButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  resendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});