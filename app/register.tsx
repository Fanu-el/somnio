import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Loader } from '../src/components/Loader';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [register, { isLoading }] = useRegisterMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  });

  const inputStyle = {
    borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, color: colors.onSurface,
    backgroundColor: colors.surface, fontSize: 15, marginBottom: 4,
  };

  const onSubmit = async (data: FormData) => {
    try {
      await register(data).unwrap();
      notify.success('Account Created', 'Please verify your email.');
      router.push({ pathname: '/verify-email' as any, params: { email: data.email } });
    } catch (err: any) {
      notify.error('Registration Failed', err?.data?.error?.message ?? 'Please try again.');
    }
  };

  const Field = ({ name, label, placeholder, keyboardType = 'default', secure = false }: any) => (
    <>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginTop: 14, marginBottom: 6 }}>{label}</Text>
      <Controller
        control={control} name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[inputStyle, errors[name as keyof typeof errors] && { borderColor: colors.error }]}
            onBlur={onBlur} onChangeText={onChange} value={value}
            keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            autoCorrect={false} secureTextEntry={secure}
            placeholder={placeholder} placeholderTextColor={colors.onSurfaceVariant}
          />
        )}
      />
      {errors[name as keyof typeof errors] && (
        <Text style={{ color: colors.error, fontSize: 12, marginBottom: 2 }}>
          {(errors[name as keyof typeof errors] as any)?.message}
        </Text>
      )}
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 42 }}>🌙</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: colors.primary, marginTop: 6 }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>Start tracking your dreams</Text>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field name="firstName" label="FIRST NAME" placeholder="Jane" />
              </View>
              <View style={{ flex: 1 }}>
                <Field name="lastName" label="LAST NAME" placeholder="Doe" />
              </View>
            </View>
            <Field name="email" label="EMAIL" placeholder="you@example.com" keyboardType="email-address" />
            <Field name="password" label="PASSWORD" placeholder="Min. 8 characters" secure />

            <Pressable
              onPress={handleSubmit(onSubmit)} disabled={isLoading}
              style={{ backgroundColor: isLoading ? colors.outline : colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 20 }}
            >
              <Loader visible={isLoading} inline size="small" color="#fff" />
              {!isLoading && <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Create Account</Text>}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>Already have an account?</Text>
            <Link href="/login" style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>Sign In</Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
