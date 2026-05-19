import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2, RefreshCw, Trash2, MessageSquare, Clock } from 'lucide-react-native';
import { SleepRecord } from '../types';
import { useTheme } from '../hooks/useTheme';
import { dateUtils } from '../utils/date';
import { Card as PaperCard, Text as PaperText, IconButton } from 'react-native-paper';

interface LogCardProps {
  log: SleepRecord;
  onDelete: (id: string) => void;
  index?: number;
  compact?: boolean;
  onPress?: () => void;
}

const qualityColors: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#8B5CF6',
};

const qualityEmoji = ['', '😫', '😕', '😐', '🙂', '🤩'];

export const LogCard = ({ log, onDelete, index = 0, compact = false, onPress }: LogCardProps) => {
  const { colors } = useTheme();
  const qColor = qualityColors[log.quality] ?? colors.primary;

  return (
    <View>
      <PaperCard 
        onPress={onPress} 
        style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: qColor }]} 
        mode="elevated" 
        elevation={2}
      >
        <PaperCard.Content style={styles.body}>
          {/* Header */}
          <View style={styles.headerRow}>
            <PaperText variant="labelLarge" style={[styles.dateText, { color: colors.onSurfaceVariant }]}>
              {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </PaperText>
            <View style={styles.rightHeader}>
              {log.synced ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <CheckCircle2 size={10} color={colors.primary} />
                  <PaperText variant="labelSmall" style={[styles.badge, { color: colors.primary }]}>Synced</PaperText>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.outline + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <RefreshCw size={10} color={colors.outline} />
                  <PaperText variant="labelSmall" style={[styles.badge, { color: colors.outline }]}>Local Only</PaperText>
                </View>
              )}
              {!compact && (
                <IconButton 
                  icon={() => <Trash2 size={16} color={colors.error} opacity={0.7} />} 
                  size={16} 
                  onPress={() => onDelete(log.id)} 
                  style={styles.deleteBtn}
                />
              )}
            </View>
          </View>

          {/* Duration + emoji */}
          <View style={styles.mainRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <PaperText variant="headlineSmall" style={[styles.duration, { color: colors.onSurface }]}>
                {dateUtils.formatDuration(log.sleepTime, log.wakeTime)}
              </PaperText>
            </View>
            <PaperText style={styles.qualityEmoji}>{log.emoji || qualityEmoji[log.quality]}</PaperText>
          </View>

          {/* Times */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={12} color={colors.onSurfaceVariant} />
            <PaperText variant="bodySmall" style={[styles.timesText, { color: colors.onSurfaceVariant }]}>
              {dateUtils.fmtTime(log.sleepTime)} — {dateUtils.fmtTime(log.wakeTime)}
            </PaperText>
          </View>

          {/* Dream snippet */}
          {!compact && log.dreams ? (
            <View style={[styles.dreamsContainer, { backgroundColor: colors.surfaceVariant + '40', borderLeftColor: colors.primary }]}>
              <MessageSquare size={12} color={colors.primary} style={{ marginTop: 2 }} />
              <PaperText numberOfLines={2} variant="bodySmall" style={[styles.dreams, { color: colors.onSurface }]}>
                {log.dreams}
              </PaperText>
            </View>
          ) : null}
        </PaperCard.Content>
      </PaperCard>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  body: { paddingVertical: 12, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateText: { fontWeight: '600' },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  deleteBtn: { margin: 0, padding: 0 },
  mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  duration: { fontWeight: '800', letterSpacing: -0.8 },
  qualityEmoji: { fontSize: 24 },
  timesText: { fontWeight: '500' },
  dreamsContainer: { 
    marginTop: 12, 
    padding: 10, 
    borderRadius: 10, 
    flexDirection: 'row', 
    gap: 8,
    borderLeftWidth: 3,
  },
  dreams: { flex: 1, lineHeight: 18, opacity: 0.8 },
});
