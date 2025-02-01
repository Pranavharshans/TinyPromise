import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Colors, Spacing } from '../constants/theme';
import StreakStats from '../components/statistics/StreakStats';
import CompletionRate from '../components/statistics/CompletionRate';
import OverallProgress from '../components/statistics/OverallProgress';
import { useHabits } from '../contexts/habit';

export default function StatisticsScreen() {
  const { activeHabits } = useHabits();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        {activeHabits.map((habit) => (
          <React.Fragment key={habit.id}>
            <StreakStats habitId={habit.id} />
            <CompletionRate habitId={habit.id} />
          </React.Fragment>
        ))}
        <OverallProgress />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});