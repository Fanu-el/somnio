import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Sun, Moon, Settings as SettingsIcon, Key, LogOut, Trash2, 
  User as UserIcon, Camera, Info, Smartphone, Pencil, Globe, Sparkles 
} from 'lucide-react-native';
import { 
  List, 
  Divider as PaperDivider, 
  Avatar, 
  Button as PaperButton, 
  TextInput as PaperInput, 
  Card as PaperCard,
  IconButton
} from 'react-native-paper';

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
  const { colors, themeMode } = useTheme();
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
  const [showTzModal, setShowTzModal] = useState(false);

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.onSurface }}>Settings</Text>
          <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }}>
            Manage your preferences and profile details
          </Text>
        </View>

        {/* Profile card */}
        <View>
          <PaperCard style={{ marginHorizontal: 16, marginBottom: 28, backgroundColor: colors.surface }} mode="elevated" elevation={2}>
            <PaperCard.Content style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Pressable onPress={handlePickImage} disabled={isUploading || !user} style={{ position: 'relative' }}>
                {avatarUrl ? (
                  <Avatar.Image size={96} source={{ uri: avatarUrl }} style={{ backgroundColor: colors.primary + '20' }} />
                ) : (
                  <Avatar.Icon size={96} icon={() => <UserIcon size={48} color={colors.primary} />} style={{ backgroundColor: colors.primary + '20' }} />
                )}
                <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 16 }}>
                  <IconButton icon={() => <Camera size={14} color="#fff" />} size={18} style={{ margin: 0 }} />
                </View>
                <Loader visible={isUploading} inline={false} message="Uploading..." />
              </Pressable>

              {editMode ? (
                <View style={{ width: '100%', gap: 12, marginTop: 20 }}>
                  <PaperInput
                    mode="outlined"
                    label="First name"
                    value={firstName}
                    onChangeText={setFirstName}
                    outlineColor={colors.outline}
                    activeOutlineColor={colors.primary}
                    style={{ backgroundColor: colors.surface }}
                  />
                  <PaperInput
                    mode="outlined"
                    label="Last name"
                    value={lastName}
                    onChangeText={setLastName}
                    outlineColor={colors.outline}
                    activeOutlineColor={colors.primary}
                    style={{ backgroundColor: colors.surface }}
                  />
                  <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 8 }}>
                    <PaperButton mode="text" onPress={() => setEditMode(false)} style={{ flex: 1 }} textColor={colors.onSurfaceVariant}>
                      Cancel
                    </PaperButton>
                    <PaperButton mode="contained" onPress={handleSaveProfile} loading={isUpdating} disabled={isUpdating} style={{ flex: 1, backgroundColor: colors.primary }}>
                      Save
                    </PaperButton>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.onSurface }}>
                    {user ? `${user.firstName} ${user.lastName}` : 'Dreamer'}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4, fontWeight: '500' }}>{user?.email ?? ''}</Text>
                  {user && (
                    <PaperButton mode="outlined" icon={() => <Pencil size={14} color={colors.primary} />} onPress={handleEditStart} style={{ marginTop: 16, borderColor: colors.primary }} textColor={colors.primary}>
                      Edit Profile
                    </PaperButton>
                  )}
                </View>
              )}
            </PaperCard.Content>
          </PaperCard>
        </View>

        {/* Appearance */}
        <View>
          <List.Section>
            <List.Subheader style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1.2 }}>APPEARANCE</List.Subheader>
            <PaperCard style={{ marginHorizontal: 16, backgroundColor: colors.surface }} mode="elevated" elevation={1}>
              {THEME_OPTIONS.map((opt, i) => {
                const isSelected = themeMode === opt.value;
                const Icon = opt.icon;
                return (
                  <React.Fragment key={opt.value}>
                    <List.Item
                      title={opt.label}
                      description={opt.desc}
                      onPress={() => dispatch(saveThemeMode(opt.value))}
                      style={{ backgroundColor: isSelected ? colors.primary + '10' : 'transparent', borderRadius: 12 }}
                      titleStyle={{ color: isSelected ? colors.primary : colors.onSurface, fontWeight: '600' }}
                      descriptionStyle={{ color: colors.onSurfaceVariant }}
                      left={props => <List.Icon {...props} icon={() => <Icon size={24} color={isSelected ? colors.primary : colors.onSurfaceVariant} />} />}
                      right={props => isSelected ? <List.Icon {...props} icon={() => <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, alignSelf: 'center', margin: 8}} />} /> : null}
                    />
                    {i < THEME_OPTIONS.length - 1 && <PaperDivider />}
                  </React.Fragment>
                );
              })}
            </PaperCard>
          </List.Section>
        </View>

        {/* Localization */}
        <View>
          <List.Section>
            <List.Subheader style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1.2 }}>LOCALIZATION</List.Subheader>
            <PaperCard style={{ marginHorizontal: 16, backgroundColor: colors.surface }} mode="elevated" elevation={1}>
              <List.Item
                title="Default Timezone"
                description={defaultTimezone}
                onPress={() => setShowTzModal(true)}
                titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                descriptionStyle={{ color: colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon={() => <Globe size={24} color={colors.primary} />} />}
              />
            </PaperCard>
          </List.Section>
        </View>

        {/* Account */}
        <View>
          <List.Section>
            <List.Subheader style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1.2 }}>ACCOUNT</List.Subheader>
            <PaperCard style={{ marginHorizontal: 16, backgroundColor: colors.surface }} mode="elevated" elevation={1}>
              {user ? (
                <>
                  <List.Item
                    title="Change Password"
                    description="Reset via email"
                    onPress={() => router.push('/forgot-password' as any)}
                    titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                    descriptionStyle={{ color: colors.onSurfaceVariant }}
                    left={props => <List.Icon {...props} icon={() => <Key size={24} color={colors.primary} />} />}
                  />
                  <PaperDivider />
                  <List.Item
                    title="Sign Out"
                    onPress={handleLogout}
                    titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                    left={props => <List.Icon {...props} icon={() => <LogOut size={24} color={colors.primary} />} />}
                  />
                  <PaperDivider />
                  <List.Item
                    title="Delete Account"
                    onPress={handleDeleteAccount}
                    titleStyle={{ color: colors.error, fontWeight: '600' }}
                    left={props => <List.Icon {...props} icon={() => <Trash2 size={24} color={colors.error} />} />}
                  />
                </>
              ) : (
                <>
                  <List.Item
                    title="Sign In"
                    onPress={() => router.push('/login' as any)}
                    titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                    left={props => <List.Icon {...props} icon={() => <LogOut size={24} color={colors.primary} />} />}
                  />
                  <PaperDivider />
                  <List.Item
                    title="Create Account"
                    onPress={() => router.push('/register' as any)}
                    titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                    left={props => <List.Icon {...props} icon={() => <Sparkles size={24} color={colors.primary} />} />}
                  />
                </>
              )}
            </PaperCard>
          </List.Section>
        </View>

        {/* About */}
        <View>
          <List.Section>
            <List.Subheader style={{ color: colors.primary, fontWeight: '800', letterSpacing: 1.2 }}>ABOUT</List.Subheader>
            <PaperCard style={{ marginHorizontal: 16, backgroundColor: colors.surface }} mode="elevated" elevation={1}>
              <List.Item
                title="Somnio"
                description="Mind & sleep health tracker"
                titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                descriptionStyle={{ color: colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon={() => <Info size={24} color={colors.primary} />} />}
              />
              <PaperDivider />
              <List.Item
                title="Version"
                description="1.0.0"
                titleStyle={{ color: colors.onSurface, fontWeight: '600' }}
                descriptionStyle={{ color: colors.onSurfaceVariant }}
                left={props => <List.Icon {...props} icon={() => <Smartphone size={24} color={colors.primary} />} />}
              />
            </PaperCard>
          </List.Section>
        </View>

      </ScrollView>

      {/* Timezone Selection Modal */}
      <Modal visible={showTzModal} transparent animationType="fade" onRequestClose={() => setShowTzModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View
            style={{ width: '90%', maxHeight: '70%', backgroundColor: colors.surface, borderRadius: 28, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}
          >
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.onSurface, marginBottom: 16 }}>Select Default Timezone</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {UNIQUE_TIMEZONES.map((tz) => {
                const isSelected = defaultTimezone === tz;
                return (
                  <Pressable
                    key={tz}
                    onPress={() => {
                      dispatch(saveDefaultTimezone(tz));
                      setShowTzModal(false);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.surfaceVariant,
                      backgroundColor: pressed ? colors.surfaceVariant + '30' : 'transparent',
                      borderRadius: 8
                    })}
                  >
                    <Text style={{ flex: 1, fontSize: 16, color: isSelected ? colors.primary : colors.onSurface, fontWeight: isSelected ? '700' : '500' }}>
                      {tz}
                    </Text>
                    {isSelected && (
                      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
            <PaperButton mode="contained" onPress={() => setShowTzModal(false)} style={{ backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 4 }}>
              Close
            </PaperButton>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
