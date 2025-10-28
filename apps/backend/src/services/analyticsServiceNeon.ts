import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';

/**
 * Analytics Service - Neon PostgreSQL version
 * Provides statistics and analytics for users, consultants, and organizations
 */

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(userId: string) {
  try {
    // Get total assessments
    const assessmentCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments WHERE beneficiary_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    const totalAssessments = assessmentCountResult[0]?.count || 0;

    // Get completed assessments
    const completedCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE beneficiary_id = $1 AND status = 'COMPLETED' AND deleted_at IS NULL`,
      [userId]
    );
    const completedAssessments = completedCountResult[0]?.count || 0;

    // Get in-progress assessments
    const inProgressCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE beneficiary_id = $1 AND status = 'IN_PROGRESS' AND deleted_at IS NULL`,
      [userId]
    );
    const inProgressAssessments = inProgressCountResult[0]?.count || 0;

    // Get recommendations count (via bilans)
    const recommendationCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM recommendations r
       INNER JOIN bilans b ON r.bilan_id = b.id
       WHERE b.beneficiary_id = $1 AND b.deleted_at IS NULL`,
      [userId]
    );
    const recommendations = recommendationCountResult[0]?.count || 0;

    // Get bilans count
    const bilansCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM bilans 
       WHERE beneficiary_id = $1 AND deleted_at IS NULL`,
      [userId]
    );
    const totalBilans = bilansCountResult[0]?.count || 0;

    // Calculate completion rate
    const completionRate =
      totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

    const stats = {
      totalAssessments,
      completedAssessments,
      inProgressAssessments,
      pendingAssessments: totalAssessments - completedAssessments - inProgressAssessments,
      recommendations,
      totalBilans,
      completionRate,
    };

    logger.info('User activity statistics calculated', { userId, stats });
    return stats;
  } catch (error) {
    logger.error('Failed to get user activity statistics', { userId, error });
    throw error;
  }
}

/**
 * Get consultant activity statistics
 */
export async function getConsultantActivityStats(consultantId: string) {
  try {
    // Get total clients
    const clientsCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(DISTINCT beneficiary_id)::int as count FROM assessments 
       WHERE consultant_id = $1 AND deleted_at IS NULL`,
      [consultantId]
    );
    const totalClients = clientsCountResult[0]?.count || 0;

    // Get total assessments managed
    const assessmentsCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE consultant_id = $1 AND deleted_at IS NULL`,
      [consultantId]
    );
    const totalAssessments = assessmentsCountResult[0]?.count || 0;

    // Get completed assessments
    const completedCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE consultant_id = $1 AND status = 'COMPLETED' AND deleted_at IS NULL`,
      [consultantId]
    );
    const completedAssessments = completedCountResult[0]?.count || 0;

    // Get active sessions
    const activeSessionsResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM sessions 
       WHERE consultant_id = $1 AND status = 'SCHEDULED'`,
      [consultantId]
    );
    const activeSessions = activeSessionsResult[0]?.count || 0;

    const stats = {
      totalClients,
      totalAssessments,
      completedAssessments,
      activeSessions,
      completionRate:
        totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0,
    };

    logger.info('Consultant activity statistics calculated', { consultantId, stats });
    return stats;
  } catch (error) {
    logger.error('Failed to get consultant activity statistics', { consultantId, error });
    throw error;
  }
}

/**
 * Get organization statistics
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    // Get total users
    const usersCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM users 
       WHERE organization_id = $1 AND deleted_at IS NULL`,
      [organizationId]
    );
    const totalUsers = usersCountResult[0]?.count || 0;

    // Get total consultants
    const consultantsCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM users 
       WHERE organization_id = $1 AND role = 'CONSULTANT' AND deleted_at IS NULL`,
      [organizationId]
    );
    const totalConsultants = consultantsCountResult[0]?.count || 0;

    // Get total beneficiaries
    const beneficiariesCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM users 
       WHERE organization_id = $1 AND role = 'BENEFICIARY' AND deleted_at IS NULL`,
      [organizationId]
    );
    const totalBeneficiaries = beneficiariesCountResult[0]?.count || 0;

    // Get total assessments
    const assessmentsCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE organization_id = $1 AND deleted_at IS NULL`,
      [organizationId]
    );
    const totalAssessments = assessmentsCountResult[0]?.count || 0;

    // Get completed assessments
    const completedCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessments 
       WHERE organization_id = $1 AND status = 'COMPLETED' AND deleted_at IS NULL`,
      [organizationId]
    );
    const completedAssessments = completedCountResult[0]?.count || 0;

    // Get Qualiopi compliance
    const qualiopiResult = await query<{ qualiopi_compliance_percentage: number }>(
      null,
      `SELECT qualiopi_compliance_percentage FROM organizations WHERE id = $1`,
      [organizationId]
    );
    const qualiopiCompliance = qualiopiResult[0]?.qualiopi_compliance_percentage || 0;

    const stats = {
      totalUsers,
      totalConsultants,
      totalBeneficiaries,
      totalAssessments,
      completedAssessments,
      qualiopiCompliance,
      completionRate:
        totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0,
    };

    logger.info('Organization statistics calculated', { organizationId, stats });
    return stats;
  } catch (error) {
    logger.error('Failed to get organization statistics', { organizationId, error });
    throw error;
  }
}

/**
 * Get assessment statistics by ID
 */
export async function getAssessmentStats(assessmentId: string) {
  try {
    // Get assessment details
    const assessment = await query<any>(
      null,
      `SELECT * FROM assessments WHERE id = $1 AND deleted_at IS NULL`,
      [assessmentId]
    );

    if (assessment.length === 0) {
      throw new Error('Assessment not found');
    }

    // Get competencies count
    const competenciesCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessment_competencies WHERE assessment_id = $1`,
      [assessmentId]
    );
    const totalCompetencies = competenciesCountResult[0]?.count || 0;

    // Get questions count
    const questionsCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessment_questions WHERE assessment_id = $1`,
      [assessmentId]
    );
    const totalQuestions = questionsCountResult[0]?.count || 0;

    // Get answers count
    const answersCountResult = await query<{ count: number }>(
      null,
      `SELECT COUNT(*)::int as count FROM assessment_answers WHERE assessment_id = $1`,
      [assessmentId]
    );
    const totalAnswers = answersCountResult[0]?.count || 0;

    const stats = {
      ...assessment[0],
      totalCompetencies,
      totalQuestions,
      totalAnswers,
      answerCompletionRate:
        totalQuestions > 0 ? Math.round((totalAnswers / totalQuestions) * 100) : 0,
    };

    logger.info('Assessment statistics calculated', { assessmentId, stats });
    return stats;
  } catch (error) {
    logger.error('Failed to get assessment statistics', { assessmentId, error });
    throw error;
  }
}

