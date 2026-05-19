import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SleepRecord } from '../types';
import { useTheme } from '../hooks/useTheme';
import { Moon } from 'lucide-react-native';

import { dateUtils } from '../utils/date';

interface Props {
  log: SleepRecord | null;
}

const qualityEmoji = ['', '😫', '😕', '😐', '🙂', '🤩'];
const qualityLabel = ['', 'Poor', 'Fair', 'Okay', 'Great', 'Excellent'];

import { Card as PaperCard, Text as PaperText } from 'react-native-paper';

export const SleepSummaryCard = ({ log }: Props) => {
  const { isDark, colors } = useTheme();
  
  const gradient: [string, string, string] = isDark 
    ? ['#2E1B69', '#5B2D8E', '#7B3FAC'] 
    : [colors.primary, colors.secondary, colors.tertiary];

  return (
    <View>
      <PaperCard style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 24, overflow: 'hidden' }} mode="elevated" elevation={3}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {log ? (
            <>
              <PaperText variant="labelSmall" style={styles.chip}>LAST NIGHT</PaperText>
              <PaperText variant="displayLarge" style={styles.duration}>{dateUtils.formatDuration(log.sleepTime, log.wakeTime)}</PaperText>
              <View style={styles.row}>
                <PaperText style={styles.emoji}>{log.emoji || qualityEmoji[log.quality]}</PaperText>
                <PaperText variant="titleMedium" style={styles.qualityText}>{qualityLabel[log.quality]} sleep</PaperText>
              </View>
              <View style={[styles.row, styles.timesRow]}>
                <View style={styles.timeBlock}>
                  <PaperText variant="labelSmall" style={styles.timeLabel}>FELL ASLEEP</PaperText>
                  <PaperText variant="titleMedium" style={styles.timeValue}>{dateUtils.fmtTime(log.sleepTime)}</PaperText>
                </View>
                <PaperText style={styles.arrow}>→</PaperText>
                <View style={styles.timeBlock}>
                  <PaperText variant="labelSmall" style={styles.timeLabel}>WOKE UP</PaperText>
                  <PaperText variant="titleMedium" style={styles.timeValue}>{dateUtils.fmtTime(log.wakeTime)}</PaperText>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={{ marginBottom: 12 }}>
                <Moon size={48} color="rgba(255,255,255,0.5)" />
              </View>
              <PaperText variant="titleLarge" style={styles.emptyText}>No sleep logged yet</PaperText>
              <PaperText variant="bodyMedium" style={styles.emptyHint}>Tap + to record your first night</PaperText>
            </View>
          )}
        </LinearGradient>
      </PaperCard>
    </View>
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
