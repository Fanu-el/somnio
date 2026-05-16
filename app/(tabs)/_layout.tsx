import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const surfaceColor = isDark ? '#13102A' : '#FFFFFF';
  const onSurfaceColor = isDark ? '#E8E5FF' : '#1A1635';
  const primaryColor = isDark ? '#9D8FFF' : '#5B4FE8';
  const onSurfaceVariantColor = isDark ? '#C4BCFF' : '#4C4578';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: surfaceColor },
        headerTintColor: onSurfaceColor,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopWidth: 0,
          elevation: 12,
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: onSurfaceVariantColor,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Somnio',
          headerTitleStyle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-variant" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Sleep Logs',
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bed" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chart-box" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cog" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
