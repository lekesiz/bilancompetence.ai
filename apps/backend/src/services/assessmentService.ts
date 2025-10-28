import { supabase } from './supabaseService.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { logger } from '../utils/logger.js';
import {
  parsePaginationParams,
  createPaginatedResponse,
  parseSortParams,
  PaginationParams,
  PaginatedResponse,
} from '../utils/pagination.js';

/**
 * Assessment Service - Bilan management with Wizard support
 */

export interface Assessment {
  id: string;
  beneficiary_id: string;
  consultant_id?: string;
  organization_id?: string;
  title: string;
  description?: string;
  status:
    | 'DRAFT'
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'COMPLETED'
    | 'draft'
    | 'in_progress'
    | 'completed'
    | 'archived';
  assessment_type: 'career' | 'skills' | 'comprehensive';
  current_step?: number;
  progress_percentage?: number;
  started_at?: string;
  submitted_at?: string;
  completed_at?: string;
  start_date?: string;
  end_date?: string;
  results?: any;
  created_at: string;
  updated_at: string;
}

export interface AssessmentDraft {
  id: string;
  assessment_id: string;
  current_step_number: number;
  draft_data: Record<string, any>;
  auto_save_enabled: boolean;
  last_saved_at: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCompetency {
  id: string;
  assessment_id: string;
  skill_name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  self_assessment_level: number; // 1-4
  self_interest_level: number; // 1-10
  context?: string;
  consultant_assessment_level?: number;
  consultant_notes?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

// Validation Schemas
export const workHistoryStepSchema = z.object({
  recentJob: z.string().min(10).max(1000),
  previousPositions: z.string().min(10).max(5000),
  importantAspects: z.string().optional(),
});

export const educationStepSchema = z.object({
  highestLevel: z.enum(['bac', 'bac+2', 'bac+3', 'bac+5', 'bac+8']),
  fieldOfStudy: z.string().optional(),
  certifications: z.string().optional(),
  currentEducation: z.string().optional(),
});

export const skillsStepSchema = z.object({
  competencies: z
    .array(
      z.object({
        skillName: z.string().min(2),
        selfAssessmentLevel: z.number().int().min(1).max(4),
        selfInterestLevel: z.number().int().min(1).max(10),
        context: z.string().optional(),
      })
    )
    .min(5, 'Please select at least 5 skills'),
  additionalSkills: z.string().optional(),
});

export const motivationsStepSchema = z.object({
  topValues: z.array(z.string()).min(1, 'Please select at least one value'),
  careerGoals: z.array(z.string()).min(1, 'Please select at least one goal'),
  motivationDescription: z.string().min(20).max(2000),
});

export const constraintsStepSchema = z.object({
  geographicPreferences: z.array(z.string()).optional(),
  contractTypes: z.array(z.string()).optional(),
  salaryExpectations: z.string().optional(),
  otherConstraints: z.string().optional(),
});

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
    .from('assessments')
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

  return data as unknown as Assessment;
}

/**
 * Get assessment by ID
 */
export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return (data as unknown as Assessment) || null;
}

/**
 * Get user's assessments
 */
/**
 * Get user assessments with pagination support
 * @param userId - User ID (beneficiary or consultant)
 * @param role - User role ('beneficiary' or 'consultant')
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20, max: 100)
 * @param sort - Sort column and direction (e.g., "created_at:desc")
 * @returns Paginated response with assessments
 */
export async function getUserAssessments(
  userId: string,
  role: 'beneficiary' | 'consultant' = 'beneficiary',
  page?: number,
  limit?: number,
  sort?: string
): Promise<PaginatedResponse<Assessment> | Assessment[]> {
  const column = role === 'beneficiary' ? 'beneficiary_id' : 'consultant_id';

  // If pagination params provided, use paginated response
  if (page !== undefined || limit !== undefined) {
    const { page: pageNum, limit: limitNum, offset } = parsePaginationParams(page, limit);
    const { column: sortCol, direction } = parseSortParams(sort);

    // Get total count
    const { count: total, error: countError } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true })
      .eq(column, userId);

    if (countError) {
      throw countError;
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq(column, userId)
      .order(sortCol, { ascending: direction === 'asc' })
      .range(offset, offset + limitNum - 1);

    if (error) {
      throw error;
    }

    return createPaginatedResponse<Assessment>(
      (data as unknown as Assessment[]) || [],
      pageNum,
      limitNum,
      total || 0
    );
  }

  // Fallback: return all assessments without pagination (legacy support)
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq(column, userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as unknown as Assessment[]) || [];
}

/**
 * Update assessment
 */
export async function updateAssessment(assessmentId: string, updates: any) {
  const { data, error } = await supabase
    .from('assessments')
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

  return data as unknown as Assessment;
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
  category?: string,
  stepNumber: number = 1,
  section: string = 'general'
): Promise<any> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .insert({
      assessment_id: assessmentId,
      question_text: question,
      question_type: questionType,
      step_number: stepNumber,
      section: section,
      options,
      category,
      order: 0,
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
export async function getAssessmentQuestions(assessmentId: string): Promise<any> {
  const { data, error } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', assessmentId)
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
  answer: any,
  stepNumber: number = 1,
  section: string = 'general'
): Promise<any> {
  const { data, error } = await supabase
    .from('assessment_answers')
    .insert({
      assessment_id: assessmentId,
      question_id: questionId,
      answer_value: answer,
      answer_type: typeof answer,
      step_number: stepNumber,
      section: section,
      submitted_at: new Date().toISOString(),
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
export async function getAssessmentAnswers(assessmentId: string): Promise<any> {
  const { data, error } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('assessment_id', assessmentId);

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
  action_items: string[],
  type: string = 'CAREER_PATH',
  priority: number = 1
): Promise<any> {
  const { data, error } = await supabase
    .from('recommendations')
    .insert({
      bilan_id: assessmentId,
      type: type,
      title,
      description,
      priority: priority,
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
export async function getUserRecommendations(userId: string): Promise<any> {
  // Get bilans for this user first, then get recommendations
  const { data: bilans, error: bilansError } = await supabase
    .from('assessments')
    .select('id')
    .eq('beneficiary_id', userId);

  if (bilansError) {
    throw bilansError;
  }

  if (!bilans || bilans.length === 0) {
    return [];
  }

  const typedBilans = bilans as any[];
  const bilanIds = typedBilans.map((b) => b.id);

  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .in('bilan_id', bilanIds)
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
): Promise<any> {
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
  const { count: answersCount, error: answersError } = await supabase
    .from('assessment_answers')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId);

  if (answersError) {
    throw answersError;
  }

  // Get questions count
  const { count: questionsCount, error: questionsError } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId);

  if (questionsError) {
    throw questionsError;
  }

  // Get recommendations count
  const { count: recommendationsCount, error: recommendationsError } = await supabase
    .from('recommendations')
    .select('*', { count: 'exact', head: true })
    .eq('bilan_id', assessmentId);

  if (recommendationsError) {
    throw recommendationsError;
  }

  return {
    questionsCount: questionsCount || 0,
    answersCount: answersCount || 0,
    recommendationsCount: recommendationsCount || 0,
    completionPercentage: questionsCount
      ? Math.round(((answersCount || 0) / questionsCount) * 100)
      : 0,
  };
}

/**
 * WIZARD FUNCTIONS - Phase 2 Implementation
 */

/**
 * Create a new assessment draft for the wizard
 */
export async function createAssessmentDraft(
  beneficiaryId: string,
  assessmentType: 'career' | 'skills' | 'comprehensive' = 'career',
  title?: string
): Promise<Assessment> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      beneficiary_id: beneficiaryId,
      assessment_type: assessmentType,
      title:
        title || `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Assessment`,
      status: 'DRAFT',
      current_step: 0,
      progress_percentage: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create assessment: ${error.message}`);
  }

  // Create accompanying draft record
  if (data) {
    const typedData = data as any;
    await supabase
      .from('assessment_drafts')
      .insert({
        assessment_id: typedData.id,
        current_step_number: 0,
        draft_data: {},
        auto_save_enabled: true,
        last_saved_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  return data as unknown as Assessment;
}

/**
 * Get assessment with all related data
 */
export async function getAssessmentWithDetails(assessmentId: string) {
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (assessmentError && assessmentError.code !== 'PGRST116') {
    throw assessmentError;
  }

  if (!assessment) {
    return null;
  }

  // Get associated questions
  const { data: questions } = await supabase
    .from('assessment_questions')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('step_number', { ascending: true })
    .order('order', { ascending: true });

  // Get submitted answers
  const { data: answers } = await supabase
    .from('assessment_answers')
    .select('*')
    .eq('assessment_id', assessmentId);

  // Get competencies
  const { data: competencies } = await supabase
    .from('assessment_competencies')
    .select('*')
    .eq('assessment_id', assessmentId);

  // Get draft
  const { data: draft } = await supabase
    .from('assessment_drafts')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single();

  const typedAssessment = assessment as any;
  return {
    ...typedAssessment,
    questions: questions || [],
    answers: answers || [],
    competencies: competencies || [],
    draft: draft || null,
  };
}

/**
 * Save a complete step with validation
 */
export async function saveDraftStep(
  assessmentId: string,
  stepNumber: number,
  section: string,
  answers: Record<string, any>,
  competencies?: any[]
): Promise<{ progressPercentage: number; currentStep: number }> {
  // Validate step data based on step number
  const validationResult = await validateAssessmentStep(stepNumber, section, answers);
  if (!validationResult.valid) {
    throw new Error(`Validation failed: ${validationResult.errors?.join(', ')}`);
  }

  // Save answers for each question
  for (const [questionId, answerValue] of Object.entries(answers)) {
    await supabase.from('assessment_answers').upsert(
      {
        assessment_id: assessmentId,
        question_id: questionId,
        step_number: stepNumber,
        section: section,
        answer_value: answerValue,
        answer_type: typeof answerValue,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'assessment_id,question_id',
      }
    );
  }

  // Save competencies if provided (Step 3)
  if (competencies && competencies.length > 0) {
    for (const comp of competencies) {
      await supabase.from('assessment_competencies').upsert(
        {
          assessment_id: assessmentId,
          skill_name: comp.skillName || comp.skill_name,
          category: comp.category || 'technical',
          self_assessment_level: comp.selfAssessmentLevel || comp.self_assessment_level || 2,
          self_interest_level: comp.selfInterestLevel || comp.self_interest_level || 5,
          context: comp.context,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'assessment_id,skill_name',
        }
      );
    }
  }

  // Update assessment with new progress
  const completedSteps = await getCompletedSteps(assessmentId);
  const progressPercentage = Math.round((completedSteps.length / 5) * 100);

  const { data, error } = await supabase
    .from('assessments')
    .update({
      current_step: stepNumber,
      progress_percentage: progressPercentage,
      status: 'IN_PROGRESS',
      updated_at: new Date().toISOString(),
    })
    .eq('id', assessmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    progressPercentage: (data as any)?.progress_percentage || progressPercentage,
    currentStep: (data as any)?.current_step || stepNumber,
  };
}

/**
 * Auto-save draft (incremental save without validation)
 */
export async function autoSaveDraft(
  assessmentId: string,
  stepNumber: number,
  partialData: any
): Promise<{ savedAt: string }> {
  // Get or create draft
  const { data: existingDraft } = await supabase
    .from('assessment_drafts')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single();

  const currentDraftData = (existingDraft as any)?.draft_data || {};
  const stepKey = `step${stepNumber}`;

  // Merge partial data with existing step data
  const updatedDraftData = {
    ...currentDraftData,
    [stepKey]: {
      ...(currentDraftData[stepKey] || {}),
      ...partialData,
    },
  };

  const now = new Date().toISOString();

  if (existingDraft) {
    // Update existing draft
    await supabase
      .from('assessment_drafts')
      .update({
        draft_data: updatedDraftData,
        current_step_number: stepNumber,
        last_saved_at: now,
        updated_at: now,
      })
      .eq('assessment_id', assessmentId);
  } else {
    // Create new draft
    await supabase.from('assessment_drafts').insert({
      assessment_id: assessmentId,
      current_step_number: stepNumber,
      draft_data: updatedDraftData,
      auto_save_enabled: true,
      last_saved_at: now,
    });
  }

  return { savedAt: now };
}

/**
 * Get assessment progress
 */
export async function getAssessmentProgress(assessmentId: string) {
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', assessmentId)
    .single();

  if (error) {
    throw error;
  }

  const { data: draft } = await supabase
    .from('assessment_drafts')
    .select('*')
    .eq('assessment_id', assessmentId)
    .single();

  const completedSteps = await getCompletedSteps(assessmentId);

  return {
    assessmentId: (assessment as any).id,
    currentStep: (assessment as any).current_step || 0,
    progressPercentage: (assessment as any).progress_percentage || 0,
    completedSteps: completedSteps,
    lastSavedAt: (draft as any)?.last_saved_at || (assessment as any).updated_at,
    draftData: (draft as any)?.draft_data || {},
    status: (assessment as any).status,
  };
}

/**
 * Validate assessment step
 */
export async function validateAssessmentStep(
  stepNumber: number,
  section: string,
  answers: Record<string, any>
): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];

  try {
    switch (stepNumber) {
      case 1:
        workHistoryStepSchema.parse(answers);
        break;
      case 2:
        educationStepSchema.parse(answers);
        break;
      case 3:
        skillsStepSchema.parse(answers);
        break;
      case 4:
        motivationsStepSchema.parse(answers);
        break;
      case 5:
        constraintsStepSchema.parse(answers);
        break;
      default:
        errors.push('Invalid step number');
    }

    return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
  } catch (error: any) {
    if (error.errors) {
      return {
        valid: false,
        errors: error.errors.map((e: any) => e.message),
      };
    }
    return {
      valid: false,
      errors: [error.message || 'Validation failed'],
    };
  }
}

/**
 * Submit assessment for review
 */
export async function submitAssessment(
  assessmentId: string,
  beneficiaryId: string
): Promise<{ status: string; submittedAt: string }> {
  // Verify all required steps are completed
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  if (assessment.beneficiary_id !== beneficiaryId) {
    throw new Error('Unauthorized: Assessment belongs to different user');
  }

  const completedSteps = await getCompletedSteps(assessmentId);
  if (completedSteps.length < 5) {
    throw new Error(`Assessment incomplete: Only ${completedSteps.length}/5 steps completed`);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('assessments')
    .update({
      status: 'SUBMITTED',
      submitted_at: now,
      updated_at: now,
    })
    .eq('id', assessmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Clean up draft after submission
  await supabase.from('assessment_drafts').delete().eq('assessment_id', assessmentId);

  return {
    status: 'submitted',
    submittedAt: now,
  };
}

/**
 * Get completed steps for an assessment
 */
async function getCompletedSteps(assessmentId: string): Promise<number[]> {
  const completedSteps: number[] = [];

  try {
    for (let step = 1; step <= 5; step++) {
      const { data, error } = (await supabase
        .from('assessment_answers')
        .select('id')
        .eq('assessment_id', assessmentId)
        .eq('step_number', step)
        .limit(1)) as any;

      if (error) {
        logger.warn(`Error checking step ${step} completion`, { error: error.message });
        continue;
      }

      if (Array.isArray(data) && data.length > 0) {
        completedSteps.push(step);
      }
    }
  } catch (error) {
    logger.error('Error getting completed steps', { error, assessmentId });
  }

  return completedSteps;
}

/**
 * Extract and create competencies from skill data
 */
export async function extractAndCreateCompetencies(
  assessmentId: string,
  skillsData: any[]
): Promise<any[]> {
  const competencies = [];

  for (const skill of skillsData) {
    const { data } = await supabase
      .from('assessment_competencies')
      .insert({
        assessment_id: assessmentId,
        skill_name: skill.skillName || skill.name,
        category: skill.category || 'technical',
        self_assessment_level: skill.selfAssessmentLevel || 2,
        self_interest_level: skill.selfInterestLevel || 5,
        context: skill.context,
      })
      .select()
      .single();

    if (data) {
      competencies.push(data);
    }
  }

  return competencies;
}

/**
 * Validate competencies format
 */
export async function validateCompetencies(
  competencies: any[]
): Promise<{ valid: boolean; errors?: string[] }> {
  const errors: string[] = [];

  if (!Array.isArray(competencies) || competencies.length === 0) {
    errors.push('Competencies must be a non-empty array');
  }

  for (let i = 0; i < competencies.length; i++) {
    const comp = competencies[i];

    if (!comp.skillName && !comp.skill_name) {
      errors.push(`Competency ${i}: Missing skill name`);
    }

    const level = comp.selfAssessmentLevel || comp.self_assessment_level;
    if (!level || level < 1 || level > 4) {
      errors.push(`Competency ${i}: Assessment level must be 1-4`);
    }

    const interest = comp.selfInterestLevel || comp.self_interest_level;
    if (!interest || interest < 1 || interest > 10) {
      errors.push(`Competency ${i}: Interest level must be 1-10`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

export default {
  createAssessment,
  getAssessment,
  getAssessmentWithDetails,
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
  // Wizard functions
  createAssessmentDraft,
  saveDraftStep,
  autoSaveDraft,
  getAssessmentProgress,
  validateAssessmentStep,
  submitAssessment,
  extractAndCreateCompetencies,
  validateCompetencies,
  workHistoryStepSchema,
  educationStepSchema,
  skillsStepSchema,
  motivationsStepSchema,
  constraintsStepSchema,
};
