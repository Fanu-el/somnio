import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useVerifyEmailMutation, useResendVerificationMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Loader } from '../src/components/Loader';

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
          <Text style={{ fontSize: 48 }}>📬</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.onSurface, marginTop: 12 }}>Verify your email</Text>
          <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 8, textAlign: 'center' }}>
            We sent a 6-digit code to{'\n'}<Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 4 }}>
          <TextInput
            style={{
              borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 13, color: colors.onSurface,
              backgroundColor: colors.background, fontSize: 24, textAlign: 'center', letterSpacing: 8, fontWeight: '700',
            }}
            value={code} onChangeText={setCode}
            keyboardType="number-pad" maxLength={6}
            placeholder="000000" placeholderTextColor={colors.outline}
          />

          <Pressable
            onPress={handleVerify} disabled={isLoading}
            style={{ backgroundColor: isLoading ? colors.outline : colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 }}
          >
            <Loader visible={isLoading} inline size="small" color="#fff" />
            {!isLoading && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Verify Email</Text>}
          </Pressable>

          <Pressable onPress={handleResend} disabled={isResending} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={{ color: isResending ? colors.outline : colors.primary, fontSize: 14, fontWeight: '600' }}>
              {isResending ? 'Sending…' : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
