import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStats } from '../../contexts/stats';

interface StreakStatsProps {
  habitId: string;
}

export const StreakStats: React.FC<StreakStatsProps> = ({ habitId }) => {
  const { habitStats } = useStats();
  const stats = habitStats.get(habitId);

  if (!stats) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Streak Stats</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Current</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest</Text>
        </View>
      </View>
      <View style={styles.streakBar}>
        <View
          style={[
            styles.streakProgress,
            { width: `${(stats.currentStreak / 3) * 100}%` }
          ]}
        />
      </View>
      <Text style={styles.streakCaption}>
        {stats.currentStreak === 0
          ? 'Start your streak!'
          : `${3 - stats.currentStreak} days until milestone`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
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
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.default,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  streakBar: {
    height: 4,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  streakProgress: {
    height: '100%',
    backgroundColor: Colors.primary.default,
    borderRadius: BorderRadius.full,
  },
  streakCaption: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default StreakStats;