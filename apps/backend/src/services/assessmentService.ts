import { supabase } from './supabaseService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Assessment Service - Bilan management
 */

export interface Assessment {
  id: string;
  beneficiary_id: string;
  consultant_id?: string;
  organization_id?: string;
  title: string;
  description?: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  assessment_type: 'career' | 'skills' | 'comprehensive';
  start_date?: string;
  end_date?: string;
  results?: any;
  created_at: string;
  updated_at: string;
}

/**
 * Create new assessment
 */
export async function createAssessment(
  beneficiaryId: string,
  assessmentType: 'career' | 'skills' | 'comprehensive',
  title: string,
  description?: string,
  consultantId?: string
) {
  const { data, error } = await supabase
    .from('bilans')
    .insert({
      beneficiary_id: beneficiaryId,
      consultant_id: consultantId,
      title,
      description,
      assessment_type: assessmentType,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Assessment;
}

/**
 * Get assessment by ID
 */
export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('bilans')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data || null;
}

/**
 * Get user's assessments
 */
export async function getUserAssessments(userId: string, role: 'beneficiary' | 'consultant' = 'beneficiary') {
  const column = role === 'beneficiary' ? 'beneficiary_id' : 'consultant_id';

  const { data, error } = await supabase
    .from('bilans')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Update assessment
 */
export async function updateAssessment(assessmentId: string, updates: any) {
  const { data, error } = await supabase
    .from('bilans')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', assessmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Assessment;
}

/**
 * Start assessment
 */
export async function startAssessment(assessmentId: string) {
  return updateAssessment(assessmentId, {
    status: 'in_progress',
    start_date: new Date().toISOString(),
  });
}

/**
 * Complete assessment
 */
export async function completeAssessment(assessmentId: string, results: any) {
  return updateAssessment(assessmentId, {
    status: 'completed',
    end_date: new Date().toISOString(),
    results,
  });
}

/**
 * Archive assessment
 */
export async function archiveAssessment(assessmentId: string) {
  return updateAssessment(assessmentId, {
    status: 'archived',
  });
}

/**
 * Create assessment questions
 */
export async function createAssessmentQuestion(
  assessmentId: string,
  question: string,
  questionType: 'multiple_choice' | 'text' | 'rating' | 'open_ended',
  options?: string[],
  category?: string
) {
  const { data, error } = await supabase
    .from('assessment_questions')
    .insert({
      bilan_id: assessmentId,
      question,
      question_type: questionType,
      options,
      category,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get assessment questions
 */
export async function getAssessmentQuestions(assessmentId: string) {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('bilan_id', assessmentId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Submit assessment answer
 */
export async function submitAnswer(
  assessmentId: string,
  questionId: string,
  userId: string,
  answer: any
) {
  const { data, error } = await supabase
    .from('assessment_answers')
    .insert({
      bilan_id: assessmentId,
      question_id: questionId,
      user_id: userId,
      answer,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get assessment answers
 */
export async function getAssessmentAnswers(assessmentId: string) {
  const { data, error } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('bilan_id', assessmentId);

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Create recommendation based on assessment
 */
export async function createRecommendation(
  userId: string,
  assessmentId: string,
  title: string,
  description: string,
  action_items: string[]
) {
  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      user_id: userId,
      bilan_id: assessmentId,
      title,
      description,
      action_items,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get user recommendations
 */
export async function getUserRecommendations(userId: string) {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Update recommendation status
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  status: 'pending' | 'in_progress' | 'completed'
) {
  const { data, error } = await supabase
    .from('recommendations')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', recommendationId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Get assessment statistics
 */
export async function getAssessmentStats(assessmentId: string) {
  // Get answers count
  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('id')
    .eq('bilan_id', assessmentId)
    .count('exact');

  // Get questions count
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('id')
    .eq('bilan_id', assessmentId)
    .count('exact');

  // Get recommendations count
  const { data: recommendations } = await supabase
    .from('recommendations')
    .select('id')
    .eq('bilan_id', assessmentId)
    .count('exact');

  return {
    questionsCount: questions?.length || 0,
    answersCount: answers?.length || 0,
    recommendationsCount: recommendations?.length || 0,
    completionPercentage: questions?.length ? Math.round((answers?.length || 0) / questions.length * 100) : 0,
  };
}

export default {
  createAssessment,
  getAssessment,
  getUserAssessments,
  updateAssessment,
  startAssessment,
  completeAssessment,
  archiveAssessment,
  createAssessmentQuestion,
  getAssessmentQuestions,
  submitAnswer,
  getAssessmentAnswers,
  createRecommendation,
  getUserRecommendations,
  updateRecommendationStatus,
  getAssessmentStats,
};
