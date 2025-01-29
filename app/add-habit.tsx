import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabits } from '../contexts/habit';

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
  const { createHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }

    setIsLoading(true);
    try {
      const habit = await createHabit(
        title.trim(),
        description.trim() || undefined
      );
      console.log('[AddHabit] Created habit:', habit);
      router.push('/dashboard');
    } catch (error) {
      console.error('[AddHabit] Error creating habit:', error);
      Alert.alert('Error', 'Failed to create habit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedHabit = (suggested: typeof SUGGESTED_HABITS[0]) => {
    setTitle(suggested.title);
    setDescription(suggested.description);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>Create New Habit</Text>
            <Text style={styles.subtitle}>
              Start your journey to better habits with a 3-day streak
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Habit Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter habit title"
                value={title}
                onChangeText={setTitle}
                maxLength={50}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                editable={!isLoading}
              />
            </View>

            <View style={styles.suggestedSection}>
              <Text style={styles.suggestedTitle}>Suggested Habits</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestedContainer}
              >
                {SUGGESTED_HABITS.map((habit, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestedHabit}
                    onPress={() => handleSuggestedHabit(habit)}
                    disabled={isLoading}
                  >
                    <Text style={styles.suggestedHabitTitle}>
                      {habit.title}
                    </Text>
                    <Text style={styles.suggestedHabitDesc}>
                      {habit.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.createButton]}
            onPress={handleCreate}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating...' : 'Create Habit'}
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  header: {
    padding: 24,
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
    padding: 24,
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
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  suggestedSection: {
    marginTop: 24,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  suggestedContainer: {
    paddingRight: 24,
  },
  suggestedHabit: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
  },
  suggestedHabitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  suggestedHabitDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 24,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  createButton: {
    backgroundColor: '#4F46E5',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});