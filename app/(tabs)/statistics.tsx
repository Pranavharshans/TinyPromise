import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import StreakStats from '../../components/statistics/StreakStats';
import CompletionRate from '../../components/statistics/CompletionRate';
import OverallProgress from '../../components/statistics/OverallProgress';
import CompletionTrends from '../../components/statistics/CompletionTrends';
import { useHabits } from '../../contexts/habit';
import { useStats } from '../../contexts/stats';
import { HabitStreak } from '../../types/habit';
import Animated, {
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export default function StatisticsScreen() {
  const { activeHabits } = useHabits();
  const { overallStats } = useStats();
  const scrollY = useSharedValue(0);

  const combinedStreakHistory = React.useMemo(() => {
    if (!activeHabits?.length) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    activeHabits.forEach(habit => {
      habit.streakHistory.forEach(streak => {
        const start = new Date(streak.startDate);
        const end = new Date(streak.endDate);
        let current = new Date(start);
        
        while (current <= end) {
          allDates.add(current.toISOString().split('T')[0]);
          current.setDate(current.getDate() + 1);
        }
      });
    });

    // Convert to streak format
    const streaks: HabitStreak[] = [];
    Array.from(allDates).sort().forEach(date => {
      const isCompleted = activeHabits.some(habit =>
        habit.streakHistory.some(streak =>
          date >= streak.startDate &&
          date <= streak.endDate &&
          streak.completed
        )
      );

      if (isCompleted) {
        // If this date continues a streak, extend it
        const lastStreak = streaks[streaks.length - 1];
        if (lastStreak && new Date(date) <= new Date(lastStreak.endDate)) {
          lastStreak.endDate = date;
        } else {
          // Start a new streak
          streaks.push({
            startDate: date,
            endDate: date,
            completed: true
          });
        }
      }
    });

    console.log('Combined streak history:', streaks);
    return streaks;
  }, [activeHabits]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 0],
      'clamp'
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 100],
      [0, -20],
      'clamp'
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  if (!activeHabits?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No habits yet. Start building some habits to see your statistics!
          </Text>
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

      <View style={styles.headerBackground} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.headerSection, headerStyle]}>
          <Text style={styles.statisticsTitle}>My Progress</Text>
          <Text style={styles.statisticsSubtitle}>
            Keep track of your habit-building journey
          </Text>
        </Animated.View>

        {/* Overall Summary Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <View style={styles.summaryCard}>
            <OverallProgress />
          </View>
        </Animated.View>

        {/* Activity Overview Section */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {overallStats.completionRate.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Average Completion</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {overallStats.currentStreak}
              </Text>
              <Text style={styles.metricLabel}>Current Streak</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {overallStats.longestStreak}
              </Text>
              <Text style={styles.metricLabel}>Longest Streak</Text>
            </View>
          </View>

          {/* Completion Trends Chart */}
          <View style={styles.trendsSection}>
            <CompletionTrends
              streakHistory={combinedStreakHistory}
              days={14} // Show last 2 weeks for a more focused view
            />
          </View>
        </Animated.View>

        {/* Individual Habits Section */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Habit Performance</Text>
          <View style={styles.habitsContainer}>
            {activeHabits.map((habit, index) => (
              <Animated.View 
                key={habit.id}
                entering={FadeInUp.delay(800 + index * 100).springify()}
                style={styles.habitCard}
              >
                <View style={styles.habitHeader}>
                  <Text style={styles.habitTitle}>{habit.title}</Text>
                  {habit.streakHistory.length > 0 && (
                    <View style={styles.habitBadge}>
                      <Text style={styles.habitBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <View style={styles.habitStats}>
                  <StreakStats habitId={habit.id} />
                  <CompletionRate habitId={habit.id} />
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Best Performing Section */}
        {overallStats.topPerformingHabit && (
          <Animated.View 
            entering={FadeInUp.delay(800).springify()}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Top Performance</Text>
            <View style={styles.topHabitCard}>
              <Text style={styles.topHabitTitle}>
                Best Performing Habit
              </Text>
              <Text style={styles.topHabitName}>
                {overallStats.topPerformingHabit}
              </Text>
            </View>
          </Animated.View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: Colors.primary.light,
    opacity: 0.05,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 88 : 60,
  },
  headerSection: {
    marginBottom: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  statisticsTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statisticsSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '31%',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  metricValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.default,
    marginBottom: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  trendsSection: {
    marginTop: Spacing.xl,
  },
  habitsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  habitCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.default,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  habitTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
  },
  habitBadge: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  habitBadgeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary.default,
    fontWeight: Typography.weights.medium,
  },
  habitStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  topHabitCard: {
    backgroundColor: Colors.primary.light,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary.default,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  topHabitTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topHabitName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.default,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    fontSize: Typography.sizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});