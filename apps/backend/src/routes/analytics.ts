import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getUserActivityStats,
  getOrganizationStats,
  getAssessmentAnalytics,
  getAssessmentsTimeSeries,
  getAssessmentTypeDistribution,
  getRecommendationEffectiveness,
  getSkillProficiency,
  generateReportData,
} from '../services/analyticsService.js';

const router = Router();

/**
 * GET /api/analytics/user-activity
 * Get user activity statistics
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
    console.error('User activity error:', error);
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
  requireRole('ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // In production, get organization_id from user context
      const organizationId = req.user.id; // placeholder

      const stats = await getOrganizationStats(organizationId);

      return res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      console.error('Organization stats error:', error);
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
    console.error('Assessment analytics error:', error);
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
    console.error('Time series error:', error);
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
    console.error('Assessment types error:', error);
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
    console.error('Recommendation effectiveness error:', error);
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
    console.error('Skills error:', error);
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
    console.error('Report error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate report',
    });
  }
});

export default router;
