import React, { useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset, 
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

import { Skeleton, SkeletonCard } from '../../src/components/Skeleton';
import { Button as PaperButton, Text as PaperText } from 'react-native-paper';

export default function HomeScreen() {
  const router = useRouter();
  const safeBottom = useSafeBottom();
  const { colors } = useTheme();
  const { logs, isLoading } = useAppSelector((s: any) => s.sleep);

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
      default:          return Moon;
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

  const hasLoggedToday = useMemo(() => {
    if (!lastLog) return false;
    const tz = lastLog.timezone || 'UTC';
    return dayjs(lastLog.date).tz(tz).isSame(dayjs().tz(tz), 'day');
  }, [lastLog]);

  if (isLoading && logs.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 24 }}>
          <Skeleton width={180} height={32} radius={8} />
          <Skeleton width={140} height={16} radius={4} style={{ marginTop: 8 }} />
        </View>
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <Skeleton width="100%" height={160} radius={24} />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 32 }}>
          <Skeleton width="30%" height={100} radius={20} style={{ marginHorizontal: 5 }} />
          <Skeleton width="30%" height={100} radius={20} style={{ marginHorizontal: 5 }} />
          <Skeleton width="30%" height={100} radius={20} style={{ marginHorizontal: 5 }} />
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
          <SkeletonCard height={60} hasIcon={false} />
          <SkeletonCard height={60} hasIcon={false} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: safeBottom + 32 }}>
        
        {/* Header */}
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, marginBottom: 24 }}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <GreetingIcon size={24} color={colors.primary} />
              <PaperText variant="headlineMedium" style={{ fontWeight: '900', color: colors.onSurface }}>{greeting.text}</PaperText>
            </View>
            <PaperText variant="labelLarge" style={{ color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '600' }}>
              {dateUtils.formatFullDate()}
            </PaperText>
          </View>
        </View>

        {/* Hero card */}
        <Pressable
          onPress={() => lastLog && router.push({ pathname: '/add', params: { id: lastLog.id } } as any)}
          disabled={!lastLog}
          style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}
        >
          <SleepSummaryCard log={lastLog} />
        </Pressable>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 15, marginBottom: 32 }}>
          <StatCard icon={TrendingUp} label="Quality" value={`${avgQuality}/5`} delay={100} accent={colors.tertiary} />
          <StatCard icon={Moon} label="Avg Sleep" value={avgDuration} delay={180} accent={colors.primary} />
          <StatCard icon={Zap} label="Streak" value={`${streak}d`} delay={260} accent="#FBBF24" />
        </View>

        {/* Recent dreams section */}
        {recentLogs.length > 0 && (
          <View
            style={{ paddingHorizontal: 20 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <PaperText variant="titleLarge" style={{ flex: 1, fontWeight: '800', color: colors.onSurface }}>
                Recent Dreams
              </PaperText>
              <PaperButton mode="text" onPress={() => router.push('/(tabs)/logs' as any)} textColor={colors.primary} compact>
                See all
              </PaperButton>
            </View>
            {recentLogs.map((log: any, i: number) => (
              <LogCard 
                key={log.id} 
                log={log} 
                onDelete={() => {}} 
                index={i} 
                compact 
                onPress={() => router.push({ pathname: '/add', params: { id: log.id } } as any)}
              />
            ))}
          </View>
        )}

        {/* CTA */}
        <View
          style={{ marginHorizontal: 20, marginTop: 24 }}
        >
          <PaperButton
            mode="contained"
            icon={() => <Plus size={20} color="#fff" strokeWidth={3} />}
            onPress={() => {
              if (hasLoggedToday && lastLog) {
                router.push({ pathname: '/add', params: { id: lastLog.id } } as any);
              } else {
                router.push('/add' as any);
              }
            }}
            style={{ 
              backgroundColor: hasLoggedToday ? colors.secondary : colors.primary, 
              borderRadius: 20, 
              paddingVertical: 8, 
            }}
            labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 }}
          >
            {hasLoggedToday ? "Update Tonight's Sleep" : "Log Tonight's Sleep"}
          </PaperButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
