import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useThemeColor } from '../../hooks/useThemeColor';

interface ProgressProps {
  progress: number; // percentage (0-100)
  height?: number;
  color?: string;
  style?: ViewStyle;
}

const Progress: React.FC<ProgressProps> = ({ 
  progress, 
  height = 4, 
  color,
  style 
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const defaultTintColor = useThemeColor({}, 'tint');
  const tintColor = color || defaultTintColor;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[
      styles.container, 
      { backgroundColor, height }, 
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
});

export default Progress;