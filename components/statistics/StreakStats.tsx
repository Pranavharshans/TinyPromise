import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useHabits } from '../../contexts/habit';
import { useStats } from '../../contexts/stats';

interface StreakStatsProps {
  habitId: string;
}

const StreakStats: React.FC<StreakStatsProps> = ({ habitId }) => {
  const { getHabitById } = useHabits();
  const { getHabitStats } = useStats();
  const habit = getHabitById(habitId);
  const stats = habit ? getHabitStats(habit) : null;

  if (!habit || !stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statBlock}>
        <Text style={styles.value}>{stats.currentStreak}</Text>
        <Text style={styles.label}>Current Streak</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBlock}>
        <Text style={styles.value}>{stats.longestStreak}</Text>
        <Text style={styles.label}>Longest Streak</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBlock}>
        <Text style={styles.value}>{stats.totalCompletions}</Text>
        <Text style={styles.label}>Total Days</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.gray[200],
    marginHorizontal: Spacing.sm,
  },
});

export default StreakStats;