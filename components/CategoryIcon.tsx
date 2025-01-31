import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';
import { IconSymbol } from './ui/IconSymbol';

export type CategoryIconType =
  | 'health'
  | 'fitness'
  | 'mindfulness'
  | 'productivity'
  | 'learning'
  | 'social'
  | 'other';

const categoryColors: Record<CategoryIconType, string> = {
  health: '#4CAF50',
  fitness: '#FF5722',
  mindfulness: '#9C27B0',
  productivity: '#2196F3',
  learning: '#FFC107',
  social: '#E91E63',
  other: Colors.gray[400],
};

const categoryIcons: Record<CategoryIconType, string> = {
  health: '🫀',
  fitness: '💪',
  mindfulness: '🧘',
  productivity: '⚡',
  learning: '📚',
  social: '👥',
  other: '🎯',
};

interface CategoryIconProps {
  category: CategoryIconType;
  size?: 'sm' | 'md' | 'lg';
}

export default function CategoryIcon({ 
  category, 
  size = 'md' 
}: CategoryIconProps) {
  const getSize = () => {
    switch (size) {
      case 'sm': return 24;
      case 'lg': return 40;
      default: return 32;
    }
  };

  const iconSize = getSize();
  const fontSize = iconSize * 0.6;

  return (
    <View
      style={[
        styles.container,
        {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          backgroundColor: categoryColors[category] + '20',
        },
      ]}
    >
      <IconSymbol
        name={categoryIcons[category]}
        size={fontSize}
        style={styles.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  icon: {
    textAlign: 'center',
  },
});