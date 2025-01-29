import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
  StyleProp,
} from 'react-native';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';

interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  contentStyle?: StyleProp<ViewStyle>;
}

export default function Card({
  children,
  style,
  variant = 'default',
  contentStyle,
  onPress,
  ...pressableProps
}: CardProps) {
  const getCardStyle = () => {
    const baseStyles: StyleProp<ViewStyle>[] = [styles.card];
    
    if (variant === 'elevated') {
      baseStyles.push(styles.elevated);
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlined);
    }
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          getCardStyle(),
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={getCardStyle()}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  elevated: {
    ...Shadows.default,
    backgroundColor: Colors.background.primary,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  content: {
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});