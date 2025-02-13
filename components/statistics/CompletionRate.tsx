import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useHabits } from '../../contexts/habit';
import { useStats } from '../../contexts/stats';
import Progress from '../ui/Progress';

interface CompletionRateProps {
  habitId: string;
}

const CompletionRate: React.FC<CompletionRateProps> = ({ habitId }) => {
  const { getHabitById } = useHabits();
  const { getHabitStats } = useStats();

  const habit = getHabitById(habitId);
  const stats = habit ? getHabitStats(habit) : null;

  if (!habit || !stats) {
    return null;
  }

  const completionRate = stats.completionRate / 100; // Convert percentage to decimal

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Progress 
          value={completionRate} 
          size={60} 
          thickness={6}
          showValue
          valueFormatter={(val: number) => `${Math.round(val * 100)}%`}
          color={Colors.primary.default}
          trackColor={Colors.gray[200]}
          type="circular"
        />
      </View>
      <Text style={styles.label}>Completion Rate</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    flexDirection: 'column',
  },
  progressContainer: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});

export default CompletionRate;