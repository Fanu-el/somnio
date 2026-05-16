import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns bottom inset padding — useful for content inside FlatList/ScrollView
 * to ensure it clears the home indicator / tab bar / keyboard.
 */
export const useSafeBottom = () => {
  const insets = useSafeAreaInsets();
  return insets.bottom;
};

export { useSafeAreaInsets };
