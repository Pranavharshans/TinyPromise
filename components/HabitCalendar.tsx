import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { Colors, Spacing, Typography } from '../constants/theme';

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
  completedDay: ViewStyle;
  completedText: TextStyle;
  missedText: TextStyle;
  activeText: TextStyle;
  expandButton: ViewStyle;
  expandedCalendarContainer: ViewStyle;
  hidden: ViewStyle;
  calendarDay: ViewStyle;
  weekStripContainer: ViewStyle;
  weekStripContent: ViewStyle;
  streakIcon: ViewStyle;
  stackContainer: ViewStyle;
  iconContainer: ViewStyle;
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
      
      // Mark the range of dates
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        markedDates[dateString] = {
          type: streak.completed ? 'completed' : 'missed',
          marked: true
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // If there's a lastChecked date and it's not already marked, mark it too
    if (habit.lastChecked && typeof habit.lastChecked === 'string') {
      const lastCheckedDate = new Date(habit.lastChecked);
      const lastCheckedString = lastCheckedDate.toISOString().split('T')[0];
      if (!markedDates[lastCheckedString]) {
        markedDates[lastCheckedString] = {
          type: 'completed',
          marked: true
        };
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

      const isCompleted = marking?.type === 'completed';
      const dayStyle = [
        styles.weekDay,
        isCompleted && styles.completedDay,
        isToday && styles.todayDay
      ];

      const textStyle = [
        styles.dayText,
        isToday && styles.todayText,
        isCompleted && styles.completedText
      ];

      console.log('Rendering date:', dateString, { isCompleted, marking }); // Debug log

      dates.push(
        <View key={dateString} style={dayStyle}>
          <View style={styles.dateContainer}>
            <View style={styles.stackContainer}>
              <Text style={textStyle}>
                {currentDate.getDate()}
              </Text>
              {marking?.type && (
                <View style={styles.iconContainer}>
                  <Entypo
                    name="circle"
                    size={32}
                    color={marking.type === 'completed' ? '#4CAF50' : '#FF5252'}
                    style={{ opacity: 0.9 }}
                  />
                </View>
              )}
            </View>
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
                marking?.type === 'completed' && styles.completedDay,
                isToday && styles.todayDay
              ]}>
                <View style={styles.stackContainer}>
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    marking?.type === 'completed' && styles.completedText
                  ]}>
                    {date.day}
                  </Text>
                  {marking?.type && (
                    <View style={styles.iconContainer}>
                      <Entypo
                        name="circle"
                        size={32}
                        color={marking.type === 'completed' ? '#4CAF50' : '#FF5252'}
                        style={{ opacity: 0.9 }}
                      />
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: Colors.text.calendar,
            textSectionTitleDisabledColor: Colors.text.calendar,
            monthTextColor: Colors.text.calendar,
            textDayColor: Colors.text.calendar,
            textDisabledColor: `${Colors.text.calendar}80`,
            dayTextColor: Colors.text.calendar,
            todayTextColor: Colors.text.calendar,
            textMonthFontSize: 16,
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayHeaderFontSize: 14,
            textDayFontSize: 16,
            textDayHeaderColor: Colors.text.calendar,
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderRadius: 12,
  },
  weekStripContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
    backgroundColor: '#FFFFFF',
  },
  weekStrip: {
    height: 60,
    flexDirection: 'row',
  },
  weekStripContent: {
    paddingHorizontal: Spacing.xl * 2,
    alignItems: 'center',
  },
  weekDay: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    marginHorizontal: 2,
    marginVertical: 6,
    position: 'relative',
  },
  calendarDay: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    margin: 2,
    position: 'relative',
  },
  todayDay: {
    backgroundColor: Colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  completedDay: {},
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    borderWidth: 0,
    margin: 0,
    padding: 0,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.calendar,
  },
  todayText: {
    color: Colors.text.calendar,
    fontWeight: '700',
  },
  completedText: {
    color: Colors.text.calendar,
    fontWeight: '700',
    opacity: 0.7,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  hidden: {
    height: 0,
    opacity: 0,
  },
  streakIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stackContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HabitCalendar;
