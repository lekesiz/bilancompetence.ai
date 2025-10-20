import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

interface UserPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'fr' | 'de' | 'tr';
}

export default function ProfileScreen({ navigation }: any) {
  const { user, updateProfile, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    theme: 'light',
    language: 'en',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/users/preferences');
      if (response.data?.data) {
        setPreferences(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        phone,
        bio,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/preferences', preferences);
      setShowPreferences(false);
      Alert.alert('Success', 'Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            setIsLoading(true);
            try {
              await api.delete('/users/account');
              await logout();
              Alert.alert('Success', 'Account deleted successfully');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Failed to delete account:', error);
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity
            onPress={() => setIsEditing(!isEditing)}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.full_name || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.roleIndicator}>
              <Text style={styles.roleText}>{user.role}</Text>
            </View>
          </View>

          {!isEditing ? (
            <View style={styles.profileInfo}>
              <InfoRow label="Full Name" value={user.full_name} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Phone" value={user.phone || 'Not set'} />
              <InfoRow label="Bio" value={user.bio || 'No bio set'} />
              <InfoRow
                label="Member Since"
                value={new Date(user.created_at).getFullYear().toString()}
              />
            </View>
          ) : (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your full name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <MenuButton
            icon="🔔"
            title="Notification Settings"
            subtitle="Manage your notifications"
            onPress={() => setShowPreferences(true)}
          />

          <MenuButton
            icon="🔐"
            title="Change Password"
            subtitle="Update your password"
            onPress={() => Alert.alert('Coming Soon', 'Password change feature coming soon')}
          />

          <MenuButton
            icon="📊"
            title="Analytics & Data"
            subtitle="Export your data"
            onPress={async () => {
              try {
                const response = await api.get('/users/export');
                Alert.alert('Success', 'Your data is being prepared for download');
              } catch (error) {
                Alert.alert('Error', 'Failed to export data');
              }
            }}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonIcon}>🚪</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.logoutButtonTitle}>Logout</Text>
              <Text style={styles.logoutButtonSubtitle}>Sign out from your account</Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isLoading}
          >
            <Text style={styles.deleteButtonIcon}>🗑️</Text>
            <View style={styles.buttonContent}>
              <Text style={styles.deleteButtonTitle}>Delete Account</Text>
              <Text style={styles.deleteButtonSubtitle}>
                Permanently delete your account and data
              </Text>
            </View>
            <Text style={styles.buttonArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>BilanCompetence</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* Preferences Modal */}
      <Modal visible={showPreferences} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Settings</Text>
              <TouchableOpacity onPress={() => setShowPreferences(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <PreferenceToggle
                label="All Notifications"
                value={preferences.notifications_enabled}
                onValueChange={(val) =>
                  setPreferences({
                    ...preferences,
                    notifications_enabled: val,
                  })
                }
              />

              <PreferenceToggle
                label="Email Notifications"
                value={preferences.email_notifications}
                onValueChange={(val) =>
                  setPreferences({
                    ...preferences,
                    email_notifications: val,
                  })
                }
              />

              <PreferenceToggle
                label="Push Notifications"
                value={preferences.push_notifications}
                onValueChange={(val) =>
                  setPreferences({
                    ...preferences,
                    push_notifications: val,
                  })
                }
              />

              <PreferenceToggle
                label="Marketing Emails"
                value={preferences.marketing_emails}
                onValueChange={(val) =>
                  setPreferences({
                    ...preferences,
                    marketing_emails: val,
                  })
                }
              />

              <View style={styles.preferenceDivider} />

              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceLabel}>Theme</Text>
                <View style={styles.themeSelector}>
                  {(['light', 'dark'] as const).map((theme) => (
                    <TouchableOpacity
                      key={theme}
                      style={[
                        styles.themeOption,
                        preferences.theme === theme && styles.themeOptionSelected,
                      ]}
                      onPress={() =>
                        setPreferences({ ...preferences, theme })
                      }
                    >
                      <Text
                        style={[
                          styles.themeOptionText,
                          preferences.theme === theme &&
                            styles.themeOptionTextSelected,
                        ]}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.preferenceGroup}>
                <Text style={styles.preferenceLabel}>Language</Text>
                <View style={styles.languageSelector}>
                  {(['en', 'fr', 'de', 'tr'] as const).map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.languageOption,
                        preferences.language === lang &&
                          styles.languageOptionSelected,
                      ]}
                      onPress={() =>
                        setPreferences({ ...preferences, language: lang })
                      }
                    >
                      <Text
                        style={[
                          styles.languageOptionText,
                          preferences.language === lang &&
                            styles.languageOptionTextSelected,
                        ]}
                      >
                        {lang.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPreferences(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.buttonDisabled]}
                onPress={handleSavePreferences}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonIcon}>{icon}</Text>
      <View style={styles.buttonContent}>
        <Text style={styles.menuButtonTitle}>{title}</Text>
        <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.buttonArrow}>›</Text>
    </TouchableOpacity>
  );
}

function PreferenceToggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.preferenceItem}>
      <Text style={styles.preferenceItemLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#e5e7eb', true: '#2563eb' }}
        thumbColor={value ? '#fff' : '#fff'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2563eb',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
  },
  roleIndicator: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  profileInfo: {
    gap: 16,
  },
  infoRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  menuButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonContent: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuButtonSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  buttonArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  logoutButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  logoutButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 2,
  },
  logoutButtonSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  deleteButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  deleteButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  deleteButtonSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  appName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  version: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#999',
  },
  modalContent: {
    padding: 20,
    maxHeight: '65%',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  preferenceItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  preferenceGroup: {
    marginTop: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  themeOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  themeOptionTextSelected: {
    color: '#2563eb',
  },
  languageSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  languageOption: {
    flex: 1,
    minWidth: '23%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  languageOptionSelected: {
    backgroundColor: '#f0f9ff',
    borderColor: '#2563eb',
  },
  languageOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  languageOptionTextSelected: {
    color: '#2563eb',
  },
});
