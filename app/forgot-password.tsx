import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForgotPasswordMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Loader } from '../src/components/Loader';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();

  const handleSubmit = async () => {
    if (!email.trim()) { notify.error('Error', 'Email is required.'); return; }
    try {
      const res = await forgotPassword({ email }).unwrap();
      notify.success('Code Sent', res.data.message);
    } catch (err: any) {
      notify.error('Error', err?.data?.error?.message ?? 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>← Back</Text>
        </Pressable>

        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <Text style={{ fontSize: 44 }}>🔑</Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.onSurface, marginTop: 10 }}>Reset Password</Text>
          <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 6, textAlign: 'center' }}>
            Enter your email and we&apos;ll send you a reset code.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginBottom: 6 }}>EMAIL</Text>
          <TextInput
            style={{ borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: colors.onSurface, backgroundColor: colors.background, fontSize: 15 }}
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
            placeholder="you@example.com" placeholderTextColor={colors.onSurfaceVariant}
          />

          <Pressable
            onPress={handleSubmit} disabled={isLoading}
            style={{ backgroundColor: isLoading ? colors.outline : colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 }}
          >
            <Loader visible={isLoading} inline size="small" color="#fff" />
            {!isLoading && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Send Reset Code</Text>}
          </Pressable>

          {isSuccess ? (
            <Pressable onPress={() => router.push('/reset-password' as any)} style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Enter reset code →</Text>
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
