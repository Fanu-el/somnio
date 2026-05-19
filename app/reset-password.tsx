import React from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useResetPasswordMutation } from '../src/api/authApi';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Text as PaperText, TextInput as PaperInput, Button as PaperButton, Card as PaperCard } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

const schema = z.object({
  email: z.string().email('Valid email required'),
  code: z.string().length(6, '6-digit code required'),
  newPassword: z.string().min(8, 'Min. 8 characters'),
});
type FormData = z.infer<typeof schema>;

const FIELD_CONFIG = [
  { name: 'email' as const, label: 'Email', keyboard: 'email-address' as const, secure: false, placeholder: 'you@example.com' },
  { name: 'code' as const, label: 'Reset Code', keyboard: 'number-pad' as const, secure: false, placeholder: '000000' },
  { name: 'newPassword' as const, label: 'New Password', keyboard: 'default' as const, secure: true, placeholder: 'Min. 8 characters' },
];

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', code: '', newPassword: '' },
  });

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
        <PaperButton
          mode="text"
          icon={() => <ArrowLeft size={18} color={colors.primary} />}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', marginBottom: 24 }}
          textColor={colors.primary}
        >
          Back
        </PaperButton>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <PaperText variant="displaySmall">🔐</PaperText>
          <PaperText variant="headlineSmall" style={{ fontWeight: '800', color: colors.onSurface, marginTop: 10 }}>New Password</PaperText>
        </View>

        <PaperCard style={{ backgroundColor: colors.surface }} mode="elevated" elevation={2}>
          <PaperCard.Content style={{ gap: 8 }}>
            {FIELD_CONFIG.map(field => (
              <View key={field.name}>
                <Controller
                  control={control}
                  name={field.name}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PaperInput
                      mode="outlined"
                      label={field.label}
                      style={{ backgroundColor: colors.surface, marginBottom: 4 }}
                      outlineColor={colors.outline}
                      activeOutlineColor={colors.primary}
                      error={!!errors[field.name]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType={field.keyboard}
                      autoCapitalize="none"
                      secureTextEntry={field.secure}
                      placeholder={field.placeholder}
                    />
                  )}
                />
                {errors[field.name] && (
                  <PaperText variant="labelSmall" style={{ color: colors.error, marginBottom: 4, marginLeft: 4 }}>
                    {errors[field.name]?.message}
                  </PaperText>
                )}
              </View>
            ))}

            <PaperButton
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 4, marginTop: 12 }}
              labelStyle={{ fontSize: 16, fontWeight: '800' }}
            >
              Reset Password
            </PaperButton>
          </PaperCard.Content>
        </PaperCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
