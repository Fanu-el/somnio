import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import '../global.css';

import { store, fetchLocalLogs, useAppDispatch, useAppSelector } from '../src/store';
import { loadSettings } from '../src/store/settingsSlice';
import { setUser, clearAuth } from '../src/store/authSlice';
import { tokenStorage } from '../src/utils/tokenStorage';
import { authApi } from '../src/api/authApi';
import { useTheme } from '../src/hooks/useTheme';
import {
  ThemeProvider,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { ToastComponents } from '../src/components/ToastComponents';

export const unstable_settings = { anchor: '(tabs)' };

// ── Auth gate: redirect based on auth state ─────────────────────────────────

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isInitializing } = useAppSelector((s: any) => s.auth);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const guestScreens = ['login', 'register', 'verify-email', 'forgot-password', 'reset-password'];
    const inGuestGroup = guestScreens.includes(segments[0] as string);

    if (!isAuthenticated && inAuthGroup) {
      router.replace('/login' as any);
    } else if (isAuthenticated && inGuestGroup) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, isInitializing, segments, router]);

  return <>{children}</>;
}

// ── App initializer: loads settings + checks stored auth ────────────────────

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        dispatch(loadSettings());
        dispatch(fetchLocalLogs());

        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken) {
          dispatch(clearAuth());
          return;
        }

        // Validate token by calling /auth/me
        const result = await dispatch(
          authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })
        );

        if (result.data?.data?.user) {
          dispatch(setUser(result.data.data.user));
        } else {
          dispatch(clearAuth());
        }
      } catch (err) {
        console.error('[AppInitializer] Auth init failed:', err);
        dispatch(clearAuth());
      }
    };
    init();
  }, [dispatch]);

  return <>{children}</>;
}

// ── Themed inner app ─────────────────────────────────────────────────────────

function ThemedApp() {
  const { resolvedScheme, isDark, setColorScheme, colors } = useTheme();

  useEffect(() => {
    setColorScheme(resolvedScheme === 'dark' ? 'dark' : 'light');
  }, [resolvedScheme, setColorScheme]);

  return (
    <ThemeProvider value={isDark ? NavigationDarkTheme : NavigationDefaultTheme}>
      <AppInitializer>
        <AuthGate>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Log Sleep' }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
          </Stack>
        </AuthGate>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Toast config={ToastComponents(colors)} />
      </AppInitializer>
    </ThemeProvider>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemedApp />
      </SafeAreaProvider>
    </Provider>
  );
}
