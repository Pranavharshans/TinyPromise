import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { FontAwesome } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { Colors, Spacing } from '../constants/theme';

interface HabitCalendarProps {
  habit: Habit;
}

interface DayComponentProps {
  date: DateData;
  state?: string;
}

interface Styles {
  container: ViewStyle;
  weekStrip: ViewStyle;
  weekDay: ViewStyle;
  dateContainer: ViewStyle;
  dayText: TextStyle;
  todayDay: ViewStyle;
  todayText: TextStyle;
  completedText: TextStyle;
  missedText: TextStyle;
  activeText: TextStyle;
  expandButton: ViewStyle;
  expandedCalendarContainer: ViewStyle;
  hidden: ViewStyle;
  calendarDay: ViewStyle;
  weekStripContainer: ViewStyle;
  weekStripContent: ViewStyle;
}

const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandAnim = useState(new Animated.Value(0))[0];

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(expandAnim, {
      toValue,
      useNativeDriver: false,
      tension: 40,
      friction: 7
    }).start();
    setIsExpanded(!isExpanded);
  };

  const getMarkedDates = () => {
    const markedDates: Record<string, any> = {};
    
    // Process streak history
    habit.streakHistory.forEach(streak => {
      const startDate = new Date(streak.startDate);
      const endDate = new Date(streak.endDate);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        markedDates[dateString] = {
          type: streak.completed ? 'completed' : 'active',
          backgroundColor: streak.completed ? `${Colors.success.default}20` : `${Colors.primary.default}20`
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Add missed days
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const lastChecked = habit.lastChecked ? new Date(habit.lastChecked) : null;

    if (lastChecked) {
      const daysSinceLastCheck = Math.floor((now.getTime() - lastChecked.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastCheck > 1 && daysSinceLastCheck <= 3) {
        const missedDate = new Date(lastChecked);
        missedDate.setDate(missedDate.getDate() + 1);
        
        while (missedDate < now) {
          const dateString = missedDate.toISOString().split('T')[0];
          markedDates[dateString] = {
            type: 'missed',
            backgroundColor: `${Colors.danger.default}20`
          };
          missedDate.setDate(missedDate.getDate() + 1);
        }
      }
    }

    return markedDates;
  };

  const renderWeekStrip = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate dates centered around today (7 days before, 7 days after)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    
    // Generate padding at start for better scrolling
    for (let i = 0; i < 3; i++) {
      dates.push(
        <View key={`padding-start-${i}`} style={styles.weekDay} />
      );
    }
    
    // Generate 15 days (7 before today, today, 7 after)
    for (let i = 0; i < 15; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = currentDate.toISOString().split('T')[0];
      const isToday = currentDate.getTime() === today.getTime();
      const markedDates = getMarkedDates();
      const marking = markedDates[dateString];

      const dayStyle = [
        styles.weekDay,
        marking && { backgroundColor: marking.backgroundColor },
        isToday && styles.todayDay
      ];

      const textStyle = [
        styles.dayText,
        isToday && styles.todayText,
        marking?.type === 'completed' && styles.completedText,
        marking?.type === 'missed' && styles.missedText,
        marking?.type === 'active' && styles.activeText
      ];

      dates.push(
        <View key={dateString} style={dayStyle}>
          <View style={styles.dateContainer}>
            <Text style={textStyle}>
              {currentDate.getDate()}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.weekStripContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.weekStrip}
          contentContainerStyle={styles.weekStripContent}
          ref={(scrollView) => {
            // Center the strip after render
            if (scrollView) {
              setTimeout(() => {
                const dayWidth = 44; // 40px width + 4px margins
                const paddingStart = Spacing.xl * 2; // Match contentContainerStyle padding
                const centerPosition = (dayWidth * 7) + paddingStart; // 7 days + padding
                scrollView.scrollTo({
                  x: centerPosition,
                  animated: false
                });
              }, 0);
            }
          }}
        >
          {dates}
          {/* Add padding at end */}
          {[0, 1, 2].map(i => (
            <View key={`padding-end-${i}`} style={styles.weekDay} />
          ))}
        </ScrollView>
      </View>
    );
  };

  const calendarHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 350]
  });

  return (
    <Animated.View style={[styles.container, { height: calendarHeight }]}>
      {renderWeekStrip()}
      <View style={isExpanded ? styles.expandedCalendarContainer : styles.hidden}>
        <Calendar
          markedDates={getMarkedDates()}
          dayComponent={({ date }: { date: DateData }) => {
            const marking = getMarkedDates()[date.dateString];
            const isToday = date.dateString === new Date().toISOString().split('T')[0];
            
            return (
              <View style={[
                styles.calendarDay,
                marking && { backgroundColor: marking.backgroundColor },
                isToday && styles.todayDay
              ]}>
                <Text style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  marking?.type === 'completed' && styles.completedText,
                  marking?.type === 'missed' && styles.missedText,
                  marking?.type === 'active' && styles.activeText
                ]}>
                  {date.day}
                </Text>
              </View>
            );
          }}
          theme={{
            backgroundColor: Colors.background.primary,
            calendarBackground: Colors.background.primary,
            textSectionTitleColor: Colors.gray[800],
            textSectionTitleDisabledColor: Colors.gray[600],
            monthTextColor: Colors.gray[800],
            textMonthFontSize: 16,
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayHeaderFontSize: 14,
          }}
        />
      </View>
      <TouchableOpacity
        style={styles.expandButton}
        onPress={toggleExpand}
      >
        <FontAwesome 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={Colors.gray[600]} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: Colors.background.primary,
    overflow: 'hidden',
  },
  weekStripContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: Colors.background.secondary,
  },
  weekStrip: {
    height: 60,
    flexDirection: 'row',
  },
  weekStripContent: {
    paddingHorizontal: Spacing.xl * 2, // Add extra padding for scrolling
    alignItems: 'center',
  },
  weekDay: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    marginVertical: 6,
  },
  calendarDay: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 2,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: Colors.primary.default,
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  todayText: {
    color: Colors.primary.default,
  },
  completedText: {
    color: Colors.success.dark,
  },
  missedText: {
    color: Colors.danger.dark,
  },
  activeText: {
    color: Colors.primary.dark,
  },
  expandButton: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  expandedCalendarContainer: {
    flex: 1,
    opacity: 1,
  },
  hidden: {
    height: 0,
    opacity: 0,
  },
});

export default HabitCalendar;