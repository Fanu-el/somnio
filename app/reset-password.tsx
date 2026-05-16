import React from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResetPasswordMutation } from '../src/api/authApi';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Loader } from '../src/components/Loader';

const schema = z.object({
  email: z.string().email('Valid email required'),
  code: z.string().length(6, '6-digit code required'),
  newPassword: z.string().min(8, 'Min. 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', code: '', newPassword: '' },
  });

  const inputStyle = { borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: colors.onSurface, backgroundColor: colors.background, fontSize: 15, marginBottom: 4 };

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data).unwrap();
      notify.success('Password Reset', 'You can now log in with your new password.');
      router.replace('/login' as any);
    } catch (err: any) {
      notify.error('Reset Failed', err?.data?.error?.message ?? 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 44 }}>🔐</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.onSurface, marginTop: 10 }}>New Password</Text>
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 4 }}>
          {(['email', 'code', 'newPassword'] as const).map((field) => (
            <View key={field}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginBottom: 6, marginTop: field === 'email' ? 0 : 12 }}>
                {field === 'email' ? 'EMAIL' : field === 'code' ? 'RESET CODE' : 'NEW PASSWORD'}
              </Text>
              <Controller control={control} name={field} render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={[inputStyle, errors[field] && { borderColor: colors.error }]}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  keyboardType={field === 'code' ? 'number-pad' : field === 'email' ? 'email-address' : 'default'}
                  autoCapitalize="none" secureTextEntry={field === 'newPassword'}
                  placeholder={field === 'code' ? '000000' : ''} placeholderTextColor={colors.outline}
                />
              )} />
              {errors[field] && <Text style={{ color: colors.error, fontSize: 12 }}>{errors[field]?.message}</Text>}
            </View>
          ))}
          <Pressable onPress={handleSubmit(onSubmit)} disabled={isLoading}
            style={{ backgroundColor: isLoading ? colors.outline : colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 20 }}>
            <Loader visible={isLoading} inline size="small" color="#fff" />
            {!isLoading && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Reset Password</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
