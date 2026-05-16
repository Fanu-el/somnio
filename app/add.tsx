import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import EmojiPicker from 'rn-emoji-keyboard';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, addLocalLog } from '../src/store';
import { useSafeAreaInsets } from '../src/hooks/useSafeArea';
import { useTheme } from '../src/hooks/useTheme';
import { Loader } from '../src/components/Loader';
import { dateUtils, UNIQUE_TIMEZONES } from '../src/utils/date';

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
  const { defaultTimezone } = useAppSelector((s: any) => s.settings);
  const [submitting, setSubmitting] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sleepTime: '22:00',
      wakeTime: '06:00',
      quality: 3,
      dreams: '',
      emoji: '',
      timezone: defaultTimezone,
    },
  });

  const inputStyle = {
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    fontSize: 16,
    marginBottom: 4,
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    const { date, sleepTime, wakeTime } = dateUtils.createLogDates(data.sleepTime, data.wakeTime, data.timezone);

    await dispatch(addLocalLog({
      date,
      sleepTime,
      wakeTime,
      timezone: data.timezone,
      quality: data.quality as 1 | 2 | 3 | 4 | 5,
      dreams: data.dreams,
      emoji: data.emoji,
    }));

    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}>

        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.primary, marginBottom: 24 }}>
          Log Your Sleep
        </Text>

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, letterSpacing: 0.5 }}>
          SLEEP TIME
        </Text>
        <Controller
          control={control}
          name="sleepTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, errors.sleepTime && { borderColor: colors.error }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="22:00"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          )}
        />
        {errors.sleepTime && <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>{errors.sleepTime.message}</Text>}

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          WAKE TIME
        </Text>
        <Controller
          control={control}
          name="wakeTime"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, errors.wakeTime && { borderColor: colors.error }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="numbers-and-punctuation"
              placeholder="06:00"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          )}
        />
        {errors.wakeTime && <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>{errors.wakeTime.message}</Text>}

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          TIMEZONE
        </Text>
        <Controller
          control={control}
          name="timezone"
          render={({ field: { onChange, value } }) => (
            <View style={{ borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, marginBottom: 4 }}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                dropdownIconColor={colors.onSurface}
                style={{ color: colors.onSurface }}
                itemStyle={{ color: colors.onSurface }}
              >
                {UNIQUE_TIMEZONES.map(tz => (
                  <Picker.Item key={tz} label={tz} value={tz} />
                ))}
              </Picker>
            </View>
          )}
        />

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 10, marginTop: 16, letterSpacing: 0.5 }}>
          SLEEP QUALITY
        </Text>
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
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? colors.primary : colors.outline,
                      backgroundColor: selected ? colors.primary + '20' : colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{q.label}</Text>
                    <Text style={{ fontSize: 10, color: selected ? colors.primary : colors.onSurfaceVariant, marginTop: 2, fontWeight: '600' }}>
                      {q.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          DREAM EMOJI
        </Text>
        <Controller
          control={control}
          name="emoji"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput
                style={[inputStyle, { flex: 1, textAlign: 'center', fontSize: 22 }]}
                onChangeText={onChange}
                value={value}
                placeholder="Type or pick an emoji 👉"
                placeholderTextColor={colors.onSurfaceVariant}
              />
              <Pressable
                onPress={() => setIsEmojiPickerOpen(true)}
                style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: colors.outline, backgroundColor: colors.surfaceVariant }}
              >
                <Text style={{ fontSize: 22 }}>😊</Text>
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

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant, marginBottom: 6, marginTop: 16, letterSpacing: 0.5 }}>
          DREAM NOTES (OPTIONAL)
        </Text>
        <Controller
          control={control}
          name="dreams"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[inputStyle, { height: 120, textAlignVertical: 'top' }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              multiline
              numberOfLines={6}
              placeholder="Describe your dreams…"
              placeholderTextColor={colors.onSurfaceVariant}
            />
          )}
        />

        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={submitting}
          style={{
            marginTop: 28,
            backgroundColor: submitting ? colors.outline : colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Loader visible={submitting} inline size="small" color="#fff" />
          {!submitting && <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>Save Sleep Log</Text>}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
