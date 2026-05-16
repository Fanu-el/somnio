import React, { useMemo } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useAppSelector } from '../../src/store';
import { SleepSummaryCard } from '../../src/components/SleepSummaryCard';
import { StatCard } from '../../src/components/StatCard';
import { LogCard } from '../../src/components/LogCard';
import { useSafeBottom } from '../../src/hooks/useSafeArea';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return { text: 'Still up?',       emoji: '🌌' };
  if (h < 12) return { text: 'Good morning',     emoji: '🌅' };
  if (h < 17) return { text: 'Good afternoon',   emoji: '☀️' };
  if (h < 21) return { text: 'Good evening',     emoji: '🌆' };
  return       { text: 'Good night',             emoji: '🌙' };
};

const calcStreak = (logs: any[]) => {
  if (!logs.length) return 0;
  const dates = logs.map(l => new Date(l.date).toDateString());
  let streak = 0;
  const d = new Date();
  while (dates.includes(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export default function HomeScreen() {
  const router = useRouter();
  const safeBottom = useSafeBottom();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logs } = useAppSelector((s: any) => s.sleep);

  const recentLogs = logs.slice(0, 3);
  const lastLog = logs[0] ?? null;
  const greeting = getGreeting();

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

  const streak = useMemo(() => calcStreak(logs), [logs]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: safeBottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          className="flex-row items-center px-5 pt-5 pb-4 gap-3"
        >
          <Text className="text-4xl">{greeting.emoji}</Text>
          <View>
            <Text className="text-2xl font-extrabold tracking-tight text-onBackground dark:text-onBackgroundDark">
              {greeting.text}
            </Text>
            <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariantDark">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </MotiView>

        {/* Hero card */}
        <SleepSummaryCard log={lastLog} isDark={isDark} />

        {/* Stats row */}
        <View className="flex-row px-3 mb-6">
          <StatCard icon="⭐" label="Avg Quality" value={`${avgQuality}/5`} delay={100} accent={isDark ? '#E879A0' : '#C026D3'} />
          <StatCard icon="🌙" label="Avg Sleep" value={avgDuration} delay={180} accent={isDark ? '#9D8FFF' : '#5B4FE8'} />
          <StatCard icon="🔥" label="Day Streak" value={`${streak}d`} delay={260} accent="#FBBF24" />
        </View>

        {/* Recent dreams section */}
        {recentLogs.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 350 }}
          >
            <View className="flex-row justify-between items-center px-4 mb-1">
              <Text className="text-lg font-bold text-onBackground dark:text-onBackgroundDark">
                Recent Dreams
              </Text>
              <Pressable onPress={() => router.push('/(tabs)/logs' as any)}>
                <Text className="text-primary dark:text-primaryDark font-semibold">See all</Text>
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
          className="mx-4 mt-6"
        >
          <Pressable
            onPress={() => router.push('/add' as any)}
            className="bg-primary dark:bg-primaryDark rounded-2xl py-4 items-center"
          >
            <Text className="text-white dark:text-onPrimaryDark text-base font-bold tracking-wide">
              + Log Tonight&apos;s Sleep
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
