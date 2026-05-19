import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width = '100%', height = 20, radius = 8, style }: SkeletonProps) => {
  const { colors, isDark } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [animValue]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-400, 400],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

  return (
    <View style={[{ width, height, borderRadius: radius, backgroundColor: colors.surfaceVariant, overflow: 'hidden' }, style]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { flexDirection: 'row', transform: [{ translateX }], opacity },
        ]}
      >
        <View 
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
            transform: [{ skewX: '-25deg' }] 
          }} 
        />
      </Animated.View>
    </View>
  );
};

export const SkeletonCard = ({ height = 120, hasIcon = true }: { height?: number; hasIcon?: boolean }) => {
  return (
    <View style={{ padding: 16, marginBottom: 16, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        {hasIcon && <Skeleton width={44} height={44} radius={14} style={{ marginRight: 12 }} />}
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="50%" height={18} radius={6} />
          <Skeleton width="30%" height={12} radius={4} />
        </View>
      </View>
      <Skeleton width="100%" height={height} radius={18} />
    </View>
  );
};
