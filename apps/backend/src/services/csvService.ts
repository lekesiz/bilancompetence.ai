import { Parser } from 'json2csv';
import { supabase } from './supabaseService';

/**
 * CSV Export/Import Service
 */

/**
 * Export assessments to CSV
 */
export async function exportAssessmentsToCSV(userId: string): Promise<string> {
  const { data: assessments } = await supabase
    .from('bilans')
    .select('*')
    .eq('beneficiary_id', userId);

  if (!assessments || assessments.length === 0) {
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
  return parser.parse(assessments);
}

/**
 * Export recommendations to CSV
 */
export async function exportRecommendationsToCSV(userId: string): Promise<string> {
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId);

  if (!recommendations || recommendations.length === 0) {
    return 'No recommendations to export';
  }

  const fields = ['id', 'title', 'description', 'status', 'action_items', 'created_at', 'updated_at'];

  const parser = new Parser({ fields });
  return parser.parse(recommendations);
}

/**
 * Export user data to CSV
 */
export async function exportUserDataToCSV(userId: string): Promise<string> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user) {
    return 'User not found';
  }

  const fields = ['id', 'email', 'full_name', 'phone', 'bio', 'role', 'created_at', 'updated_at'];

  const parser = new Parser({ fields });
  return parser.parse([user]);
}

/**
 * Export organization users to CSV (admin only)
 */
export async function exportOrganizationUsersToCSV(organizationId: string): Promise<string> {
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId);

  if (!users || users.length === 0) {
    return 'No users to export';
  }

  const fields = ['id', 'email', 'full_name', 'role', 'phone', 'created_at', 'last_login_at'];

  const parser = new Parser({ fields });
  return parser.parse(users);
}

/**
 * Export assessment results to CSV
 */
export async function exportAssessmentResultsToCSV(assessmentId: string): Promise<string> {
  // Get assessment
  const { data: assessment } = await supabase
    .from('bilans')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (!assessment) {
    return 'Assessment not found';
  }

  // Get questions and answers
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('bilan_id', assessmentId);

  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('bilan_id', assessmentId);

  if (!questions || questions.length === 0) {
    return 'No questions found';
  }

  // Create result rows
  const results = questions.map((q: any) => {
    const answer = answers?.find((a: any) => a.question_id === q.id);
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
  return parser.parse(results);
}

/**
 * Export time series data to CSV
 */
export async function exportTimeSeriesToCSV(userId: string, data: Array<any>): Promise<string> {
  if (!data || data.length === 0) {
    return 'No data to export';
  }

  const fields = Object.keys(data[0]);
  const parser = new Parser({ fields });
  return parser.parse(data);
}

/**
 * Generate analytics summary CSV
 */
export async function exportAnalyticsSummaryToCSV(userId: string, stats: any): Promise<string> {
  const summaryData = [
    { metric: 'Total Assessments', value: stats.totalAssessments },
    { metric: 'Completed Assessments', value: stats.completedAssessments },
    { metric: 'Pending Assessments', value: stats.pendingAssessments },
    { metric: 'Completion Rate', value: `${stats.completionRate}%` },
    { metric: 'Recommendations', value: stats.recommendations },
  ];

  const fields = ['metric', 'value'];
  const parser = new Parser({ fields });
  return parser.parse(summaryData);
}

/**
 * Generate CSV filename with timestamp
 */
export function generateCSVFilename(type: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(7);
  return `${type}_export_${timestamp}_${random}.csv`;
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
