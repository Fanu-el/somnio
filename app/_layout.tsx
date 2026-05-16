import { useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import 'react-native-reanimated';
import '../global.css';

import { store, fetchLocalLogs, useAppDispatch, useAppSelector } from '../src/store';
import { loadThemeMode } from '../src/store/settingsSlice';
import {
  ThemeProvider,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

export const unstable_settings = { anchor: '(tabs)' };

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadThemeMode());
    dispatch(fetchLocalLogs());
  }, [dispatch]);
  return <>{children}</>;
}

function ThemedApp() {
  const systemScheme = useNativeColorScheme();
  const themeMode = useAppSelector((s: any) => s.settings.themeMode);
  const resolved = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = resolved === 'dark';

  const { setColorScheme } = useColorScheme();
  
  useEffect(() => {
    setColorScheme(resolved === 'dark' ? 'dark' : 'light');
  }, [resolved, setColorScheme]);

  const navTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <ThemeProvider value={navTheme}>
      <AppInitializer>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ presentation: 'modal', title: 'Log Sleep' }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </AppInitializer>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemedApp />
      </SafeAreaProvider>
    </Provider>
  );
}
