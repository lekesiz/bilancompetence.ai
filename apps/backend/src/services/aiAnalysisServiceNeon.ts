import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';

/**
 * Save CV analysis result
 */
export async function saveCVAnalysis(
  assessmentId: string,
  cvText: string,
  analysisResult: any,
  userId?: string
): Promise<void> {
  await query(
    userId || null,
    `INSERT INTO cv_analyses (assessment_id, cv_text, analysis_result, created_at)
     VALUES ($1, $2, $3, NOW())`,
    [assessmentId, cvText, JSON.stringify(analysisResult)]
  );

  logger.info('CV analysis saved', { assessmentId });
}

/**
 * Save job recommendation
 */
export async function saveJobRecommendation(
  assessmentId: string,
  recommendations: any,
  userId?: string
): Promise<void> {
  await query(
    userId || null,
    `INSERT INTO job_recommendations (assessment_id, recommendations, created_at)
     VALUES ($1, $2, NOW())`,
    [assessmentId, JSON.stringify(recommendations)]
  );

  logger.info('Job recommendations saved', { assessmentId });
}

/**
 * Save personality analysis result
 */
export async function savePersonalityAnalysis(
  assessmentId: string,
  analysisResult: any,
  userId?: string
): Promise<void> {
  await query(
    userId || null,
    `INSERT INTO personality_analyses (assessment_id, analysis_result, created_at)
     VALUES ($1, $2, NOW())`,
    [assessmentId, JSON.stringify(analysisResult)]
  );

  logger.info('Personality analysis saved', { assessmentId });
}

/**
 * Save action plan
 */
export async function saveActionPlan(
  assessmentId: string,
  actionPlan: any,
  userId?: string
): Promise<void> {
  await query(
    userId || null,
    `INSERT INTO action_plans (assessment_id, action_plan, created_at)
     VALUES ($1, $2, NOW())`,
    [assessmentId, JSON.stringify(actionPlan)]
  );

  logger.info('Action plan saved', { assessmentId });
}

/**
 * Get CV analysis by assessment ID
 */
export async function getCVAnalysis(assessmentId: string, userId?: string): Promise<any | null> {
  const result = await query<{ analysis_result: string }>(
    userId || null,
    `SELECT analysis_result FROM cv_analyses 
     WHERE assessment_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [assessmentId]
  );

  if (result.length === 0) return null;

  return JSON.parse(result[0].analysis_result);
}

/**
 * Get job recommendations by assessment ID
 */
export async function getJobRecommendations(
  assessmentId: string,
  userId?: string
): Promise<any | null> {
  const result = await query<{ recommendations: string }>(
    userId || null,
    `SELECT recommendations FROM job_recommendations 
     WHERE assessment_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [assessmentId]
  );

  if (result.length === 0) return null;

  return JSON.parse(result[0].recommendations);
}

/**
 * Get personality analysis by assessment ID
 */
export async function getPersonalityAnalysis(
  assessmentId: string,
  userId?: string
): Promise<any | null> {
  const result = await query<{ analysis_result: string }>(
    userId || null,
    `SELECT analysis_result FROM personality_analyses 
     WHERE assessment_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [assessmentId]
  );

  if (result.length === 0) return null;

  return JSON.parse(result[0].analysis_result);
}

/**
 * Get action plan by assessment ID
 */
export async function getActionPlan(assessmentId: string, userId?: string): Promise<any | null> {
  const result = await query<{ action_plan: string }>(
    userId || null,
    `SELECT action_plan FROM action_plans 
     WHERE assessment_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [assessmentId]
  );

  if (result.length === 0) return null;

  return JSON.parse(result[0].action_plan);
}
