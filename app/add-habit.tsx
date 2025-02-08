import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../contexts/habit';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

const SUGGESTED_HABITS = [
  {
    title: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    defaultReminders: [
      { time: '09:00', days: [1, 2, 3, 4, 5] },
      { time: '15:00', days: [1, 2, 3, 4, 5] }
    ]
  },
  {
    title: 'Read',
    description: 'Read for at least 15 minutes',
    defaultReminders: [
      { time: '21:00', days: [0, 1, 2, 3, 4, 5, 6] }
    ]
  },
  {
    title: 'Exercise',
    description: 'Get your body moving',
    defaultReminders: [
      { time: '07:00', days: [1, 2, 3, 4, 5] }
    ]
  },
  {
    title: 'Meditate',
    description: 'Practice mindfulness',
    defaultReminders: [
      { time: '06:00', days: [0, 1, 2, 3, 4, 5, 6] }
    ]
  }
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { createHabit, error: contextError, clearError } = useHabits();
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    isSubmitting: false,
    error: null as string | null,
  });

  // Clear context errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  // Update local error state when context error changes
  useEffect(() => {
    if (contextError) {
      setFormState(prev => ({ ...prev, error: contextError }));
    }
  }, [contextError]);

  const validateInput = () => {
    if (!formState.title.trim()) {
      setFormState(prev => ({ ...prev, error: 'Please enter a habit title' }));
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    console.log('[AddHabit] Starting habit creation:', {
      title: formState.title,
      description: formState.description
    });
    
    if (!validateInput()) {
      return;
    }

    // Set a timeout to clear loading state if operation takes too long
    const timeout = setTimeout(() => {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Operation timed out. Your habit will be synced when connection is restored.'
      }));
    }, 15000);

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      console.log('[AddHabit] Calling createHabit...');
      if (!formState.title) {
        setFormState(prev => ({ ...prev, error: 'Title is required' }));
        return;
      }

      const habitInput = {
        title: formState.title.trim(),
        description: formState.description?.trim() || undefined
      };
      
      await createHabit(habitInput);
      console.log('[AddHabit] Habit created successfully');
      
      // Clear timeout since operation succeeded
      clearTimeout(timeout);

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        error: null
      }));

      router.push('/dashboard');

    } catch (error) {
      console.error('[AddHabit] Error creating habit:', error);
      
      // Clear timeout since we got an error
      clearTimeout(timeout);

      let errorMessage = 'Failed to create habit';
      if (error instanceof Error) {
        errorMessage = error.message;
        // Special handling for timeout errors
        if (error.message === 'Request timed out') {
          errorMessage = 'Connection is slow. Your habit will be synced when connection improves.';
        }
      }

      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        isSubmitting: false
      }));
    }
  };

  const handleSuggestedHabit = (suggested: typeof SUGGESTED_HABITS[0]) => {
    setFormState(prev => ({
      ...prev,
      title: suggested.title,
      description: suggested.description,
      error: null
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create New Habit</Text>
          <Text style={styles.subtitle}>
            Start your journey to better habits with a 3-day streak
          </Text>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.formCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Habit Title</Text>
              <TextInput
                style={[
                  styles.input,
                  formState.error && styles.inputError
                ]}
                placeholder="Enter habit title"
                value={formState.title}
                onChangeText={(text) => {
                  setFormState(prev => ({
                    ...prev,
                    title: text,
                    error: null
                  }));
                }}
                maxLength={50}
                autoCapitalize="words"
                editable={!formState.isSubmitting}
                placeholderTextColor={Colors.text.tertiary}
              />
              {formState.error && (
                <Text style={styles.errorText}>{formState.error}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a description"
                value={formState.description}
                onChangeText={(text) => {
                  setFormState(prev => ({
                    ...prev,
                    description: text
                  }));
                }}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!formState.isSubmitting}
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>
          </Card>

          <View style={styles.suggestedSection}>
            <Text style={styles.suggestedTitle}>Suggested Habits</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedContainer}
            >
              {SUGGESTED_HABITS.map((habit, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  style={styles.suggestedCard}
                  onPress={() => handleSuggestedHabit(habit)}
                >
                  <Text style={styles.suggestedHabitTitle}>
                    {habit.title}
                  </Text>
                  <Text style={styles.suggestedHabitDesc}>
                    {habit.description}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            disabled={formState.isSubmitting}
          />
          <Button
            title={formState.isSubmitting ? 'Creating...' : 'Create Habit'}
            onPress={handleCreate}
            disabled={formState.isSubmitting}
            loading={formState.isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.default,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.default,
    fontWeight: Typography.weights.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.default,
    color: Colors.text.primary,
    backgroundColor: Colors.background.secondary,
  },
  inputError: {
    borderColor: Colors.danger.default,
  },
  errorText: {
    color: Colors.danger.default,
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  suggestedSection: {
    marginBottom: Spacing.lg,
  },
  suggestedTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  suggestedContainer: {
    paddingBottom: Spacing.sm,
  },
  suggestedCard: {
    width: 200,
    marginRight: Spacing.md,
  },
  suggestedHabitTitle: {
    fontSize: Typography.sizes.default,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  suggestedHabitDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: Colors.background.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
