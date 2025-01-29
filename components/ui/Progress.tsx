import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ProgressProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  roundness?: 'none' | 'sm' | 'md' | 'full';
}

export default function Progress({
  progress,
  height = 8,
  color = Colors.primary.default,
  backgroundColor = Colors.gray[200],
  style,
  animated = true,
  roundness = 'full',
}: ProgressProps) {
  const [width, setWidth] = React.useState(0);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [progress, animated]);

  const getBorderRadius = () => {
    switch (roundness) {
      case 'none':
        return 0;
      case 'sm':
        return BorderRadius.sm;
      case 'md':
        return BorderRadius.md;
      case 'full':
        return height;
    }
  };

  const borderRadius = getBorderRadius();

  const progressWidth = Math.max(0, Math.min(1, progress)) * width;

  const containerStyle = [
    styles.container,
    {
      height,
      backgroundColor,
      borderRadius,
    },
    style,
  ];

  const progressStyle = [
    styles.progress,
    {
      width: progressWidth,
      backgroundColor: color,
      borderRadius,
    },
  ];

  return (
    <View
      style={containerStyle}
      onLayout={({ nativeEvent }) => {
        setWidth(nativeEvent.layout.width);
      }}
    >
      <View style={progressStyle}>
        <View style={styles.shine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});