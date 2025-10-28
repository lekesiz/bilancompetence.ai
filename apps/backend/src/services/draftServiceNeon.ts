/**
 * Draft Service - Manage JSONB-based assessment draft data
 * 
 * This service replaces the old assessment_questions/assessment_answers approach
 * with a modern JSONB-based system using assessment_drafts table.
 */

import { query } from '../config/neon.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import {
  DraftData,
  calculateCompletion,
  validateStepData,
  mergeDraftData,
  getCurrentStep,
  isAssessmentComplete,
  initializeDraftData,
  extractCompetenciesFromDraft,
  generateDraftSummary,
} from '../utils/draftDataHelpers.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AssessmentDraft {
  id: string;
  assessment_id: string;
  current_step_number: number;
  draft_data: DraftData;
  auto_save_enabled: boolean;
  last_saved_at: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// DRAFT CRUD FUNCTIONS
// ============================================================================

/**
 * Create a new draft for an assessment
 */
export async function createDraft(assessmentId: string): Promise<AssessmentDraft> {
  const draftId = uuidv4();
  const initialData = initializeDraftData();

  const result = await query<AssessmentDraft>(
    null,
    `INSERT INTO assessment_drafts (
      id, assessment_id, current_step_number, draft_data, auto_save_enabled, last_saved_at, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())
    RETURNING *`,
    [draftId, assessmentId, 0, JSON.stringify(initialData), true]
  );

  logger.info(`Draft created for assessment: ${assessmentId}`);
  return result[0];
}

/**
 * Get draft by assessment ID
 */
export async function getDraftByAssessmentId(assessmentId: string): Promise<AssessmentDraft | null> {
  const result = await query<AssessmentDraft>(
    null,
    `SELECT * FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

/**
 * Get or create draft for an assessment
 */
export async function getOrCreateDraft(assessmentId: string): Promise<AssessmentDraft> {
  let draft = await getDraftByAssessmentId(assessmentId);

  if (!draft) {
    draft = await createDraft(assessmentId);
  }

  return draft;
}

/**
 * Update draft data for a specific step
 */
export async function updateDraftStep(
  assessmentId: string,
  stepNumber: number,
  stepData: any
): Promise<AssessmentDraft> {
  // Validate step data
  if (!validateStepData(stepNumber, stepData)) {
    throw new Error(`Invalid data for step ${stepNumber}`);
  }

  // Get existing draft
  const draft = await getOrCreateDraft(assessmentId);

  // Merge new step data
  const updatedDraftData = mergeDraftData(draft.draft_data, stepNumber, stepData);

  // Calculate new current step
  const newCurrentStep = getCurrentStep(updatedDraftData);

  // Update in database
  const result = await query<AssessmentDraft>(
    null,
    `UPDATE assessment_drafts 
     SET draft_data = $1, 
         current_step_number = $2,
         last_saved_at = NOW(),
         updated_at = NOW()
     WHERE assessment_id = $3
     RETURNING *`,
    [JSON.stringify(updatedDraftData), newCurrentStep, assessmentId]
  );

  logger.info(`Draft updated for assessment ${assessmentId}, step ${stepNumber}`);
  return result[0];
}

/**
 * Save complete draft data (replaces entire draft_data)
 */
export async function saveDraftData(assessmentId: string, draftData: DraftData): Promise<AssessmentDraft> {
  const currentStep = getCurrentStep(draftData);

  const draft = await getOrCreateDraft(assessmentId);

  const result = await query<AssessmentDraft>(
    null,
    `UPDATE assessment_drafts 
     SET draft_data = $1,
         current_step_number = $2,
         last_saved_at = NOW(),
         updated_at = NOW()
     WHERE assessment_id = $3
     RETURNING *`,
    [JSON.stringify(draftData), currentStep, assessmentId]
  );

  logger.info(`Complete draft data saved for assessment: ${assessmentId}`);
  return result[0];
}

/**
 * Get draft data (JSONB only)
 */
export async function getDraftData(assessmentId: string): Promise<DraftData> {
  const draft = await getDraftByAssessmentId(assessmentId);

  if (!draft) {
    return initializeDraftData();
  }

  return draft.draft_data;
}

/**
 * Delete draft
 */
export async function deleteDraft(assessmentId: string): Promise<void> {
  await query(
    null,
    `DELETE FROM assessment_drafts WHERE assessment_id = $1`,
    [assessmentId]
  );

  logger.info(`Draft deleted for assessment: ${assessmentId}`);
}

/**
 * Toggle auto-save
 */
export async function toggleAutoSave(assessmentId: string, enabled: boolean): Promise<AssessmentDraft> {
  const result = await query<AssessmentDraft>(
    null,
    `UPDATE assessment_drafts 
     SET auto_save_enabled = $1,
         updated_at = NOW()
     WHERE assessment_id = $2
     RETURNING *`,
    [enabled, assessmentId]
  );

  logger.info(`Auto-save ${enabled ? 'enabled' : 'disabled'} for assessment: ${assessmentId}`);
  return result[0];
}

// ============================================================================
// COMPETENCY EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extract and save competencies from draft data to assessment_competencies table
 */
export async function extractAndSaveCompetencies(assessmentId: string): Promise<number> {
  const draftData = await getDraftData(assessmentId);
  const competencies = extractCompetenciesFromDraft(draftData);

  if (competencies.length === 0) {
    logger.warn(`No competencies found in draft for assessment: ${assessmentId}`);
    return 0;
  }

  // Delete existing competencies for this assessment
  await query(
    null,
    `DELETE FROM assessment_competencies WHERE assessment_id = $1`,
    [assessmentId]
  );

  // Insert new competencies
  let insertedCount = 0;

  for (const comp of competencies) {
    const competencyId = uuidv4();

    await query(
      null,
      `INSERT INTO assessment_competencies (
        id, assessment_id, skill_name, category, 
        self_assessment_level, self_interest_level, context, 
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [
        competencyId,
        assessmentId,
        comp.skill_name || comp.name,
        comp.category || 'other',
        comp.self_assessment_level || comp.level,
        comp.self_interest_level || comp.interest,
        comp.context || '',
      ]
    );

    insertedCount++;
  }

  logger.info(`Extracted ${insertedCount} competencies for assessment: ${assessmentId}`);
  return insertedCount;
}

/**
 * Get assessment competencies
 */
export async function getAssessmentCompetencies(assessmentId: string): Promise<any[]> {
  const result = await query(
    null,
    `SELECT * FROM assessment_competencies 
     WHERE assessment_id = $1
     ORDER BY category, skill_name`,
    [assessmentId]
  );

  return result;
}

// ============================================================================
// ANALYTICS & SUMMARY FUNCTIONS
// ============================================================================

/**
 * Get draft completion stats
 */
export async function getDraftCompletionStats(assessmentId: string): Promise<{
  completion: ReturnType<typeof calculateCompletion>;
  isComplete: boolean;
  currentStep: number;
}> {
  const draftData = await getDraftData(assessmentId);
  const completion = calculateCompletion(draftData);

  return {
    completion,
    isComplete: isAssessmentComplete(draftData),
    currentStep: getCurrentStep(draftData),
  };
}

/**
 * Get full draft summary for analytics
 */
export async function getDraftSummary(assessmentId: string): Promise<ReturnType<typeof generateDraftSummary>> {
  const draftData = await getDraftData(assessmentId);
  return generateDraftSummary(draftData);
}

/**
 * Get draft last saved time
 */
export async function getDraftLastSaved(assessmentId: string): Promise<Date | null> {
  const draft = await getDraftByAssessmentId(assessmentId);
  return draft ? draft.last_saved_at : null;
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Get all drafts for a user (via assessments)
 */
export async function getUserDrafts(userId: string): Promise<AssessmentDraft[]> {
  const result = await query<AssessmentDraft>(
    null,
    `SELECT ad.* FROM assessment_drafts ad
     INNER JOIN assessments a ON ad.assessment_id = a.id
     WHERE a.beneficiary_id = $1
     ORDER BY ad.last_saved_at DESC`,
    [userId]
  );

  return result;
}

/**
 * Get incomplete drafts (for reminders, etc.)
 */
export async function getIncompleteDrafts(organizationId?: string): Promise<AssessmentDraft[]> {
  let sql = `
    SELECT ad.* FROM assessment_drafts ad
    INNER JOIN assessments a ON ad.assessment_id = a.id
    WHERE a.status IN ('DRAFT', 'IN_PROGRESS')
    AND a.deleted_at IS NULL
  `;

  const params: any[] = [];

  if (organizationId) {
    sql += ` AND a.organization_id = $1`;
    params.push(organizationId);
  }

  sql += ` ORDER BY ad.last_saved_at DESC`;

  const result = await query<AssessmentDraft>(null, sql, params);
  return result;
}

/**
 * Clean up old drafts (for maintenance)
 */
export async function cleanupOldDrafts(daysOld: number = 90): Promise<number> {
  const result = await query(
    null,
    `DELETE FROM assessment_drafts 
     WHERE last_saved_at < NOW() - INTERVAL '${daysOld} days'
     AND assessment_id IN (
       SELECT id FROM assessments WHERE status = 'DRAFT' AND deleted_at IS NULL
     )`
  );

  const deletedCount = result.length;
  logger.info(`Cleaned up ${deletedCount} old drafts (older than ${daysOld} days)`);
  return deletedCount;
}

