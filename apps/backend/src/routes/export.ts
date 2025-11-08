import { Router, Request, Response } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getAssessment } from '../services/assessmentServiceNeon.js';
import {
  exportAssessmentsToCSV,
  exportRecommendationsToCSV,
  exportUserDataToCSV,
  exportOrganizationUsersToCSV,
  exportAssessmentResultsToCSV,
  exportAnalyticsSummaryToCSV,
  generateCSVFilename,
} from '../services/csvService.js';
import { getUserActivityStats } from '../services/analyticsServiceNeon.js';
import { logger } from '../utils/logger.js';
import {
  generateAssessmentPDF,
  generateUserAssessmentsSummary,
  generateConsultantClientReport,
} from '../services/pdfServiceNeon.js';

const router = Router();

/**
 * @swagger
 * /api/export/assessments:
 *   get:
 *     summary: Export assessments to CSV
 *     description: Download user's assessments as CSV file
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
    logger.error('Export assessments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export assessments',
    });
  }
});

/**
 * @swagger
 * /api/export/recommendations:
 *   get:
 *     summary: Export recommendations to CSV
 *     description: Download user's job recommendations as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
    logger.error('Export recommendations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export recommendations',
    });
  }
});

/**
 * @swagger
 * /api/export/user-data:
 *   get:
 *     summary: Export user data to CSV
 *     description: Download complete user profile data as CSV (GDPR compliance)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
    logger.error('Export user data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export user data',
    });
  }
});

/**
 * @swagger
 * /api/export/organization-users:
 *   get:
 *     summary: Export organization users to CSV
 *     description: Download all organization users as CSV (ORG_ADMIN only)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
      logger.error('Export organization users error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to export organization users',
      });
    }
  }
);

/**
 * @swagger
 * /api/export/assessment/{assessmentId}/results:
 *   get:
 *     summary: Export assessment results to CSV
 *     description: Download specific assessment results as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CSV file download
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/assessment/:assessmentId/results',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;

      const csv = await exportAssessmentResultsToCSV(assessmentId);
      const filename = generateCSVFilename(`assessment_results_${assessmentId}`);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      logger.error('Export assessment results error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to export assessment results',
      });
    }
  }
);

/**
 * @swagger
 * /api/export/analytics:
 *   get:
 *     summary: Export analytics to CSV
 *     description: Download user activity analytics as CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
    logger.error('Export analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to export analytics',
    });
  }
});

/**
 * @swagger
 * /api/export/assessment/{assessmentId}/pdf:
 *   post:
 *     summary: Generate assessment PDF report
 *     description: Generate and download assessment PDF (preliminary/investigation/conclusion)
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [preliminary, investigation, conclusion]
 *           default: preliminary
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid report type
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/assessment/:assessmentId/pdf',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { assessmentId } = req.params;
      const { type = 'preliminary' } = req.query;

      // Validate report type
      if (!['preliminary', 'investigation', 'conclusion'].includes(type as string)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid report type. Must be one of: preliminary, investigation, conclusion',
        });
      }

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Fetch assessment to verify access control
      const assessment = await getAssessment(assessmentId);

      if (!assessment) {
        return res.status(404).json({
          status: 'error',
          message: 'Assessment not found',
        });
      }

      // Verify user has access to this assessment
      // Access allowed if: user is the beneficiary OR user is the assigned consultant
      const isOwner = (assessment as any).beneficiary_id === req.user.id;
      const isConsultant = (assessment as any).consultant_id === req.user.id;
      const isAdmin = req.user.role === 'ORG_ADMIN';

      if (!isOwner && !isConsultant && !isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this assessment',
        });
      }

      // Generate PDF
      const pdfBuffer = await generateAssessmentPDF(
        assessmentId,
        req.user.id,
        type as 'preliminary' | 'investigation' | 'conclusion'
      );

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const reportType =
        type === 'preliminary'
          ? 'Preliminary'
          : type === 'investigation'
            ? 'Investigation'
            : 'Conclusion';
      const filename = `Assessment_${reportType}_${assessmentId.slice(0, 8)}_${timestamp}.pdf`;

      // Send PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      logger.error('Export assessment PDF error:', error);

      // Check if error is due to insufficient assessment data
      if (
        (error as Error).message.includes('No assessment found') ||
        (error as Error).message.includes('not found')
      ) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Assessment or required data not found',
        });
      }

      // Check if error is due to access denial
      if ((error as Error).message.includes('Unauthorized')) {
        return res.status(403).json({
          status: 'error',
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this assessment',
        });
      }

      res.status(500).json({
        status: 'error',
        code: 'PDF_GENERATION_ERROR',
        message: 'Failed to generate PDF: ' + ((error as Error).message || 'Unknown error'),
      });
    }
  }
);

/**
 * @swagger
 * /api/export/assessments/summary/pdf:
 *   post:
 *     summary: Generate assessments summary PDF
 *     description: Generate and download PDF summary of all user assessments
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF file download
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/assessments/summary/pdf', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Generate PDF summary of all user assessments
    const pdfBuffer = await generateUserAssessmentsSummary(req.user.id);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Assessments_Summary_${req.user.id.slice(0, 8)}_${timestamp}.pdf`;

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('Export assessments summary PDF error:', error);

    // Check if error is due to missing assessments
    if ((error as Error).message.includes('No assessments found')) {
      return res.status(404).json({
        status: 'error',
        code: 'NOT_FOUND',
        message: 'No assessments found for this user',
      });
    }

    res.status(500).json({
      status: 'error',
      code: 'PDF_GENERATION_ERROR',
      message: 'Failed to generate PDF: ' + ((error as Error).message || 'Unknown error'),
    });
  }
});

export default router;
