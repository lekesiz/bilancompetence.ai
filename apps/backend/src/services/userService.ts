import { supabase } from './supabaseService';

/**
 * User Service - User profile management
 */

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
  phone?: string;
  avatar_url?: string;
  bio?: string;
  specialization?: string;
  organization_id?: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user profile with full details
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    bio?: string;
    specialization?: string;
    avatar_url?: string;
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

/**
 * Get user by role
 */
export async function getUsersByRole(role: string, limit: number = 100) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Get organization users
 */
export async function getOrganizationUsers(organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN'
) {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as UserProfile;
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  preferences: {
    notifications_email?: boolean;
    notifications_sms?: boolean;
    theme?: 'light' | 'dark';
    language?: string;
    [key: string]: any;
  }
) {
  // Try to update existing preferences
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Get bilans count
  const { data: bilans } = await supabase
    .from('bilans')
    .select('id')
    .or(`beneficiary_id.eq.${userId},consultant_id.eq.${userId}`)
    .count('exact');

  // Get recommendations count
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('id')
    .eq('user_id', userId)
    .count('exact');

  return {
    userId: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    assessmentCount: bilans?.length || 0,
    recommendationCount: recommendations?.length || 0,
    lastLogin: user.last_login_at,
    emailVerified: !!user.email_verified_at,
    joinedDate: user.created_at,
  };
}

/**
 * Delete user account (with audit trail)
 */
export async function deleteUserAccount(userId: string, reason?: string) {
  // Create audit log before deletion
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'ACCOUNT_DELETED',
    entity_type: 'user',
    entity_id: userId,
    changes: { reason },
  });

  // Soft delete - mark as deleted instead of hard delete
  const { data, error } = await supabase
    .from('users')
    .update({
      deleted_at: new Date().toISOString(),
      email: `deleted_${userId}@deleted.local`, // Anonymize email
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Export user data (GDPR)
 */
export async function exportUserData(userId: string) {
  // Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Get user sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId);

  // Get user audit logs
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId);

  return {
    user,
    sessions,
    auditLogs,
    exportedAt: new Date().toISOString(),
  };
}

export default {
  getUserProfile,
  updateUserProfile,
  getUsersByRole,
  getOrganizationUsers,
  updateUserRole,
  getUserPreferences,
  updateUserPreferences,
  getUserStats,
  deleteUserAccount,
  exportUserData,
};
