import React, { useState } from 'react';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EmojiPicker from 'rn-emoji-keyboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ArrowLeft } from 'lucide-react-native';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { useAppDispatch, useAppSelector, addLocalLog, updateLocalLog, markSynced } from '../src/store';
import { useSafeAreaInsets } from '../src/hooks/useSafeArea';
import { useTheme } from '../src/hooks/useTheme';
import { dateUtils, UNIQUE_TIMEZONES } from '../src/utils/date';
import { useSyncLogsMutation } from '../src/api/sleepApi';
import { notify } from '../src/utils/notifications';
import { TextInput as PaperInput, Button as PaperButton, Text as PaperText, IconButton, Card as PaperCard } from 'react-native-paper';

dayjs.extend(utc);
dayjs.extend(timezone);

const schema = z.object({
  sleepTime: z.string().min(1, 'Required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
  wakeTime: z.string().min(1, 'Required').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
  quality: z.number().min(1).max(5),
  dreams: z.string().optional(),
  emoji: z.string().optional(),
  timezone: z.string().min(1, 'Timezone required'),
});

type FormData = z.infer<typeof schema>;

const QUALITY_OPTS = [
  { val: 1, label: '😫', desc: 'Terrible' },
  { val: 2, label: '😕', desc: 'Poor' },
  { val: 3, label: '😐', desc: 'Okay' },
  { val: 4, label: '🙂', desc: 'Good' },
  { val: 5, label: '🤩', desc: 'Great' },
];

export default function AddLogScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { logs } = useAppSelector((s: any) => s.sleep);
  const existingLog = id ? logs.find((l: any) => l.id === id) : null;
  const { defaultTimezone } = useAppSelector((s: any) => s.settings);
  const [submitting, setSubmitting] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showTzModal, setShowTzModal] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sleepTime: existingLog ? dayjs(existingLog.sleepTime).tz(existingLog.timezone).format('HH:mm') : '22:00',
      wakeTime: existingLog ? dayjs(existingLog.wakeTime).tz(existingLog.timezone).format('HH:mm') : '06:00',
      quality: existingLog ? existingLog.quality : 3,
      dreams: existingLog ? existingLog.dreams || '' : '',
      emoji: existingLog ? existingLog.emoji || '' : '',
      timezone: existingLog ? existingLog.timezone : defaultTimezone,
    },
  });

  const [syncLogs] = useSyncLogsMutation();

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { date, sleepTime, wakeTime } = dateUtils.createLogDates(
      data.sleepTime, 
      data.wakeTime, 
      data.timezone, 
      existingLog?.date
    );

    const logRecord = {
      date: existingLog ? existingLog.date : date,
      sleepTime,
      wakeTime,
      timezone: data.timezone,
      quality: data.quality as 1 | 2 | 3 | 4 | 5,
      dreams: data.dreams,
      emoji: data.emoji,
    };

    try {
      let savedRecord;
      if (existingLog) {
        const updatedLog = {
          ...logRecord,
          id: existingLog.id,
          synced: false,
        };
        savedRecord = await dispatch(updateLocalLog(updatedLog)).unwrap();
      } else {
        savedRecord = await dispatch(addLocalLog(logRecord)).unwrap();
      }

      if (savedRecord) {
        // Fire sync in the background without awaiting it to unblock navigation
        syncLogs([savedRecord])
          .unwrap()
          .then(() => {
            dispatch(markSynced([savedRecord.id]));
            notify.success(existingLog ? 'Updated' : 'Logged', existingLog ? 'Sleep record updated and synced.' : 'Sleep record saved and synced.');
          })
          .catch((syncErr) => {
            console.log('[AddLog] Immediate sync failed, will sync later.', syncErr);
            notify.info(existingLog ? 'Updated Locally' : 'Logged Locally', 'Saved offline. Will sync when back online.');
          });
      }
      
      router.back();
    } catch (err: any) {
      console.error('Save Sleep Log Error:', err);
      notify.error('Database Error', err?.message || 'Failed to save sleep log.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>
        
        <IconButton 
          icon={() => <ArrowLeft size={24} color={colors.onSurface} />} 
          size={24} 
          onPress={() => router.back()} 
          style={{ backgroundColor: colors.surfaceVariant, marginBottom: 20 }}
        />

        <PaperText variant="headlineLarge" style={{ fontWeight: '900', color: colors.onSurface, marginBottom: 24, letterSpacing: -0.5 }}>
          {existingLog ? 'Edit Sleep Log' : 'Log Your Sleep'}
        </PaperText>

        <Controller
          control={control}
          name="sleepTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <PaperInput
              mode="outlined"
              label="Sleep Time"
              style={{ backgroundColor: colors.surface, marginBottom: 4 }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              error={!!errors.sleepTime}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="22:00"
            />
          )}
        />
        {errors.sleepTime && <PaperText style={{ color: colors.error, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>{errors.sleepTime.message}</PaperText>}

        <Controller
          control={control}
          name="wakeTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <PaperInput
              mode="outlined"
              label="Wake Time"
              style={{ backgroundColor: colors.surface, marginTop: 16, marginBottom: 4 }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              error={!!errors.wakeTime}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="06:00"
            />
          )}
        />
        {errors.wakeTime && <PaperText style={{ color: colors.error, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>{errors.wakeTime.message}</PaperText>}

        <PaperText variant="labelLarge" style={{ color: colors.primary, marginBottom: 6, marginTop: 16, letterSpacing: 1 }}>
          TIMEZONE
        </PaperText>
        <Controller
          control={control}
          name="timezone"
          render={({ field: { onChange, value } }) => (
            <>
              <Pressable
                onPress={() => setShowTzModal(true)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: colors.outline,
                  borderRadius: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: pressed ? colors.surfaceVariant + '50' : colors.surface,
                  marginBottom: 4,
                })}
              >
                <PaperText variant="bodyLarge" style={{ color: colors.onSurface }}>
                  {value}
                </PaperText>
                <ChevronDown size={18} color={colors.outline} />
              </Pressable>

              <Modal visible={showTzModal} transparent animationType="fade" onRequestClose={() => setShowTzModal(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                  <View
                    style={{ width: '90%', maxHeight: '70%', backgroundColor: colors.surface, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}
                  >
                    <PaperText variant="titleLarge" style={{ fontWeight: '900', color: colors.onSurface, marginBottom: 16 }}>Select Timezone</PaperText>
                    <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
                      {UNIQUE_TIMEZONES.map((tz) => {
                        const isSelected = value === tz;
                        return (
                          <Pressable
                            key={tz}
                            onPress={() => {
                              onChange(tz);
                              setShowTzModal(false);
                            }}
                            style={({ pressed }) => ({
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingVertical: 16,
                              paddingHorizontal: 8,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.surfaceVariant,
                              backgroundColor: pressed ? colors.surfaceVariant + '30' : 'transparent',
                              borderRadius: 8
                            })}
                          >
                            <PaperText style={{ flex: 1, color: isSelected ? colors.primary : colors.onSurface, fontWeight: isSelected ? '700' : '500' }}>
                              {tz}
                            </PaperText>
                            {isSelected && (
                              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                    <PaperButton mode="contained" onPress={() => setShowTzModal(false)}>
                      Close
                    </PaperButton>
                  </View>
                </View>
              </Modal>
            </>
          )}
        />

        <PaperText variant="labelLarge" style={{ color: colors.primary, marginBottom: 10, marginTop: 16, letterSpacing: 1 }}>
          SLEEP QUALITY
        </PaperText>
        <Controller
          control={control}
          name="quality"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {QUALITY_OPTS.map(q => {
                const selected = value === q.val;
                return (
                  <Pressable
                    key={q.val}
                    onPress={() => onChange(q.val)}
                    style={{
                      alignItems: 'center',
                      flex: 1,
                      marginHorizontal: 4,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.outline,
                      backgroundColor: selected ? colors.primary + '15' : colors.surface,
                    }}
                  >
                    <PaperText variant="headlineMedium">{q.label}</PaperText>
                    <PaperText variant="labelSmall" style={{ color: selected ? colors.primary : colors.onSurfaceVariant, marginTop: 4 }}>
                      {q.desc}
                    </PaperText>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <PaperText variant="labelLarge" style={{ color: colors.primary, marginBottom: 6, marginTop: 16, letterSpacing: 1 }}>
          DREAM EMOJI
        </PaperText>
        <Controller
          control={control}
          name="emoji"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <PaperInput
                mode="outlined"
                style={{ backgroundColor: colors.surface, flex: 1, textAlign: 'center' }}
                outlineColor={colors.outline}
                activeOutlineColor={colors.primary}
                onChangeText={onChange}
                value={value}
                placeholder="Pick an emoji 👉"
              />
              <Pressable
                onPress={() => setIsEmojiPickerOpen(true)}
                style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: colors.outline, backgroundColor: colors.surfaceVariant, marginTop: 6, marginBottom: 2 }}
              >
                <PaperText variant="headlineSmall">😊</PaperText>
              </Pressable>
              <EmojiPicker
                open={isEmojiPickerOpen}
                onClose={() => setIsEmojiPickerOpen(false)}
                onEmojiSelected={(em) => onChange(em.emoji)}
                theme={{
                  backdrop: '#00000080',
                  knob: colors.primary,
                  container: colors.surface,
                  header: colors.onSurface,
                  skinTonesContainer: colors.surfaceVariant,
                  category: {
                    icon: colors.onSurfaceVariant,
                    iconActive: colors.primary,
                    container: colors.surfaceVariant,
                    containerActive: colors.primary + '33',
                  },
                }}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="dreams"
          render={({ field: { onChange, onBlur, value } }) => (
            <PaperInput
              mode="outlined"
              label="Dream Notes (Optional)"
              style={{ backgroundColor: colors.surface, marginTop: 16 }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={4}
              placeholder="Describe your dreams…"
            />
          )}
        />

        <PaperButton
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          disabled={submitting}
          style={{ marginTop: 32, marginBottom: 40, borderRadius: 12, paddingVertical: 6 }}
          labelStyle={{ fontSize: 18, fontWeight: '900', letterSpacing: 0.5 }}
        >
          {existingLog ? 'Update Sleep Log' : 'Save Sleep Log'}
        </PaperButton>

      </ScrollView>
    </SafeAreaView>
  );
}
