import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useHabits } from '../../contexts/habit';

interface StreakStatsProps {
  habitId: string;
}

const StreakStats: React.FC<StreakStatsProps> = ({ habitId }) => {
  const { getHabitById } = useHabits();
  const habit = getHabitById(habitId);

  if (!habit) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.statBlock}>
        <Text style={styles.value}>{habit.currentStreak}</Text>
        <Text style={styles.label}>Current Streak</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBlock}>
        <Text style={styles.value}>{habit.longestStreak}</Text>
        <Text style={styles.label}>Longest Streak</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBlock}>
        <Text style={styles.value}>{habit.streaksCompleted}</Text>
        <Text style={styles.label}>Total Streaks</Text>
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