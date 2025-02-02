import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { Badge } from '../components/ui/Badge';
import { useBadges } from '../contexts/badges';
import { BADGE_DEFINITIONS, BadgeId } from '../types/badges';

export default function AchievementsScreen() {
  const { badges, progress, isLoading } = useBadges();

  const getProgressForBadge = (badgeId: BadgeId) => {
    switch (badgeId) {
      case 'first_streak':
        return {
          current: progress.streaksCompleted,
          required: 1,
        };
      case 'triple_threat':
        return {
          current: progress.streaksCompleted,
          required: 3,
        };
      case 'consistency_champion_1':
        return {
          current: progress.totalStreaks,
          required: 5,
        };
      case 'consistency_champion_2':
        return {
          current: progress.totalStreaks,
          required: 10,
        };
      case 'consistency_champion_3':
        return {
          current: progress.totalStreaks,
          required: 20,
        };
      case 'habit_hacker':
        return {
          current: progress.habitsCreated,
          required: 5,
        };
      case 'resilient_streak':
        return {
          current: progress.resumedHabits,
          required: 1,
        };
      default:
        return undefined;
    }
  };

  const earnedBadgeIds = badges.map(badge => badge.id);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Achievements',
          headerLargeTitle: true,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ThemedText>Loading achievements...</ThemedText>
        ) : (
          <View style={styles.badgeGrid}>
            {Object.entries(BADGE_DEFINITIONS).map(([badgeId, badge]) => (
              <Badge
                key={badgeId}
                badge={{ id: badgeId as BadgeId, ...badge }}
                earned={earnedBadgeIds.includes(badgeId as BadgeId)}
                progress={getProgressForBadge(badgeId as BadgeId)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  badgeGrid: {
    gap: 16,
  },
});