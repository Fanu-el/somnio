import React, { useState } from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Text as PaperText, TextInput as PaperInput, Button as PaperButton, Card as PaperCard } from 'react-native-paper';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { colors } = useTheme();
  const [code, setCode] = useState('');
  const [verify, { isLoading }] = useVerifyEmailMutation();
  const [resend, { isLoading: isResending }] = useResendVerificationMutation();

  const handleVerify = async () => {
    if (!code.trim()) { notify.error('Missing Code', 'Please enter the 6-digit code.'); return; }
    try {
      await verify({ email: email ?? '', code: code.trim() }).unwrap();
      notify.success('Verified', 'Your email has been verified.');
      router.replace('/login' as any);
    } catch (err: any) {
      notify.error('Verification Failed', err?.data?.error?.message ?? 'Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      const res = await resend({ email: email ?? '' }).unwrap();
      notify.success('Resent', res.data.message);
    } catch (err: any) {
      notify.error('Error', err?.data?.error?.message ?? 'Could not resend code.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <PaperText variant="displaySmall">📬</PaperText>
          <PaperText variant="headlineSmall" style={{ fontWeight: '800', color: colors.onSurface, marginTop: 12 }}>Verify your email</PaperText>
          <PaperText variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
            We sent a 6-digit code to{'\n'}
            <PaperText style={{ color: colors.primary, fontWeight: '700' }}>{email}</PaperText>
          </PaperText>
        </View>

        <PaperCard style={{ backgroundColor: colors.surface }} mode="elevated" elevation={2}>
          <PaperCard.Content style={{ gap: 12 }}>
            <PaperInput
              mode="outlined"
              label="6-digit code"
              style={{ backgroundColor: colors.surface, textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: '700' }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
            />

            <PaperButton
              mode="contained"
              onPress={handleVerify}
              loading={isLoading}
              disabled={isLoading}
              style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 4 }}
              labelStyle={{ fontSize: 16, fontWeight: '800' }}
            >
              Verify Email
            </PaperButton>

            <PaperButton
              mode="text"
              onPress={handleResend}
              loading={isResending}
              disabled={isResending}
              textColor={colors.primary}
            >
              Resend code
            </PaperButton>
          </PaperCard.Content>
        </PaperCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
