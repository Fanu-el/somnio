import React, { useState } from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForgotPasswordMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Text as PaperText, TextInput as PaperInput, Button as PaperButton, Card as PaperCard } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

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
        <PaperButton 
          mode="text" 
          icon={() => <ArrowLeft size={18} color={colors.primary} />} 
          onPress={() => router.back()} 
          style={{ alignSelf: 'flex-start', marginBottom: 24 }}
          textColor={colors.primary}
        >
          Back
        </PaperButton>

        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <PaperText variant="displaySmall">🔑</PaperText>
          <PaperText variant="headlineSmall" style={{ fontWeight: '800', color: colors.onSurface, marginTop: 10 }}>Reset Password</PaperText>
          <PaperText variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginTop: 6, textAlign: 'center' }}>
            Enter your email and we&apos;ll send you a reset code.
          </PaperText>
        </View>

        <PaperCard style={{ backgroundColor: colors.surface }} mode="elevated" elevation={2}>
          <PaperCard.Content style={{ gap: 12 }}>
            <PaperInput
              mode="outlined"
              label="Email"
              style={{ backgroundColor: colors.surface }}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
            />

            <PaperButton
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 4 }}
              labelStyle={{ fontSize: 16, fontWeight: '800' }}
            >
              Send Reset Code
            </PaperButton>

            {isSuccess && (
              <PaperButton 
                mode="text" 
                onPress={() => router.push('/reset-password' as any)} 
                textColor={colors.primary}
                style={{ marginTop: 4 }}
              >
                Enter reset code →
              </PaperButton>
            )}
          </PaperCard.Content>
        </PaperCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
