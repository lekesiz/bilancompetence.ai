import { supabase } from './supabaseService.js';
import { logAndThrow, validateRequired, DatabaseError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';
import { isValidUserRole } from '../types/enums.js';

/**
 * User Service - User profile management
 * Standardized error handling for all user operations
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
  try {
    validateRequired({ userId }, ['userId']);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch user profile', error);
    }

    if (!data) {
      logger.info('User profile not found', { userId });
      return null;
    }

    logger.info('User profile retrieved successfully', { userId });
    return data as unknown as UserProfile;
  } catch (error) {
    logAndThrow('Failed to get user profile', error);
  }
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
  try {
    validateRequired({ userId, updates }, ['userId', 'updates']);

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('No fields provided for update');
    }

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
      throw new DatabaseError('Failed to update user profile', error);
    }

    logger.info('User profile updated successfully', { userId, fields: Object.keys(updates) });
    return data as unknown as UserProfile;
  } catch (error) {
    logAndThrow('Failed to update user profile', error);
  }
}

/**
 * Get user by role
 */
export async function getUsersByRole(role: string, limit: number = 100) {
  try {
    validateRequired({ role }, ['role']);

    const validRoles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Validate role enum
    if (!isValidUserRole(role)) {
      throw new ValidationError(`Invalid role: ${role}`);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .limit(limit);

    if (error) {
      throw new DatabaseError('Failed to fetch users by role', error);
    }

    logger.info('Users by role retrieved successfully', { role, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logAndThrow('Failed to get users by role', error);
  }
}

/**
 * Get organization users
 */
export async function getOrganizationUsers(organizationId: string) {
  try {
    validateRequired({ organizationId }, ['organizationId']);

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      throw new DatabaseError('Failed to fetch organization users', error);
    }

    logger.info('Organization users retrieved successfully', { organizationId, count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logAndThrow('Failed to get organization users', error);
  }
}

/**
 * Update user role
 */
export async function updateUserRole(
  userId: string,
  newRole: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN'
) {
  try {
    validateRequired({ userId, newRole }, ['userId', 'newRole']);

    const validRoles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN'];
    if (!validRoles.includes(newRole)) {
      throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new DatabaseError('Failed to update user role', error);
    }

    logger.info('User role updated successfully', { userId, newRole });
    return data as unknown as UserProfile;
  } catch (error) {
    logAndThrow('Failed to update user role', error);
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch user preferences', error);
    }

    if (!data) {
      logger.info('User preferences not found, returning null', { userId });
      return null;
    }

    logger.info('User preferences retrieved successfully', { userId });
    return data;
  } catch (error) {
    logAndThrow('Failed to get user preferences', error);
  }
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
  try {
    validateRequired({ userId, preferences }, ['userId', 'preferences']);

    // Try to update existing preferences
    const { data: existing, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new DatabaseError('Failed to fetch user preferences', fetchError);
    }

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

      if (error) {
        throw new DatabaseError('Failed to update user preferences', error);
      }

      logger.info('User preferences updated successfully', { userId });
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

      if (error) {
        throw new DatabaseError('Failed to create user preferences', error);
      }

      logger.info('User preferences created successfully', { userId });
      return data;
    }
  } catch (error) {
    logAndThrow('Failed to update user preferences', error);
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new DatabaseError('Failed to fetch user for statistics', userError);
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get bilans count
    const { data: bilans, count: bilansCount, error: bilansError } = await supabase
      .from('bilans')
      .select('id', { count: 'exact' })
      .or(`beneficiary_id.eq.${userId},consultant_id.eq.${userId}`);

    if (bilansError) {
      throw new DatabaseError('Failed to fetch assessment count', bilansError);
    }

    // Get recommendations count
    const { data: recommendations, count: recommendationsCount, error: recommendationsError } = await supabase
      .from('recommendations')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (recommendationsError) {
      throw new DatabaseError('Failed to fetch recommendation count', recommendationsError);
    }

    const typedUser = user as any; // Type assertion for database row
    const stats = {
      userId: typedUser.id,
      email: typedUser.email,
      full_name: typedUser.full_name,
      role: typedUser.role,
      assessmentCount: bilansCount || 0,
      recommendationCount: recommendationsCount || 0,
      lastLogin: typedUser.last_login_at,
      emailVerified: !!typedUser.email_verified_at,
      joinedDate: typedUser.created_at,
    };

    logger.info('User statistics retrieved successfully', { userId });
    return stats;
  } catch (error) {
    logAndThrow('Failed to get user statistics', error);
  }
}

/**
 * Delete user account (with audit trail)
 */
export async function deleteUserAccount(userId: string, reason?: string) {
  try {
    validateRequired({ userId }, ['userId']);

    // Create audit log before deletion
    const { error: auditError } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action: 'ACCOUNT_DELETED',
      entity_type: 'user',
      entity_id: userId,
      changes: { reason },
    });

    if (auditError) {
      throw new DatabaseError('Failed to create audit log for account deletion', auditError);
    }

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
      throw new DatabaseError('Failed to delete user account', error);
    }

    logger.info('User account deleted successfully', { userId, reason });
    return data;
  } catch (error) {
    logAndThrow('Failed to delete user account', error);
  }
}

/**
 * Export user data (GDPR)
 */
export async function exportUserData(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new DatabaseError('Failed to fetch user for export', userError);
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get user sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId);

    if (sessionsError) {
      throw new DatabaseError('Failed to fetch user sessions', sessionsError);
    }

    // Get user audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId);

    if (auditError) {
      throw new DatabaseError('Failed to fetch user audit logs', auditError);
    }

    const exportData = {
      user,
      sessions: sessions || [],
      auditLogs: auditLogs || [],
      exportedAt: new Date().toISOString(),
    };

    logger.info('User data exported successfully (GDPR)', { userId });
    return exportData;
  } catch (error) {
    logAndThrow('Failed to export user data', error);
  }
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
