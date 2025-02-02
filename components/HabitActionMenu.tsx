import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

interface HabitActionMenuProps {
  visible: boolean;
  habitStatus: 'active' | 'paused' | 'completed';
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
}

export default function HabitActionMenu({
  visible,
  habitStatus,
  onClose,
  onEdit,
  onDelete,
  onPause,
  onResume
}: HabitActionMenuProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderAction = (title: string, onPress?: () => void, color = Colors.gray[800]) => (
    <TouchableOpacity
      style={styles.action}
      onPress={() => {
        onPress?.();
        onClose();
      }}
    >
      <Text style={[styles.actionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  const renderStatusAction = () => {
    switch (habitStatus) {
      case 'active':
        return renderAction('Pause Habit', onPause);
      case 'paused':
        return renderAction('Resume Habit', onResume, Colors.primary.default);
      case 'completed':
        return null;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.menu,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderAction('Edit Habit', onEdit)}
          {renderStatusAction()}
          {renderAction('Delete Habit', onDelete, Colors.danger.default)}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    width: '80%',
    maxWidth: 300,
    padding: Spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  action: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});