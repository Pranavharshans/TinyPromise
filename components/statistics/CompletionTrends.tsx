import React, { useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { HabitStreak } from '../../types/habit';
import Svg, { Path, Line, Text as SvgText } from 'react-native-svg';

interface CompletionTrendsProps {
  streakHistory: HabitStreak[];
  days?: number;
}

const CompletionTrends: React.FC<CompletionTrendsProps> = ({
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

  const renderChart = () => {
    if (chartData.length === 0) return null;

    const width = Dimensions.get('window').width - (Spacing.md * 4);
    const height = 180;
    const padding = { top: 20, bottom: 30, left: 40, right: 20 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Find min/max values
    const minY = 0;
    const maxY = 100;
    const minX = chartData[0].x;
    const maxX = chartData[chartData.length - 1].x;

    // Create points string for path
    const points = chartData.map((point, index) => {
      const x = padding.left + (graphWidth * (point.x - minX)) / (maxX - minX);
      const y = padding.top + graphHeight - (graphHeight * (point.y - minY)) / (maxY - minY);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Create axis labels
    const yAxisLabels = [0, 25, 50, 75, 100].map(value => ({
      value,
      y: padding.top + graphHeight - (graphHeight * (value - minY)) / (maxY - minY)
    }));

    // X-axis labels (show only 4 dates)
    const xAxisLabels = [0, 1, 2, 3].map(index => {
      const pointIndex = Math.floor((chartData.length - 1) * (index / 3));
      const point = chartData[pointIndex];
      const date = new Date(point.x);
      return {
        text: `${date.getDate()}/${date.getMonth() + 1}`,
        x: padding.left + (graphWidth * (point.x - minX)) / (maxX - minX)
      };
    });

    return (
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {yAxisLabels.map(label => (
          <Line
            key={label.value}
            x1={padding.left}
            y1={label.y}
            x2={width - padding.right}
            y2={label.y}
            stroke={Colors.text.secondary}
            strokeWidth="0.5"
            opacity={0.2}
          />
        ))}

        {/* Y-axis labels */}
        {yAxisLabels.map(label => (
          <SvgText
            key={label.value}
            x={padding.left - 5}
            y={label.y + 4}
            textAnchor="end"
            fill={Colors.text.secondary}
            fontSize="10"
          >
            {label.value}%
          </SvgText>
        ))}

        {/* X-axis labels */}
        {xAxisLabels.map((label, index) => (
          <SvgText
            key={index}
            x={label.x}
            y={height - 10}
            textAnchor="middle"
            fill={Colors.text.secondary}
            fontSize="10"
          >
            {label.text}
          </SvgText>
        ))}

        {/* Line chart */}
        <Path
          d={points}
          stroke={Colors.primary.default}
          strokeWidth="2"
          fill="none"
        />
      </Svg>
    );
  };

  console.log('[CompletionTrends] Rendering chart with', chartData.length, 'data points');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completion History</Text>
      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          renderChart()
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
    justifyContent: 'center',
    alignItems: 'center',
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