import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge as BadgeType } from '../../types/badges';
import { ThemedText } from '../ThemedText';
import Card from './Card';
import Progress from './Progress';

interface BadgeProps {
  badge: BadgeType;
  earned?: boolean;
  progress?: {
    current: number;
    required: number;
  };
}

export const Badge: React.FC<BadgeProps> = ({ badge, earned = false, progress }) => {
  const progressPercentage = progress 
    ? (progress.current / progress.required) * 100
    : 0;

  return (
    <Card style={[styles.container, earned ? styles.earned : styles.locked]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.icon}>{badge.icon}</ThemedText>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>{badge.name}</ThemedText>
            {badge.level && (
              <ThemedText style={styles.level}>Level {badge.level}</ThemedText>
            )}
          </View>
        </View>
        <ThemedText style={styles.description}>{badge.description}</ThemedText>
        {!earned && progress && (
          <View style={styles.progressContainer}>
            <Progress progress={progressPercentage} />
            <ThemedText style={styles.progressText}>
              {progress.current} / {progress.required}
            </ThemedText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
  },
  earned: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  locked: {
    opacity: 0.7,
  },
  content: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  level: {
    fontSize: 14,
    opacity: 0.7,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 8,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});