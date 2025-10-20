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

export default supabase;
