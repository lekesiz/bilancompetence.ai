import { query, queryOne } from '../config/neon.js';

/**
 * Email Verification Token Interface
 */
export interface EmailVerificationToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
}

/**
 * Password Reset Token Interface
 */
export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
}

/**
 * Audit Log Interface
 */
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata?: any;
  ip_address?: string;
  created_at: Date;
}

// ============================================================================
// EMAIL VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Verify user email
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  await query(
    null,
    'UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1',
    [userId]
  );
}

/**
 * Create email verification token
 */
export async function createEmailVerificationToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<EmailVerificationToken> {
  const result = await query<EmailVerificationToken>(
    null,
    `INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [userId, token, expiresAt]
  );
  return result[0];
}

/**
 * Get valid email verification token
 */
export async function getEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  return queryOne<EmailVerificationToken>(
    null,
    `SELECT * FROM email_verification_tokens
     WHERE token = $1
     AND expires_at > NOW()
     AND used_at IS NULL`,
    [token]
  );
}

/**
 * Mark email verification token as used
 */
export async function useEmailVerificationToken(tokenId: string): Promise<void> {
  await query(
    null,
    'UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1',
    [tokenId]
  );
}

// ============================================================================
// PASSWORD RESET FUNCTIONS
// ============================================================================

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await query(
    null,
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [passwordHash, userId]
  );
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(
  userId: string,
  token: string,
  expiresAt: Date
): Promise<PasswordResetToken> {
  const result = await query<PasswordResetToken>(
    null,
    `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [userId, token, expiresAt]
  );
  return result[0];
}

/**
 * Get valid password reset token
 */
export async function getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  return queryOne<PasswordResetToken>(
    null,
    `SELECT * FROM password_reset_tokens
     WHERE token = $1
     AND expires_at > NOW()
     AND used_at IS NULL`,
    [token]
  );
}

/**
 * Mark password reset token as used
 */
export async function usePasswordResetToken(tokenId: string): Promise<void> {
  await query(
    null,
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
    [tokenId]
  );
}

// ============================================================================
// AUDIT LOG FUNCTIONS
// ============================================================================

/**
 * Create audit log entry
 */
export async function createAuditLog(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata: any = null,
  ipAddress: string | undefined = undefined
): Promise<AuditLog> {
  const result = await query<AuditLog>(
    null,
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata, ip_address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING *`,
    [userId, action, resourceType, resourceId, metadata ? JSON.stringify(metadata) : null, ipAddress || null]
  );
  return result[0];
}

/**
 * Get audit logs for a user
 */
export async function getAuditLogsByUser(userId: string, limit: number = 50): Promise<AuditLog[]> {
  return query<AuditLog>(
    userId,
    'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
}

