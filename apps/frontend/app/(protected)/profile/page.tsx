'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/qualiopi';
import { AvatarUpload, ProfileForm, PasswordForm } from '@/components/profile';
import { User, Settings, Shield, Camera, Mail, Phone, FileText, Calendar, ShieldCheck, Upload, File, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getCsrfToken } from '@/lib/csrfHelper';

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
  cv_url?: string;
  cv_uploaded_at?: string;
}

type TabType = 'profile' | 'security' | 'cv';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [notifications, setNotifications] = useState<{
    success?: string;
    error?: string;
  }>({});
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          credentials: 'include', // 🔒 SECURITY: Send HttpOnly cookies automatically
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
            cv_url: undefined,
            cv_uploaded_at: undefined,
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
          cv_url: undefined,
          cv_uploaded_at: undefined,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (data: { full_name: string; phone: string; bio: string }) => {
    try {
      // 🔒 SECURITY: HttpOnly cookies + CSRF token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers,
        credentials: 'include', // 🔒 SECURITY: Send HttpOnly cookies automatically
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
      // 🔒 SECURITY: HttpOnly cookies + CSRF token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/change-password`, {
        method: 'POST',
        headers,
        credentials: 'include', // 🔒 SECURITY: Send HttpOnly cookies automatically
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

  const handleCvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setNotifications({ error: 'Invalid file type. Please upload a PDF or DOCX file.' });
        setTimeout(() => setNotifications({}), 5000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotifications({ error: 'File size exceeds 5MB. Please upload a smaller file.' });
        setTimeout(() => setNotifications({}), 5000);
        return;
      }

      setCvFile(file);
    }
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;

    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      // 🔒 SECURITY: HttpOnly cookies + CSRF token
      const headers: Record<string, string> = {};
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/upload-cv`, {
        method: 'POST',
        headers,
        credentials: 'include', // 🔒 SECURITY: Send HttpOnly cookies automatically
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile((prev) => prev ? { ...prev, cv_url: data.cv_url, cv_uploaded_at: new Date().toISOString() } : null);
        setNotifications({ success: 'CV uploaded successfully! AI analysis will begin shortly.' });
        setCvFile(null);
        if (cvInputRef.current) {
          cvInputRef.current.value = '';
        }
        setTimeout(() => setNotifications({}), 5000);
      } else {
        throw new Error('Failed to upload CV');
      }
    } catch (error) {
      console.error('Failed to upload CV:', error);
      setNotifications({ error: 'Failed to upload CV. Please try again.' });
      setTimeout(() => setNotifications({}), 5000);
    } finally {
      setCvUploading(false);
    }
  };

  const handleCvDelete = async () => {
    if (!confirm('Are you sure you want to delete your CV?')) return;

    try {
      // 🔒 SECURITY: HttpOnly cookies + CSRF token
      const headers: Record<string, string> = {};
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/delete-cv`, {
        method: 'DELETE',
        headers,
        credentials: 'include', // 🔒 SECURITY: Send HttpOnly cookies automatically
      });

      if (response.ok) {
        setProfile((prev) => prev ? { ...prev, cv_url: undefined, cv_uploaded_at: undefined } : null);
        setNotifications({ success: 'CV deleted successfully!' });
        setTimeout(() => setNotifications({}), 3000);
      } else {
        throw new Error('Failed to delete CV');
      }
    } catch (error) {
      console.error('Failed to delete CV:', error);
      setNotifications({ error: 'Failed to delete CV. Please try again.' });
      setTimeout(() => setNotifications({}), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      BENEFICIARY: 'Bénéficiaire',
      CONSULTANT: 'Consultant',
      ORG_ADMIN: 'Administrateur',
      ADMIN: 'Administrateur',
    };
    return roleMap[role] || role;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Échec du chargement du profil</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres du Profil</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Gérez vos informations personnelles et préférences</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Membre depuis {formatDate(profile.created_at || '')}</span>
        </div>
      </div>

      {/* Notifications */}
      {notifications.success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
          <span className="text-green-800 dark:text-green-200">{notifications.success}</span>
        </div>
      )}

      {notifications.error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
          <span className="text-red-800 dark:text-red-200">{notifications.error}</span>
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
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Informations Personnelles</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cv'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>CV & Documents</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Sécurité & Confidentialité</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <Card title="Informations Personnelles" subtitle="Mettez à jour vos informations personnelles">
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

          {activeTab === 'cv' && (
            <div className="space-y-6">
              <Card title="Télécharger votre CV" subtitle="Uploadez votre CV pour une analyse IA personnalisée">
                <div className="space-y-6">
                  {/* Current CV Status */}
                  {profile.cv_url ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                            <File className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900 dark:text-green-100">CV Téléchargé</h4>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              Téléchargé le {profile.cv_uploaded_at ? formatDate(profile.cv_uploaded_at) : 'Date inconnue'}
                            </p>
                            <div className="flex items-center space-x-4 mt-3">
                              <a
                                href={profile.cv_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Voir le CV
                              </a>
                              <button
                                onClick={handleCvDelete}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                          <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Aucun CV téléchargé</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Téléchargez votre CV pour bénéficier d'une analyse IA et de recommandations personnalisées.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Form */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {cvFile ? cvFile.name : 'Sélectionnez un fichier'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {cvFile 
                          ? `Taille: ${formatFileSize(cvFile.size)} • Type: ${cvFile.type.includes('pdf') ? 'PDF' : 'DOCX'}`
                          : 'PDF ou DOCX (max 5MB)'
                        }
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <File className="w-4 h-4 mr-2" />
                            Choisir un fichier
                          </span>
                          <input
                            ref={cvInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleCvFileChange}
                            className="hidden"
                          />
                        </label>
                        {cvFile && (
                          <button
                            onClick={handleCvUpload}
                            disabled={cvUploading}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cvUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Téléchargement...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Télécharger
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pourquoi télécharger votre CV ?</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span>Analyse automatique de vos compétences et expériences</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Recommandations de métiers personnalisées basées sur votre profil</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Identification des lacunes de compétences et suggestions de formation</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Génération automatique de votre bilan de compétences</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <Card title="Changer le Mot de Passe" subtitle="Mettez à jour votre mot de passe pour sécuriser votre compte">
              <PasswordForm onSubmit={handlePasswordChange} loading={loading} />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card title="Statut du Compte" icon={<Settings className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Email Vérifié</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  ✓ Vérifié
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Authentification 2FA</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  Non activée
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Dernière Connexion</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {profile.last_login_at ? formatDate(profile.last_login_at) : 'Jamais'}
                </span>
              </div>
              {profile.cv_url && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-300">CV Téléchargé</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    ✓ Oui
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Actions Rapides">
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <span>Modifier la Photo de Profil</span>
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('cv')}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span>Télécharger mon CV</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span>Activer l'Authentification 2FA</span>
                </div>
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Paramètres de Confidentialité</span>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

