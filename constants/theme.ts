import { TextStyle } from 'react-native';

export const Colors = {
  primary: {
    light: '#6366F1', // Indigo-500
    default: '#4F46E5', // Indigo-600
    dark: '#4338CA', // Indigo-700
  },
  habit: {
    orange: '#FE8810',
    yellow: '#F4D06E',
    teal: '#9EDAD2',
  },
  success: {
    light: '#34D399', // Emerald-400
    default: '#059669', // Emerald-600
    dark: '#047857', // Emerald-700
  },
  danger: {
    light: '#F87171', // Red-400
    default: '#EF4444', // Red-500
    dark: '#DC2626', // Red-600
  },
  warning: {
    light: '#FBBF24', // Amber-400
    default: '#F59E0B', // Amber-500
    dark: '#D97706', // Amber-600
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#6B7280',
    inverse: '#FFFFFF',
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  default: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

export const BorderRadius = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  default: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

type FontWeight = TextStyle['fontWeight'];

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    default: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400' as FontWeight,
    medium: '500' as FontWeight,
    semibold: '600' as FontWeight,
    bold: '700' as FontWeight,
  },
  families: {
    default: undefined, // System default
    mono: 'SpaceMono',
  },
};

export default {
  Colors,
  Shadows,
  BorderRadius,
  Spacing,
  Typography,
};