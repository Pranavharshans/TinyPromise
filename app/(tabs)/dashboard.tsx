import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/auth';
import { useHabits } from '../../contexts/habit';
import { Habit } from '../../types/habit';
import { Colors, Typography, Spacing } from '../../constants/theme';
import HabitCard from '../../components/HabitCard';
import { IconSymbol } from '../../components/ui/IconSymbol';
import FilterChips, { FilterOption } from '../../components/ui/FilterChips';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    habits,
    isLoading,
    activeHabits,
    pausedHabits,
    completedHabits,
    updateStreak,
    updateHabitStatus,
    refreshHabits,
    error
  } = useHabits();
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'paused' | 'completed'>('active');

  useEffect(() => {
    if (user) {
      refreshHabits();
    }
  }, [user]);

  const filterOptions: FilterOption[] = [
    { id: 'active', label: 'Active', count: activeHabits.length },
    { id: 'paused', label: 'Paused', count: pausedHabits.length },
    { id: 'completed', label: 'Completed', count: completedHabits.length },
  ];

  const filteredHabits = useMemo(() => {
    switch (selectedStatus) {
      case 'active':
        return activeHabits;
      case 'paused':
        return pausedHabits;
      case 'completed':
        return completedHabits;
      default:
        return [];
    }
  }, [selectedStatus, activeHabits, pausedHabits, completedHabits]);

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
              style: 'destructive',
              onPress: () => updateHabitStatus(habitId, 'completed')
            },
            {
              text: 'Keep Going',
              onPress: () => updateHabitStatus(habitId, 'active')
            }
          ]
        );
      }
    } catch (error) {
      console.error('[Dashboard] Check-in error:', error);
      Alert.alert('Error', 'Failed to update streak');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => router.push('/')
        }
      ]
    );
  };

  const renderHabitItem = (habit: Habit, index: number) => (
    <HabitCard
      habit={habit}
      onCheckIn={() => handleCheckIn(habit.id)}
      index={index}
    />
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>My Habits</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleSignOut}
          >
            <Text style={styles.profileButtonText}>
              {user?.email?.[0]?.toUpperCase() || '👤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FilterChips
        options={filterOptions}
        selectedId={selectedStatus}
        onSelect={(status) => setSelectedStatus(status as typeof selectedStatus)}
        style={styles.filterChips}
      />
      <View style={{ flex: 1 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.default} />
            <Text style={styles.loadingText}>Loading habits...</Text>
          </View>
        ) : filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {selectedStatus} habits yet.
              {selectedStatus === 'active' && '\nStart building better habits today!'}
            </Text>
            {selectedStatus === 'active' && (
              <Text style={styles.emptyStateSecondary}>
                Tap the + button below to get started
              </Text>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredHabits.map((habit, index) => renderHabitItem(habit, index))}
          </ScrollView>
        )}
      </View>

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
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 90 : 70, // Space for FAB and tab bar
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  completedSection: {
    marginTop: Spacing.xl,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  filterChips: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.default,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.sizes.default,
    color: Colors.danger.default,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.sizes.md * 1.5,
  },
  emptyStateSecondary: {
    fontSize: Typography.sizes.default,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    paddingHorizontal: 0,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Platform.OS === 'ios' ? 32 : 24, // Adjusted for tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.default,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  fabIcon: {
    fontSize: 32,
    color: Colors.text.inverse,
    marginTop: -2,
  },
});