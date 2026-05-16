import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SleepRecord } from '../types';

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

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDuration = (sleepIso: string, wakeIso: string) => {
  const diff = new Date(wakeIso).getTime() - new Date(sleepIso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

export const LogCard = ({ log, onDelete, index = 0, compact = false }: LogCardProps) => {
  const qColor = qualityColors[log.quality] ?? '#8B5CF6';

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 70 }}
      style={[styles.card, { borderLeftColor: qColor }]}
    >
      {/* Quality accent bar */}
      <View style={[styles.qualityBar, { backgroundColor: qColor }]} />

      <View style={styles.body}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.dateText}>
            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </Text>
          <View style={styles.rightHeader}>
            {log.synced && (
              <Text style={[styles.badge, { color: '#9D8FFF' }]}>☁ synced</Text>
            )}
            {!compact && (
              <Pressable onPress={() => onDelete(log.id)} hitSlop={8} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Duration + emoji */}
        <View style={styles.mainRow}>
          <Text style={styles.duration}>
            {formatDuration(log.sleepTime, log.wakeTime)}
          </Text>
          <Text style={styles.qualityEmoji}>{log.emoji || qualityEmoji[log.quality]}</Text>
        </View>

        {/* Times */}
        <Text style={styles.timesText}>
          {fmtTime(log.sleepTime)} → {fmtTime(log.wakeTime)}
        </Text>

        {/* Dream snippet */}
        {!compact && log.dreams ? (
          <Text numberOfLines={2} style={styles.dreams}>
            💭 {log.dreams}
          </Text>
        ) : null}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    // Surface color handled at runtime – default to white-ish
    backgroundColor: '#13102A',
  },
  qualityBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dateText: { fontSize: 12, color: '#C4BCFF' },
  rightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, opacity: 0.8 },
  deleteBtn: { padding: 4 },
  deleteText: { color: '#FCA5A5', fontSize: 15 },
  mainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  duration: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: '#E8E5FF' },
  qualityEmoji: { fontSize: 22 },
  timesText: { fontSize: 12, color: '#C4BCFF' },
  dreams: { marginTop: 8, fontStyle: 'italic', opacity: 0.85, fontSize: 13, color: '#C084FC' },
});
