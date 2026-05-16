import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { MotiView } from 'moti';

interface Props {
  visible?: boolean;
  inline?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const Loader = ({ visible = true, inline = false, message, size = 'large', color }: Props) => {
  const { colors } = useTheme();
  const activeColor = color || colors.primary;

  if (!visible) return null;

  if (inline) {
    return <ActivityIndicator size={size} color={activeColor} />;
  }

  const content = (
    <View style={[styles.container, !inline && styles.fullScreen, { backgroundColor: inline ? 'transparent' : 'rgba(0,0,0,0.4)' }]}>
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        style={[styles.card, { backgroundColor: colors.surface }]}
      >
        <ActivityIndicator size="large" color={activeColor} />
        {message && (
          <Text style={[styles.message, { color: colors.onSurface }]}>
            {message}
          </Text>
        )}
      </MotiView>
    </View>
  );

  if (inline) return content;

  return (
    <Modal transparent visible={visible} animationType="fade">
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
