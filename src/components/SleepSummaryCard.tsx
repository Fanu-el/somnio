import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { SleepRecord } from '../types';
import { useTheme } from '../hooks/useTheme';
import { Moon } from 'lucide-react-native';

import { dateUtils } from '../utils/date';

interface Props {
  log: SleepRecord | null;
}

const qualityEmoji = ['', '😫', '😕', '😐', '🙂', '🤩'];
const qualityLabel = ['', 'Poor', 'Fair', 'Okay', 'Great', 'Excellent'];

export const SleepSummaryCard = ({ log }: Props) => {
  const { isDark, colors } = useTheme();
  
  const gradient: [string, string, string] = isDark 
    ? ['#2E1B69', '#5B2D8E', '#7B3FAC'] 
    : [colors.primary, colors.secondary, colors.tertiary];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 600, delay: 200 }}
      style={styles.wrapper}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {log ? (
          <>
            <Text style={styles.chip}>LAST NIGHT</Text>
            <Text style={styles.duration}>{dateUtils.formatDuration(log.sleepTime, log.wakeTime)}</Text>
            <View style={styles.row}>
              <Text style={styles.emoji}>{log.emoji || qualityEmoji[log.quality]}</Text>
              <Text style={styles.qualityText}>{qualityLabel[log.quality]} sleep</Text>
            </View>
            <View style={[styles.row, styles.timesRow]}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>FELL ASLEEP</Text>
                <Text style={styles.timeValue}>{dateUtils.fmtTime(log.sleepTime)}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
              <View style={styles.timeBlock}>
                <Text style={styles.timeLabel}>WOKE UP</Text>
                <Text style={styles.timeValue}>{dateUtils.fmtTime(log.wakeTime)}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={{ marginBottom: 12 }}>
              <Moon size={48} color="rgba(255,255,255,0.5)" />
            </View>
            <Text style={styles.emptyText}>No sleep logged yet</Text>
            <Text style={styles.emptyHint}>Tap + to record your first night</Text>
          </View>
        )}
      </LinearGradient>
    </MotiView>
  );
};

const WHITE = 'rgba(255,255,255,0.92)';
const WHITE60 = 'rgba(255,255,255,0.6)';

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 16, borderRadius: 24, overflow: 'hidden', elevation: 6 },
  gradient: { padding: 24 },
  chip: { color: WHITE60, letterSpacing: 1.5, marginBottom: 8, fontSize: 11, fontWeight: '700' },
  duration: { fontSize: 52, fontWeight: '800', color: WHITE, letterSpacing: -1 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  emoji: { fontSize: 22, marginRight: 6 },
  qualityText: { color: WHITE, fontSize: 16, fontWeight: '600' },
  timesRow: { marginTop: 20, justifyContent: 'space-between' },
  timeBlock: { alignItems: 'center' },
  timeLabel: { color: WHITE60, fontSize: 10, letterSpacing: 1.2 },
  timeValue: { color: WHITE, fontWeight: '700', fontSize: 18, marginTop: 2 },
  arrow: { color: WHITE60, fontSize: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 16 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { color: WHITE, fontSize: 18, fontWeight: '700' },
  emptyHint: { color: WHITE60, fontSize: 13, marginTop: 4 },
});
