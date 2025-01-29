import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const getButtonColors = (variant: ButtonVariant) => {
    switch (variant) {
      case 'primary':
        return {
          bg: Colors.primary.default,
          text: Colors.text.inverse,
          border: Colors.primary.default,
        };
      case 'secondary':
        return {
          bg: Colors.background.primary,
          text: Colors.primary.default,
          border: Colors.primary.default,
        };
      case 'danger':
        return {
          bg: Colors.danger.default,
          text: Colors.text.inverse,
          border: Colors.danger.default,
        };
      case 'success':
        return {
          bg: Colors.success.default,
          text: Colors.text.inverse,
          border: Colors.success.default,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: Colors.text.primary,
          border: Colors.gray[200],
        };
    }
  };

  const getButtonSize = (size: ButtonSize) => {
    switch (size) {
      case 'sm':
        return {
          padding: 8,
          fontSize: Typography.sizes.sm,
        };
      case 'md':
        return {
          padding: 12,
          fontSize: Typography.sizes.default,
        };
      case 'lg':
        return {
          padding: 16,
          fontSize: Typography.sizes.md,
        };
    }
  };

  const buttonColors = getButtonColors(variant);
  const buttonSize = getButtonSize(size);

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: buttonColors.bg,
      borderColor: buttonColors.border,
      paddingVertical: buttonSize.padding,
      paddingHorizontal: buttonSize.padding * 2,
      opacity: disabled ? 0.6 : 1,
    },
    variant === 'secondary' || variant === 'ghost' ? styles.bordered : null,
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyleFinal = [
    styles.text,
    {
      color: buttonColors.text,
      fontSize: buttonSize.fontSize,
    },
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator 
          color={buttonColors.text} 
          size={size === 'sm' ? 'small' : 'small'} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={textStyleFinal}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadows.sm,
  },
  bordered: {
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});