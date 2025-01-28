import React from 'react';
import { 
  Platform, 
  Pressable,
  PressableProps,
  StyleSheet
} from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: PressableProps & { focused?: boolean }) {
  const { onPress, ...rest } = props;

  const handlePress = React.useCallback(
    (e: any) => {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.(e);
    },
    [onPress]
  );

  return (
    <Pressable
      {...rest}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.tab,
        pressed && styles.pressed
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }]
  }
});
