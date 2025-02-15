import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants/theme';
import Animated, { FadeIn } from 'react-native-reanimated';

type DateRange = '7d' | '14d' | '30d' | '90d';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

const ranges: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 Days' },
  { value: '14d', label: '2 Weeks' },
  { value: '30d', label: '1 Month' },
  { value: '90d', label: '3 Months' },
];

export default function DateRangeFilter({ 
  selectedRange, 
  onRangeChange 
}: DateRangeFilterProps) {
  return (
    <Animated.View 
      entering={FadeIn}
      style={styles.container}
    >
      <View style={styles.filterRow}>
        {ranges.map((range) => (
          <TouchableOpacity
            key={range.value}
            onPress={() => onRangeChange(range.value)}
            activeOpacity={0.7}
            style={[
              styles.filterButton,
              selectedRange === range.value && styles.selectedFilter
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedRange === range.value && styles.selectedFilterText
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    borderWidth: 1,
    borderColor: Colors.background.secondary,
  },
  selectedFilter: {
    backgroundColor: Colors.primary.default,
    borderColor: Colors.primary.default,
  },
  filterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.weights.medium,
  },
  selectedFilterText: {
    color: Colors.background.primary,
    fontWeight: Typography.weights.semibold,
  },
});