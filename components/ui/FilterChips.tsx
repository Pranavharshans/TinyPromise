import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

export type FilterOption = {
  id: string;
  label: string;
  count: number;
};

interface FilterChipsProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export default function FilterChips({
  options,
  selectedId,
  onSelect,
  style,
}: FilterChipsProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.chip,
            selectedId === option.id && styles.chipSelected,
          ]}
          onPress={() => onSelect(option.id)}
        >
          <Text
            style={[
              styles.label,
              selectedId === option.id && styles.labelSelected,
            ]}
          >
            {option.label} ({option.count})
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  chipSelected: {
    backgroundColor: Colors.primary.light,
    borderColor: Colors.primary.default,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text.secondary,
  },
  labelSelected: {
    color: Colors.primary.default,
  },
});