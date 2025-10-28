import { query, queryOne } from '../config/neon.js';

export interface Bilan {
  id: string;
  beneficiary_id: string;
  consultant_id?: string;
  status: string;
  satisfaction_score?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Recommendation {
  id: string;
  beneficiary_id: string;
  title: string;
  description: string;
  created_at: Date;
}

export interface DashboardStats {
  totalBilans: number;
  completedBilans: number;
  pendingBilans: number;
  activeBilans?: number;
  totalClients?: number;
  averageSatisfaction: number;
}

/**
 * Get all bilans for a beneficiary
 */
export async function getBilansByBeneficiary(beneficiaryId: string): Promise<Bilan[]> {
  return query<Bilan>(
    beneficiaryId,
    'SELECT * FROM bilans WHERE beneficiary_id = $1 ORDER BY created_at DESC',
    [beneficiaryId]
  );
}

/**
 * Get all recommendations for a beneficiary
 * Recommendations are linked to bilans, so we need to join through bilans table
 */
export async function getRecommendationsByBeneficiary(
  beneficiaryId: string
): Promise<Recommendation[]> {
  return query<Recommendation>(
    beneficiaryId,
    `SELECT r.* FROM recommendations r
     INNER JOIN bilans b ON b.id = r.bilan_id
     WHERE b.beneficiary_id = $1
     ORDER BY r.created_at DESC`,
    [beneficiaryId]
  );
}

/**
 * Get all bilans assigned to a consultant
 */
export async function getBilansByConsultant(consultantId: string): Promise<Bilan[]> {
  return query<Bilan>(
    consultantId,
    'SELECT * FROM bilans WHERE consultant_id = $1 ORDER BY created_at DESC',
    [consultantId]
  );
}

/**
 * Get unique clients (beneficiaries) for a consultant
 */
export async function getClientsByConsultant(
  consultantId: string
): Promise<Array<{ id: string; full_name: string; email: string }>> {
  return query<{ id: string; full_name: string; email: string }>(
    consultantId,
    `SELECT DISTINCT u.id, u.full_name, u.email 
     FROM users u
     INNER JOIN bilans b ON b.beneficiary_id = u.id
     WHERE b.consultant_id = $1
     ORDER BY u.full_name`,
    [consultantId]
  );
}

/**
 * Get all bilans (for admin)
 */
export async function getAllBilans(): Promise<Bilan[]> {
  return query<Bilan>(null, 'SELECT * FROM bilans ORDER BY created_at DESC LIMIT 100', []);
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string): Promise<DashboardStats> {
  const bilans = await query<Bilan>(
    null,
    `SELECT * FROM bilans b
     INNER JOIN users u ON u.id = b.beneficiary_id
     WHERE u.organization_id = $1`,
    [organizationId]
  );

  const completedBilans = bilans.filter((b) => b.status === 'COMPLETED').length;
  const activeBilans = bilans.filter(
    (b) => b.status === 'PRELIMINARY' || b.status === 'INVESTIGATION' || b.status === 'CONCLUSION'
  ).length;

  const totalSatisfaction = bilans.reduce((sum, b) => sum + (b.satisfaction_score || 0), 0);
  const averageSatisfaction =
    bilans.length > 0 ? Math.round((totalSatisfaction / bilans.length) * 10) / 10 : 0;

  return {
    totalBilans: bilans.length,
    completedBilans,
    pendingBilans: bilans.length - completedBilans,
    activeBilans,
    averageSatisfaction,
  };
}

/**
 * Get recent activity for an organization
 */
export async function getRecentActivityByOrganization(
  organizationId: string,
  limit: number = 20
): Promise<Array<{ id: string; action: string; created_at: Date }>> {
  return query<{ id: string; action: string; created_at: Date }>(
    null,
    `SELECT id, action, created_at 
     FROM audit_logs 
     WHERE organization_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [organizationId, limit]
  );
}
