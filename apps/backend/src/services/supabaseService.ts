import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * User Service - Database operations
 */

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' = 'BENEFICIARY'
) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserEmail(userId: string, newEmail: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ email: newEmail, email_verified_at: null })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function verifyUserEmail(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ email_verified_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserPassword(userId: string, newPasswordHash: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ password_hash: newPasswordHash })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserLastLogin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPasswordResetToken(token: string) {
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function usePasswordResetToken(tokenId: string) {
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createEmailVerificationToken(userId: string, token: string, expiresAt: Date) {
  const { data, error } = await supabase
    .from('email_verification_tokens')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getEmailVerificationToken(token: string) {
  const { data, error } = await supabase
    .from('email_verification_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function useEmailVerificationToken(tokenId: string) {
  const { data, error } = await supabase
    .from('email_verification_tokens')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Organization Service
 */

export async function createOrganization(
  name: string,
  adminUserId: string,
  description?: string
) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      admin_user_id: adminUserId,
      description,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

/**
 * Session Service
 */

export async function createSession(userId: string, refreshToken: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

export async function revokeSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Audit Log Service
 */

export async function createAuditLog(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  changes?: any,
  ipAddress?: string
) {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      ip_address: ipAddress,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Bilan Service - Query operations for dashboard
 */

export async function getBilansByBeneficiary(beneficiaryId: string) {
  const { data, error } = await supabase
    .from('bilans')
    .select(`
      id,
      status,
      start_date,
      expected_end_date,
      actual_end_date,
      duration_hours,
      satisfaction_score,
      created_at,
      updated_at,
      consultant:consultant_id(id, full_name, email)
    `)
    .eq('beneficiary_id', beneficiaryId)
    .order('created_at', { ascending: false });

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || [];
}

export async function getBilansByConsultant(consultantId: string) {
  const { data, error } = await supabase
    .from('bilans')
    .select(`
      id,
      status,
      start_date,
      expected_end_date,
      actual_end_date,
      duration_hours,
      satisfaction_score,
      created_at,
      updated_at,
      beneficiary:beneficiary_id(id, full_name, email)
    `)
    .eq('consultant_id', consultantId)
    .order('created_at', { ascending: false });

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || [];
}

export async function getClientsByConsultant(consultantId: string) {
  const { data, error } = await supabase
    .from('bilans')
    .select('beneficiary:beneficiary_id(id, full_name, email)')
    .eq('consultant_id', consultantId);

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  // Extract unique beneficiaries by creating a Set of IDs
  const uniqueMap = new Map();
  data?.forEach(row => {
    if (row.beneficiary && row.beneficiary.id) {
      uniqueMap.set(row.beneficiary.id, row.beneficiary);
    }
  });

  return Array.from(uniqueMap.values());
}

export async function getRecommendationsByBeneficiary(beneficiaryId: string) {
  // First, get all bilans for the beneficiary
  const { data: bilans, error: bilansError } = await supabase
    .from('bilans')
    .select('id')
    .eq('beneficiary_id', beneficiaryId);

  if (bilansError) {
    throw bilansError;
  }

  const bilanIds = bilans?.map(b => b.id) || [];

  // If no bilans, return empty array
  if (bilanIds.length === 0) {
    return [];
  }

  // Get recommendations for all bilans
  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      id,
      type,
      title,
      description,
      match_score,
      priority,
      created_at,
      updated_at,
      bilan:bilan_id(id, status)
    `)
    .in('bilan_id', bilanIds)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || [];
}

export async function getAllBilans() {
  const { data, error } = await supabase
    .from('bilans')
    .select(`
      id,
      status,
      start_date,
      expected_end_date,
      satisfaction_score,
      created_at,
      beneficiary:beneficiary_id(id, full_name, email),
      consultant:consultant_id(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || [];
}

export async function countBilansByStatus(status: string) {
  const { count, error } = await supabase
    .from('bilans')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);

  if (error) {
    throw error;
  }

  return count || 0;
}

export async function getOrganizationStats(organizationId: string) {
  try {
    // Get all users in organization
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get all bilans in organization
    const { count: totalAssessments, error: assessmentsError } = await supabase
      .from('bilans')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    // Get active consultants (have at least one bilan)
    const { data: bilanData, error: consultantsError } = await supabase
      .from('bilans')
      .select('consultant_id')
      .eq('organization_id', organizationId)
      .not('consultant_id', 'is', null);

    // Count unique consultants
    const uniqueConsultants = new Set(bilanData?.map(b => b.consultant_id) || []);

    // Get completed bilans
    const { count: completedBilans, error: completedError } = await supabase
      .from('bilans')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'COMPLETED');

    // Get average satisfaction
    const { data: satisfactionData, error: satisfactionError } = await supabase
      .from('bilans')
      .select('satisfaction_score')
      .eq('organization_id', organizationId)
      .not('satisfaction_score', 'is', null);

    const avgSatisfaction = satisfactionData && satisfactionData.length > 0
      ? satisfactionData.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0) / satisfactionData.length
      : 0;

    return {
      totalUsers: totalUsers || 0,
      totalAssessments: totalAssessments || 0,
      totalConsultants: uniqueConsultants.size,
      completedBilans: completedBilans || 0,
      averageSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      successRate: totalAssessments
        ? Math.round((completedBilans || 0) / totalAssessments * 100)
        : 0,
    };
  } catch (error) {
    console.error('Error getting organization stats:', error);
    throw error;
  }
}

/**
 * Recent Activity Service
 */

export async function getRecentActivityByOrganization(organizationId: string, limit: number = 20) {
  // First, get all user IDs in the organization
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .eq('organization_id', organizationId);

  if (usersError) {
    throw usersError;
  }

  const userIds = users?.map(u => u.id) || [];

  // If no users, return empty array
  if (userIds.length === 0) {
    return [];
  }

  // Get recent activity for all users
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      user:user_id(id, full_name, email),
      action,
      entity_type,
      created_at
    `)
    .in('user_id', userIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || [];
}

export default supabase;
