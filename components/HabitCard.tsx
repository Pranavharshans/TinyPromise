import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import Card from './ui/Card';
import Button from './ui/Button';
import Progress from './ui/Progress';
import { Habit } from '../types/habit';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface HabitCardProps {
  habit: Habit;
  onCheckIn?: () => void;
  style?: StyleProp<ViewStyle>;
  isToday?: boolean;
}

export default function HabitCard({
  habit,
  onCheckIn,
  style,
  isToday = false,
}: HabitCardProps) {
  const getStreakColor = (streak: number) => {
    if (streak === 0) return Colors.gray[400];
    if (streak === 3) return Colors.success.default;
    return Colors.primary.default;
  };

  const getProgress = (streak: number) => {
    return Math.min(streak / 3, 1);
  };

  return (
    <Card
      variant="elevated"
      style={[styles.container, style]}
      contentStyle={styles.cardContent}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{habit.title}</Text>
          {habit.description && (
            <Text style={styles.description} numberOfLines={2}>
              {habit.description}
            </Text>
          )}
        </View>
        {habit.status === 'active' && onCheckIn && (
          <Button
            title={isToday ? '✓ Done' : 'Check In'}
            variant={isToday ? 'success' : 'primary'}
            size="sm"
            disabled={isToday}
            onPress={onCheckIn}
          />
        )}
      </View>

      <View style={styles.streakContainer}>
        <View style={styles.streakInfo}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <View style={styles.streakRow}>
            <Text 
              style={[
                styles.streakCount,
                { color: getStreakColor(habit.currentStreak) }
              ]}
            >
              {habit.currentStreak}
            </Text>
            <Text style={styles.streakDays}> / 3 days</Text>
          </View>
        </View>
        <Progress
          progress={getProgress(habit.currentStreak)}
          height={6}
          color={getStreakColor(habit.currentStreak)}
          style={styles.progress}
        />
      </View>

      {habit.status === 'completed' && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>
            ✨ {habit.totalStreaks} streaks completed
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  cardContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  streakContainer: {
    marginTop: Spacing.sm,
  },
  streakInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  streakLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  streakDays: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.tertiary,
  },
  progress: {
    marginTop: Spacing.xs,
  },
  completedBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.success.light + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success.default,
    fontWeight: Typography.weights.medium,
  },
});