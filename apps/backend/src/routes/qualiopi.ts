/**
 * Qualiopi Compliance Module Routes
 * Handles all API endpoints for Qualiopi indicator management, surveys, and reporting
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import QualioptService from '../services/qualioptService.js';
import SatisfactionSurveyService from '../services/satisfactionSurveyService.js';
import DocumentArchiveService from '../services/documentArchiveService.js';
import ComplianceReportService from '../services/complianceReportService.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Schema for updating indicator status
 */
const updateIndicatorSchema = z.object({
  status: z.enum(['COMPLIANT', 'MISSING', 'UNDER_REVIEW']),
  notes: z.string().max(1000).optional(),
});

/**
 * Schema for adding evidence
 */
const addEvidenceSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSize: z.number().positive(),
  fileType: z.string().max(50),
  description: z.string().max(500).optional(),
});

/**
 * Schema for survey response submission
 */
const submitSurveySchema = z.object({
  answers: z.record(
    z.union([
      z.number().min(1).max(10),
      z.string(),
      z.boolean(),
    ])
  ),
});

/**
 * Schema for survey query
 */
const surveyQuerySchema = z.object({
  status: z.enum(['PENDING', 'SENT', 'COMPLETED', 'EXPIRED']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().default(50).optional(),
  offset: z.number().default(0).optional(),
});

/**
 * Schema for document query
 */
const documentQuerySchema = z.object({
  documentType: z.enum(['PRELIMINARY', 'INVESTIGATION', 'CONCLUSION', 'REPORT', 'EVIDENCE', 'OTHER']).optional(),
  bilanId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  limit: z.number().default(50).optional(),
  offset: z.number().default(0).optional(),
});

/**
 * Schema for report generation
 */
const generateReportSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json').optional(),
  includeEvidence: z.boolean().default(false).optional(),
  indicators: z.enum(['all', 'critical']).default('all').optional(),
});

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Require admin or org admin role
 */
const requireAdminRole = requireRole('ADMIN', 'ORG_ADMIN');

/**
 * Get organization ID from authenticated user
 */
const getOrgId = (req: Request): string | null => {
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const orgId = (req as any).user?.organization_id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // ADMIN global can access all organizations (orgId = null)
  if (userRole === 'ADMIN') {
    return orgId || null;
  }

  // ORG_ADMIN must have an organization
  if (!orgId) {
    throw new Error('Organization not found for user');
  }

  return orgId;
};

// ============================================
// QUALIOPI INDICATORS ENDPOINTS
// ============================================

/**
 * GET /api/admin/qualiopi/indicators
 * Get all Qualiopi indicators with status
 */
router.get('/indicators', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const qualioptService = new QualioptService(orgId);

    const indicators = await qualioptService.getIndicators();

    res.json({
      success: true,
      data: indicators,
      count: indicators.length,
    });
  } catch (error: any) {
    logger.error('Error fetching indicators:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch indicators',
    });
  }
});

/**
 * GET /api/admin/qualiopi/indicators/:id
 * Get single indicator with full details
 */
router.get('/indicators/:id', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const indicatorId = parseInt(req.params.id);

    if (isNaN(indicatorId) || indicatorId < 1 || indicatorId > 32) {
      return res.status(400).json({
        success: false,
        error: 'Invalid indicator ID (must be 1-32)',
      });
    }

    const qualioptService = new QualioptService(orgId);
    const details = await qualioptService.getIndicatorDetails(indicatorId);

    res.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    logger.error('Error fetching indicator details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch indicator details',
    });
  }
});

/**
 * PUT /api/admin/qualiopi/indicators/:id
 * Update indicator status
 */
router.put('/indicators/:id', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const indicatorId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(indicatorId) || indicatorId < 1 || indicatorId > 32) {
      return res.status(400).json({
        success: false,
        error: 'Invalid indicator ID (must be 1-32)',
      });
    }

    // Validate request body
    const validationResult = updateIndicatorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.flatten(),
      });
    }

    const { status, notes } = validationResult.data;
    const qualioptService = new QualioptService(orgId);

    const updated = await qualioptService.updateIndicatorStatus(
      indicatorId,
      status,
      notes || '',
      userId
    );

    res.json({
      success: true,
      data: updated,
      message: `Indicator ${indicatorId} status updated to ${status}`,
    });
  } catch (error: any) {
    logger.error('Error updating indicator:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update indicator',
    });
  }
});

/**
 * POST /api/admin/qualiopi/indicators/:id/evidence
 * Add evidence file for indicator
 */
router.post('/indicators/:id/evidence', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const indicatorId = parseInt(req.params.id);
    const userId = (req as any).user?.id;

    if (isNaN(indicatorId) || indicatorId < 1 || indicatorId > 32) {
      return res.status(400).json({
        success: false,
        error: 'Invalid indicator ID (must be 1-32)',
      });
    }

    // Validate request body
    const validationResult = addEvidenceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: validationResult.error.flatten(),
      });
    }

    const { fileName, fileUrl, fileSize, fileType, description } = validationResult.data;
    const qualioptService = new QualioptService(orgId);

    const evidence = await qualioptService.addEvidence(
      indicatorId,
      fileName,
      fileUrl,
      fileSize,
      fileType,
      description || '',
      userId
    );

    res.status(201).json({
      success: true,
      data: evidence,
      message: `Evidence added to indicator ${indicatorId}`,
    });
  } catch (error: any) {
    logger.error('Error adding evidence:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add evidence',
    });
  }
});

/**
 * GET /api/admin/qualiopi/indicators/core
 * Get only core indicators (1, 11, 22)
 */
router.get('/indicators/core', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const qualioptService = new QualioptService(orgId);

    const coreIndicators = await qualioptService.getCoreIndicators();

    res.json({
      success: true,
      data: coreIndicators,
      count: coreIndicators.length,
    });
  } catch (error: any) {
    logger.error('Error fetching core indicators:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch core indicators',
    });
  }
});

/**
 * GET /api/admin/qualiopi/compliance
 * Get compliance percentage and metrics
 */
router.get('/compliance', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const qualioptService = new QualioptService(orgId);

    const metrics = await qualioptService.getCompliancePercentage();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    logger.error('Error fetching compliance metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch compliance metrics',
    });
  }
});

// ============================================
// SATISFACTION SURVEYS ENDPOINTS
// ============================================

/**
 * POST /api/bilans/:bilanId/satisfaction-survey
 * Submit satisfaction survey response
 */
router.post('/bilans/:bilanId/survey', authMiddleware, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const surveyToken = req.body.surveyToken || req.query.token;

    if (!surveyToken) {
      return res.status(400).json({
        success: false,
        error: 'Survey token is required',
      });
    }

    // Validate answers
    const validationResult = submitSurveySchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid survey answers',
        details: validationResult.error.flatten(),
      });
    }

    const { answers } = validationResult.data;
    const surveyService = new SatisfactionSurveyService(orgId);

    await surveyService.submitResponse(surveyToken, answers);

    res.json({
      success: true,
      message: 'Survey response submitted successfully',
    });
  } catch (error: any) {
    logger.error('Error submitting survey:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit survey',
    });
  }
});

/**
 * GET /api/admin/qualiopi/surveys
 * Get survey list and statistics
 */
router.get('/surveys', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    // Parse query parameters
    const queryResult = surveyQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
      });
    }

    const surveyService = new SatisfactionSurveyService(orgId);
    const analytics = await surveyService.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Error fetching surveys:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch surveys',
    });
  }
});

/**
 * GET /api/admin/qualiopi/surveys/analytics
 * Get detailed survey analytics
 */
router.get('/surveys/analytics', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const surveyService = new SatisfactionSurveyService(orgId);

    const analytics = await surveyService.getAnalytics();

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    logger.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics',
    });
  }
});

// ============================================
// DOCUMENT ARCHIVE ENDPOINTS
// ============================================

/**
 * GET /api/admin/qualiopi/documents
 * Get archived documents list
 */
router.get('/documents', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    // Parse query parameters
    const queryResult = documentQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
      });
    }

    const archiveService = new DocumentArchiveService(orgId);
    const documents = await archiveService.getArchivedDocuments(queryResult.data);

    res.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error: any) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch documents',
    });
  }
});

/**
 * GET /api/admin/qualiopi/documents/:id
 * Get document details with access log
 */
router.get('/documents/:id', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const documentId = req.params.id;

    const archiveService = new DocumentArchiveService(orgId);
    const details = await archiveService.getDocumentDetails(documentId);

    res.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    logger.error('Error fetching document details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch document details',
    });
  }
});

/**
 * GET /api/admin/qualiopi/documents/:id/access-log
 * Get document access audit trail
 */
router.get('/documents/:id/access-log', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const documentId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);

    const archiveService = new DocumentArchiveService(orgId);
    const accessLog = await archiveService.getAccessLog(documentId, limit);

    res.json({
      success: true,
      data: accessLog,
      count: accessLog.length,
    });
  } catch (error: any) {
    logger.error('Error fetching access log:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch access log',
    });
  }
});

/**
 * GET /api/admin/qualiopi/archive-stats
 * Get archive statistics
 */
router.get('/archive-stats', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const archiveService = new DocumentArchiveService(orgId);

    const stats = await archiveService.getArchiveStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching archive stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch archive stats',
    });
  }
});

// ============================================
// COMPLIANCE REPORT ENDPOINTS
// ============================================

/**
 * GET /api/admin/qualiopi/compliance-report
 * Generate compliance report
 */
router.get('/compliance-report', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);

    // Parse query parameters
    const queryResult = generateReportSchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
      });
    }

    const { format, includeEvidence } = queryResult.data;
    const reportService = new ComplianceReportService(orgId);

    const report = await reportService.generateReport(includeEvidence);

    // Export in requested format
    let responseData;
    let contentType = 'application/json';

    if (format === 'csv') {
      responseData = reportService.exportAsCSV(report);
      contentType = 'text/csv';
      res.setHeader('Content-Disposition', 'attachment; filename="compliance-report.csv"');
    } else if (format === 'json') {
      responseData = reportService.exportAsJSON(report);
      contentType = 'application/json';
    }
    // TODO: Implement PDF export with pdfkit

    res.setHeader('Content-Type', contentType);
    res.send(responseData);
  } catch (error: any) {
    logger.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate report',
    });
  }
});

/**
 * POST /api/admin/qualiopi/compliance-report/pdf
 * Generate PDF report (async)
 */
router.post('/compliance-report/pdf', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const { includeEvidence } = req.body;

    const reportService = new ComplianceReportService(orgId);
    const report = await reportService.generateReport(includeEvidence);

    // TODO: Implement PDF generation with pdfkit
    // const pdfBuffer = await reportService.generatePDFReport(report);

    res.status(501).json({
      success: false,
      error: 'PDF generation not yet implemented',
      message: 'Use JSON or CSV format for now',
    });
  } catch (error: any) {
    logger.error('Error generating PDF report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PDF report',
    });
  }
});

/**
 * GET /api/admin/qualiopi/audit-log
 * Get Qualiopi audit log
 */
router.get('/audit-log', authMiddleware, requireAdminRole, async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);

    const qualioptService = new QualioptService(orgId);
    const auditLog = await qualioptService.getAuditLog(limit);

    res.json({
      success: true,
      data: auditLog,
      count: auditLog.length,
    });
  } catch (error: any) {
    logger.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch audit log',
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /api/admin/qualiopi/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'Qualiopi module is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

