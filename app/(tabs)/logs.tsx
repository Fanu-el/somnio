import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import { useColorScheme } from 'nativewind';
import { MotiView } from 'moti';
import { useAppSelector, useAppDispatch, removeLocalLog, markSynced } from '../../src/store';
import { useSyncLogsMutation } from '../../src/api/sleepApi';
import { LogCard } from '../../src/components/LogCard';
import { useSafeBottom } from '../../src/hooks/useSafeArea';

export default function LogsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const safeBottom = useSafeBottom();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logs, isLoading } = useAppSelector((s: any) => s.sleep);
  const [syncLogs, { isLoading: isSyncing }] = useSyncLogsMutation();
  const netInfo = useNetInfo();

  const unsyncedLogs = logs.filter((l: any) => !l.synced);

  const handleSync = async () => {
    if (!unsyncedLogs.length) return;
    try {
      await syncLogs(unsyncedLogs).unwrap();
      dispatch(markSynced(unsyncedLogs.map((l: any) => l.id)));
    } catch (e) {
      console.error('Sync failed:', e);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background dark:bg-backgroundDark">
        <ActivityIndicator size="large" color={isDark ? '#9D8FFF' : '#5B4FE8'} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={['left', 'right']}>
      {/* Sync banner */}
      {unsyncedLogs.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          className="flex-row items-center justify-between px-4 py-3 bg-surfaceVariant dark:bg-surfaceVariantDark"
        >
          <View>
            <Text className="text-sm font-bold text-onSurface dark:text-onSurfaceDark">
              {unsyncedLogs.length} log{unsyncedLogs.length > 1 ? 's' : ''} not synced
            </Text>
            {netInfo.isConnected === false && (
              <Text className="text-xs text-error dark:text-errorDark mt-0.5">
                Offline – connect to sync
              </Text>
            )}
          </View>
          <Pressable
            onPress={handleSync}
            disabled={isSyncing || !netInfo.isConnected}
            className="px-4 py-2 rounded-xl bg-primary dark:bg-primaryDark disabled:opacity-40"
          >
            <Text className="text-white text-sm font-bold">
              {isSyncing ? 'Syncing…' : 'Sync Now'}
            </Text>
          </Pressable>
        </MotiView>
      )}

      <FlatList
        data={logs}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: safeBottom + 90 }}
        renderItem={({ item, index }: any) => (
          <LogCard
            log={item}
            index={index}
            onDelete={(id) => dispatch(removeLocalLog(id))}
          />
        )}
        ListEmptyComponent={
          <View className="items-center px-12 pt-20">
            <Text className="text-5xl mb-4">🌙</Text>
            <Text className="text-lg font-bold text-center text-onSurface dark:text-onSurfaceDark mb-1">
              No sleep logs yet
            </Text>
            <Text className="text-sm text-center text-onSurfaceVariant dark:text-onSurfaceVariantDark">
              Tap + to record your first night
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/add' as any)}
        style={{ bottom: safeBottom + 24 }}
        className="absolute right-4 w-14 h-14 rounded-2xl bg-primary dark:bg-primaryDark items-center justify-center shadow-lg"
      >
        <Text className="text-white text-3xl font-thin leading-none" style={{ marginTop: -2 }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
