import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegisterMutation } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import { notify } from '../src/utils/notifications';
import { Card as PaperCard, TextInput as PaperInput, Button as PaperButton } from 'react-native-paper';

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

  const onSubmit = async (data: FormData) => {
    try {
      await register(data).unwrap();
      notify.success('Account Created', 'Please verify your email.');
      router.push({ pathname: '/verify-email' as any, params: { email: data.email } });
    } catch (err: any) {
      notify.error('Registration Failed', err?.data?.error?.message ?? 'Please try again.');
    }
  };

  const Field = ({ name, label, placeholder, keyboardType = 'default', secure = false, style }: any) => (
    <View style={style}>
      <Controller
        control={control} name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <PaperInput
            mode="outlined"
            label={label}
            style={{ backgroundColor: colors.surface, marginBottom: 8 }}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            error={!!errors[name as keyof typeof errors]}
            onBlur={onBlur} onChangeText={onChange} value={value}
            keyboardType={keyboardType} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            autoCorrect={false} secureTextEntry={secure}
            placeholder={placeholder}
          />
        )}
      />
      {errors[name as keyof typeof errors] && (
        <Text style={{ color: colors.error, fontSize: 12, marginBottom: 8, marginLeft: 4 }}>
          {(errors[name as keyof typeof errors] as any)?.message}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontSize: 56 }}>🌙</Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: colors.primary, marginTop: 6, letterSpacing: -1 }}>Create Account</Text>
            <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }}>Start tracking your dreams</Text>
          </View>

          <View>
            <PaperCard style={{ backgroundColor: colors.surface }} mode="elevated" elevation={2}>
              <PaperCard.Content>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <Field name="firstName" label="First Name" placeholder="Jane" style={{ flex: 1 }} />
                  <Field name="lastName" label="Last Name" placeholder="Doe" style={{ flex: 1 }} />
                </View>
                <Field name="email" label="Email" placeholder="you@example.com" keyboardType="email-address" />
                <Field name="password" label="Password" placeholder="Min. 8 characters" secure />

                <PaperButton 
                  mode="contained" 
                  onPress={handleSubmit(onSubmit)} 
                  loading={isLoading} 
                  disabled={isLoading}
                  style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 6, marginTop: 16 }}
                  labelStyle={{ fontSize: 16, fontWeight: '800' }}
                >
                  Create Account
                </PaperButton>
              </PaperCard.Content>
            </PaperCard>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24, gap: 4 }}>
            <Text style={{ color: colors.onSurfaceVariant, fontSize: 14 }}>Already have an account?</Text>
            <PaperButton mode="text" onPress={() => router.push('/login' as any)} textColor={colors.primary} compact>
              Sign In
            </PaperButton>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
