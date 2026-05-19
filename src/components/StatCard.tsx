import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { Card as PaperCard, Text as PaperText } from 'react-native-paper';

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
    <View style={{ flex: 1, marginHorizontal: 6 }}>
      <PaperCard style={{ backgroundColor: colors.surface, borderRadius: 28 }} mode="elevated" elevation={2}>
        <PaperCard.Content style={{ alignItems: 'center', paddingVertical: 22, paddingHorizontal: 12 }}>
          <View style={[styles.iconWrapper, { backgroundColor: activeAccent + '15' }]}>
            <Icon size={20} color={activeAccent} strokeWidth={2.5} />
          </View>
          <PaperText variant="titleLarge" style={[styles.value, { color: colors.onSurface }]}>{value}</PaperText>
          <PaperText variant="labelMedium" style={[styles.label, { color: colors.onSurfaceVariant }]}>{label}</PaperText>
        </PaperCard.Content>
      </PaperCard>
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
