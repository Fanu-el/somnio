import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLoginMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Loader } from '../src/components/Loader';

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

  const inputStyle = {
    borderWidth: 1.5,
    borderColor: colors.outline,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.onSurface,
    backgroundColor: colors.surface,
    fontSize: 15,
    marginBottom: 4,
  };

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
            <Text style={{ fontSize: 52 }}>🌙</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: -1, marginTop: 8 }}>Somnio</Text>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>Your dream journal & sleep tracker</Text>
          </View>

          {/* Form card */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.onSurface, marginBottom: 20 }}>Welcome back</Text>

            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginBottom: 6 }}>EMAIL</Text>
            <Controller
              control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[inputStyle, errors.email && { borderColor: colors.error }]}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                  placeholder="you@example.com" placeholderTextColor={colors.onSurfaceVariant}
                />
              )}
            />
            {errors.email && <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8 }}>{errors.email.message}</Text>}

            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginTop: 12, marginBottom: 6 }}>PASSWORD</Text>
            <Controller
              control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[inputStyle, errors.password && { borderColor: colors.error }]}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  secureTextEntry placeholder="••••••••" placeholderTextColor={colors.onSurfaceVariant}
                />
              )}
            />
            {errors.password && <Text style={{ color: colors.error, fontSize: 12, marginBottom: 4 }}>{errors.password.message}</Text>}

            <Pressable onPress={() => router.push('/forgot-password' as any)} style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              style={{ backgroundColor: isLoading ? colors.outline : colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 }}
            >
              <Loader visible={isLoading} inline size="small" color="#fff" />
              {!isLoading && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Sign In</Text>}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>Don&apos;t have an account?</Text>
            <Link href="/register" style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Sign Up</Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
