import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';

interface CardProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  contentStyle?: StyleProp<ViewStyle>;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  shadowColor?: string;
}

export default function Card({
  children,
  style,
  variant = 'default',
  contentStyle,
  onPress,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  shadowColor,
  ...pressableProps
}: CardProps) {
  const getCardStyle = () => {
    const baseStyles: StyleProp<ViewStyle>[] = [styles.card];
    
    if (variant === 'elevated') {
      baseStyles.push(styles.elevated);
      if (shadowColor) {
        baseStyles.push({ shadowColor });
      }
    } else if (variant === 'outlined') {
      baseStyles.push(styles.outlined);
    }
    
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const content = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const cardBackground = gradientColors ? (
    <LinearGradient
      colors={gradientColors}
      start={gradientStart}
      end={gradientEnd}
      style={getCardStyle()}
    >
      {content}
    </LinearGradient>
  ) : (
    <View style={getCardStyle()}>{content}</View>
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
        {cardBackground}
      </Pressable>
    );
  }

  return cardBackground;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  elevated: {
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.background.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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