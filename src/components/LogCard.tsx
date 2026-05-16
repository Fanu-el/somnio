import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Cloud, Trash2, MessageSquare, Clock } from 'lucide-react-native';
import { SleepRecord } from '../types';
import { useTheme } from '../hooks/useTheme';
import { dateUtils } from '../utils/date';

interface LogCardProps {
  log: SleepRecord;
  onDelete: (id: string) => void;
  index?: number;
  compact?: boolean;
}

const qualityColors: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#8B5CF6',
};

const qualityEmoji = ['', '😫', '😕', '😐', '🙂', '🤩'];

export const LogCard = ({ log, onDelete, index = 0, compact = false }: LogCardProps) => {
  const { colors } = useTheme();
  const qColor = qualityColors[log.quality] ?? colors.primary;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 80 }}
      style={[styles.card, { backgroundColor: colors.surface, borderLeftColor: qColor }]}
    >
      <View style={styles.body}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>
            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <View style={styles.rightHeader}>
            {log.synced && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Cloud size={12} color={colors.primary} />
                <Text style={[styles.badge, { color: colors.primary }]}>Synced</Text>
              </View>
            )}
            {!compact && (
              <Pressable onPress={() => onDelete(log.id)} hitSlop={12} style={styles.deleteBtn}>
                <Trash2 size={16} color={colors.error} opacity={0.7} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Duration + emoji */}
        <View style={styles.mainRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[styles.duration, { color: colors.onSurface }]}>
              {dateUtils.formatDuration(log.sleepTime, log.wakeTime)}
            </Text>
          </View>
          <Text style={styles.qualityEmoji}>{log.emoji || qualityEmoji[log.quality]}</Text>
        </View>

        {/* Times */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Clock size={12} color={colors.onSurfaceVariant} />
          <Text style={[styles.timesText, { color: colors.onSurfaceVariant }]}>
            {dateUtils.fmtTime(log.sleepTime)} — {dateUtils.fmtTime(log.wakeTime)}
          </Text>
        </View>

        {/* Dream snippet */}
        {!compact && log.dreams ? (
          <View style={[styles.dreamsContainer, { backgroundColor: colors.surfaceVariant + '40', borderLeftColor: colors.primary }]}>
            <MessageSquare size={12} color={colors.primary} style={{ marginTop: 2 }} />
            <Text numberOfLines={2} style={[styles.dreams, { color: colors.onSurface }]}>
              {log.dreams}
            </Text>
          </View>
        ) : null}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 20,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  body: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dateText: { fontSize: 13, fontWeight: '600' },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  deleteBtn: { padding: 4 },
  mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  duration: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8 },
  qualityEmoji: { fontSize: 24 },
  timesText: { fontSize: 13, fontWeight: '500' },
  dreamsContainer: { 
    marginTop: 12, 
    padding: 10, 
    borderRadius: 10, 
    flexDirection: 'row', 
    gap: 8,
    borderLeftWidth: 3,
  },
  dreams: { flex: 1, fontSize: 13, lineHeight: 18, opacity: 0.8 },
});
