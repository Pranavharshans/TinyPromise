import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ViewStyle, TextStyle } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';
import { Habit } from '../types/habit';
import { Colors, Spacing, Typography } from '../constants/theme';

// Helper function to format date to YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

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
  pausedDay: ViewStyle;
  pausedText: TextStyle;
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
    console.log("========================");
    console.log("getMarkedDates: Starting marking process");
    console.log("Habit state:", {
      id: habit.id,
      title: habit.title,
      status: habit.status,
      pausedAt: habit.pausedAt,
      lastChecked: habit.lastChecked,
      checkInHistory: habit.checkInHistory || []
    });

    const markedDates: Record<string, any> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const createdAt = new Date(habit.createdAt);
    createdAt.setHours(0, 0, 0, 0);

    console.log("=================== START ===================");
    console.log("Habit Details:", {
      id: habit.id,
      title: habit.title,
      status: habit.status,
      pausedAt: habit.pausedAt
    });

    // Mark completed dates first
    const completedDates = new Set(habit.checkInHistory || []);
    completedDates.forEach(dateString => {
      markedDates[dateString] = {
        type: 'completed',
        marked: true
      };
    });

    // Handle paused state
    if (habit.status === 'paused' && habit.pausedAt) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const pauseDate = new Date(habit.pausedAt);
      pauseDate.setHours(0, 0, 0, 0);

      console.log("Pause Details:", {
        pauseDate: formatDateToYYYYMMDD(pauseDate),
        today: formatDateToYYYYMMDD(today),
        completedDates: Array.from(completedDates)
      });

      let currentDate = new Date(pauseDate);
      while (currentDate <= today) {
        const dateString = formatDateToYYYYMMDD(currentDate);
        // Don't mark completed dates as paused
        if (!completedDates.has(dateString)) {
          markedDates[dateString] = {
            type: 'paused',
            marked: true,
            // Add selected property to make it more visible
            selected: true,
            selectedColor: Colors.habitState.paused.default
          };
          console.log("Marked as paused:", dateString);
        } else {
          console.log("Skipping completed date:", dateString);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log("Processed pause dates. Status:", {
      status: habit.status,
      pausedAt: habit.pausedAt,
      markedDatesCount: Object.keys(markedDates).length,
      pausedDatesCount: Object.values(markedDates).filter(m => m.type === 'paused').length
    });

    console.log("Final Markings:", Object.entries(markedDates).map(([date, value]) => ({
      date,
      type: value.type
    })));
    console.log("=================== END ===================");

    // Mark completed dates (these will override any paused markings)
    completedDates.forEach(dateString => {
      markedDates[dateString] = {
        type: 'completed',
        marked: true
      };
    });

    console.log("Final markings:", {
      habit: habit.id,
      status: habit.status,
      pausedAt: habit.pausedAt,
      markings: Object.keys(markedDates).map(date => ({
        date,
        type: markedDates[date].type
      }))
    });

    // Mark incomplete days (days before today where there was no check-in)
      let currentDate = new Date(createdAt);
      while (currentDate < today) {
        const dateString = formatDateToYYYYMMDD(currentDate);
        if (!markedDates[dateString]) {
          if (habit.status === 'active') {
            // Only show red rings for active habits that were missed
            markedDates[dateString] = {
              type: 'incomplete',
              marked: true
            };
          } else if (habit.status === 'paused' && habit.pausedAt && new Date(dateString) >= new Date(habit.pausedAt)) {
            // Show blue rings for paused habits after the pause date
            markedDates[dateString] = {
              type: 'paused',
              marked: true
            };
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

    // If there's a lastChecked date and it's not already marked, mark it too
    if (habit.lastChecked && typeof habit.lastChecked === 'string') {
      const lastCheckedDate = new Date(habit.lastChecked);
      const lastCheckedString = formatDateToYYYYMMDD(lastCheckedDate);
      // Only mark lastChecked as completed if it's not already marked
      // and it was actually completed (exists in checkInHistory)
      if (!markedDates[lastCheckedString] && habit.checkInHistory?.includes(lastCheckedString)) {
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
    
    // Get marked dates once for all days
    const markedDates = getMarkedDates();
    console.log("All marked dates for week strip:", markedDates);
    
    // Generate dates centered around today (7 days before, 7 days after)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
    
    // Generate padding at start for better scrolling
    dates.push(
      ...Array.from({ length: 3 }, (_, i) => (
        <View key={`padding-start-${i}`} style={styles.weekDay} />
      ))
    );
    
    // Generate 15 days (7 before today, today, 7 after)
    for (let i = 0; i < 15; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateString = formatDateToYYYYMMDD(currentDate);
      const isToday = currentDate.getTime() === today.getTime();
      const marking = markedDates[dateString];

      console.log("Week strip date marking:", {
        date: dateString,
        marking,
        isToday,
        habitStatus: habit.status,
        habitPausedAt: habit.pausedAt
      });

      const isCompleted = marking?.type === 'completed';
      const isPaused = marking?.type === 'paused';
      const dayStyle = [
        styles.weekDay,
        isCompleted && styles.completedDay,
        isPaused && {
          ...styles.pausedDay,
          backgroundColor: `${Colors.habitState.paused.default}15`, // Light blue background
          borderWidth: 2,
          borderColor: Colors.habitState.paused.default
        },
        isToday && styles.todayDay
      ];

      const textStyle = [
        styles.dayText,
        isToday && styles.todayText,
        isCompleted && styles.completedText,
        isPaused && {
          ...styles.pausedText,
          color: Colors.habitState.paused.default,
          fontWeight: "700" as const // TypeScript needs const assertion for font weight
        }
      ];

      console.log("Rendering cell:", {
        date: dateString,
        isCompleted,
        isPaused,
        marking: marking?.type
      });

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
                    color={
                       marking.type === 'completed'
                         ? Colors.success.default
                         : marking.type === 'paused'
                         ? Colors.habitState.paused.default
                         : marking.type === 'incomplete'
                         ? Colors.danger.default
                         : Colors.gray[400]
                     }
                     style={[
                       marking.type === 'completed' && {
                         opacity: 0.85,
                         transform: [{ scale: 1.1 }]
                       },
                       marking.type === 'paused' && {
                         transform: [{ scale: 1.2 }],
                         opacity: 0.75
                       },
                       marking.type === 'incomplete' && {
                         opacity: 0.7,
                         transform: [{ scale: 1.15 }]
                       }
                     ]}
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
          {Array.from({ length: 3 }, (_, i) => (
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
            const isToday = date.dateString === formatDateToYYYYMMDD(new Date());
            
            return (
              <View style={[
                styles.calendarDay,
                marking?.type === 'completed' && styles.completedDay,
                marking?.type === 'paused' && {
                  ...styles.pausedDay,
                  backgroundColor: `${Colors.habitState.paused.default}15`,
                  borderWidth: 2,
                  borderColor: Colors.habitState.paused.default
                },
                isToday && styles.todayDay
              ]}>
                <View style={styles.stackContainer}>
                  <Text style={[
                    styles.dayText,
                    isToday && styles.todayText,
                    marking?.type === 'completed' && styles.completedText,
                    marking?.type === 'paused' && {
                      ...styles.pausedText,
                      color: Colors.habitState.paused.default,
                      fontWeight: "700" as const
                    }
                  ]}>
                    {date.day}
                  </Text>
                  {marking?.type && (
                    <View style={styles.iconContainer}>
                      <Entypo
                        name="circle"
                        size={32}
                        color={
                          marking.type === 'completed'
                            ? Colors.success.default
                            : marking.type === 'paused'
                            ? Colors.habitState.paused.default
                            : marking.type === 'incomplete'
                            ? Colors.danger.default
                            : Colors.gray[400]
                        }
                        style={[
                          marking.type === 'completed' && {
                            opacity: 0.85,
                            transform: [{ scale: 1.1 }]
                          },
                          marking.type === 'paused' && {
                            transform: [{ scale: 1.2 }],
                            opacity: 0.75
                          },
                          marking.type === 'incomplete' && {
                            opacity: 0.7,
                            transform: [{ scale: 1.15 }]
                          }
                        ]}
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
  pausedDay: {
    borderColor: Colors.habitState.paused.default,
    borderWidth: 2.5,
    backgroundColor: `${Colors.habitState.paused.default}20`,
    padding: 2,
    borderRadius: 24,
    shadowColor: Colors.habitState.paused.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    // Add a subtle inner shadow for more depth
    borderStyle: 'solid',
    position: 'relative',
    overflow: 'visible',
  },
  pausedText: {
    color: Colors.habitState.paused.default,
    fontWeight: '700',
    opacity: 0.85,
    fontSize: 17, // Slightly larger for better visibility
    textShadowColor: Colors.habitState.paused.default,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
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
