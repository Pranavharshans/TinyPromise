import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStats } from '../../contexts/stats';

export const OverallProgress: React.FC = () => {
  const { overallStats } = useStats();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Progress</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStats.totalHabits}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStats.activeHabits}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStats.completedHabits}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
      <Text style={styles.topHabit}>
        Top Habit: {overallStats.topPerformingHabit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.default,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  topHabit: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default OverallProgress;