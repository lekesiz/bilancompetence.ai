import { supabase } from './supabaseService';
import { withCache } from '../utils/cache.js';

/**
 * Analytics Service - Data analysis & reporting
 * All analytics queries are cached for 5 minutes (300 seconds)
 */

/**
 * Get user activity statistics with caching
 * Cache TTL: 5 minutes
 */
export async function getUserActivityStats(userId: string) {
  return withCache(
    `analytics:user:${userId}`,
    async () => {
      // Get total assessments
      const { data: assessments, count: assessmentCount } = await supabase
        .from('bilans')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', userId);

      // Get completed assessments
      const { data: completed, count: completedCount } = await supabase
        .from('bilans')
        .select('*', { count: 'exact', head: true })
        .eq('beneficiary_id', userId)
        .eq('status', 'completed');

      // Get recommendations count
      const { data: recommendations, count: recommendationCount } = await supabase
        .from('recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        totalAssessments: assessmentCount || 0,
        completedAssessments: completedCount || 0,
        pendingAssessments: (assessmentCount || 0) - (completedCount || 0),
        recommendations: recommendationCount || 0,
        completionRate: assessmentCount ? Math.round((completedCount || 0) / assessmentCount * 100) : 0,
      };
    },
    300 // 5 minutes
  );
}

/**
 * Get organization statistics with caching
 * Cache TTL: 5 minutes
 */
export async function getOrganizationStats(organizationId: string) {
  return withCache(
    `analytics:org:${organizationId}`,
    async () => {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Get total assessments
      const { count: assessmentCount } = await supabase
        .from('bilans')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Get completed assessments
      const { count: completedCount } = await supabase
        .from('bilans')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('status', 'completed');

      return {
        totalUsers: userCount || 0,
        totalAssessments: assessmentCount || 0,
        completedAssessments: completedCount || 0,
        completionRate: assessmentCount ? Math.round((completedCount || 0) / assessmentCount * 100) : 0,
      };
    },
    300 // 5 minutes
  );
}

/**
 * Get assessment analytics
 */
export async function getAssessmentAnalytics(assessmentId: string) {
  // Get assessment
  const { data: assessment } = await supabase
    .from('bilans')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  // Get answers count
  const { data: answers, count: answerCount } = await supabase
    .from('assessment_answers')
    .select('*', { count: 'exact', head: true })
    .eq('bilan_id', assessmentId);

  // Get questions count
  const { data: questions, count: questionCount } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('bilan_id', assessmentId);

  return {
    assessmentId,
    title: assessment.title,
    status: assessment.status,
    totalQuestions: questionCount || 0,
    totalAnswers: answerCount || 0,
    completionPercentage: questionCount ? Math.round((answerCount || 0) / questionCount * 100) : 0,
    startDate: assessment.start_date,
    endDate: assessment.end_date,
  };
}

/**
 * Get time-series data (assessments per week)
 */
export async function getAssessmentsTimeSeries(userId: string, weeks: number = 12) {
  const { data } = await supabase.from('bilans').select('created_at').eq('beneficiary_id', userId);

  if (!data) {
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

  return timeSeries;
}

/**
 * Get assessment types distribution
 */
export async function getAssessmentTypeDistribution(organizationId?: string) {
  let query = supabase.from('bilans').select('assessment_type, count', { count: 'exact' });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data } = await query;

  const distribution: { [key: string]: number } = {};

  if (data) {
    data.forEach((item: any) => {
      distribution[item.assessment_type] = (distribution[item.assessment_type] || 0) + 1;
    });
  }

  return distribution;
}

/**
 * Get recommendation effectiveness (completion rate)
 */
export async function getRecommendationEffectiveness(userId: string) {
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId);

  if (!recommendations || recommendations.length === 0) {
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

  return {
    total: recommendations.length,
    completed,
    inProgress,
    pending,
    completionRate: Math.round((completed / recommendations.length) * 100),
  };
}

/**
 * Get skill proficiency levels
 */
export async function getSkillProficiency(userId: string) {
  const { data: competencies } = await supabase
    .from('competencies')
    .select('*')
    .eq('user_id', userId);

  if (!competencies) {
    return [];
  }

  return competencies.map((c: any) => ({
    skill: c.name,
    level: c.level,
    endorsements: c.endorsements || 0,
  }));
}

/**
 * Generate report data
 */
export async function generateReportData(userId: string, reportType: 'detailed' | 'summary' = 'detailed') {
  const activityStats = await getUserActivityStats(userId);
  const effectiveness = await getRecommendationEffectiveness(userId);
  const skills = await getSkillProficiency(userId);
  const timeSeries = await getAssessmentsTimeSeries(userId);

  if (reportType === 'summary') {
    return {
      generatedAt: new Date().toISOString(),
      userStats: activityStats,
      effectiveness: effectiveness,
      totalSkills: skills.length,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    userStats: activityStats,
    effectiveness,
    skills,
    timeSeries,
    reportType: 'detailed',
  };
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
