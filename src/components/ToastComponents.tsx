import React from 'react';
import { View } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

export const ToastComponents = (colors: any) => ({
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.success, backgroundColor: colors.surface, height: 'auto', minHeight: 60, paddingVertical: 10, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: colors.onSurface }}
      text2Style={{ fontSize: 13, color: colors.onSurfaceVariant }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 15 }}>
          <CheckCircle2 size={24} color={colors.success} />
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: colors.error, backgroundColor: colors.surface, height: 'auto', minHeight: 60, paddingVertical: 10, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: colors.onSurface }}
      text2Style={{ fontSize: 13, color: colors.onSurfaceVariant }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 15 }}>
          <AlertCircle size={24} color={colors.error} />
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: colors.primary, backgroundColor: colors.surface, height: 'auto', minHeight: 60, paddingVertical: 10, borderRadius: 12 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: colors.onSurface }}
      text2Style={{ fontSize: 13, color: colors.onSurfaceVariant }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 15 }}>
          <Info size={24} color={colors.primary} />
        </View>
      )}
    />
  ),
});
