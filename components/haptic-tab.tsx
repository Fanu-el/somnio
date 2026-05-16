import { Pressable, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab({ onPress, ...props }: PressableProps) {
  return (
    <Pressable
      onPress={(event) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
      }}
      {...props}
    />
  );
}
