import React from 'react';
import { Platform, Text, TextStyle } from 'react-native';

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function IconSymbol({ name, size = 20, color, style }: IconSymbolProps) {
  // On iOS we use SF Symbols
  if (Platform.OS === 'ios') {
    return (
      <Text 
        style={[
          {
            fontSize: size,
            color: color,
            fontWeight: '400',
          },
          style
        ]}
      >
        {name}
      </Text>
    );
  }

  // For Android, we'll use a simple fallback icon
  return (
    <Text 
      style={[
        {
          fontSize: size,
          color: color,
          fontWeight: '400',
        },
        style
      ]}
    >
      •
    </Text>
  );
}
