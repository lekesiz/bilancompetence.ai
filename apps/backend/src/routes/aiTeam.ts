/**
 * AI Team API Routes
 * Endpoints for AI team collaboration and orchestration
 *
 * @module routes/aiTeam
 */

import { Router, Request, Response } from 'express';
import { getAITeamService, AITeamTask, AITeamMode } from '../services/aiTeamService';
import { authenticateToken } from '../middleware/authMiddleware';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/ai-team/execute:
 *   post:
 *     summary: Execute task with AI team
 *     tags: [AI Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *               - type
 *             properties:
 *               task:
 *                 type: string
 *                 description: The task to execute
 *               type:
 *                 type: string
 *                 enum: [analysis, code-review, debug, documentation, general]
 *               context:
 *                 type: string
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *               error:
 *                 type: string
 *               mode:
 *                 type: string
 *                 enum: [parallel, sequential, best-match, consensus]
 *     responses:
 *       200:
 *         description: AI team response
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/execute', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { task, type, context, code, language, error, mode } = req.body;

    if (!task || !type) {
      return res.status(400).json({
        success: false,
        error: 'Task and type are required',
      });
    }

    const aiTask: AITeamTask = {
      task,
      type,
      context,
      code,
      language,
      error,
    };

    const aiTeam = getAITeamService({ mode: mode as AITeamMode });
    const result = await aiTeam.executeTask(aiTask);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[AITeam] Execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute AI team task',
    });
  }
});

/**
 * @swagger
 * /api/ai-team/members:
 *   get:
 *     summary: Get AI team members status
 *     tags: [AI Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team members list
 *       401:
 *         description: Unauthorized
 */
router.get('/members', authenticateToken, async (req: Request, res: Response) => {
  try {
    const aiTeam = getAITeamService();
    const members = aiTeam.getAllMembers();

    res.json({
      success: true,
      data: {
        members,
        enabled: members.filter(m => m.enabled).length,
        total: members.length,
      },
    });
  } catch (error: any) {
    logger.error('[AITeam] Get members error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get team members',
    });
  }
});

/**
 * @swagger
 * /api/ai-team/stats:
 *   get:
 *     summary: Get AI team statistics
 *     tags: [AI Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Team statistics
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const aiTeam = getAITeamService();
    const stats = aiTeam.getTeamStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('[AITeam] Get stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get team stats',
    });
  }
});

/**
 * @swagger
 * /api/ai-team/analyze-code:
 *   post:
 *     summary: Analyze code with AI team
 *     tags: [AI Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - language
 *               - task
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *               task:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code analysis result
 */
router.post('/analyze-code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, language, task } = req.body;

    if (!code || !language || !task) {
      return res.status(400).json({
        success: false,
        error: 'Code, language, and task are required',
      });
    }

    const aiTask: AITeamTask = {
      task,
      type: 'analysis',
      code,
      language,
    };

    const aiTeam = getAITeamService();
    const result = await aiTeam.executeTask(aiTask);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[AITeam] Analyze code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze code',
    });
  }
});

/**
 * @swagger
 * /api/ai-team/review-code:
 *   post:
 *     summary: Review code with AI team
 *     tags: [AI Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - language
 *             properties:
 *               code:
 *                 type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code review result
 */
router.post('/review-code', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required',
      });
    }

    const aiTask: AITeamTask = {
      task: 'Review this code for security, performance, and best practices',
      type: 'code-review',
      code,
      language,
    };

    const aiTeam = getAITeamService();
    const result = await aiTeam.executeTask(aiTask);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[AITeam] Review code error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to review code',
    });
  }
});

export default router;
