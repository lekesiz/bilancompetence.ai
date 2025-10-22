import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  createAssessment,
  getAssessment,
  getAssessmentWithDetails,
  getUserAssessments,
  updateAssessment,
  startAssessment,
  completeAssessment,
  getAssessmentStats,
  createAssessmentQuestion,
  getAssessmentQuestions,
  submitAnswer,
  getUserRecommendations,
  createRecommendation,
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
} from '../services/assessmentService.js';
import { createAuditLog } from '../services/supabaseService.js';

const router = Router();

// Validation schemas
const createAssessmentSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(2000).optional(),
  assessment_type: z.enum(['career', 'skills', 'comprehensive']),
  consultant_id: z.string().uuid().optional(),
});

const createQuestionSchema = z.object({
  question: z.string().min(5),
  question_type: z.enum(['multiple_choice', 'text', 'rating', 'open_ended']),
  options: z.array(z.string()).optional(),
  category: z.string().optional(),
});

const submitAnswerSchema = z.object({
  question_id: z.string(),
  answer: z.any(),
});

// Wizard step schemas
const saveDraftStepSchema = z.object({
  section: z.enum(['work_history', 'education', 'skills', 'motivations', 'constraints']),
  answers: z.record(z.string(), z.any()),
  competencies: z.array(z.object({
    skillName: z.string().optional(),
    skill_name: z.string().optional(),
    selfAssessmentLevel: z.number().optional(),
    self_assessment_level: z.number().optional(),
    selfInterestLevel: z.number().optional(),
    self_interest_level: z.number().optional(),
    category: z.string().optional(),
    context: z.string().optional(),
  })).optional(),
});

const autoSaveSchema = z.object({
  step_number: z.number().int().min(0).max(5),
  partial_data: z.record(z.string(), z.any()),
});

/**
 * POST /api/assessments
 * Create new assessment (wizard draft or traditional)
 * Body: { title?, description?, assessment_type: 'career' | 'skills' | 'comprehensive', consultant_id? }
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { title, description, assessment_type, consultant_id } = req.body;

    // Validate assessment type
    if (!assessment_type || !['career', 'skills', 'comprehensive'].includes(assessment_type)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid assessment_type. Must be one of: career, skills, comprehensive',
      });
    }

    // Use wizard draft creation (automatically creates draft record)
    const assessment = await createAssessmentDraft(
      req.user.id,
      assessment_type,
      title
    );

    // Log action
    await createAuditLog(
      req.user.id,
      'ASSESSMENT_DRAFT_CREATED',
      'bilan',
      assessment.id,
      { title, assessment_type },
      req.ip
    );

    return res.status(201).json({
      status: 'success',
      message: 'Assessment draft created',
      data: assessment,
    });
  } catch (error) {
    console.error('Create assessment draft error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create assessment draft',
      error: error instanceof Error ? error.message : undefined,
    });
  }
});

/**
 * GET /api/assessments
 * Get user's assessments
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const role = (req.query.role as string) || 'beneficiary';
    const assessments = await getUserAssessments(req.user.id, role as any);

    return res.status(200).json({
      status: 'success',
      data: assessments,
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assessments',
    });
  }
});

/**
 * GET /api/assessments/:id
 * Get assessment details with all related data (questions, answers, draft, competencies)
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assessment = await getAssessmentWithDetails(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    // Check authorization
    if (assessment.beneficiary_id !== req.user?.id && assessment.consultant_id !== req.user?.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access to this assessment',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: assessment,
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assessment',
    });
  }
});

/**
 * PUT /api/assessments/:id
 * Update assessment
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { title, description, status } = req.body;

    const updated = await updateAssessment(id, {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
    });

    await createAuditLog(req.user.id, 'ASSESSMENT_UPDATED', 'bilan', id, { title, status }, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Assessment updated',
      data: updated,
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update assessment',
    });
  }
});

/**
 * POST /api/assessments/:id/start
 * Start assessment
 */
router.post('/:id/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const assessment = await startAssessment(id);

    await createAuditLog(req.user.id, 'ASSESSMENT_STARTED', 'bilan', id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Assessment started',
      data: assessment,
    });
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to start assessment',
    });
  }
});

/**
 * POST /api/assessments/:id/complete
 * Complete assessment
 */
router.post('/:id/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;
    const { results } = req.body;

    const assessment = await completeAssessment(id, results);

    await createAuditLog(req.user.id, 'ASSESSMENT_COMPLETED', 'bilan', id, null, req.ip);

    return res.status(200).json({
      status: 'success',
      message: 'Assessment completed',
      data: assessment,
    });
  } catch (error) {
    console.error('Complete assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete assessment',
    });
  }
});

/**
 * GET /api/assessments/:id/stats
 * Get assessment statistics
 */
router.get('/:id/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await getAssessmentStats(id);

    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * POST /api/assessments/:id/questions
 * Add assessment question
 */
router.post('/:id/questions', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const validation = createQuestionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
      });
    }

    const { id } = req.params;
    const { question, question_type, options, category } = validation.data;

    const questionData = await createAssessmentQuestion(id, question, question_type, options, category);

    return res.status(201).json({
      status: 'success',
      data: questionData,
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create question',
    });
  }
});

/**
 * GET /api/assessments/:id/questions
 * Get assessment questions
 */
router.get('/:id/questions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questions = await getAssessmentQuestions(id);

    return res.status(200).json({
      status: 'success',
      data: questions,
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch questions',
    });
  }
});

/**
 * POST /api/assessments/:id/answers
 * Submit answer
 */
router.post('/:id/answers', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const validation = submitAnswerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
      });
    }

    const { id } = req.params;
    const { question_id, answer } = validation.data;

    const answerData = await submitAnswer(id, question_id, req.user.id, answer);

    return res.status(201).json({
      status: 'success',
      data: answerData,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit answer',
    });
  }
});

/**
 * GET /api/assessments/recommendations
 * Get user recommendations
 */
router.get('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const recommendations = await getUserRecommendations(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: recommendations,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendations',
    });
  }
});

/**
 * ============================================
 * WIZARD ENDPOINTS - Phase 2 Implementation
 * ============================================
 */

/**
 * POST /api/assessments/:id/steps/:stepNumber
 * Save individual step with validation
 * Body: { section, answers: {questionId: value, ...}, competencies?: [...] }
 */
router.post('/:id/steps/:stepNumber', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id, stepNumber } = req.params;
    const stepNum = parseInt(stepNumber, 10);

    if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid step number. Must be 1-5',
      });
    }

    const validation = saveDraftStepSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues.map(e => e.message),
      });
    }

    const { section, answers, competencies } = validation.data;

    // Verify assessment belongs to user
    const assessment = await getAssessment(id);
    if (!assessment || assessment.beneficiary_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const result = await saveDraftStep(id, stepNum, section, answers, competencies);

    await createAuditLog(
      req.user.id,
      'ASSESSMENT_STEP_SAVED',
      'bilan',
      id,
      { step: stepNum, section },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: `Step ${stepNum} saved`,
      data: result,
    });
  } catch (error) {
    console.error('Save draft step error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save step',
      error: error instanceof Error ? error.message : undefined,
    });
  }
});

/**
 * POST /api/assessments/:id/auto-save
 * Auto-save draft (incremental, without validation)
 * Body: { step_number: number, partial_data: {...} }
 */
router.post('/:id/auto-save', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    const validation = autoSaveSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues.map(e => e.message),
      });
    }

    const { step_number, partial_data } = validation.data;

    // Verify assessment belongs to user
    const assessment = await getAssessment(id);
    if (!assessment || assessment.beneficiary_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const result = await autoSaveDraft(id, step_number, partial_data);

    return res.status(200).json({
      status: 'success',
      message: 'Auto-saved',
      data: result,
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to auto-save',
      error: error instanceof Error ? error.message : undefined,
    });
  }
});

/**
 * GET /api/assessments/:id/progress
 * Get wizard progress
 * Response: { currentStep, progressPercentage, completedSteps, lastSavedAt, draftData, status }
 */
router.get('/:id/progress', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify assessment belongs to user
    const assessment = await getAssessment(id);
    if (!assessment || (assessment.beneficiary_id !== req.user?.id && assessment.consultant_id !== req.user?.id)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const progress = await getAssessmentProgress(id);

    return res.status(200).json({
      status: 'success',
      data: progress,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch progress',
    });
  }
});

/**
 * POST /api/assessments/:id/submit
 * Submit assessment for review
 * Validates all steps are complete before submission
 */
router.post('/:id/submit', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify assessment belongs to user
    const assessment = await getAssessment(id);
    if (!assessment || assessment.beneficiary_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const result = await submitAssessment(id, req.user.id);

    await createAuditLog(
      req.user.id,
      'ASSESSMENT_SUBMITTED',
      'bilan',
      id,
      { status: result.status },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: 'Assessment submitted for review',
      data: result,
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit assessment';
    res.status(400).json({
      status: 'error',
      message: errorMessage,
    });
  }
});

export default router;
