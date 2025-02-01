import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Habit } from '../types/habit';
import { Colors } from '../constants/theme';

interface HabitCalendarProps {
  habit: Habit;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit }) => {
  const markedDates = habit.streakHistory.reduce((acc: Record<string, any>, streak) => {
    const startDate = new Date(streak.startDate);
    const endDate = new Date(streak.endDate);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      acc[dateString] = { marked: true, dotColor: Colors.primary.default };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return acc;
  }, {});

  if (habit.lastChecked) {
    const lastCheckedDate = new Date(habit.lastChecked).toISOString().split('T')[0];
    if (!markedDates[lastCheckedDate]) {
      markedDates[lastCheckedDate] = {selected: true, selectedColor: Colors.success.default};
    } else {
      markedDates[lastCheckedDate] = {...markedDates[lastCheckedDate], selected: true, selectedColor: Colors.success.default};
    }
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        theme={{
          backgroundColor: Colors.background.primary,
          calendarBackground: Colors.background.primary,
          textSectionTitleColor: Colors.gray[800],
          textSectionTitleDisabledColor: Colors.gray[600],
          selectedDayBackgroundColor: Colors.primary.default,
          selectedDayTextColor: Colors.text.inverse,
          todayTextColor: Colors.primary.default,
          dayTextColor: Colors.gray[800],
          textDisabledColor: Colors.gray[400],
          dotColor: Colors.primary.default,
          selectedDotColor: Colors.text.inverse,
          arrowColor: Colors.gray[800],
          disabledArrowColor: Colors.gray[400],
          monthTextColor: Colors.gray[800],
          indicatorColor: Colors.primary.default,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background.primary,
  },
});

export default HabitCalendar;