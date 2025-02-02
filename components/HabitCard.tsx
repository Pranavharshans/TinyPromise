import React, { useState } from 'react';
import { useHabits } from '../contexts/habit';
import { habitService } from '../services/habit';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  Pressable,
  Vibration,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import Card from './ui/Card';
import Button from './ui/Button';
import Progress from './ui/Progress';
import MiniCalendar from './MiniCalendar';
import HabitActionMenu from './HabitActionMenu';
import SyncIndicator from './SyncIndicator';
import { Habit } from '../types/habit';
import HabitCalendar from './HabitCalendar';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface HabitCardProps {
  habit: Habit;
  onCheckIn?: () => void;
  style?: StyleProp<ViewStyle>;
  isToday?: boolean;
  index?: number;
}

const HabitCard = ({
  habit,
  onCheckIn,
  style,
  isToday = false,
  index = 0,
}: HabitCardProps) => {
  const { deleteHabit, updateHabitStatus } = useHabits();
  const [menuVisible, setMenuVisible] = useState(false);
  const scale = useSharedValue(1);
  const success = useSharedValue(0);
  const longPressTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const handleLongPress = () => {
    Vibration.vibrate(40);
    setMenuVisible(true);
  };

  const SWIPE_THRESHOLD = 100;


  const handleCheckIn = () => {
    console.log('Check In button pressed');
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    success.value = withTiming(1, { duration: 300 }, (finished) => {
      if (finished) {
        console.log('Animation finished');
        if (onCheckIn) {
          console.log('Calling onCheckIn');
          runOnJS(onCheckIn)();
        }
        success.value = withTiming(0, { duration: 300 });
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: success.value,
      transform: [
        {
          scale: interpolate(
            success.value,
            [0, 0.5, 1],
            [0.5, 1.2, 1]
          )
        }
      ]
    };
  });

  const getGradientColors = (idx: number) => {
    const baseColors = [
      [Colors.habit.orange, '#FFA347'],
      [Colors.habit.yellow, '#FFE4A3'],
      [Colors.habit.teal, '#B4F0E9'],
    ];
    return baseColors[idx % baseColors.length];
  };

  const getShadowColor = (idx: number) => {
    const shadowColors = [
      Colors.habit.orange + '40',
      Colors.habit.yellow + '40',
      Colors.habit.teal + '40',
    ];
    return shadowColors[idx % shadowColors.length];
  };

  const getStreakColor = (habit: Habit) => {
    if (habit.status === 'completed') return Colors.habitState.paused.default;
    if (habit.currentStreak === 0) return Colors.gray[400];
    if (habit.currentStreak === 3) return Colors.success.default;
    return Colors.primary.default;
  };

  const getProgress = (habit: Habit) => {
    if (habit.status === 'completed') return 0;
    return Math.min(habit.currentStreak / 3, 1);
  };

  return (
    <Pressable onLongPress={handleLongPress}>
      <Animated.View style={animatedStyle}>
        <Card
          variant="elevated"
          style={[
            styles.container,
            style,
            habit.status === 'completed' && { backgroundColor: Colors.habitState.paused.light + '33' }
          ]}
          contentStyle={styles.cardContent}
          gradientColors={getGradientColors(index)}
          gradientStart={{ x: 0, y: 0 }}
          gradientEnd={{ x: 1, y: 0.5 }}
          shadowColor={getShadowColor(index)}
        >
          <SyncIndicator syncing={habit._sync?.status === 'pending'} />
          <Animated.View
            style={[styles.checkmarkContainer, successAnimatedStyle]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
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
              <Animated.View style={animatedStyle}>
                <Button
                  title={isToday ? '✓ Done' : 'Check In'}
                  variant={isToday ? 'success' : 'primary'}
                  size="sm"
                  disabled={isToday}
                  onPress={handleCheckIn}
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.streakContainer}>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <View style={styles.streakRow}>
                <Text
                  style={[
                    styles.streakCount,
                    { color: getStreakColor(habit) }
                  ]}
                >
                  {habit.currentStreak}
                </Text>
                <Text style={styles.streakDays}> / 3 days</Text>
              </View>
            </View>
            <HabitCalendar
              habit={habit}
            />
            <Progress
              progress={getProgress(habit)}
              height={6}
              color={getStreakColor(habit)}
              style={{ ...styles.progress, marginTop: Spacing.sm }}
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
        <HabitActionMenu
          visible={menuVisible}
          habitStatus={habit.status}
          onClose={() => setMenuVisible(false)}
          onEdit={() => {
            console.log('Edit habit:', habit.id);
          }}
          onDelete={async () => {
            try {
              await deleteHabit(habit.id);
              console.log('Habit deleted successfully:', habit.id);
            } catch (error) {
              console.error('Failed to delete habit:', error);
            }
          }}
          onPause={async () => {
            try {
              await updateHabitStatus(habit.id, false);
              console.log('Habit paused successfully:', habit.id);
            } catch (error) {
              console.error('Failed to pause habit:', error);
            }
          }}
          onResume={async () => {
            try {
              await updateHabitStatus(habit.id, true);
              console.log('Habit resumed successfully:', habit.id);
            } catch (error) {
              console.error('Failed to resume habit:', error);
            }
          }}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
  checkmark: {
    fontSize: 32,
    color: Colors.success.default,
  },
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
    color: Colors.gray[800],
    marginBottom: 4,
  },
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
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
    color: Colors.gray[700],
  },
  streakRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  streakCount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.gray[900],
  },
  streakDays: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
  },
  progress: {
    marginTop: Spacing.xs,
  },
  completedBadge: {
    marginTop: Spacing.md,
    backgroundColor: Colors.habitState.paused.light + '20',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: Typography.sizes.sm,
    color: Colors.habitState.paused.default,
    fontWeight: Typography.weights.medium,
  },
  countdown: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray[600],
  }
});

export default HabitCard;
