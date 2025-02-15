import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform } from 'react-native';
import { LineChart, LineChartData } from 'react-native-chart-kit';
import { HabitStreak } from '../../types/habit';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CompletionTrendsProps {
  streakHistory: HabitStreak[];
  days?: number;
}

interface DataPoint {
  date: Date;
  completed: boolean;
  label: string;
  value: number;
}

interface ChartTouchEvent {
  index: number;
  x: number;
  y: number;
  value: number;
}

const transformData = (streakHistory: HabitStreak[], days: number = 30) => {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);

  // Create array of dates for the chart
  const dates: DataPoint[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return {
      date,
      completed: false,
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      value: 0
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
        item.value = 1;
      }
    });
  });

  return {
    labels: dates.map(d => d.label),
    data: dates.map(d => d.value),
    rawData: dates
  };
};

const CompletionTrends: React.FC<CompletionTrendsProps> = ({ streakHistory, days = 30 }) => {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const chartData = React.useMemo(
    () => transformData(streakHistory, days),
    [streakHistory, days]
  );

  const screenWidth = Dimensions.get('window').width;

  const handleDataPointClick = (event: ChartTouchEvent) => {
    setSelectedPoint(chartData.rawData[event.index]);
  };

  const chartProps: any = {
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.data
      }]
    },
    width: screenWidth - 40,
    height: 220,
    yAxisLabel: "",
    yAxisSuffix: "",
    yAxisInterval: 1,
    chartConfig: {
      backgroundColor: Colors.background.primary,
      backgroundGradientFrom: Colors.background.primary,
      backgroundGradientTo: Colors.background.primary,
      decimalPlaces: 0,
      color: (opacity = 1) => Colors.primary.default,
      labelColor: (opacity = 1) => Colors.text.secondary,
      style: {
        borderRadius: BorderRadius.lg
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: Colors.primary.default
      },
      propsForLabels: {
        fontSize: 10
      }
    },
    bezier: true,
    style: styles.chart,
    getDotColor: (dataPoint: number, index: number) => 
      chartData.rawData[index].completed ? Colors.primary.default : Colors.text.secondary,
    renderDotContent: ({x, y, index}: {x: number; y: number; index: number}) => (
      selectedPoint && index === chartData.labels.indexOf(selectedPoint.label) ? (
        <Animated.View 
          entering={FadeIn}
          style={[styles.tooltip, { top: y - 40, left: x - 50 }]}
        >
          <Text style={styles.tooltipText}>
            {selectedPoint.completed ? 'Completed' : 'Not completed'}
          </Text>
          <Text style={styles.tooltipDate}>
            {selectedPoint.date.toLocaleDateString()}
          </Text>
        </Animated.View>
      ) : null
    ),
    onDataPointClick: handleDataPointClick
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <LineChart {...chartProps} />
      </View>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary.default }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.text.secondary }]} />
          <Text style={styles.legendText}>Not Completed</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.md,
    padding: Spacing.md,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.lg
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.background.secondary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    width: 100,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tooltipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.primary,
    fontWeight: Typography.weights.medium,
  },
  tooltipDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
  },
});

export default CompletionTrends;