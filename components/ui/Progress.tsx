import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Typography } from '../../constants/theme';

interface ProgressProps {
  progress?: number; // percentage (0-100)
  value?: number; // decimal (0-1)
  height?: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  type?: 'linear' | 'circular';
}

const Progress: React.FC<ProgressProps> = ({ 
  progress,
  value,
  height = 4,
  size = 40,
  thickness = 4,
  color,
  trackColor,
  style,
  showValue = false,
  valueFormatter,
  type = 'linear'
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const defaultTintColor = useThemeColor({}, 'tint');
  const tintColor = color || defaultTintColor;
  const track = trackColor || backgroundColor;

  // Convert value to percentage if value is provided
  const percentage = progress ?? (value != null ? value * 100 : 0);
  const clampedProgress = Math.min(Math.max(percentage, 0), 100);

  if (type === 'circular') {
    const radius = (size - thickness) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
      <View style={[styles.circularContainer, { width: size, height: size }, style]}>
        <View style={styles.svgContainer}>
          <View style={[
            styles.circularTrack,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: thickness,
              borderColor: track
            }
          ]} />
          <View style={[
            styles.circularProgress,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: thickness,
              borderColor: tintColor,
              transform: [{ rotate: '-90deg' }],
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              opacity: clampedProgress > 0 ? 1 : 0
            }
          ]} />
        </View>
        {showValue && (
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: tintColor }]}>
              {valueFormatter ? valueFormatter(value ?? clampedProgress / 100) : `${Math.round(clampedProgress)}%`}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: track, height }, 
      style
    ]}>
      <View 
        style={[
          styles.progressBar, 
          { 
            backgroundColor: tintColor,
            width: `${clampedProgress}%` 
          }
        ]} 
      />
      {showValue && (
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: tintColor }]}>
            {valueFormatter ? valueFormatter(value ?? clampedProgress / 100) : `${Math.round(clampedProgress)}%`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  circularContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  circularTrack: {
    position: 'absolute',
  },
  circularProgress: {
    position: 'absolute',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

export default Progress;