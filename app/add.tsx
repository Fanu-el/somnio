import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EmojiPicker from 'rn-emoji-keyboard';
import { Picker } from '@react-native-picker/picker';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, addLocalLog } from '../src/store';
import { useSafeAreaInsets } from '../src/hooks/useSafeArea';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const utc = require('dayjs/plugin/utc');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const timezonePlugin = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezonePlugin);

const COMMON_TIMEZONES = [
  (dayjs as any).tz.guess(),
  'America/Los_Angeles',
  'America/New_York',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Australia/Sydney',
  'UTC',
];
const UNIQUE_TIMEZONES = Array.from(new Set(COMMON_TIMEZONES));

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [submitting, setSubmitting] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // theme tokens
  const bg = isDark ? '#0A0818' : '#F5F3FF';
  const surface = isDark ? '#13102A' : '#FFFFFF';
  const surfaceVariant = isDark ? '#1E1B40' : '#EDE9FE';
  const onSurface = isDark ? '#E8E5FF' : '#1A1635';
  const onSurfaceVariant = isDark ? '#C4BCFF' : '#4C4578';
  const primary = isDark ? '#9D8FFF' : '#5B4FE8';
  const outline = isDark ? '#3D3870' : '#C4BCFF';
  const errorColor = isDark ? '#FCA5A5' : '#DC2626';

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sleepTime: '22:00',
      wakeTime: '06:00',
      quality: 3,
      dreams: '',
      emoji: '',
      timezone: (dayjs as any).tz.guess() || 'UTC',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const now = (dayjs as any)().tz(data.timezone);
    const [sH, sM] = data.sleepTime.split(':').map(Number);
    let sleepDate = now.hour(sH).minute(sM).second(0).millisecond(0);
    const [wH, wM] = data.wakeTime.split(':').map(Number);
    let wakeDate = now.hour(wH).minute(wM).second(0).millisecond(0);
    if (sleepDate.isAfter(wakeDate)) sleepDate = sleepDate.subtract(1, 'day');

    await dispatch(addLocalLog({
      date: now.toISOString(),
      sleepTime: sleepDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      timezone: data.timezone,
      quality: data.quality as 1 | 2 | 3 | 4 | 5,
      dreams: data.dreams,
      emoji: data.emoji,
    }));
    setSubmitting(false);
    router.back();
  };

  const inputStyle = {
    borderWidth: 1.5,
    borderColor: outline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: onSurface,
    backgroundColor: surface,
    fontSize: 16,
    marginBottom: 4,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>

        <Text style={{ fontSize: 26, fontWeight: '800', color: primary, marginBottom: 24 }}>
          Log Your Sleep
        </Text>

        {/* Sleep Time */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 6, letterSpacing: 0.5 }}>
          SLEEP TIME
        </Text>
        <Controller
          control={control}
          name="sleepTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, errors.sleepTime && { borderColor: errorColor }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="22:00"
              placeholderTextColor={onSurfaceVariant}
            />
          )}
        />
        {errors.sleepTime && <Text style={{ color: errorColor, fontSize: 12, marginBottom: 8 }}>{errors.sleepTime.message}</Text>}

        {/* Wake Time */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          WAKE TIME
        </Text>
        <Controller
          control={control}
          name="wakeTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, errors.wakeTime && { borderColor: errorColor }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="06:00"
              placeholderTextColor={onSurfaceVariant}
            />
          )}
        />
        {errors.wakeTime && <Text style={{ color: errorColor, fontSize: 12, marginBottom: 8 }}>{errors.wakeTime.message}</Text>}

        {/* Timezone */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          TIMEZONE
        </Text>
        <Controller
          control={control}
          name="timezone"
          render={({ field: { onChange, value } }) => (
            <View style={{ borderWidth: 1.5, borderColor: outline, borderRadius: 12, overflow: 'hidden', backgroundColor: surface, marginBottom: 4 }}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                dropdownIconColor={onSurface}
                style={{ color: onSurface }}
                itemStyle={{ color: onSurface }}
              >
                {UNIQUE_TIMEZONES.map(tz => (
                  <Picker.Item key={tz} label={tz} value={tz} />
                ))}
              </Picker>
            </View>
          )}
        />

        {/* Sleep Quality */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 10, marginTop: 16, letterSpacing: 0.5 }}>
          SLEEP QUALITY
        </Text>
        <Controller
          control={control}
          name="quality"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              {QUALITY_OPTS.map(q => {
                const selected = value === q.val;
                return (
                  <Pressable
                    key={q.val}
                    onPress={() => onChange(q.val)}
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? primary : outline,
                      backgroundColor: selected ? primary + '20' : surface,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{q.label}</Text>
                    <Text style={{ fontSize: 10, color: selected ? primary : onSurfaceVariant, marginTop: 2, fontWeight: '600' }}>
                      {q.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        {/* Emoji */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          DREAM EMOJI
        </Text>
        <Controller
          control={control}
          name="emoji"
          render={({ field: { onChange, value } }) => (
            <>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                <TextInput
                  style={[inputStyle, { flex: 1, marginBottom: 0 }]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Type or pick an emoji 👉"
                  placeholderTextColor={onSurfaceVariant}
                />
                <Pressable
                  onPress={() => setIsEmojiPickerOpen(true)}
                  style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: outline, backgroundColor: surfaceVariant }}
                >
                  <Text style={{ fontSize: 22 }}>😊</Text>
                </Pressable>
              </View>
              <EmojiPicker
                open={isEmojiPickerOpen}
                onClose={() => setIsEmojiPickerOpen(false)}
                onEmojiSelected={(em) => onChange(em.emoji)}
                theme={{
                  backdrop: '#00000080',
                  knob: primary,
                  container: surface,
                  header: onSurface,
                  skinTonesContainer: surfaceVariant,
                  category: {
                    icon: onSurfaceVariant,
                    iconActive: primary,
                    container: surfaceVariant,
                    containerActive: primary + '33',
                  },
                }}
              />
            </>
          )}
        />

        {/* Dreams */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          DREAM NOTES (OPTIONAL)
        </Text>
        <Controller
          control={control}
          name="dreams"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, { minHeight: 120, textAlignVertical: 'top', paddingTop: 14 }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={6}
              placeholder="Describe your dreams…"
              placeholderTextColor={onSurfaceVariant}
            />
          )}
        />

        {/* Submit */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={{
            marginTop: 28,
            backgroundColor: submitting ? outline : primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>Save Log</Text>
          }
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
