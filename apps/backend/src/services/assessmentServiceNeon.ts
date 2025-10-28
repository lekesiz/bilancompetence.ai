import { query, queryOne } from '../config/neon.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Assessment {
  id: string;
  beneficiary_id: string;
  consultant_id?: string;
  organization_id?: string;
  title: string;
  description?: string;
  assessment_type: string;
  status: string;
  current_step: number;
  progress_percentage: number;
  started_at?: Date;
  submitted_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id?: string;
  question: string;
  question_type: string;
  options?: any;
  category?: string;
  order_number?: number;
  created_at: Date;
}

export interface AssessmentAnswer {
  id: string;
  assessment_id: string;
  question_id: string;
  user_id: string;
  answer: any;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentDraft {
  id: string;
  assessment_id: string;
  current_step_number: number;
  draft_data: any;
  last_saved_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Recommendation {
  id: string;
  bilan_id?: string;
  assessment_id?: string;
  recommendation_text: string;
  category?: string;
  priority?: string;
  status?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentCompetency {
  id: string;
  assessment_id: string;
  skill_name: string;
  self_assessment_level?: number;
  self_interest_level?: number;
  category?: string;
  context?: string;
  created_at: Date;
}

// ============================================================================
// BASIC CRUD FUNCTIONS
// ============================================================================

/**
 * Create a new assessment
 */
export async function createAssessment(
  beneficiaryId: string,
  assessmentType: 'career' | 'skills' | 'comprehensive',
  title?: string,
  description?: string,
  consultantId?: string
): Promise<Assessment> {
  const assessmentId = uuidv4();
  const defaultTitle =
    title || `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Assessment`;

  const result = await query<Assessment>(
    null,
    `INSERT INTO assessments (
      id, beneficiary_id, consultant_id, title, description, 
      assessment_type, status, current_step, progress_percentage, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      assessmentId,
      beneficiaryId,
      consultantId || null,
      defaultTitle,
      description || null,
      assessmentType,
      'DRAFT',
      0,
      0,
    ]
  );

  logger.info(`Assessment created: ${assessmentId}`, { beneficiaryId, assessmentType });
  return result[0];
}

/**
 * Get assessment by ID
 */
export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  const result = await query<Assessment>(
    null,
    `SELECT * FROM assessments WHERE id = $1 AND deleted_at IS NULL`,
    [assessmentId]
  );

  return result.length > 0 ? result[0] : null;
}

/**
 * Get assessment with full details (including questions, answers, competencies)
 */
export async function getAssessmentWithDetails(assessmentId: string): Promise<any> {
  try {
    const assessment = await getAssessment(assessmentId);
    if (!assessment) return null;

    // Fetch related data with error handling for each (JSONB-based)
    const [competencies, draft] = await Promise.all([
      query(
        null,
        `SELECT * FROM assessment_competencies WHERE assessment_id = $1 ORDER BY category, skill_name`,
        [assessmentId]
      ).catch(() => []),
      query(null, `SELECT * FROM assessment_drafts WHERE assessment_id = $1`, [assessmentId]).catch(
        () => []
      ),
    ]);

    return {
      ...assessment,
      competencies: competencies || [],
      draft: draft && draft.length > 0 ? draft[0] : null,
      draft_data: draft && draft.length > 0 ? draft[0].draft_data : {},
    };
  } catch (error) {
    logger.error('Failed to get assessment with details', { assessmentId, error });
    throw error;
  }
}

/**
 * Get user's assessments with pagination
 */
export async function getUserAssessments(
  userId: string,
  role: string,
  page: number = 1,
  limit: number = 10
): Promise<{ assessments: Assessment[]; total: number }> {
  const offset = (page - 1) * limit;

  let whereClause = '';
  let params: any[] = [limit, offset];

  if (role === 'BENEFICIARY') {
    whereClause = 'WHERE beneficiary_id = $3 AND deleted_at IS NULL';
    params.push(userId);
  } else if (role === 'CONSULTANT') {
    whereClause = 'WHERE consultant_id = $3 AND deleted_at IS NULL';
    params.push(userId);
  } else if (role === 'ORGANIZATION_ADMIN' || role === 'ORG_ADMIN' || role === 'ADMIN') {
    // Admins can see all assessments in their organization
    whereClause = 'WHERE deleted_at IS NULL';
  } else {
    // Unknown role - return empty
    whereClause = 'WHERE 1=0';
  }

  const assessments = await query<Assessment>(
    null,
    `SELECT * FROM assessments ${whereClause} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    params
  );

  const countResult = await query<{ count: number }>(
    null,
    `SELECT COUNT(*)::int as count FROM assessments ${whereClause}`,
    params.slice(2)
  );

  return {
    assessments,
    total: countResult[0]?.count || 0,
  };
}

/**
 * Update assessment
 */
export async function updateAssessment(
  assessmentId: string,
  updates: Partial<Assessment>
): Promise<Assessment> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(assessmentId);

  const result = await query<Assessment>(
    null,
    `UPDATE assessments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  logger.info(`Assessment updated: ${assessmentId}`);
  return result[0];
}

/**
 * Start assessment (update status and timestamp)
 */
export async function startAssessment(assessmentId: string): Promise<Assessment> {
  const result = await query<Assessment>(
    null,
    `UPDATE assessments 
     SET status = 'IN_PROGRESS', started_at = NOW(), updated_at = NOW()
     WHERE id = $1 
     RETURNING *`,
    [assessmentId]
  );

  logger.info(`Assessment started: ${assessmentId}`);
  return result[0];
}

/**
 * Complete assessment
 */
export async function completeAssessment(assessmentId: string, results?: any): Promise<Assessment> {
  const result = await query<Assessment>(
    null,
    `UPDATE assessments 
     SET status = 'COMPLETED', completed_at = NOW(), progress_percentage = 100, updated_at = NOW()
     WHERE id = $1 
     RETURNING *`,
    [assessmentId]
  );

  logger.info(`Assessment completed: ${assessmentId}`);
  return result[0];
}

/**
 * Archive assessment
 */
export async function archiveAssessment(assessmentId: string): Promise<Assessment> {
  const result = await query<Assessment>(
    null,
    `UPDATE assessments 
     SET status = 'ARCHIVED', updated_at = NOW()
     WHERE id = $1 
     RETURNING *`,
    [assessmentId]
  );

  logger.info(`Assessment archived: ${assessmentId}`);
  return result[0];
}

// ============================================================================
// QUESTION & ANSWER FUNCTIONS
// ============================================================================

/**
 * Create assessment question
 */
export async function createAssessmentQuestion(
  assessmentId: string | null,
  question: string,
  questionType: string,
  options?: any,
  category?: string,
  orderNumber?: number
): Promise<AssessmentQuestion> {
  const questionId = uuidv4();

  const result = await query<AssessmentQuestion>(
    null,
    `INSERT INTO assessment_questions (
      id, assessment_id, question, question_type, options, category, order_number, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *`,
    [
      questionId,
      assessmentId,
      question,
      questionType,
      options ? JSON.stringify(options) : null,
      category,
      orderNumber,
    ]
  );

  return result[0];
}

/**
 * Get assessment questions
 */
export async function getAssessmentQuestions(assessmentId: string): Promise<AssessmentQuestion[]> {
  const result = await query<AssessmentQuestion>(
    null,
    `SELECT * FROM assessment_questions 
     WHERE assessment_id = $1 OR assessment_id IS NULL
     ORDER BY order_number ASC, created_at ASC`,
    [assessmentId]
  );

  return result;
}

/**
 * Submit answer
 */
export async function submitAnswer(
  assessmentId: string,
  questionId: string,
  userId: string,
  answer: any
): Promise<AssessmentAnswer> {
  const answerId = uuidv4();

  // Check if answer already exists
  const existing = await query<AssessmentAnswer>(
    null,
    `SELECT * FROM assessment_answers 
     WHERE assessment_id = $1 AND question_id = $2 AND user_id = $3`,
    [assessmentId, questionId, userId]
  );

  if (existing.length > 0) {
    // Update existing answer
    const result = await query<AssessmentAnswer>(
      null,
      `UPDATE assessment_answers 
       SET answer = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(answer), existing[0].id]
    );
    return result[0];
  }

  // Insert new answer
  const result = await query<AssessmentAnswer>(
    null,
    `INSERT INTO assessment_answers (
      id, assessment_id, question_id, user_id, answer, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`,
    [answerId, assessmentId, questionId, userId, JSON.stringify(answer)]
  );

  return result[0];
}

/**
 * Get assessment answers
 */
export async function getAssessmentAnswers(assessmentId: string): Promise<AssessmentAnswer[]> {
  const result = await query<AssessmentAnswer>(
    null,
    `SELECT * FROM assessment_answers WHERE assessment_id = $1 ORDER BY created_at`,
    [assessmentId]
  );

  return result;
}

// ============================================================================
// RECOMMENDATION FUNCTIONS
// ============================================================================

/**
 * Create recommendation
 */
export async function createRecommendation(
  assessmentId: string,
  recommendationText: string,
  category?: string,
  priority?: string,
  createdBy?: string
): Promise<Recommendation> {
  const recommendationId = uuidv4();

  const result = await query<Recommendation>(
    null,
    `INSERT INTO recommendations (
      id, assessment_id, recommendation_text, category, priority, status, created_by, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *`,
    [recommendationId, assessmentId, recommendationText, category, priority, 'PENDING', createdBy]
  );

  return result[0];
}

/**
 * Get user recommendations
 */
export async function getUserRecommendations(userId: string): Promise<Recommendation[]> {
  const result = await query<Recommendation>(
    null,
    `SELECT r.* FROM recommendations r
     INNER JOIN assessments a ON r.assessment_id = a.id
     WHERE a.beneficiary_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );

  return result;
}

/**
 * Update recommendation status
 */
export async function updateRecommendationStatus(
  recommendationId: string,
  status: string
): Promise<Recommendation> {
  const result = await query<Recommendation>(
    null,
    `UPDATE recommendations 
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, recommendationId]
  );

  return result[0];
}

/**
 * Get assessment stats
 */
export async function getAssessmentStats(assessmentId: string): Promise<any> {
  const [questionsCount, answersCount, competenciesCount] = await Promise.all([
    query(
      null,
      `SELECT COUNT(*)::int as count FROM assessment_questions WHERE assessment_id = $1`,
      [assessmentId]
    ),
    query(null, `SELECT COUNT(*)::int as count FROM assessment_answers WHERE assessment_id = $1`, [
      assessmentId,
    ]),
    query(
      null,
      `SELECT COUNT(*)::int as count FROM assessment_competencies WHERE assessment_id = $1`,
      [assessmentId]
    ),
  ]);

  return {
    totalQuestions: questionsCount[0]?.count || 0,
    answeredQuestions: answersCount[0]?.count || 0,
    totalCompetencies: competenciesCount[0]?.count || 0,
  };
}

// File continues in Part 2...

// ============================================================================
// WIZARD FUNCTIONS
// ============================================================================

/**
 * Create assessment draft for wizard
 */
export async function createAssessmentDraft(
  beneficiaryId: string,
  assessmentType: 'career' | 'skills' | 'comprehensive' = 'career',
  title?: string
): Promise<Assessment> {
  // Create assessment
  const assessment = await createAssessment(beneficiaryId, assessmentType, title);

  // Create accompanying draft record
  const draftId = uuidv4();
  await query(
    null,
    `INSERT INTO assessment_drafts (
      id, assessment_id, current_step_number, draft_data, last_saved_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
    [draftId, assessment.id, 0, JSON.stringify({})]
  );

  logger.info(`Assessment draft created: ${assessment.id}`);
  return assessment;
}

/**
 * Save draft step
 */
export async function saveDraftStep(
  assessmentId: string,
  stepNumber: number,
  section: string,
  answers: any,
  competencies?: any[]
): Promise<AssessmentDraft> {
  // Get existing draft
  const existingDraft = await query<AssessmentDraft>(
    null,
    `SELECT * FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  let draftData: any = {};
  if (existingDraft.length > 0 && existingDraft[0].draft_data) {
    draftData =
      typeof existingDraft[0].draft_data === 'string'
        ? JSON.parse(existingDraft[0].draft_data)
        : existingDraft[0].draft_data;
  }

  // Update draft data with new section
  draftData[section] = answers;

  // Update draft
  const result = await query<AssessmentDraft>(
    null,
    `UPDATE assessment_drafts 
     SET current_step_number = $1, draft_data = $2, last_saved_at = NOW(), updated_at = NOW()
     WHERE assessment_id = $3
     RETURNING *`,
    [stepNumber, JSON.stringify(draftData), assessmentId]
  );

  // Save competencies if provided
  if (competencies && competencies.length > 0) {
    await saveCompetencies(assessmentId, competencies);
  }

  // Update assessment progress
  const progressPercentage = Math.round((stepNumber / 5) * 100);
  await query(
    null,
    `UPDATE assessments 
     SET current_step = $1, progress_percentage = $2, updated_at = NOW()
     WHERE id = $3`,
    [stepNumber, progressPercentage, assessmentId]
  );

  logger.info(`Draft step saved: ${assessmentId}, step ${stepNumber}`);
  return result[0];
}

/**
 * Auto-save draft
 */
export async function autoSaveDraft(
  assessmentId: string,
  stepNumber: number,
  partialData: any
): Promise<AssessmentDraft> {
  // Get existing draft
  const existingDraft = await query<AssessmentDraft>(
    null,
    `SELECT * FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  let draftData: any = {};
  if (existingDraft.length > 0 && existingDraft[0].draft_data) {
    draftData =
      typeof existingDraft[0].draft_data === 'string'
        ? JSON.parse(existingDraft[0].draft_data)
        : existingDraft[0].draft_data;
  }

  // Merge partial data
  draftData = { ...draftData, ...partialData };

  // Update draft
  const result = await query<AssessmentDraft>(
    null,
    `UPDATE assessment_drafts 
     SET draft_data = $1, last_saved_at = NOW(), updated_at = NOW()
     WHERE assessment_id = $2
     RETURNING *`,
    [JSON.stringify(draftData), assessmentId]
  );

  logger.info(`Draft auto-saved: ${assessmentId}`);
  return result[0];
}

/**
 * Get assessment progress
 */
export async function getAssessmentProgress(assessmentId: string): Promise<any> {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const draft = await query<AssessmentDraft>(
    null,
    `SELECT * FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  const competencies = await query<AssessmentCompetency>(
    null,
    `SELECT * FROM assessment_competencies WHERE assessment_id = $1`,
    [assessmentId]
  );

  return {
    currentStep: assessment.current_step,
    progressPercentage: assessment.progress_percentage,
    status: assessment.status,
    draftData: draft.length > 0 ? draft[0].draft_data : {},
    competencies: competencies,
    lastSavedAt: draft.length > 0 ? draft[0].last_saved_at : null,
  };
}

/**
 * Validate assessment step
 */
export async function validateAssessmentStep(
  assessmentId: string,
  stepNumber: number,
  stepData: any
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Basic validation based on step number
  switch (stepNumber) {
    case 1: // Work history
      if (!stepData.positions || stepData.positions.length === 0) {
        errors.push('At least one work position is required');
      }
      break;
    case 2: // Education
      if (!stepData.education || stepData.education.length === 0) {
        errors.push('At least one education entry is required');
      }
      break;
    case 3: // Skills
      if (!stepData.skills || stepData.skills.length === 0) {
        errors.push('At least one skill is required');
      }
      break;
    case 4: // Motivations
      if (!stepData.motivations || !stepData.motivations.primaryMotivation) {
        errors.push('Primary motivation is required');
      }
      break;
    case 5: // Constraints
      if (!stepData.constraints) {
        errors.push('Constraints data is required');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Submit assessment (finalize)
 */
export async function submitAssessment(assessmentId: string): Promise<Assessment> {
  // Validate all steps
  const draft = await query<AssessmentDraft>(
    null,
    `SELECT * FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  if (draft.length === 0) {
    throw new Error('No draft found for this assessment');
  }

  const draftData =
    typeof draft[0].draft_data === 'string' ? JSON.parse(draft[0].draft_data) : draft[0].draft_data;

  // Check if all required sections are completed
  const requiredSections = ['work_history', 'education', 'skills', 'motivations', 'constraints'];
  const missingSections = requiredSections.filter((section) => !draftData[section]);

  if (missingSections.length > 0) {
    throw new Error(`Missing required sections: ${missingSections.join(', ')}`);
  }

  // Update assessment status
  const result = await query<Assessment>(
    null,
    `UPDATE assessments 
     SET status = 'SUBMITTED', submitted_at = NOW(), progress_percentage = 100, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [assessmentId]
  );

  logger.info(`Assessment submitted: ${assessmentId}`);
  return result[0];
}

/**
 * Extract and create competencies from assessment data
 */
export async function extractAndCreateCompetencies(
  assessmentId: string,
  assessmentData: any
): Promise<AssessmentCompetency[]> {
  const competencies: any[] = [];

  // Extract from work history
  if (assessmentData.work_history && assessmentData.work_history.positions) {
    assessmentData.work_history.positions.forEach((position: any) => {
      if (position.skills) {
        position.skills.forEach((skill: string) => {
          competencies.push({
            skill_name: skill,
            category: 'professional',
            context: `${position.title} at ${position.company}`,
          });
        });
      }
    });
  }

  // Extract from skills section
  if (assessmentData.skills && assessmentData.skills.skills) {
    assessmentData.skills.skills.forEach((skill: any) => {
      competencies.push({
        skill_name: skill.name || skill.skillName,
        self_assessment_level: skill.level || skill.selfAssessmentLevel,
        self_interest_level: skill.interest || skill.selfInterestLevel,
        category: skill.category || 'general',
      });
    });
  }

  // Save competencies
  return await saveCompetencies(assessmentId, competencies);
}

/**
 * Save competencies to database
 */
async function saveCompetencies(
  assessmentId: string,
  competencies: any[]
): Promise<AssessmentCompetency[]> {
  const results: AssessmentCompetency[] = [];

  for (const comp of competencies) {
    const competencyId = uuidv4();
    const result = await query<AssessmentCompetency>(
      null,
      `INSERT INTO assessment_competencies (
        id, assessment_id, skill_name, self_assessment_level, 
        self_interest_level, category, context, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (assessment_id, skill_name) 
      DO UPDATE SET 
        self_assessment_level = EXCLUDED.self_assessment_level,
        self_interest_level = EXCLUDED.self_interest_level,
        category = EXCLUDED.category,
        context = EXCLUDED.context
      RETURNING *`,
      [
        competencyId,
        assessmentId,
        comp.skill_name || comp.skillName,
        comp.self_assessment_level || comp.selfAssessmentLevel || null,
        comp.self_interest_level || comp.selfInterestLevel || null,
        comp.category || 'general',
        comp.context || null,
      ]
    );

    if (result.length > 0) {
      results.push(result[0]);
    }
  }

  return results;
}

/**
 * Validate competencies
 */
export async function validateCompetencies(
  competencies: any[]
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  competencies.forEach((comp, index) => {
    if (!comp.skill_name && !comp.skillName) {
      errors.push(`Competency ${index + 1}: skill_name is required`);
    }
    if (
      comp.self_assessment_level &&
      (comp.self_assessment_level < 1 || comp.self_assessment_level > 5)
    ) {
      errors.push(`Competency ${index + 1}: self_assessment_level must be between 1 and 5`);
    }
    if (
      comp.self_interest_level &&
      (comp.self_interest_level < 1 || comp.self_interest_level > 5)
    ) {
      errors.push(`Competency ${index + 1}: self_interest_level must be between 1 and 5`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// VALIDATION SCHEMAS (for use in routes)
// ============================================================================

export const workHistoryStepSchema = {
  positions: 'array',
  required: ['positions'],
};

export const educationStepSchema = {
  education: 'array',
  required: ['education'],
};

export const skillsStepSchema = {
  skills: 'array',
  required: ['skills'],
};

export const motivationsStepSchema = {
  primaryMotivation: 'string',
  required: ['primaryMotivation'],
};

export const constraintsStepSchema = {
  constraints: 'object',
  required: ['constraints'],
};

// ============================================================================
// PARCOURS (ASSESSMENT PHASES) FUNCTIONS
// ============================================================================

/**
 * Get assessment with parcours data (phases and answers)
 */
export async function getAssessmentWithParcours(
  assessmentId: string,
  userId: string
): Promise<{
  assessment: Assessment | null;
  answers: AssessmentAnswer[];
  phases: {
    preliminaire: { status: string; completed_at?: Date; progress: number };
    investigation: { status: string; completed_at?: Date; progress: number };
    conclusion: { status: string; completed_at?: Date; progress: number };
  };
}> {
  // Get assessment
  const assessment = await getAssessment(assessmentId);

  if (!assessment) {
    return {
      assessment: null,
      answers: [],
      phases: {
        preliminaire: { status: 'locked', progress: 0 },
        investigation: { status: 'locked', progress: 0 },
        conclusion: { status: 'locked', progress: 0 },
      },
    };
  }

  // Get answers
  const answers = await getAssessmentAnswers(assessmentId);

  // Calculate phase statuses
  const phases = {
    preliminaire: {
      status: (assessment as any).phase_preliminaire_completed ? 'completed' : 'in_progress',
      completed_at: (assessment as any).phase_preliminaire_completed_at,
      progress: calculatePhaseProgress(answers, 1),
    },
    investigation: {
      status: (assessment as any).phase_investigation_completed
        ? 'completed'
        : (assessment as any).phase_preliminaire_completed
          ? 'in_progress'
          : 'locked',
      completed_at: (assessment as any).phase_investigation_completed_at,
      progress: calculatePhaseProgress(answers, 2),
    },
    conclusion: {
      status: (assessment as any).phase_conclusion_completed
        ? 'completed'
        : (assessment as any).phase_investigation_completed
          ? 'in_progress'
          : 'locked',
      completed_at: (assessment as any).phase_conclusion_completed_at,
      progress: calculatePhaseProgress(answers, 3),
    },
  };

  return { assessment, answers, phases };
}

/**
 * Calculate phase progress based on answers
 */
function calculatePhaseProgress(answers: AssessmentAnswer[], phase: number): number {
  // Simple progress calculation - can be enhanced based on business logic
  const phaseAnswers = answers.filter((a) => (a as any).phase === phase);
  if (phaseAnswers.length === 0) return 0;

  // Assume 10 questions per phase (adjust as needed)
  const expectedQuestions = 10;
  return Math.min(100, Math.round((phaseAnswers.length / expectedQuestions) * 100));
}

/**
 * Complete a phase (preliminaire, investigation, or conclusion)
 */
export async function completePhase(
  assessmentId: string,
  phase: 'preliminaire' | 'investigation' | 'conclusion',
  userId: string
): Promise<Assessment | null> {
  const fieldMap = {
    preliminaire: 'phase_preliminaire_completed',
    investigation: 'phase_investigation_completed',
    conclusion: 'phase_conclusion_completed',
  };

  const dateFieldMap = {
    preliminaire: 'phase_preliminaire_completed_at',
    investigation: 'phase_investigation_completed_at',
    conclusion: 'phase_conclusion_completed_at',
  };

  const field = fieldMap[phase];
  const dateField = dateFieldMap[phase];

  return queryOne<Assessment>(
    userId,
    `UPDATE bilans 
     SET ${field} = true, 
         ${dateField} = NOW(), 
         updated_at = NOW() 
     WHERE id = $1 
     RETURNING *`,
    [assessmentId]
  );
}

/**
 * Save or update assessment answer (upsert)
 */
export async function saveAssessmentAnswer(
  assessmentId: string,
  questionId: string,
  answer: any,
  userId: string
): Promise<AssessmentAnswer> {
  // Check if answer exists
  const existing = await query<AssessmentAnswer>(
    userId,
    `SELECT * FROM assessment_answers 
     WHERE assessment_id = $1 AND question_id = $2`,
    [assessmentId, questionId]
  );

  if (existing.length > 0) {
    // Update existing answer
    const result = await query<AssessmentAnswer>(
      userId,
      `UPDATE assessment_answers 
       SET answer_value = $1, updated_at = NOW() 
       WHERE assessment_id = $2 AND question_id = $3 
       RETURNING *`,
      [JSON.stringify(answer), assessmentId, questionId]
    );
    return result[0];
  } else {
    // Insert new answer
    const result = await query<AssessmentAnswer>(
      userId,
      `INSERT INTO assessment_answers (assessment_id, question_id, answer_value, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [assessmentId, questionId, JSON.stringify(answer)]
    );
    return result[0];
  }
}
