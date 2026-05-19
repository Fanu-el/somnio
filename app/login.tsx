import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Card as PaperCard, TextInput as PaperInput, Button as PaperButton } from 'react-native-paper';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [login, { isLoading }] = useLoginMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data).unwrap();
      if (result.data.user.role === 'SUPER_ADMIN') {
        notify.error('Access Denied', 'This app is for Dreamers. Please use the admin dashboard.');
        return;
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message ?? 'Login failed. Please try again.';
      notify.error('Login Failed', msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

          {/* Brand */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <Text style={{ fontSize: 56 }}>🌙</Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: colors.primary, letterSpacing: -1, marginTop: 8 }}>Somnio</Text>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }}>Your dream journal & sleep tracker</Text>
          </View>

          {/* Form card */}
          <View>
            <PaperCard style={{ backgroundColor: colors.surface }} mode="elevated" elevation={2}>
              <PaperCard.Content>
                <Text style={{ fontSize: 22, fontWeight: '900', color: colors.onSurface, marginBottom: 20, letterSpacing: -0.5 }}>Welcome back</Text>

                <Controller
                  control={control} name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PaperInput
                      mode="outlined"
                      label="Email"
                      style={{ backgroundColor: colors.surface, marginBottom: 8 }}
                      outlineColor={colors.outline}
                      activeOutlineColor={colors.primary}
                      error={!!errors.email}
                      onBlur={onBlur} onChangeText={onChange} value={value}
                      keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                    />
                  )}
                />
                {errors.email && <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>{errors.email.message}</Text>}

                <Controller
                  control={control} name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PaperInput
                      mode="outlined"
                      label="Password"
                      style={{ backgroundColor: colors.surface, marginTop: 8 }}
                      outlineColor={colors.outline}
                      activeOutlineColor={colors.primary}
                      error={!!errors.password}
                      onBlur={onBlur} onChangeText={onChange} value={value}
                      secureTextEntry
                    />
                  )}
                />
                {errors.password && <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{errors.password.message}</Text>}

                <View style={{ alignItems: 'flex-end', marginTop: 8, marginBottom: 16 }}>
                  <PaperButton mode="text" onPress={() => router.push('/forgot-password' as any)} textColor={colors.primary} compact>
                    Forgot password?
                  </PaperButton>
                </View>

                <PaperButton 
                  mode="contained" 
                  onPress={handleSubmit(onSubmit)} 
                  loading={isLoading} 
                  disabled={isLoading}
                  style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 6 }}
                  labelStyle={{ fontSize: 16, fontWeight: '800' }}
                >
                  Sign In
                </PaperButton>
              </PaperCard.Content>
            </PaperCard>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>Don&apos;t have an account?</Text>
            <PaperButton mode="text" onPress={() => router.push('/register' as any)} textColor={colors.primary} compact>
              Sign Up
            </PaperButton>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
