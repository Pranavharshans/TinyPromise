import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { HabitStreak } from '../../types/habit';
import { Colors } from '../../constants/theme';

interface CompletionTrendsProps {
  streakHistory: HabitStreak[];
  days?: number;
}

const transformData = (streakHistory: HabitStreak[], days: number = 30) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);

  // Create array of dates for the chart
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return {
      date,
      completed: false,
      label: `${date.getDate()}/${date.getMonth() + 1}`
    };
  });

  // Mark completed dates from streak history
  streakHistory.forEach(streak => {
    const start = new Date(streak.startDate);
    const end = new Date(streak.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    dates.forEach(item => {
      if (
        item.date >= start &&
        item.date <= end &&
        streak.completed
      ) {
        item.completed = true;
      }
    });
  });

  return {
    labels: dates.map(d => d.label),
    data: dates.map(d => d.completed ? 1 : 0)
  };
};

const CompletionTrends: React.FC<CompletionTrendsProps> = ({ streakHistory, days = 30 }) => {
  const chartData = React.useMemo(
    () => transformData(streakHistory, days),
    [streakHistory, days]
  );

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <LineChart
          data={{
            labels: chartData.labels,
            datasets: [{
              data: chartData.data
            }]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: Colors.background.primary,
            backgroundGradientFrom: Colors.background.primary,
            backgroundGradientTo: Colors.background.primary,
            decimalPlaces: 0,
            color: (opacity = 1) => Colors.primary.default,
            labelColor: (opacity = 1) => Colors.text.secondary,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: Colors.primary.default
            },
            propsForLabels: {
              fontSize: 10
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 8
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    marginVertical: 8,
    padding: 10,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default CompletionTrends;