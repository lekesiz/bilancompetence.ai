import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  grantConsent,
  getConsent,
  hasConsent,
  getUserConsents,
  withdrawConsent,
  getConsentLog,
  grantMultipleConsents,
  getConsentStatistics,
} from '../services/consentServiceNeon.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { getErrorMessage, getErrorStatusCode } from '../types/errors.js';

const router = Router();

// Validation schemas
const grantConsentSchema = z.object({
  consent_type: z.enum([
    'essential',
    'analytics',
    'marketing',
    'preferences',
    'third_party',
    'data_processing',
    'profiling',
  ]),
  granted: z.boolean(),
  consent_version: z.string().optional(),
  purpose: z.string().optional(),
  legal_basis: z.string().optional(),
});

const grantMultipleConsentsSchema = z.object({
  consents: z.array(
    z.object({
      consent_type: z.enum([
        'essential',
        'analytics',
        'marketing',
        'preferences',
        'third_party',
        'data_processing',
        'profiling',
      ]),
      granted: z.boolean(),
      purpose: z.string().optional(),
      legal_basis: z.string().optional(),
    })
  ),
  consent_version: z.string().optional(),
});

/**
 * @swagger
 * /api/consent:
 *   post:
 *     summary: Grant or withdraw consent
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consent_type
 *               - granted
 *             properties:
 *               consent_type:
 *                 type: string
 *                 enum: [essential, analytics, marketing, preferences, third_party, data_processing, profiling]
 *               granted:
 *                 type: boolean
 *               consent_version:
 *                 type: string
 *               purpose:
 *                 type: string
 *               legal_basis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Consent updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const validation = grantConsentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.error.errors,
      });
    }

    const { consent_type, granted, consent_version, purpose, legal_basis } = validation.data;

    const consent = await grantConsent(userId, {
      consentType: consent_type,
      granted,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || undefined,
      consentVersion: consent_version,
      purpose,
      legalBasis: legal_basis,
    });

    return res.status(200).json({
      status: 'success',
      message: granted ? 'Consent granted' : 'Consent withdrawn',
      data: {
        consent: {
          id: consent.id,
          consent_type: consent.consent_type,
          granted: consent.granted,
          granted_at: consent.granted_at,
          withdrawn_at: consent.withdrawn_at,
          consent_version: consent.consent_version,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Grant consent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent/multiple:
 *   post:
 *     summary: Grant or withdraw multiple consents at once
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.post('/multiple', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const validation = grantMultipleConsentsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: validation.error.errors,
      });
    }

    const { consents, consent_version } = validation.data;

    const results = await grantMultipleConsents(
      userId,
      consents.map((c) => ({
        consentType: c.consent_type,
        granted: c.granted,
        purpose: c.purpose,
        legalBasis: c.legal_basis,
      })),
      req.ip,
      req.get('user-agent') || undefined,
      consent_version
    );

    return res.status(200).json({
      status: 'success',
      message: 'Consents updated successfully',
      data: {
        consents: results.map((c) => ({
          id: c.id,
          consent_type: c.consent_type,
          granted: c.granted,
          granted_at: c.granted_at,
          withdrawn_at: c.withdrawn_at,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Grant multiple consents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update consents',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent:
 *   get:
 *     summary: Get all user consents
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const consents = await getUserConsents(userId);

    return res.status(200).json({
      status: 'success',
      data: {
        consents: consents.map((c) => ({
          id: c.id,
          consent_type: c.consent_type,
          granted: c.granted,
          granted_at: c.granted_at,
          withdrawn_at: c.withdrawn_at,
          consent_version: c.consent_version,
          purpose: c.purpose,
          legal_basis: c.legal_basis,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Get consents error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get consents',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent/:type:
 *   get:
 *     summary: Check if user has specific consent
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const consentType = req.params.type;

    const consent = await getConsent(userId, consentType);
    const hasGranted = await hasConsent(userId, consentType);

    return res.status(200).json({
      status: 'success',
      data: {
        consent_type: consentType,
        granted: hasGranted,
        consent: consent
          ? {
              id: consent.id,
              granted_at: consent.granted_at,
              withdrawn_at: consent.withdrawn_at,
              consent_version: consent.consent_version,
            }
          : null,
      },
    });
  } catch (error: unknown) {
    logger.error('Get consent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent/:type:
 *   delete:
 *     summary: Withdraw consent
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const consentType = req.params.type;

    const consent = await withdrawConsent(
      userId,
      consentType,
      req.ip,
      req.get('user-agent') || undefined
    );

    if (!consent) {
      return res.status(404).json({
        status: 'error',
        message: 'Consent not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Consent withdrawn successfully',
      data: {
        consent: {
          id: consent.id,
          consent_type: consent.consent_type,
          granted: consent.granted,
          withdrawn_at: consent.withdrawn_at,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Withdraw consent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to withdraw consent',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent/log:
 *   get:
 *     summary: Get consent history/audit log
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/log', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await getConsentLog(userId, limit);

    return res.status(200).json({
      status: 'success',
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          consent_type: log.consent_type,
          action: log.action,
          previous_value: log.previous_value,
          new_value: log.new_value,
          created_at: log.created_at,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Get consent log error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get consent log',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * @swagger
 * /api/consent/statistics:
 *   get:
 *     summary: Get consent statistics (Admin only)
 *     tags: [Consent]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'ORG_ADMIN') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin role required.',
      });
    }

    const statistics = await getConsentStatistics();

    return res.status(200).json({
      status: 'success',
      data: {
        statistics,
      },
    });
  } catch (error: unknown) {
    logger.error('Get consent statistics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get consent statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

