import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';

export interface MBTIQuestion {
  id: string;
  question_text: string;
  question_order: number;
  dimension: string; // E/I, S/N, T/F, J/P
  direction: string; // positive or negative
}

export interface RIASECQuestion {
  id: string;
  question_text: string;
  question_order: number;
  category: string; // R, I, A, S, E, C
}

export interface TestResult {
  id: string;
  assessment_id: string;
  test_type: string; // 'mbti', 'riasec', 'values', 'interests'
  test_result: any; // JSON result
  created_at: Date;
}

/**
 * Get all MBTI questions
 */
export async function getMBTIQuestions(): Promise<MBTIQuestion[]> {
  return query<MBTIQuestion>(
    null,
    `SELECT * FROM mbti_questions 
     ORDER BY question_order ASC`
  );
}

/**
 * Get all RIASEC questions
 */
export async function getRIASECQuestions(): Promise<RIASECQuestion[]> {
  return query<RIASECQuestion>(
    null,
    `SELECT * FROM riasec_questions 
     ORDER BY question_order ASC`
  );
}

/**
 * Get test results for an assessment
 */
export async function getTestResults(
  assessmentId: string,
  userId?: string
): Promise<TestResult[]> {
  return query<TestResult>(
    userId || null,
    `SELECT * FROM test_results 
     WHERE assessment_id = $1 
     ORDER BY created_at DESC`,
    [assessmentId]
  );
}

/**
 * Save test result
 */
export async function saveTestResult(
  assessmentId: string,
  testType: string,
  testResult: any,
  userId?: string
): Promise<TestResult> {
  const result = await query<TestResult>(
    userId || null,
    `INSERT INTO test_results (assessment_id, test_type, test_result, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [assessmentId, testType, JSON.stringify(testResult)]
  );

  logger.info('Test result saved', { assessmentId, testType });
  return result[0];
}

/**
 * Get specific test result by type
 */
export async function getTestResultByType(
  assessmentId: string,
  testType: string,
  userId?: string
): Promise<TestResult | null> {
  const results = await query<TestResult>(
    userId || null,
    `SELECT * FROM test_results 
     WHERE assessment_id = $1 AND test_type = $2 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [assessmentId, testType]
  );

  return results.length > 0 ? results[0] : null;
}

/**
 * Delete test result
 */
export async function deleteTestResult(
  resultId: string,
  userId?: string
): Promise<boolean> {
  const result = await query<{ id: string }>(
    userId || null,
    `DELETE FROM test_results 
     WHERE id = $1 
     RETURNING id`,
    [resultId]
  );

  const deleted = result.length > 0;
  if (deleted) {
    logger.info('Test result deleted', { resultId });
  }
  return deleted;
}

