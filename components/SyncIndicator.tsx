import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../constants/theme';

interface SyncIndicatorProps {
  syncing?: boolean;
  size?: number;
}

export default function SyncIndicator({ syncing = false, size = 12 }: SyncIndicatorProps) {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (syncing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [syncing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!syncing) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [{ rotate: spin }],
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  indicator: {
    borderWidth: 2,
    borderColor: Colors.primary.default,
    borderTopColor: Colors.primary.light,
  },
});