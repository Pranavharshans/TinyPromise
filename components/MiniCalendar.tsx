import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface MiniCalendarProps {
  dates: Date[];
  currentStreak: number;
}

export default function MiniCalendar({ dates, currentStreak }: MiniCalendarProps) {
  // Get last 7 days
  const getDayLabels = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    return [...days.slice(today + 1), ...days.slice(0, today + 1)];
  };

  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      result.push(date);
    }
    return result;
  };

  const isDateChecked = (date: Date) => {
    return dates.some(d => 
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );
  };

  const dayLabels = getDayLabels();
  const last7Days = getLast7Days();

  return (
    <View style={styles.container}>
      <View style={styles.daysRow}>
        {dayLabels.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            <Text style={styles.dayLabel}>{day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.datesRow}>
        {last7Days.map((date, index) => (
          <View 
            key={index} 
            style={[
              styles.dateCell,
              isDateChecked(date) && styles.checkedDate
            ]}
          >
            <Text style={[
              styles.dateText,
              isDateChecked(date) && styles.checkedDateText
            ]}>
              {date.getDate()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  checkedDate: {
    backgroundColor: Colors.primary.light,
  },
  dayLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[600],
    fontWeight: Typography.weights.medium,
  },
  dateText: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray[700],
  },
  checkedDateText: {
    color: Colors.primary.default,
    fontWeight: Typography.weights.bold,
  },
});