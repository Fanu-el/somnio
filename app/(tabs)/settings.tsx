import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  Key, 
  LogOut, 
  Trash2, 
  User as UserIcon, 
  Camera, 
  ChevronRight, 
  Info, 
  Smartphone,
  Pencil,
  Globe,
  Sparkles
} from 'lucide-react-native';

import { useAppSelector, useAppDispatch } from '../../src/store';
import { saveThemeMode, saveDefaultTimezone } from '../../src/store/settingsSlice';
import { clearAuth } from '../../src/store/authSlice';
import { ThemeMode } from '../../src/types';
import { useSafeAreaInsets } from '../../src/hooks/useSafeArea';
import * as ImagePicker from 'expo-image-picker';
import {
  useLogoutMutation,
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
  useDeleteAccountMutation,
  useGetMeQuery,
} from '../../src/api/authApi';
import { tokenStorage } from '../../src/utils/tokenStorage';
import { useTheme } from '../../src/hooks/useTheme';
import { notify } from '../../src/utils/notifications';
import { Loader } from '../../src/components/Loader';
import { UNIQUE_TIMEZONES } from '../../src/utils/date';

const FILE_PREVIEW_URL = process.env.EXPO_PUBLIC_API_FILE_PREVIEW_URL ?? '';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: any; desc: string }[] = [
  { label: 'Light',  value: 'light',  icon: Sun, desc: 'Always bright mode' },
  { label: 'Dark',   value: 'dark',   icon: Moon, desc: 'Easy on the eyes at night' },
  { label: 'System', value: 'system', icon: SettingsIcon, desc: 'Follow device setting' },
];

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, themeMode, isDark } = useTheme();
  const { defaultTimezone } = useAppSelector((s: any) => s.settings);
  const authUser = useAppSelector((s: any) => s.auth.user);

  const { data: meData, refetch } = useGetMeQuery(undefined, { skip: !authUser });
  const user = meData?.data?.user ?? authUser;

  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUploading }] = useUpdateProfilePictureMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const avatarUrl = user?.profilePictureFile
    ? `${FILE_PREVIEW_URL}${user.profilePictureFile.path}`
    : null;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const formData = new FormData();
      
      const fileData = {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
      } as any;

      formData.append('file', fileData);

      try {
        await updateAvatar(formData).unwrap();
        notify.success('Updated', 'Profile picture updated.');
        refetch();
      } catch (err: any) {
        notify.error('Upload Failed', err?.data?.error?.message ?? 'Could not upload image.');
      }
    }
  };

  const handleEditStart = () => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() && !lastName.trim()) return;
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() }).unwrap();
      notify.success('Success', 'Profile updated.');
      setEditMode(false);
      refetch();
    } catch (err: any) {
      notify.error('Update Failed', err?.data?.error?.message ?? 'Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {}
    await tokenStorage.clearTokens();
    dispatch(clearAuth());
    router.replace('/login' as any);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent. Your account and all data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            Alert.prompt('Confirm Password', 'Enter your password to confirm:', async (password) => {
              if (!password) return;
              try {
                await deleteAccount({ password }).unwrap();
                await tokenStorage.clearTokens();
                dispatch(clearAuth());
                router.replace('/login' as any);
              } catch (err: any) {
                Alert.alert('Error', err?.data?.error?.message ?? 'Deletion failed.');
              }
            }, 'secure-text');
          },
        },
      ],
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={{ marginHorizontal: 20, marginBottom: 12, letterSpacing: 1.2, fontSize: 11, fontWeight: '800', color: colors.primary }}>
      {label}
    </Text>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View style={{ marginHorizontal: 16, marginBottom: 28, borderRadius: 24, overflow: 'hidden', backgroundColor: colors.surface, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }}>
      {children}
    </View>
  );

  const Divider = () => <View style={{ height: 1, backgroundColor: colors.surfaceVariant, marginLeft: 56 }} />;

  const Row = ({ icon: Icon, label, value, onPress, danger = false }: any) => (
    <Pressable onPress={onPress} style={({ pressed }) => ({ 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 16, 
      paddingVertical: 16,
      backgroundColor: pressed ? colors.surfaceVariant : 'transparent'
    })}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (danger ? colors.error : colors.primary) + '15', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Icon size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: danger ? colors.error : colors.onSurface }}>{label}</Text>
        {value ? <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>{value}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.outline} />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* Profile hero */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18 }}
          style={{ alignItems: 'center', paddingVertical: 40, marginBottom: 24, backgroundColor: isDark ? colors.surface : colors.surfaceVariant }}
        >
          <Pressable onPress={handlePickImage} disabled={isUploading || !user} style={{ position: 'relative' }}>
            <View style={{ padding: 4, borderRadius: 52, borderWidth: 2, borderColor: colors.primary }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 96, height: 96, borderRadius: 48 }} />
              ) : (
                <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={48} color={colors.primary} />
                </View>
              )}
            </View>
            
            <View style={{ position: 'absolute', bottom: 4, right: 4, backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: isDark ? colors.surface : colors.surfaceVariant }}>
              <Camera size={14} color="#fff" />
            </View>

            <Loader visible={isUploading} inline={false} message="Uploading..." />
          </Pressable>

          {editMode ? (
            <View style={{ width: '85%', gap: 10, marginTop: 20 }}>
              <TextInput
                value={firstName} onChangeText={setFirstName}
                style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.onSurface, fontSize: 16, borderWidth: 1, borderColor: colors.outline }}
                placeholder="First name" placeholderTextColor={colors.onSurfaceVariant}
              />
              <TextInput
                value={lastName} onChangeText={setLastName}
                style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: colors.onSurface, fontSize: 16, borderWidth: 1, borderColor: colors.outline }}
                placeholder="Last name" placeholderTextColor={colors.onSurfaceVariant}
              />
              <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                <Pressable onPress={() => setEditMode(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surfaceVariant, alignItems: 'center' }}>
                  <Text style={{ color: colors.onSurfaceVariant, fontWeight: '700' }}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveProfile} disabled={isUpdating} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center' }}>
                  <Loader visible={isUpdating} inline size="small" color="#fff" />
                  {!isUpdating && <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>}
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: '900', color: colors.onSurface }}>
                {user ? `${user.firstName} ${user.lastName}` : 'Dreamer'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }}>{user?.email ?? ''}</Text>
              {user && (
                <Pressable onPress={handleEditStart} style={{ marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.primary + '15', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Pencil size={14} color={colors.primary} />
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>Edit Profile</Text>
                </Pressable>
              )}
            </View>
          )}
        </MotiView>

        {/* Appearance */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 150 }}>
          <SectionLabel label="APPEARANCE" />
          <Card>
            {THEME_OPTIONS.map((opt, i) => {
              const isSelected = themeMode === opt.value;
              const Icon = opt.icon;
              return (
                <React.Fragment key={opt.value}>
                  <Pressable
                    onPress={() => dispatch(saveThemeMode(opt.value))}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: isSelected ? colors.primary + '10' : 'transparent' }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (isSelected ? colors.primary : colors.outline) + '15', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                      <Icon size={20} color={isSelected ? colors.primary : colors.onSurfaceVariant} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: isSelected ? colors.primary : colors.onSurface }}>{opt.label}</Text>
                      <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>{opt.desc}</Text>
                    </View>
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: isSelected ? colors.primary : colors.outline, alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                    </View>
                  </Pressable>
                  {i < THEME_OPTIONS.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </Card>
        </MotiView>

        {/* Localization */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
          <SectionLabel label="LOCALIZATION" />
          <Card>
            <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Globe size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.onSurface }}>Default Timezone</Text>
                  <Text style={{ fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 }}>Used for new sleep logs</Text>
                </View>
              </View>
              <View style={{ borderWidth: 1.5, borderColor: colors.outline, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surfaceVariant + '30' }}>
                <Picker
                  selectedValue={defaultTimezone}
                  onValueChange={(val) => dispatch(saveDefaultTimezone(val))}
                  dropdownIconColor={colors.onSurface}
                  style={{ color: colors.onSurface }}
                >
                  {UNIQUE_TIMEZONES.map(tz => (
                    <Picker.Item key={tz} label={tz} value={tz} />
                  ))}
                </Picker>
              </View>
            </View>
          </Card>
        </MotiView>

        {/* Account */}
        {user && (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
            <SectionLabel label="ACCOUNT" />
            <Card>
              <Row icon={Key} label="Change Password" value="Reset via email" onPress={() => router.push('/forgot-password' as any)} />
              <Divider />
              <Row icon={LogOut} label="Sign Out" onPress={handleLogout} />
              <Divider />
              <Row icon={Trash2} label="Delete Account" danger onPress={handleDeleteAccount} />
            </Card>
          </MotiView>
        )}

        {!user && (
          <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 250 }}>
            <SectionLabel label="ACCOUNT" />
            <Card>
              <Row icon={LogOut} label="Sign In" onPress={() => router.push('/login' as any)} />
              <Divider />
              <Row icon={Sparkles} label="Create Account" onPress={() => router.push('/register' as any)} />
            </Card>
          </MotiView>
        )}

        {/* About */}
        <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 350 }}>
          <SectionLabel label="ABOUT" />
          <Card>
            <Row icon={Info} label="Somnio" value="Mind & sleep health tracker" />
            <Divider />
            <Row icon={Smartphone} label="Version" value="1.0.0" />
          </Card>
        </MotiView>

      </ScrollView>
    </SafeAreaView>
  );
}
