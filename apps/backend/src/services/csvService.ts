import { Parser } from 'json2csv';
import { supabase } from './supabaseService.js';
import { logAndThrow, validateRequired, DatabaseError, NotFoundError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

/**
 * CSV Export/Import Service
 * Standardized error handling for all CSV operations
 */

/**
 * Export assessments to CSV
 */
export async function exportAssessmentsToCSV(userId: string): Promise<string> {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: assessments, error } = await supabase
      .from('bilans')
      .select('*')
      .eq('beneficiary_id', userId);

    if (error) {
      throw new DatabaseError('Failed to fetch assessments', error);
    }

    if (!assessments || assessments.length === 0) {
      logger.info('No assessments to export', { userId });
      return 'No assessments to export';
    }

    const fields = [
      'id',
      'title',
      'description',
      'status',
      'assessment_type',
      'start_date',
      'end_date',
      'created_at',
      'updated_at',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(assessments);
    logger.info('Assessments exported to CSV', { userId, count: assessments.length });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export assessments to CSV', error);
  }
}

/**
 * Export recommendations to CSV
 */
export async function exportRecommendationsToCSV(userId: string): Promise<string> {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new DatabaseError('Failed to fetch recommendations', error);
    }

    if (!recommendations || recommendations.length === 0) {
      logger.info('No recommendations to export', { userId });
      return 'No recommendations to export';
    }

    const fields = ['id', 'title', 'description', 'status', 'action_items', 'created_at', 'updated_at'];

    const parser = new Parser({ fields });
    const csv = parser.parse(recommendations);
    logger.info('Recommendations exported to CSV', { userId, count: recommendations.length });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export recommendations to CSV', error);
  }
}

/**
 * Export user data to CSV
 */
export async function exportUserDataToCSV(userId: string): Promise<string> {
  try {
    validateRequired({ userId }, ['userId']);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new DatabaseError('Failed to fetch user data', error);
    }

    if (!user) {
      throw new NotFoundError('User');
    }

    const fields = ['id', 'email', 'full_name', 'phone', 'bio', 'role', 'created_at', 'updated_at'];

    const parser = new Parser({ fields });
    const csv = parser.parse([user]);
    logger.info('User data exported to CSV', { userId });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export user data to CSV', error);
  }
}

/**
 * Export organization users to CSV (admin only)
 */
export async function exportOrganizationUsersToCSV(organizationId: string): Promise<string> {
  try {
    validateRequired({ organizationId }, ['organizationId']);

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      throw new DatabaseError('Failed to fetch organization users', error);
    }

    if (!users || users.length === 0) {
      logger.info('No users to export for organization', { organizationId });
      return 'No users to export';
    }

    const fields = ['id', 'email', 'full_name', 'role', 'phone', 'created_at', 'last_login_at'];

    const parser = new Parser({ fields });
    const csv = parser.parse(users);
    logger.info('Organization users exported to CSV', { organizationId, count: users.length });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export organization users to CSV', error);
  }
}

/**
 * Export assessment results to CSV
 */
export async function exportAssessmentResultsToCSV(assessmentId: string): Promise<string> {
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

    // Get questions and answers
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('bilan_id', assessmentId);

    if (questionsError) {
      throw new DatabaseError('Failed to fetch assessment questions', questionsError);
    }

    const { data: answers, error: answersError } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('bilan_id', assessmentId);

    if (answersError) {
      throw new DatabaseError('Failed to fetch assessment answers', answersError);
    }

    if (!questions || questions.length === 0) {
      logger.info('No questions found for assessment', { assessmentId });
      return 'No questions found';
    }

    // Create result rows
    const results = questions.map((q: any) => {
      const typedAnswers = (answers as any[]) || [];
      const answer = typedAnswers.find((a: any) => a.question_id === q.id);
      return {
        question_id: q.id,
        question: q.question,
        question_type: q.question_type,
        category: q.category,
        answer: answer?.answer || 'Not answered',
        answered_at: answer?.created_at || 'N/A',
      };
    });

    const fields = ['question_id', 'question', 'question_type', 'category', 'answer', 'answered_at'];

    const parser = new Parser({ fields });
    const csv = parser.parse(results);
    logger.info('Assessment results exported to CSV', { assessmentId, count: results.length });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export assessment results to CSV', error);
  }
}

/**
 * Export time series data to CSV
 */
export async function exportTimeSeriesToCSV(userId: string, data: Array<any>): Promise<string> {
  try {
    validateRequired({ userId, data }, ['userId', 'data']);

    if (!data || data.length === 0) {
      logger.info('No time series data to export', { userId });
      return 'No data to export';
    }

    const fields = Object.keys(data[0]);
    const parser = new Parser({ fields });
    const csv = parser.parse(data);
    logger.info('Time series data exported to CSV', { userId, count: data.length });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export time series data to CSV', error);
  }
}

/**
 * Generate analytics summary CSV
 */
export async function exportAnalyticsSummaryToCSV(userId: string, stats: any): Promise<string> {
  try {
    validateRequired({ userId, stats }, ['userId', 'stats']);

    const summaryData = [
      { metric: 'Total Assessments', value: stats.totalAssessments },
      { metric: 'Completed Assessments', value: stats.completedAssessments },
      { metric: 'Pending Assessments', value: stats.pendingAssessments },
      { metric: 'Completion Rate', value: `${stats.completionRate}%` },
      { metric: 'Recommendations', value: stats.recommendations },
    ];

    const fields = ['metric', 'value'];
    const parser = new Parser({ fields });
    const csv = parser.parse(summaryData);
    logger.info('Analytics summary exported to CSV', { userId });
    return csv;
  } catch (error) {
    logAndThrow('Failed to export analytics summary to CSV', error);
  }
}

/**
 * Generate CSV filename with timestamp
 */
export function generateCSVFilename(type: string): string {
  try {
    validateRequired({ type }, ['type']);
    const timestamp = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(7);
    return `${type}_export_${timestamp}_${random}.csv`;
  } catch (error) {
    logger.error('Failed to generate CSV filename', error);
    throw error;
  }
}

export default {
  exportAssessmentsToCSV,
  exportRecommendationsToCSV,
  exportUserDataToCSV,
  exportOrganizationUsersToCSV,
  exportAssessmentResultsToCSV,
  exportTimeSeriesToCSV,
  exportAnalyticsSummaryToCSV,
  generateCSVFilename,
};
