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
    if (value !== undefined && key !== 'id' && key !== 'email' && key !== 'password_hash' && key !== 'created_at') {
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
export async function updateUserCV(
  userId: string,
  cvUrl: string
): Promise<User | null> {
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

