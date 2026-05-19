import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';

import { Moon, Plus, CloudOff, RefreshCw } from 'lucide-react-native';

import { useAppSelector, useAppDispatch, removeLocalLog, markSynced, syncFromCloud } from '../../src/store';
import { useSyncLogsMutation } from '../../src/api/sleepApi';
import { LogCard } from '../../src/components/LogCard';
import { useSafeBottom } from '../../src/hooks/useSafeArea';
import { useTheme } from '../../src/hooks/useTheme';
import { notify } from '../../src/utils/notifications';

import { SkeletonCard } from '../../src/components/Skeleton';
import { Text as PaperText, Button as PaperButton, IconButton, FAB } from 'react-native-paper';

export default function LogsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const safeBottom = useSafeBottom();
  const { colors } = useTheme();
  const { logs, isLoading } = useAppSelector((s: any) => s.sleep);
  const [syncLogs, { isLoading: isSyncing }] = useSyncLogsMutation();
  const netInfo = useNetInfo();
  
  const [hasPromptedSync, setHasPromptedSync] = useState(false);

  const unsyncedLogs = logs.filter((l: any) => !l.synced);

  const handleSync = async () => {
    if (!unsyncedLogs.length) return;
    try {
      await syncLogs(unsyncedLogs).unwrap();
      await dispatch(markSynced(unsyncedLogs.map((l: any) => l.id)));
      notify.success('Synced', 'All local logs are now in the cloud.');
      setHasPromptedSync(true); 
    } catch (e) {
      console.error('Sync failed:', e);
      notify.error('Sync Failed', 'Could not sync logs to the cloud.');
    }
  };

  useEffect(() => {
    if (netInfo.isConnected && !isLoading) {
      dispatch(syncFromCloud());
    }
  }, [netInfo.isConnected, isLoading, dispatch]);

  useEffect(() => {
    if (netInfo.isConnected && unsyncedLogs.length > 0 && !hasPromptedSync && !isSyncing) {
      Alert.alert(
        'Offline Logs Detected',
        `You have ${unsyncedLogs.length} unsynced sleep logs. Would you like to sync them to the cloud now?`,
        [
          { text: 'Later', style: 'cancel', onPress: () => setHasPromptedSync(true) },
          { text: 'Sync Now', onPress: handleSync }
        ]
      );
    }
  }, [netInfo.isConnected, unsyncedLogs.length, hasPromptedSync, isSyncing, handleSync]);

  if (isLoading && logs.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 12 }}>
          <PaperText variant="headlineMedium" style={{ fontWeight: '900', color: colors.onSurface }}>Sleep Logs</PaperText>
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <SkeletonCard height={80} />
          <SkeletonCard height={80} />
          <SkeletonCard height={80} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      
      <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <PaperText variant="headlineMedium" style={{ fontWeight: '900', color: colors.onSurface }}>Sleep Logs</PaperText>
          <IconButton 
            icon={() => <Plus size={20} color={colors.primary} />} 
            size={24} 
            onPress={() => router.push('/add' as any)} 
            style={{ backgroundColor: colors.primary + '15', margin: 0 }}
          />
        </View>
        {netInfo.isConnected === false && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.error + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
            <CloudOff size={14} color={colors.error} />
            <PaperText variant="labelSmall" style={{ fontWeight: '800', color: colors.error }}>OFFLINE</PaperText>
          </View>
        )}
      </View>

        {unsyncedLogs.length > 0 && (
          <View
            style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginHorizontal: 16,
              marginBottom: 12,
              padding: 14,
              borderRadius: 20,
              backgroundColor: colors.primary + '10',
              borderWidth: 1.5,
              borderColor: colors.primary + '30'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={20} color="#fff" />
              </View>
              <View>
                <PaperText variant="titleMedium" style={{ fontWeight: '800', color: colors.onSurface }}>
                  {unsyncedLogs.length} Pending Sync
                </PaperText>
                <PaperText variant="labelMedium" style={{ color: colors.onSurfaceVariant, fontWeight: '500' }}>
                  Local records not in cloud
                </PaperText>
              </View>
            </View>
            <PaperButton
              mode="contained"
              onPress={handleSync}
              loading={isSyncing}
              disabled={isSyncing || !netInfo.isConnected}
              style={{ backgroundColor: colors.primary, borderRadius: 12 }}
            >
              Sync Now
            </PaperButton>
          </View>
        )}

      <FlatList
        data={logs}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: safeBottom + 100 }}
        refreshing={isSyncing}
        onRefresh={() => dispatch(syncFromCloud())}
        renderItem={({ item, index }: any) => (
          <LogCard
            log={item}
            index={index}
            onDelete={(id) => dispatch(removeLocalLog(id))}
            onPress={() => router.push({ pathname: '/add', params: { id: item.id } } as any)}
          />
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingHorizontal: 40, paddingTop: 60 }}>
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Moon size={48} color={colors.outline} />
            </View>
            <PaperText variant="headlineSmall" style={{ fontWeight: '900', color: colors.onSurface, marginBottom: 12, textAlign: 'center' }}>
              No sleep logs yet
            </PaperText>
            <PaperText variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
              Your sleep history is currently empty. Start logging tonight to see your trends!
            </PaperText>
            <PaperButton
              mode="contained"
              icon={() => <Plus size={18} color="#fff" strokeWidth={3} />}
              onPress={() => router.push('/add' as any)}
              style={{ backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 4 }}
              labelStyle={{ color: '#fff', fontSize: 15, fontWeight: '800' }}
            >
              Log Sleep Now
            </PaperButton>
          </View>
        }
      />

      <View
        style={{ position: 'absolute', right: 24, bottom: safeBottom + 24 }}
      >
        <FAB
          icon={() => <Plus size={28} color="#fff" strokeWidth={3} />}
          onPress={() => router.push('/add' as any)}
          style={{ backgroundColor: colors.primary, borderRadius: 24 }}
          color="#fff"
        />
      </View>
    </SafeAreaView>
  );
}
