import { pool, withUserContext, query, queryOne, transaction } from '../config/neon.js';
import { PoolClient } from 'pg';

export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' | 'ADMIN';
  organization_id?: string;
  cv_url?: string;
  cv_uploaded_at?: Date;
  email_verified_at?: Date;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Récupérer un utilisateur par email (sans RLS - pour l'authentification)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    null, // Pas de contexte utilisateur pour la connexion
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Récupérer un utilisateur par ID (sans RLS - pour l'authentification)
 */
export async function getUserById(userId: string): Promise<User | null> {
  return queryOne<User>(
    null,
    'SELECT id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
}

/**
 * Récupérer le profil utilisateur avec RLS (l'utilisateur ne peut voir que son propre profil)
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  return queryOne<User>(
    userId, // Contexte utilisateur pour RLS
    'SELECT id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
}

/**
 * Créer un nouvel utilisateur
 */
export async function createUser(userData: {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
}): Promise<User> {
  const result = await query<User>(
    null, // Pas de RLS pour la création
    `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at`,
    [userData.id, userData.email, userData.password_hash, userData.full_name, userData.role]
  );

  return result[0];
}

/**
 * Mettre à jour le profil utilisateur (avec RLS)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'password_hash' | 'created_at'>>
): Promise<User | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Construire dynamiquement la requête UPDATE
  Object.entries(updates).forEach(([key, value]) => {
    if (
      value !== undefined &&
      key !== 'id' &&
      key !== 'email' &&
      key !== 'password_hash' &&
      key !== 'created_at'
    ) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  if (fields.length === 0) {
    return getUserProfile(userId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query<User>(
    userId, // Contexte utilisateur pour RLS
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} 
     RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at`,
    values
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Mettre à jour l'URL du CV (avec RLS)
 */
export async function updateUserCV(userId: string, cvUrl: string): Promise<User | null> {
  const result = await query<User>(
    userId, // Contexte utilisateur pour RLS
    `UPDATE users 
     SET cv_url = $1, cv_uploaded_at = NOW(), updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at`,
    [cvUrl, userId]
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Supprimer l'URL du CV (avec RLS)
 */
export async function deleteUserCV(userId: string): Promise<User | null> {
  const result = await query<User>(
    userId, // Contexte utilisateur pour RLS
    `UPDATE users 
     SET cv_url = NULL, cv_uploaded_at = NULL, updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at`,
    [userId]
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Récupérer tous les utilisateurs (admin uniquement)
 */
export async function getAllUsers(adminUserId: string): Promise<User[]> {
  return query<User>(
    adminUserId, // Contexte admin pour RLS
    'SELECT id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at FROM users ORDER BY created_at DESC',
    []
  );
}

/**
 * Récupérer les utilisateurs d'une organisation (consultant/admin)
 */
export async function getUsersByOrganization(
  requestUserId: string,
  organizationId: string
): Promise<User[]> {
  return query<User>(
    requestUserId, // Contexte utilisateur pour RLS
    'SELECT id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at FROM users WHERE organization_id = $1 ORDER BY created_at DESC',
    [organizationId]
  );
}

/**
 * Mettre à jour le mot de passe (avec RLS)
 */
export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
): Promise<boolean> {
  const result = await query<{ id: string }>(
    userId, // Contexte utilisateur pour RLS
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
    [newPasswordHash, userId]
  );

  return result.length > 0;
}

/**
 * Supprimer un utilisateur (admin uniquement)
 */
export async function deleteUser(adminUserId: string, userIdToDelete: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    adminUserId, // Contexte admin pour RLS
    'DELETE FROM users WHERE id = $1 RETURNING id',
    [userIdToDelete]
  );

  return result.length > 0;
}

/**
 * Vérifier si un email existe déjà
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await query<{ count: string }>(
    null,
    'SELECT COUNT(*) as count FROM users WHERE email = $1',
    [email]
  );

  return result.length > 0 && parseInt(result[0].count) > 0;
}

/**
 * Get users by role
 */
export async function getUsersByRole(
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' | 'ADMIN',
  limit: number = 100
): Promise<User[]> {
  const validRoles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN', 'ADMIN'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  return query<User>(
    null, // Admin context
    'SELECT id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at FROM users WHERE role = $1 LIMIT $2',
    [role, limit]
  );
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(
  adminUserId: string,
  userId: string,
  newRole: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' | 'ADMIN'
): Promise<User | null> {
  const validRoles = ['BENEFICIARY', 'CONSULTANT', 'ORG_ADMIN', 'ADMIN'];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }

  return queryOne<User>(
    adminUserId, // Admin context for RLS
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at',
    [newRole, userId]
  );
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string): Promise<any | null> {
  return queryOne<any>(userId, 'SELECT * FROM user_preferences WHERE user_id = $1', [userId]);
}

/**
 * Update user preferences (upsert)
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
): Promise<any> {
  // Check if preferences exist
  const existing = await getUserPreferences(userId);

  if (existing) {
    // Update existing preferences
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(preferences).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return existing;
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query<any>(
      userId,
      `UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );

    return result[0];
  } else {
    // Insert new preferences
    const result = await query<any>(
      userId,
      `INSERT INTO user_preferences (user_id, notifications_email, notifications_sms, theme, language, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        preferences.notifications_email ?? true,
        preferences.notifications_sms ?? false,
        preferences.theme ?? 'light',
        preferences.language ?? 'fr',
      ]
    );

    return result[0];
  }
}

/**
 * Get user statistics (assessments, recommendations, etc.)
 */
export async function getUserStats(userId: string): Promise<{
  userId: string;
  email: string;
  full_name: string;
  role: string;
  assessmentCount: number;
  recommendationCount: number;
  lastLogin: Date | null;
  emailVerified: boolean;
  joinedDate: Date;
}> {
  // Get user
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Get bilans count
  const bilansResult = await query<{ count: string }>(
    userId,
    'SELECT COUNT(*) as count FROM bilans WHERE beneficiary_id = $1 OR consultant_id = $1',
    [userId]
  );

  // Get recommendations count
  const recommendationsResult = await query<{ count: string }>(
    userId,
    'SELECT COUNT(*) as count FROM recommendations WHERE user_id = $1',
    [userId]
  );

  return {
    userId: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    assessmentCount: parseInt(bilansResult[0]?.count || '0'),
    recommendationCount: parseInt(recommendationsResult[0]?.count || '0'),
    lastLogin: null, // TODO: Add last_login_at to users table
    emailVerified: !!user.email_verified_at,
    joinedDate: user.created_at,
  };
}

/**
 * Delete user account (soft delete with audit trail)
 */
export async function deleteUserAccount(
  adminUserId: string,
  userId: string,
  reason?: string
): Promise<User | null> {
  // Create audit log before deletion
  await query(
    adminUserId,
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, created_at)
     VALUES ($1, 'ACCOUNT_DELETED', 'user', $2, $3, NOW())`,
    [userId, userId, JSON.stringify({ reason })]
  );

  // Soft delete - mark as deleted instead of hard delete
  return queryOne<User>(
    adminUserId,
    `UPDATE users 
     SET deleted_at = NOW(), 
         email = $1, 
         updated_at = NOW() 
     WHERE id = $2 
     RETURNING id, email, full_name, role, organization_id, cv_url, cv_uploaded_at, created_at, updated_at`,
    [`deleted_${userId}@deleted.local`, userId]
  );
}

/**
 * Export user data (GDPR compliance)
 */
export async function exportUserData(userId: string): Promise<{
  user: User | null;
  sessions: any[];
  auditLogs: any[];
  exportedAt: string;
}> {
  // Get user profile
  const user = await getUserById(userId);

  // Get user sessions
  const sessions = await query<any>(userId, 'SELECT * FROM auth_sessions WHERE user_id = $1', [
    userId,
  ]);

  // Get user audit logs
  const auditLogs = await query<any>(userId, 'SELECT * FROM audit_logs WHERE user_id = $1', [
    userId,
  ]);

  return {
    user,
    sessions,
    auditLogs,
    exportedAt: new Date().toISOString(),
  };
}
