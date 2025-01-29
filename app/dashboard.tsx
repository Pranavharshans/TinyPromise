import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  ViewStyle
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/auth';
import { useHabits } from '../contexts/habit';
import { authService } from '../services/auth';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    habits, 
    isLoading, 
    activeHabits,
    completedHabits,
    updateStreak,
    handleStreakDecision,
    refreshHabits 
  } = useHabits();

  useEffect(() => {
    console.log('[Dashboard] Current habits:', {
      total: habits.length,
      active: activeHabits.length,
      completed: completedHabits.length
    });
  }, [habits, activeHabits, completedHabits]);

  const handleCheckIn = async (habitId: string) => {
    try {
      const progress = await updateStreak(habitId, true);
      console.log('[Dashboard] Check-in result:', progress);

      if (progress.currentStreak === 3) {
        Alert.alert(
          'Streak Complete! 🎉',
          'You\'ve completed a 3-day streak! Would you like to continue this habit?',
          [
            {
              text: 'Complete Habit',
              style: 'cancel',
              onPress: () => handleStreakDecision(habitId, false)
            },
            {
              text: 'Keep Going',
              onPress: () => handleStreakDecision(habitId, true)
            }
          ]
        );
      }
    } catch (error) {
      console.error('[Dashboard] Check-in error:', error);
      Alert.alert('Error', 'Failed to update streak');
    }
  };

  const handleSignOut = async () => {
    try {
      const response = await authService.logout();
      if (response.success) {
        router.replace('/');
      } else {
        Alert.alert('Error', response.error || 'Failed to sign out');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const isCheckedInToday = (lastChecked?: number): boolean => {
    if (!lastChecked) return false;
    return new Date(lastChecked).getDate() === new Date().getDate();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading habits...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {activeHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No active habits yet. Start building better habits today!
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-habit')}
              >
                <Text style={styles.addButtonText}>Create New Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Habits</Text>
                {activeHabits.map(habit => {
                  const checkedInToday = isCheckedInToday(habit.lastChecked);
                  return (
                    <View key={habit.id} style={styles.habitCard}>
                      <View style={styles.habitInfo}>
                        <Text style={styles.habitTitle}>{habit.title}</Text>
                        {habit.description && (
                          <Text style={styles.habitDescription}>
                            {habit.description}
                          </Text>
                        )}
                        <Text style={styles.streakText}>
                          Current streak: {habit.currentStreak} days
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.checkButton,
                          checkedInToday && styles.checkButtonDisabled
                        ]}
                        onPress={() => handleCheckIn(habit.id)}
                        disabled={checkedInToday}
                      >
                        <Text style={styles.checkButtonText}>
                          {checkedInToday ? '✓ Done' : 'Check In'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {completedHabits.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Completed Habits</Text>
                  {completedHabits.map(habit => (
                    <View key={habit.id} style={[styles.habitCard, styles.completedCard]}>
                      <View style={styles.habitInfo}>
                        <Text style={styles.habitTitle}>{habit.title}</Text>
                        <Text style={styles.completedText}>
                          {habit.totalStreaks} streaks completed
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-habit')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  habitCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedCard: {
    opacity: 0.8,
  },
  habitInfo: {
    flex: 1,
    marginRight: 12,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  completedText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  checkButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  checkButtonDisabled: {
    backgroundColor: '#059669',
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    margin: 24,
    paddingVertical: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: -2,  // Visual alignment for the + symbol
  },
});