import React, { useMemo } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useAppSelector } from '../../src/store';
import { useSafeBottom } from '../../src/hooks/useSafeArea';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const qualityColor: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E', 5: '#8B5CF6',
};

export default function ReportsScreen() {
  const safeBottom = useSafeBottom();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logs } = useAppSelector((s: any) => s.sleep);

  const totalLogs = logs.length;

  const avgQuality = useMemo(() =>
    totalLogs ? (logs.reduce((a: number, l: any) => a + l.quality, 0) / totalLogs).toFixed(1) : '–',
  [logs, totalLogs]);

  const avgDuration = useMemo(() => {
    if (!totalLogs) return '–';
    const ms = logs.reduce((a: number, l: any) =>
      a + (new Date(l.wakeTime).getTime() - new Date(l.sleepTime).getTime()), 0
    ) / totalLogs;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  }, [logs, totalLogs]);

  const weekData = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      const match = logs.find((l: any) => new Date(l.date).toDateString() === d.toDateString());
      const durationHrs = match
        ? (new Date(match.wakeTime).getTime() - new Date(match.sleepTime).getTime()) / 3600000
        : 0;
      return { day: DAYS[d.getDay()], hrs: durationHrs, quality: match?.quality ?? 0, isToday: i === 6 };
    });
  }, [logs]);

  const maxHrs = Math.max(...weekData.map(d => d.hrs), 1);

  const qualityDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0, 0];
    logs.forEach((l: any) => { dist[l.quality]++; });
    return dist.slice(1);
  }, [logs]);

  const statItems = [
    { label: 'Total Logs', value: String(totalLogs), icon: '📋', delay: 0 },
    { label: 'Avg Quality', value: `${avgQuality}/5`, icon: '⭐', delay: 80 },
    { label: 'Avg Duration', value: avgDuration, icon: '🌙', delay: 160 },
  ];

  const surfaceColor = isDark ? '#13102A' : '#FFFFFF';
  const surfaceVariantColor = isDark ? '#1E1B40' : '#EDE9FE';
  const onSurfaceColor = isDark ? '#E8E5FF' : '#1A1635';
  const onSurfaceVariantColor = isDark ? '#C4BCFF' : '#4C4578';
  const primaryColor = isDark ? '#9D8FFF' : '#5B4FE8';

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: safeBottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat cards */}
        <View className="flex-row px-3 py-4 gap-2">
          {statItems.map(s => (
            <MotiView
              key={s.label}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', delay: s.delay, damping: 18 }}
              style={{ flex: 1, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8, alignItems: 'center', backgroundColor: surfaceVariantColor }}
            >
              <Text style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: primaryColor }}>{s.value}</Text>
              <Text style={{ fontSize: 11, color: onSurfaceVariantColor, textAlign: 'center', marginTop: 2 }}>{s.label}</Text>
            </MotiView>
          ))}
        </View>

        {/* Weekly bar chart */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 250 }}
          style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 20, backgroundColor: surfaceColor, padding: 20, elevation: 3 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: onSurfaceColor, marginBottom: 16 }}>
            Weekly Sleep
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 }}>
            {weekData.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <MotiView
                  from={{ height: 0 }}
                  animate={{ height: d.hrs ? Math.max((d.hrs / maxHrs) * 100, 6) : 4 }}
                  transition={{ type: 'timing', duration: 700, delay: 300 + i * 80 }}
                  style={{
                    width: '60%',
                    borderRadius: 6,
                    backgroundColor: d.quality ? qualityColor[d.quality] : surfaceVariantColor,
                    opacity: d.hrs ? 1 : 0.35,
                  }}
                />
                <Text style={{ fontSize: 11, color: d.isToday ? primaryColor : onSurfaceVariantColor, marginTop: 4, fontWeight: d.isToday ? '700' : '400' }}>
                  {d.day}
                </Text>
                {d.hrs > 0 && (
                  <Text style={{ fontSize: 9, color: onSurfaceVariantColor }}>
                    {d.hrs.toFixed(1)}h
                  </Text>
                )}
              </View>
            ))}
          </View>
        </MotiView>

        {/* Quality distribution */}
        {totalLogs > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 400 }}
            style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 20, backgroundColor: surfaceColor, padding: 20, elevation: 3 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: onSurfaceColor, marginBottom: 16 }}>
              Quality Distribution
            </Text>
            {qualityDist.map((count, i) => {
              const pct = totalLogs ? count / totalLogs : 0;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 }}>
                  <Text style={{ fontSize: 18, width: 26 }}>{['😫', '😕', '😐', '🙂', '🤩'][i]}</Text>
                  <View style={{ flex: 1, height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: surfaceVariantColor }}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${pct * 100}%` } as any}
                      transition={{ type: 'timing', duration: 700, delay: 500 + i * 60 }}
                      style={{ height: '100%', borderRadius: 5, backgroundColor: Object.values(qualityColor)[i] }}
                    />
                  </View>
                  <Text style={{ width: 28, fontSize: 12, color: onSurfaceVariantColor, textAlign: 'right' }}>{count}</Text>
                </View>
              );
            })}
          </MotiView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
