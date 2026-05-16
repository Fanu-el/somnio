import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Plus, 
  CloudMoon
} from 'lucide-react-native';

import { useAppSelector } from '../../src/store';
import { SleepSummaryCard } from '../../src/components/SleepSummaryCard';
import { StatCard } from '../../src/components/StatCard';
import { LogCard } from '../../src/components/LogCard';
import { useSafeBottom } from '../../src/hooks/useSafeArea';
import { dateUtils } from '../../src/utils/date';
import { useTheme } from '../../src/hooks/useTheme';

export default function HomeScreen() {
  const router = useRouter();
  const safeBottom = useSafeBottom();
  const { colors } = useTheme();
  const { logs } = useAppSelector((s: any) => s.sleep);

  const recentLogs = logs.slice(0, 3);
  const lastLog = logs[0] ?? null;
  const greeting = dateUtils.getGreeting();

  const GreetingIcon = useMemo(() => {
    switch (greeting.type) {
      case 'morning':   return Sunrise;
      case 'afternoon': return Sun;
      case 'evening':   return Sunset;
      case 'night':     return Moon;
      case 'late':      return CloudMoon;
      default:          return Sparkles;
    }
  }, [greeting.type]);

  const avgQuality = useMemo(() =>
    logs.length ? (logs.reduce((a: number, l: any) => a + l.quality, 0) / logs.length).toFixed(1) : '-',
  [logs]);

  const avgDuration = useMemo(() => {
    if (!logs.length) return '-';
    const avg = logs.reduce((a: number, l: any) => {
      return a + (new Date(l.wakeTime).getTime() - new Date(l.sleepTime).getTime());
    }, 0) / logs.length;
    return `${(avg / 3600000).toFixed(1)}h`;
  }, [logs]);

  const streak = useMemo(() => dateUtils.calculateStreak(logs), [logs]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: safeBottom + 32 }}>
        
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 24 }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GreetingIcon size={24} color={colors.primary} />
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.onSurface }}>{greeting.text}</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '600' }}>
              {dateUtils.formatFullDate()}
            </Text>
          </View>
        </MotiView>

        {/* Hero card */}
        <SleepSummaryCard log={lastLog} />

        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 32 }}>
          <StatCard icon={TrendingUp} label="Quality" value={`${avgQuality}/5`} delay={100} accent={colors.tertiary} />
          <StatCard icon={Moon} label="Avg Sleep" value={avgDuration} delay={180} accent={colors.primary} />
          <StatCard icon={Zap} label="Streak" value={`${streak}d`} delay={260} accent="#FBBF24" />
        </View>

        {/* Recent dreams section */}
        {recentLogs.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 350 }}
            style={{ paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: colors.onSurface }}>
                Recent Dreams
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/logs' as any)}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>See all</Text>
              </Pressable>
            </View>
            {recentLogs.map((log: any, i: number) => (
              <LogCard key={log.id} log={log} onDelete={() => {}} index={i} compact />
            ))}
          </MotiView>
        )}

        {/* CTA */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 400, damping: 15 }}
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <Pressable
            onPress={() => router.push('/add' as any)}
            style={{ 
              backgroundColor: colors.primary, 
              borderRadius: 20, 
              paddingVertical: 18, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 10,
              elevation: 4,
              shadowColor: colors.primary,
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 }
            }}
          >
            <Plus size={20} color="#fff" strokeWidth={3} />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}>
              Log Tonight&apos;s Sleep
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
