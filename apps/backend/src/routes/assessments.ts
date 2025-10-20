import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  createAssessment,
  getAssessment,
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
} from '../services/assessmentService';
import { createAuditLog } from '../services/supabaseService';

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

/**
 * POST /api/assessments
 * Create new assessment
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const validation = createAssessmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues,
      });
    }

    const { title, description, assessment_type, consultant_id } = validation.data;

    const assessment = await createAssessment(
      req.user.id,
      assessment_type,
      title,
      description,
      consultant_id
    );

    // Log action
    await createAuditLog(req.user.id, 'ASSESSMENT_CREATED', 'bilan', assessment.id, { title }, req.ip);

    return res.status(201).json({
      status: 'success',
      message: 'Assessment created',
      data: assessment,
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create assessment',
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
 * Get assessment details
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
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

export default router;
