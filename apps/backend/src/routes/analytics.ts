import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getUserActivityStats,
  getConsultantActivityStats,
  getOrganizationStats,
  getAssessmentStats,
} from '../services/analyticsServiceNeon.js';
import { logger } from '../utils/logger.js';

// TODO: Temporary stubs - implement these in analyticsServiceNeon.js
const getAssessmentAnalytics = async (id: string) => ({ message: 'Not implemented yet' });
const getAssessmentsTimeSeries = async (userId: string, weeks: number) => ({ message: 'Not implemented yet' });
const getAssessmentTypeDistribution = async () => ({ message: 'Not implemented yet' });
const getRecommendationEffectiveness = async (userId: string) => ({ message: 'Not implemented yet' });
const getSkillProficiency = async (userId: string) => ({ message: 'Not implemented yet' });
const generateReportData = async (userId: string, reportType: string) => ({ message: 'Not implemented yet' });

const router = Router();

/**
 * @swagger
 * /api/analytics/user-activity:
 *   get:
 *     summary: Get user activity statistics
 *     description: Retrieve current user's activity statistics including assessments, progress, and engagement metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User activity statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssessments:
 *                       type: integer
 *                       example: 10
 *                     completedAssessments:
 *                       type: integer
 *                       example: 7
 *                     inProgressAssessments:
 *                       type: integer
 *                       example: 2
 *                     averageScore:
 *                       type: number
 *                       example: 85.5
 *                     completionRate:
 *                       type: number
 *                       example: 70
 *                     totalTimeSpent:
 *                       type: integer
 *                       description: Total time spent in minutes
 *                       example: 480
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/user-activity', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const stats = await getUserActivityStats(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    logger.error('User activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user activity',
    });
  }
});

/**
 * GET /api/analytics/organization
 * Get organization statistics (admin only)
 */
router.get(
  '/organization',
  authMiddleware,
  requireRole('ORG_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Get organization_id from user context
      const organizationId = req.user.organization_id;

      if (!organizationId) {
        return res.status(400).json({
          status: 'error',
          message: 'Organization ID not found for user',
        });
      }

      const stats = await getOrganizationStats(organizationId);

      return res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      logger.error('Organization stats error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch organization statistics',
      });
    }
  }
);

/**
 * GET /api/analytics/assessment/:assessmentId
 * Get assessment analytics
 */
router.get('/assessment/:assessmentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;

    const analytics = await getAssessmentAnalytics(assessmentId);

    return res.status(200).json({
      status: 'success',
      data: analytics,
    });
  } catch (error) {
    logger.error('Assessment analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assessment analytics',
    });
  }
});

/**
 * GET /api/analytics/time-series
 * Get assessments time series data
 */
router.get('/time-series', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const weeks = parseInt(req.query.weeks as string) || 12;
    const timeSeries = await getAssessmentsTimeSeries(req.user.id, weeks);

    return res.status(200).json({
      status: 'success',
      data: timeSeries,
    });
  } catch (error) {
    logger.error('Time series error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch time series data',
    });
  }
});

/**
 * GET /api/analytics/assessment-types
 * Get assessment type distribution
 */
router.get('/assessment-types', authMiddleware, async (req: Request, res: Response) => {
  try {
    const distribution = await getAssessmentTypeDistribution();

    return res.status(200).json({
      status: 'success',
      data: distribution,
    });
  } catch (error) {
    logger.error('Assessment types error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assessment type distribution',
    });
  }
});

/**
 * GET /api/analytics/recommendation-effectiveness
 * Get recommendation effectiveness
 */
router.get('/recommendation-effectiveness', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const effectiveness = await getRecommendationEffectiveness(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: effectiveness,
    });
  } catch (error) {
    logger.error('Recommendation effectiveness error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch recommendation effectiveness',
    });
  }
});

/**
 * GET /api/analytics/skills
 * Get user skill proficiency
 */
router.get('/skills', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const skills = await getSkillProficiency(req.user.id);

    return res.status(200).json({
      status: 'success',
      data: skills,
    });
  } catch (error) {
    logger.error('Skills error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skills',
    });
  }
});

/**
 * GET /api/analytics/report
 * Generate analytics report
 */
router.get('/report', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const reportType = (req.query.type as 'detailed' | 'summary') || 'detailed';
    const reportData = await generateReportData(req.user.id, reportType);

    return res.status(200).json({
      status: 'success',
      data: reportData,
    });
  } catch (error) {
    logger.error('Report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate report',
    });
  }
});

export default router;
