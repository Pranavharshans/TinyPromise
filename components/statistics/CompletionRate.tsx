import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useStats } from '../../contexts/stats';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface CompletionRateProps {
  habitId: string;
}

export const CompletionRate: React.FC<CompletionRateProps> = ({ habitId }) => {
  const { habitStats } = useStats();
  const stats = habitStats.get(habitId);

  if (!stats) return null;

  const completionRate = Math.round(stats.completionRate);
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completion Rate</Text>
      <View style={styles.progressContainer}>
        <Svg height={100} width={100} style={styles.progressCircle}>
          {/* Background circle */}
          <Circle
            cx={50}
            cy={50}
            r={36}
            stroke={Colors.gray[100]}
            strokeWidth={8}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={50}
            cy={50}
            r={36}
            stroke={Colors.primary.default}
            strokeWidth={8}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 50 50)`}
          />
          <SvgText
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="0.3em"
            dx="0em"
            fill={Colors.text.primary}
            fontSize={Typography.sizes.xl}
            fontWeight={Typography.weights.bold}
          >
            {completionRate}%
          </SvgText>
        </Svg>
      </View>
      <Text style={styles.caption}>
        {stats.totalCompletions} total check-ins
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    marginVertical: Spacing.sm,
    alignItems: 'center',
  },
  progressCircle: {
    transform: [{ rotateZ: '-90deg' }],
  },
  progressText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  caption: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});

export default CompletionRate;