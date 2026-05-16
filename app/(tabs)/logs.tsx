import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import { MotiView } from 'moti';
import { Moon, Plus, CloudOff, RefreshCw } from 'lucide-react-native';

import { useAppSelector, useAppDispatch, removeLocalLog, markSynced } from '../../src/store';
import { useSyncLogsMutation } from '../../src/api/sleepApi';
import { LogCard } from '../../src/components/LogCard';
import { useSafeBottom } from '../../src/hooks/useSafeArea';
import { useTheme } from '../../src/hooks/useTheme';
import { Loader } from '../../src/components/Loader';

export default function LogsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const safeBottom = useSafeBottom();
  const { colors } = useTheme();
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Loader visible={true} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['left', 'right']}>
      {/* Sync banner */}
      {unsyncedLogs.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginHorizontal: 16,
            marginTop: 8,
            padding: 14,
            borderRadius: 16,
            backgroundColor: colors.surfaceVariant,
            borderWidth: 1,
            borderColor: colors.outline + '20'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.onSurface }}>
                {unsyncedLogs.length} Log{unsyncedLogs.length > 1 ? 's' : ''} Pending
              </Text>
              {netInfo.isConnected === false && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <CloudOff size={10} color={colors.error} />
                  <Text style={{ fontSize: 11, color: colors.error, fontWeight: '600' }}>Offline</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={handleSync}
            disabled={isSyncing || !netInfo.isConnected}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: colors.primary,
              opacity: (isSyncing || !netInfo.isConnected) ? 0.5 : (pressed ? 0.8 : 1)
            })}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
              {isSyncing ? 'Syncing…' : 'Sync Now'}
            </Text>
          </Pressable>
        </MotiView>
      )}

      <FlatList
        data={logs}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: safeBottom + 100 }}
        renderItem={({ item, index }: any) => (
          <LogCard
            log={item}
            index={index}
            onDelete={(id) => dispatch(removeLocalLog(id))}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingHorizontal: 40, paddingTop: 80 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Moon size={40} color={colors.outline} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.onSurface, marginBottom: 8 }}>
              No sleep logs yet
            </Text>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40 }}>
              Tap the button below to record your first night.
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', delay: 500 }}
        style={{ position: 'absolute', right: 20, bottom: safeBottom + 20 }}
      >
        <Pressable
          onPress={() => router.push('/add' as any)}
          style={({ pressed }) => ({
            width: 64,
            height: 64,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 8,
            shadowColor: colors.primary,
            shadowOpacity: 0.4,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 8 },
            transform: [{ scale: pressed ? 0.95 : 1 }]
          })}
        >
          <Plus size={32} color="#fff" strokeWidth={2.5} />
        </Pressable>
      </MotiView>
    </SafeAreaView>
  );
}
