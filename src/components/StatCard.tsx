import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { MotiView } from 'moti';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  delay?: number;
  accent?: string;
}

export const StatCard = ({ icon, label, value, delay = 0, accent = '#9D8FFF' }: StatCardProps) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85, translateY: 12 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', delay, damping: 18, stiffness: 120 }}
      style={styles.card}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#1E1B40',
  },
  icon: { fontSize: 26, marginBottom: 6 },
  value: { fontWeight: '800', fontSize: 20 },
  label: { marginTop: 2, textAlign: 'center', fontSize: 11, color: '#C4BCFF' },
});
