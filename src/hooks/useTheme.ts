import { useColorScheme } from 'nativewind';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useAppSelector } from '../store';

export const useTheme = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const systemScheme = useNativeColorScheme();
  const themeMode = useAppSelector((s) => s.settings.themeMode);
  
  const resolved = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = resolved === 'dark';

  const colors = {
    background: isDark ? '#0A0818' : '#F5F3FF',
    surface: isDark ? '#13102A' : '#FFFFFF',
    surfaceVariant: isDark ? '#1E1B40' : '#EDE9FE',
    onSurface: isDark ? '#E8E5FF' : '#1A1635',
    onSurfaceVariant: isDark ? '#C4BCFF' : '#4C4578',
    primary: isDark ? '#9D8FFF' : '#5B4FE8',
    secondary: isDark ? '#C084FC' : '#7C3AED',
    tertiary: isDark ? '#E879A0' : '#C026D3',
    outline: isDark ? '#3D3870' : '#C4BCFF',
    error: isDark ? '#FCA5A5' : '#DC2626',
    success: isDark ? '#22C55E' : '#10B981',
  };

  return {
    isDark,
    colors,
    colorScheme,
    setColorScheme,
    themeMode,
    resolvedScheme: resolved,
  };
};
