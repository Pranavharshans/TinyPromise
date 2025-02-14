const tintColorLight = '#4F46E5';
const tintColorDark = '#818CF8';

export const Colors = {
  light: {
    text: '#1F2937',
    background: '#FFFFFF',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
  },
  dark: {
    text: '#F3F4F6',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
  },
  text: {
    calendar: '#1F2937',
  },
  background: {
    primary: '#F3F4F6',
  },
  gray: {
    200: '#E5E7EB',
    400: '#9CA3AF',
    600: '#4B5563',
  },
  danger: {
    default: '#EF4444', // Red for missed/incomplete habits
    dark: '#DC2626',
  },
  success: {
    default: '#22C55E', // Green for completed habits
    dark: '#16A34A',
  },
  primary: {
    dark: '#4338CA',
  },
  habitState: {
    paused: {
      default: '#3B82F6', // Blue for paused habits
    },
  },
};
