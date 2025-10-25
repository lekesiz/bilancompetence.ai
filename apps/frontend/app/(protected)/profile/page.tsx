'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card } from '@/components/qualiopi';
import { AvatarUpload, ProfileForm, PasswordForm } from '@/components/profile';
import { User, Settings, Shield, Camera, Mail, Phone, FileText, Calendar, ShieldCheck } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role?: string;
  created_at?: string;
  last_login_at?: string;
}

type TabType = 'profile' | 'security';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState<{
    success?: string;
    error?: string;
  }>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data.data);
        } else {
          // Mock data for development when API is not ready
          setProfile({
            id: user?.id || '1',
            email: user?.email || 'user@example.com',
            full_name: user?.full_name || 'John Doe',
            phone: '+33 6 12 34 56 78',
            bio: 'Passionate career development professional with expertise in skills assessment and career guidance.',
            avatar_url: undefined,
            role: user?.role || 'BENEFICIARY',
            created_at: '2024-01-15T10:30:00Z',
            last_login_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Mock data for development
        setProfile({
          id: user?.id || '1',
          email: user?.email || 'user@example.com',
          full_name: user?.full_name || 'John Doe',
          phone: '+33 6 12 34 56 78',
          bio: 'Passionate career development professional with expertise in skills assessment and career guidance.',
          avatar_url: undefined,
          role: user?.role || 'BENEFICIARY',
          created_at: '2024-01-15T10:30:00Z',
          last_login_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (data: { full_name: string; phone: string; bio: string }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData.data);
        setNotifications({ success: 'Profile updated successfully!' });
        setTimeout(() => setNotifications({}), 3000);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setNotifications({ error: 'Failed to update profile. Please try again.' });
      setTimeout(() => setNotifications({}), 5000);
    }
  };

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      });

      if (response.ok) {
        setNotifications({ success: 'Password updated successfully!' });
        setTimeout(() => setNotifications({}), 3000);
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      setNotifications({ error: 'Failed to update password. Please check your current password.' });
      setTimeout(() => setNotifications({}), 5000);
    }
  };

  const handleAvatarChange = async (file: File) => {
    setAvatarFile(file);
    // TODO: Implement avatar upload when backend is ready
    setNotifications({ success: 'Avatar will be uploaded when backend is ready!' });
    setTimeout(() => setNotifications({}), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      BENEFICIARY: 'Career Seeker',
      CONSULTANT: 'Career Consultant',
      ORG_ADMIN: 'Organization Admin',
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load profile</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Member since {formatDate(profile.created_at || '')}</span>
        </div>
      </div>

      {/* Notifications */}
      {notifications.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <div className="w-5 h-5 bg-success-500 rounded-full flex items-center justify-center mr-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-green-800">{notifications.success}</span>
        </div>
      )}

      {notifications.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-red-800">{notifications.error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <div className="flex items-center space-x-6">
            <AvatarUpload
              currentAvatar={profile.avatar_url}
              onAvatarChange={handleAvatarChange}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span className="text-blue-100">{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-blue-100">{profile.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  {getRoleDisplayName(profile.role || '')}
                </span>
              </div>
            </div>
          </div>
          {profile.bio && (
            <div className="mt-6 pt-6 border-t border-white border-opacity-20">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-blue-100 leading-relaxed">{profile.bio}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile Information</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security & Privacy</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <Card title="Profile Information" subtitle="Update your personal information">
              <ProfileForm
                initialData={{
                  full_name: profile.full_name,
                  email: profile.email,
                  phone: profile.phone || '',
                  bio: profile.bio || '',
                }}
                onSubmit={handleProfileUpdate}
                loading={loading}
              />
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Change Password" subtitle="Update your password to keep your account secure">
              <PasswordForm onSubmit={handlePasswordChange} loading={loading} />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card title="Account Status" icon={<Settings className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Two-Factor Auth</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Not Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {profile.last_login_at ? formatDate(profile.last_login_at) : 'Never'}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Camera className="w-4 h-4 text-gray-300" />
                  <span>Update Profile Photo</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-300" />
                  <span>Enable 2FA</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 text-gray-300" />
                  <span>Privacy Settings</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
