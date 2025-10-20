import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  exportAssessmentsToCSV,
  exportRecommendationsToCSV,
  exportUserDataToCSV,
  exportOrganizationUsersToCSV,
  exportAssessmentResultsToCSV,
  exportAnalyticsSummaryToCSV,
  generateCSVFilename,
} from '../services/csvService';
import { getUserActivityStats } from '../services/analyticsService';

const router = Router();

/**
 * GET /api/export/assessments
 * Export user assessments to CSV
 */
router.get('/assessments', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const csv = await exportAssessmentsToCSV(req.user.id);
    const filename = generateCSVFilename('assessments');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export assessments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export assessments',
    });
  }
});

/**
 * GET /api/export/recommendations
 * Export user recommendations to CSV
 */
router.get('/recommendations', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const csv = await exportRecommendationsToCSV(req.user.id);
    const filename = generateCSVFilename('recommendations');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export recommendations',
    });
  }
});

/**
 * GET /api/export/user-data
 * Export user data to CSV
 */
router.get('/user-data', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const csv = await exportUserDataToCSV(req.user.id);
    const filename = generateCSVFilename('user_data');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export user data',
    });
  }
});

/**
 * GET /api/export/organization-users
 * Export organization users to CSV (admin only)
 */
router.get(
  '/organization-users',
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
      const organizationId = req.user.id;

      const csv = await exportOrganizationUsersToCSV(organizationId);
      const filename = generateCSVFilename('organization_users');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      console.error('Export organization users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to export organization users',
      });
    }
  }
);

/**
 * GET /api/export/assessment/:assessmentId/results
 * Export assessment results to CSV
 */
router.get('/assessment/:assessmentId/results', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;

    const csv = await exportAssessmentResultsToCSV(assessmentId);
    const filename = generateCSVFilename(`assessment_results_${assessmentId}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export assessment results error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export assessment results',
    });
  }
});

/**
 * GET /api/export/analytics
 * Export analytics summary to CSV
 */
router.get('/analytics', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const stats = await getUserActivityStats(req.user.id);
    const csv = await exportAnalyticsSummaryToCSV(req.user.id, stats);
    const filename = generateCSVFilename('analytics_summary');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export analytics',
    });
  }
});

export default router;
