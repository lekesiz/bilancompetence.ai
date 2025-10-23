import { supabase } from './supabaseService';
import { withCache } from '../utils/cache.js';
import { logAndThrow, validateRequired, DatabaseError, NotFoundError, ValidationError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';
import { BilanStatus } from '../types/enums.js';

/**
 * Analytics Service - Data analysis & reporting
 * All analytics queries are cached for 5 minutes (300 seconds)
 * Standardized error handling for all analytics operations
 */

/**
 * Get user activity statistics with caching
 * Cache TTL: 5 minutes
 */
export async function getUserActivityStats(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    return withCache(
      `analytics:user:${userId}`,
      async () => {
        // Get total assessments
        const { data: assessments, count: assessmentCount, error: assessmentError } = await supabase
          .from('bilans')
          .select('*', { count: 'exact', head: true })
          .eq('beneficiary_id', userId);

        if (assessmentError) {
          throw new DatabaseError('Failed to fetch assessment count', assessmentError);
        }

        // Get completed assessments
        const { data: completed, count: completedCount, error: completedError } = await supabase
          .from('bilans')
          .select('*', { count: 'exact', head: true })
          .eq('beneficiary_id', userId)
          .eq('status', BilanStatus.COMPLETED);

        if (completedError) {
          throw new DatabaseError('Failed to fetch completed assessment count', completedError);
        }

        // Get recommendations count
        const { data: recommendations, count: recommendationCount, error: recommendationError } = await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (recommendationError) {
          throw new DatabaseError('Failed to fetch recommendation count', recommendationError);
        }

        const stats = {
          totalAssessments: assessmentCount || 0,
          completedAssessments: completedCount || 0,
          pendingAssessments: (assessmentCount || 0) - (completedCount || 0),
          recommendations: recommendationCount || 0,
          completionRate: assessmentCount ? Math.round((completedCount || 0) / assessmentCount * 100) : 0,
        };

        logger.info('User activity statistics calculated', { userId });
        return stats;
      },
      300 // 5 minutes
    );
  } catch (error) {
    logAndThrow('Failed to get user activity statistics', error);
  }
}

/**
 * Get organization statistics with caching
 * Cache TTL: 5 minutes
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    validateRequired({ organizationId }, ['organizationId']);

    return withCache(
      `analytics:org:${organizationId}`,
      async () => {
        // Get total users
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId);

        if (userError) {
          throw new DatabaseError('Failed to fetch user count', userError);
        }

        // Get total assessments
        const { count: assessmentCount, error: assessmentError } = await supabase
          .from('bilans')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId);

        if (assessmentError) {
          throw new DatabaseError('Failed to fetch assessment count', assessmentError);
        }

        // Get completed assessments
        const { count: completedCount, error: completedError } = await supabase
          .from('bilans')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organizationId)
          .eq('status', BilanStatus.COMPLETED);

        if (completedError) {
          throw new DatabaseError('Failed to fetch completed assessment count', completedError);
        }

        const stats = {
          totalUsers: userCount || 0,
          totalAssessments: assessmentCount || 0,
          completedAssessments: completedCount || 0,
          completionRate: assessmentCount ? Math.round((completedCount || 0) / assessmentCount * 100) : 0,
        };

        logger.info('Organization statistics calculated', { organizationId });
        return stats;
      },
      300 // 5 minutes
    );
  } catch (error) {
    logAndThrow('Failed to get organization statistics', error);
  }
}

/**
 * Get assessment analytics
 */
export async function getAssessmentAnalytics(assessmentId: string) {
  try {
    validateRequired({ assessmentId }, ['assessmentId']);

    // Get assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('bilans')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (assessmentError) {
      throw new DatabaseError('Failed to fetch assessment', assessmentError);
    }

    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    // Get answers count
    const { data: answers, count: answerCount, error: answerError } = await supabase
      .from('assessment_answers')
      .select('*', { count: 'exact', head: true })
      .eq('bilan_id', assessmentId);

    if (answerError) {
      throw new DatabaseError('Failed to fetch answer count', answerError);
    }

    // Get questions count
    const { data: questions, count: questionCount, error: questionError } = await supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true })
      .eq('bilan_id', assessmentId);

    if (questionError) {
      throw new DatabaseError('Failed to fetch question count', questionError);
    }

    const analytics = {
      assessmentId,
      title: assessment.title,
      status: assessment.status,
      totalQuestions: questionCount || 0,
      totalAnswers: answerCount || 0,
      completionPercentage: questionCount ? Math.round((answerCount || 0) / questionCount * 100) : 0,
      startDate: assessment.start_date,
      endDate: assessment.end_date,
    };

    logger.info('Assessment analytics retrieved', { assessmentId });
    return analytics;
  } catch (error) {
    logAndThrow('Failed to get assessment analytics', error);
  }
}

/**
 * Get time-series data (assessments per week)
 */
export async function getAssessmentsTimeSeries(userId: string, weeks: number = 12) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data, error } = await supabase.from('bilans').select('created_at').eq('beneficiary_id', userId);

    if (error) {
      throw new DatabaseError('Failed to fetch assessment time series data', error);
    }

    if (!data || data.length === 0) {
      logger.info('No assessment data for time series', { userId });
      return [];
    }

    const now = new Date();
    const timeSeries = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = data.filter((item) => {
        const date = new Date(item.created_at);
        return date >= weekStart && date < weekEnd;
      }).length;

      timeSeries.push({
        week: weekStart.toISOString().split('T')[0],
        count,
      });
    }

    logger.info('Assessment time series generated', { userId, weeks });
    return timeSeries;
  } catch (error) {
    logAndThrow('Failed to get assessment time series', error);
  }
}

/**
 * Get assessment types distribution
 */
export async function getAssessmentTypeDistribution(organizationId?: string) {
  try {
    let query = supabase.from('bilans').select('assessment_type, count', { count: 'exact' });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError('Failed to fetch assessment type distribution', error);
    }

    const distribution: { [key: string]: number } = {};

    if (data) {
      data.forEach((item: any) => {
        distribution[item.assessment_type] = (distribution[item.assessment_type] || 0) + 1;
      });
    }

    logger.info('Assessment type distribution calculated', { organizationId, typesCount: Object.keys(distribution).length });
    return distribution;
  } catch (error) {
    logAndThrow('Failed to get assessment type distribution', error);
  }
}

/**
 * Get recommendation effectiveness (completion rate)
 */
export async function getRecommendationEffectiveness(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new DatabaseError('Failed to fetch recommendations for effectiveness analysis', error);
    }

    if (!recommendations || recommendations.length === 0) {
      logger.info('No recommendations found for user', { userId });
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        completionRate: 0,
      };
    }

    const completed = recommendations.filter((r) => r.status === 'completed').length;
    const inProgress = recommendations.filter((r) => r.status === 'in_progress').length;
    const pending = recommendations.filter((r) => r.status === 'pending').length;

    const effectiveness = {
      total: recommendations.length,
      completed,
      inProgress,
      pending,
      completionRate: Math.round((completed / recommendations.length) * 100),
    };

    logger.info('Recommendation effectiveness calculated', { userId, completionRate: effectiveness.completionRate });
    return effectiveness;
  } catch (error) {
    logAndThrow('Failed to get recommendation effectiveness', error);
  }
}

/**
 * Get skill proficiency levels
 */
export async function getSkillProficiency(userId: string) {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: competencies, error } = await supabase
      .from('competencies')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new DatabaseError('Failed to fetch skill proficiency data', error);
    }

    if (!competencies || competencies.length === 0) {
      logger.info('No competencies found for user', { userId });
      return [];
    }

    const skills = competencies.map((c: any) => ({
      skill: c.name,
      level: c.level,
      endorsements: c.endorsements || 0,
    }));

    logger.info('Skill proficiency data retrieved', { userId, skillsCount: skills.length });
    return skills;
  } catch (error) {
    logAndThrow('Failed to get skill proficiency', error);
  }
}

/**
 * Generate report data
 */
export async function generateReportData(userId: string, reportType: 'detailed' | 'summary' = 'detailed') {
  try {
    validateRequired({ userId }, ['userId']);

    if (!['detailed', 'summary'].includes(reportType)) {
      throw new ValidationError('Invalid report type. Must be "detailed" or "summary".');
    }

    const activityStats = await getUserActivityStats(userId);
    const effectiveness = await getRecommendationEffectiveness(userId);
    const skills = await getSkillProficiency(userId);
    const timeSeries = await getAssessmentsTimeSeries(userId);

    if (reportType === 'summary') {
      const summary = {
        generatedAt: new Date().toISOString(),
        userStats: activityStats,
        effectiveness: effectiveness,
        totalSkills: skills.length,
      };

      logger.info('Report generated (summary)', { userId });
      return summary;
    }

    const detailed = {
      generatedAt: new Date().toISOString(),
      userStats: activityStats,
      effectiveness,
      skills,
      timeSeries,
      reportType: 'detailed' as const,
    };

    logger.info('Report generated (detailed)', { userId });
    return detailed;
  } catch (error) {
    logAndThrow('Failed to generate report data', error);
  }
}

export default {
  getUserActivityStats,
  getOrganizationStats,
  getAssessmentAnalytics,
  getAssessmentsTimeSeries,
  getAssessmentTypeDistribution,
  getRecommendationEffectiveness,
  getSkillProficiency,
  generateReportData,
};
