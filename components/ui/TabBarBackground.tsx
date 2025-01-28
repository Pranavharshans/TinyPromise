import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return (
    <View style={styles.background} />
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
