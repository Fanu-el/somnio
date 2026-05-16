import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import { useAppSelector, useAppDispatch } from '../../src/store';
import { saveThemeMode } from '../../src/store/settingsSlice';
import { ThemeMode } from '../../src/types';
import { useSafeAreaInsets } from '../../src/hooks/useSafeArea';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string; desc: string }[] = [
  { label: 'Light',  value: 'light',  icon: '☀️', desc: 'Always bright mode' },
  { label: 'Dark',   value: 'dark',   icon: '🌙', desc: 'Easy on the eyes at night' },
  { label: 'System', value: 'system', icon: '⚙️', desc: 'Follow device setting' },
];

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeMode = useAppSelector((s: any) => s.settings.themeMode);

  const surfaceColor = isDark ? '#13102A' : '#FFFFFF';
  const surfaceVariantColor = isDark ? '#1E1B40' : '#EDE9FE';
  const onSurfaceColor = isDark ? '#E8E5FF' : '#1A1635';
  const onSurfaceVariantColor = isDark ? '#C4BCFF' : '#4C4578';
  const primaryColor = isDark ? '#9D8FFF' : '#5B4FE8';

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-backgroundDark" edges={['left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* Profile hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          style={{ alignItems: 'center', paddingVertical: 36, marginBottom: 24, backgroundColor: surfaceVariantColor }}
        >
          {/* Avatar placeholder */}
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: primaryColor + '33', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 36 }}>🌙</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: onSurfaceColor }}>Dreamer</Text>
          <Text style={{ fontSize: 13, color: onSurfaceVariantColor, marginTop: 4 }}>
            Tracking dreams since {new Date().getFullYear()}
          </Text>
        </MotiView>

        {/* Appearance section */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 150 }}
        >
          <Text style={{ marginHorizontal: 20, marginBottom: 10, letterSpacing: 1, fontSize: 11, fontWeight: '700', color: primaryColor }}>
            APPEARANCE
          </Text>
          <View style={{ marginHorizontal: 16, marginBottom: 24, borderRadius: 20, overflow: 'hidden', backgroundColor: surfaceColor, elevation: 2 }}>
            {THEME_OPTIONS.map((opt, i) => {
              const isSelected = themeMode === opt.value;
              return (
                <React.Fragment key={opt.value}>
                  <Pressable
                    onPress={() => dispatch(saveThemeMode(opt.value))}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: isSelected ? primaryColor + '18' : 'transparent' }}
                  >
                    <Text style={{ fontSize: 20, marginRight: 14 }}>{opt.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: isSelected ? primaryColor : onSurfaceColor }}>{opt.label}</Text>
                      <Text style={{ fontSize: 12, color: onSurfaceVariantColor, marginTop: 1 }}>{opt.desc}</Text>
                    </View>
                    {/* Radio indicator */}
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? primaryColor : onSurfaceVariantColor, alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: primaryColor }} />}
                    </View>
                  </Pressable>
                  {i < THEME_OPTIONS.length - 1 && (
                    <View style={{ height: 1, backgroundColor: surfaceVariantColor, marginLeft: 52 }} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </MotiView>

        {/* About section */}
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 260 }}
        >
          <Text style={{ marginHorizontal: 20, marginBottom: 10, letterSpacing: 1, fontSize: 11, fontWeight: '700', color: primaryColor }}>
            ABOUT
          </Text>
          <View style={{ marginHorizontal: 16, marginBottom: 24, borderRadius: 20, overflow: 'hidden', backgroundColor: surfaceColor, elevation: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 20, marginRight: 14 }}>🌙</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: onSurfaceColor }}>Somnio</Text>
                <Text style={{ fontSize: 12, color: onSurfaceVariantColor, marginTop: 1 }}>Mind & sleep health tracker</Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: surfaceVariantColor, marginLeft: 52 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 20, marginRight: 14 }}>📱</Text>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: onSurfaceColor }}>Version</Text>
              <Text style={{ fontSize: 13, color: onSurfaceVariantColor }}>1.0.0</Text>
            </View>
          </View>
        </MotiView>

      </ScrollView>
    </SafeAreaView>
  );
}
