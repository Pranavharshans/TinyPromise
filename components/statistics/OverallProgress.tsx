import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStats } from '../../contexts/stats';
import Progress from '../ui/Progress';

const OverallProgress: React.FC = () => {
  const { overallStats } = useStats();
  
  const activeHabitsPercent = overallStats.activeHabits / overallStats.totalHabits;
  const completedHabitsPercent = overallStats.completedHabits / overallStats.totalHabits;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overall Progress</Text>
      
      <View style={styles.row}>
        <View style={styles.statBox}>
          <Text style={styles.label}>Active Habits</Text>
          <Progress 
            value={activeHabitsPercent} 
            height={6}
            showValue
            valueFormatter={(val: number) => `${overallStats.activeHabits}/${overallStats.totalHabits}`}
            color={Colors.primary.default}
            trackColor={Colors.gray[200]}
            style={styles.progressBar}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.statBox}>
          <Text style={styles.label}>Completed Habits</Text>
          <Progress 
            value={completedHabitsPercent} 
            height={6}
            showValue
            valueFormatter={(val: number) => `${overallStats.completedHabits}/${overallStats.totalHabits}`}
            color={Colors.success.default}
            trackColor={Colors.gray[200]}
            style={styles.progressBar}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStats.averageStreak.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Average Streak</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{overallStats.streaksCompleted}</Text>
          <Text style={styles.statLabel}>Total Streaks</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(overallStats.completionRate)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  row: {
    marginBottom: Spacing.sm,
  },
  statBox: {
    flex: 1,
  },
  progressBar: {
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs / 2,
  },
  statLabel: {
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

export default OverallProgress;