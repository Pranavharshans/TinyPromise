import React, { useState } from 'react';
import {
  View,
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
import DateRangeFilter from '../../components/statistics/DateRangeFilter';
import MetricCard from '../../components/statistics/MetricCard';
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

type DateRange = '7d' | '14d' | '30d' | '90d';

export default function StatisticsScreen() {
  const { activeHabits } = useHabits();
  const { overallStats } = useStats();
  const scrollY = useSharedValue(0);
  const [selectedRange, setSelectedRange] = useState<DateRange>('14d');

  const combinedStreakHistory = React.useMemo(() => {
    if (!activeHabits?.length) return [] as HabitStreak[];

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
        const lastStreak = streaks[streaks.length - 1];
        if (lastStreak && new Date(date) <= new Date(lastStreak.endDate)) {
          lastStreak.endDate = date;
        } else {
          streaks.push({
            startDate: date,
            endDate: date,
            completed: true
          });
        }
      }
    });

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

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case '7d': return 7;
      case '14d': return 14;
      case '30d': return 30;
      case '90d': return 90;
      default: return 14;
    }
  };

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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.headerSection, headerStyle]}>
          <Text style={styles.statisticsTitle}>Statistics</Text>
          <Text style={styles.statisticsSubtitle}>
            Track your progress and achievements
          </Text>
        </Animated.View>

        {/* Overall Summary Section */}
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.metricsContainer}>
            <MetricCard
              value={`${overallStats.completionRate.toFixed(1)}%`}
              label="Completion"
              tooltipText="Your overall habit completion rate"
              icon="bar-chart-outline"
            />
            <MetricCard
              value={overallStats.currentStreak}
              label="Current Streak"
              tooltipText="Days in a row you've completed habits"
              icon="flame-outline"
            />
            <MetricCard
              value={overallStats.longestStreak}
              label="Best Streak"
              tooltipText="Your best streak ever"
              icon="trophy-outline"
            />
          </View>
        </Animated.View>

        {/* Trends Section */}
        <Animated.View 
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Activity Trends</Text>
          <DateRangeFilter
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
          <View style={styles.trendsCard}>
            <CompletionTrends
              streakHistory={combinedStreakHistory}
              days={getDaysFromRange(selectedRange)}
            />
          </View>
        </Animated.View>

        {/* Individual Habits Section */}
        <Animated.View 
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Habit Details</Text>
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
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  trendsCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  habitsContainer: {
    gap: Spacing.md,
  },
  habitCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
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