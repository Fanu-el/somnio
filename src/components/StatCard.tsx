import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  delay?: number;
  accent?: string;
}

export const StatCard = ({ icon: Icon, label, value, delay = 0, accent }: StatCardProps) => {
  const { colors } = useTheme();
  const activeAccent = accent || colors.primary;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.85, translateY: 12 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'spring', delay, damping: 18, stiffness: 120 }}
      style={[styles.card, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: activeAccent + '15' }]}>
        <Icon size={22} color={activeAccent} />
      </View>
      <Text style={[styles.value, { color: activeAccent }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: { fontWeight: '800', fontSize: 20, letterSpacing: -0.5 },
  label: { marginTop: 4, textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});
