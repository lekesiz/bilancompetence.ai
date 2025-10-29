import { pool, query, queryOne, withUserContext } from '../config/neon.js';
import { logger } from '../utils/logger.js';

export interface UserConsent {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  granted_at: Date | null;
  withdrawn_at: Date | null;
  ip_address: string | null;
  user_agent: string | null;
  consent_version: string;
  purpose: string | null;
  legal_basis: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ConsentLog {
  id: string;
  user_id: string | null;
  consent_id: string | null;
  consent_type: string;
  action: 'granted' | 'withdrawn' | 'updated';
  previous_value: boolean | null;
  new_value: boolean | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: Date;
}

export interface GrantConsentParams {
  userId: string;
  consentType: string;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  consentVersion?: string;
  purpose?: string;
  legalBasis?: string;
}

/**
 * Grant or withdraw consent for a user
 * RGPD Art. 7: Conditions for consent
 */
export async function grantConsent(
  userId: string,
  params: Omit<GrantConsentParams, 'userId'>
): Promise<UserConsent> {
  return withUserContext(userId, async (client) => {
    const {
      consentType,
      granted,
      ipAddress,
      userAgent,
      consentVersion = '1.0',
      purpose,
      legalBasis,
    } = params;

    // Check if consent already exists
    const existing = await queryOne<UserConsent>(
      userId,
      `SELECT * FROM user_consents 
       WHERE user_id = $1 AND consent_type = $2`,
      [userId, consentType]
    );

    let consent: UserConsent;

    if (existing) {
      // Update existing consent
      const timestamp = granted ? 'NOW()' : 'NULL';
      const withdrawnTimestamp = granted ? 'NULL' : 'NOW()';

      const result = await client.query<UserConsent>(
        `UPDATE user_consents 
         SET granted = $1,
             granted_at = CASE WHEN $1 = TRUE THEN COALESCE(granted_at, NOW()) ELSE granted_at END,
             withdrawn_at = CASE WHEN $1 = FALSE THEN NOW() ELSE NULL END,
             ip_address = $2,
             user_agent = $3,
             consent_version = $4,
             purpose = COALESCE($5, purpose),
             legal_basis = COALESCE($6, legal_basis),
             updated_at = NOW()
         WHERE user_id = $7 AND consent_type = $8
         RETURNING *`,
        [
          granted,
          ipAddress || null,
          userAgent || null,
          consentVersion,
          purpose || null,
          legalBasis || null,
          userId,
          consentType,
        ]
      );

      consent = result.rows[0];
      logger.info('Consent updated', {
        userId,
        consentType,
        granted,
        service: 'bilancompetence-api',
      });
    } else {
      // Create new consent
      const result = await client.query<UserConsent>(
        `INSERT INTO user_consents (
           user_id, consent_type, granted, granted_at, withdrawn_at,
           ip_address, user_agent, consent_version, purpose, legal_basis
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          consentType,
          granted,
          granted ? new Date() : null,
          granted ? null : new Date(),
          ipAddress || null,
          userAgent || null,
          consentVersion,
          purpose || null,
          legalBasis || null,
        ]
      );

      consent = result.rows[0];
      logger.info('Consent granted', {
        userId,
        consentType,
        granted,
        service: 'bilancompetence-api',
      });
    }

    return consent;
  });
}

/**
 * Get consent status for a specific type
 */
export async function getConsent(
  userId: string,
  consentType: string
): Promise<UserConsent | null> {
  return withUserContext(userId, async () => {
    return queryOne<UserConsent>(
      userId,
      `SELECT * FROM user_consents 
       WHERE user_id = $1 AND consent_type = $2`,
      [userId, consentType]
    );
  });
}

/**
 * Check if user has granted a specific consent
 */
export async function hasConsent(
  userId: string,
  consentType: string
): Promise<boolean> {
  const consent = await getConsent(userId, consentType);
  if (!consent) return false;

  // Consent must be granted and not withdrawn
  return (
    consent.granted &&
    (consent.withdrawn_at === null || consent.granted_at > consent.withdrawn_at)
  );
}

/**
 * Get all consents for a user
 */
export async function getUserConsents(userId: string): Promise<UserConsent[]> {
  return withUserContext(userId, async () => {
    return query<UserConsent>(
      userId,
      `SELECT * FROM user_consents 
       WHERE user_id = $1 
       ORDER BY consent_type`,
      [userId]
    );
  });
}

/**
 * Withdraw consent
 */
export async function withdrawConsent(
  userId: string,
  consentType: string,
  ipAddress?: string,
  userAgent?: string
): Promise<UserConsent | null> {
  return withUserContext(userId, async (client) => {
    const result = await client.query<UserConsent>(
      `UPDATE user_consents 
       SET granted = FALSE,
           withdrawn_at = NOW(),
           ip_address = $1,
           user_agent = $2,
           updated_at = NOW()
       WHERE user_id = $3 AND consent_type = $4
       RETURNING *`,
      [ipAddress || null, userAgent || null, userId, consentType]
    );

    if (result.rows.length === 0) {
      return null;
    }

    logger.info('Consent withdrawn', {
      userId,
      consentType,
      service: 'bilancompetence-api',
    });

    return result.rows[0];
  });
}

/**
 * Get consent log for a user (audit trail)
 * RGPD Art. 30: Records of processing activities
 */
export async function getConsentLog(
  userId: string,
  limit: number = 50
): Promise<ConsentLog[]> {
  return withUserContext(userId, async () => {
    return query<ConsentLog>(
      userId,
      `SELECT * FROM consent_log 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
  });
}

/**
 * Grant multiple consents at once
 */
export async function grantMultipleConsents(
  userId: string,
  consents: Array<{
    consentType: string;
    granted: boolean;
    purpose?: string;
    legalBasis?: string;
  }>,
  ipAddress?: string,
  userAgent?: string,
  consentVersion?: string
): Promise<UserConsent[]> {
  return withUserContext(userId, async (client) => {
    const results: UserConsent[] = [];

    for (const consent of consents) {
      const result = await grantConsent(userId, {
        ...consent,
        ipAddress,
        userAgent,
        consentVersion,
      });
      results.push(result);
    }

    logger.info('Multiple consents granted', {
      userId,
      count: consents.length,
      service: 'bilancompetence-api',
    });

    return results;
  });
}

/**
 * Get consent statistics for admin dashboard
 */
export async function getConsentStatistics(): Promise<{
  total_users: number;
  consents_by_type: Record<string, { granted: number; withdrawn: number }>;
  consent_rate: number;
}> {
  // This query doesn't need user context (admin only)
  const statsResult = await query<any>(
    null,
    `SELECT 
       COUNT(DISTINCT user_id) as total_users,
       consent_type,
       COUNT(*) FILTER (WHERE granted = TRUE) as granted_count,
       COUNT(*) FILTER (WHERE granted = FALSE) as withdrawn_count
     FROM user_consents
     GROUP BY consent_type`,
    []
  );

  const consents_by_type: Record<string, { granted: number; withdrawn: number }> = {};

  let totalGranted = 0;
  let totalWithdrawn = 0;

  for (const row of statsResult) {
    consents_by_type[row.consent_type] = {
      granted: parseInt(row.granted_count) || 0,
      withdrawn: parseInt(row.withdrawn_count) || 0,
    };
    totalGranted += parseInt(row.granted_count) || 0;
    totalWithdrawn += parseInt(row.withdrawn_count) || 0;
  }

  const totalUsers = statsResult.length > 0 ? parseInt(statsResult[0].total_users) || 0 : 0;
  const consentRate = totalUsers > 0 ? (totalGranted / (totalGranted + totalWithdrawn)) * 100 : 0;

  return {
    total_users: totalUsers,
    consents_by_type,
    consent_rate: Math.round(consentRate * 100) / 100,
  };
}

