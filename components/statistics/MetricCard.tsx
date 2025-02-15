import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
  FadeIn,
} from 'react-native-reanimated';

interface MetricCardProps {
  value: string | number;
  label: string;
  tooltipText: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function MetricCard({ value, label, tooltipText, icon }: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 8 })
    );
    setShowTooltip(!showTooltip);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <AnimatedTouchable
        style={[styles.card, animatedStyle]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={22} 
            color={Colors.primary.default} 
          />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </AnimatedTouchable>
      
      {showTooltip && (
        <Animated.View 
          entering={FadeIn}
          style={styles.tooltip}
        >
          <Text style={styles.tooltipText}>{tooltipText}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
  },
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: Colors.background.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    top: -40,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tooltipText: {
    fontSize: Typography.sizes.xs,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});