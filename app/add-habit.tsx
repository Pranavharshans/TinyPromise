import React, { useState } from 'react';
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
      await createHabit(title.trim(), description.trim() || undefined);
      console.log('[AddHabit] Habit created successfully');
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
        >
          <Card style={styles.formCard}>
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
                placeholderTextColor={Colors.text.tertiary}
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
            disabled={isLoading}
          />
          <Button
            title={isLoading ? 'Creating...' : 'Create Habit'}
            onPress={handleCreate}
            disabled={isLoading}
            loading={isLoading}
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