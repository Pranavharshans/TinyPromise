import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { HabitStreak } from '../../types/habit';

interface CompletionTrendsProps {
  streakHistory: HabitStreak[];
  days?: number;
}

export const CompletionTrends: React.FC<CompletionTrendsProps> = ({
  streakHistory,
  days = 30
}) => {
  const chartData = useMemo(() => {
    if (!streakHistory || streakHistory.length === 0) {
      console.log('[CompletionTrends] No streak history data');
      return [];
    }

    console.log('[CompletionTrends] Processing streak history:', streakHistory.length, 'items');

    // Get the last 30 days of data
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    // Create a map of dates to completion rates
    const dateMap = new Map<string, { completed: number; total: number }>();
    
    // Initialize all dates in the range
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, { completed: 0, total: 0 });
    }

    // Fill in the actual data
    streakHistory.forEach(streak => {
      const startDate = new Date(streak.startDate);
      if (startDate >= thirtyDaysAgo) {
        const dateStr = startDate.toISOString().split('T')[0];
        if (dateMap.has(dateStr)) {
          const current = dateMap.get(dateStr)!;
          dateMap.set(dateStr, {
            completed: current.completed + (streak.completed ? 1 : 0),
            total: current.total + 1
          });
        }
      }
    });

    // Convert to array and calculate rates
    const data = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        x: new Date(date).getTime(),
        y: data.total > 0 ? (data.completed / data.total) * 100 : 0
      }))
      .sort((a, b) => a.x - b.x);

    console.log('[CompletionTrends] Processed chart data:', data);
    return data;
  }, [streakHistory, days]);

  if (!streakHistory || streakHistory.length === 0) {
    console.log('[CompletionTrends] Rendering empty state');
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Completion History</Text>
        <View style={styles.placeholderChart}>
          <Text style={styles.placeholderText}>
            No streak data available yet
          </Text>
          <Text style={styles.placeholderSubtext}>
            Complete habits to see your trends
          </Text>
        </View>
      </View>
    );
  }

  console.log('[CompletionTrends] Rendering chart with', chartData.length, 'data points');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completion History</Text>
      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          <VictoryChart
            height={200}
            padding={{ top: 20, bottom: 30, left: 40, right: 20 }}
          >
            <VictoryAxis
              tickFormat={(x) => {
                const date = new Date(x);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
              style={{
                axis: { stroke: Colors.text.secondary },
                tickLabels: { 
                  fill: Colors.text.secondary,
                  fontSize: 10
                }
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => `${Math.round(Number(t))}%`}
              style={{
                axis: { stroke: Colors.text.secondary },
                tickLabels: { 
                  fill: Colors.text.secondary,
                  fontSize: 10
                }
              }}
            />
            <VictoryLine
              data={chartData}
              style={{
                data: {
                  stroke: Colors.primary.default,
                  strokeWidth: 2
                }
              }}
              animate={{
                duration: 500,
                onLoad: { duration: 500 }
              }}
            />
          </VictoryChart>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No data available for the selected period
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    height: 220,
  },
  placeholderChart: {
    height: 200,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
    marginBottom: Spacing.xs,
  },
  placeholderSubtext: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.sm,
    opacity: 0.7,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: Colors.text.secondary,
    fontSize: Typography.sizes.md,
  }
});

export default CompletionTrends;