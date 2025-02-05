import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Text,
  Dimensions,
} from 'react-native';
import { Stack } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import StreakStats from '../../components/statistics/StreakStats';
import CompletionRate from '../../components/statistics/CompletionRate';
import OverallProgress from '../../components/statistics/OverallProgress';
import { useHabits } from '../../contexts/habit';
import { useStats } from '../../contexts/stats';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const { activeHabits } = useHabits();
  const { overallStats } = useStats();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerLargeTitle: true,
        }}
      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerSection}>
          <Text style={styles.statisticsTitle}>My Progress</Text>
          <Text style={styles.statisticsSubtitle}>
            Keep track of your habit-building journey
          </Text>
        </View>
        {/* Overall Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Summary</Text>
          <View style={styles.summaryCard}>
            <OverallProgress />
          </View>
        </View>

        {/* Activity Overview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {overallStats.completionRate.toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>Average Completion Rate</Text>
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
        </View>

        {/* Individual Habits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habit Performance</Text>
          <View style={styles.habitsContainer}>
            {activeHabits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <View style={styles.habitStats}>
                  <StreakStats habitId={habit.id} />
                  <CompletionRate habitId={habit.id} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Best Performing Section */}
        {overallStats.topPerformingHabit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Performance</Text>
            <View style={styles.topHabitCard}>
              <Text style={styles.topHabitTitle}>
                Best Performing Habit
              </Text>
              <Text style={styles.topHabitName}>
                {overallStats.topPerformingHabit}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
    elevation: 2,
    shadowColor: Colors.background.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  habitsContainer: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  habitCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: Colors.background.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  habitTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
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
    elevation: 3,
    shadowColor: Colors.primary.default,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
});