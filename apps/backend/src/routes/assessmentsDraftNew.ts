/**
 * Assessment Draft Routes - New JSONB-based API endpoints
 * 
 * These routes replace the old question/answer approach with JSONB draft_data
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import {
  getDraftByAssessmentId,
  updateDraftStep,
  saveDraftData,
  getDraftData,
  getDraftCompletionStats,
  getDraftSummary,
  extractAndSaveCompetencies,
  getAssessmentCompetencies,
} from '../services/draftServiceNeon.js';
import { getAssessment, updateAssessment } from '../services/assessmentServiceNeon.js';
import { createAuditLog } from '../services/authFlowServiceNeon.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateDraftStepSchema = z.object({
  step_number: z.number().int().min(1).max(5),
  step_data: z.record(z.string(), z.any()),
});

const saveDraftSchema = z.object({
  draft_data: z.record(z.string(), z.any()),
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * @swagger
 * /api/assessments/{id}/draft:
 *   get:
 *     summary: Get assessment draft data
 *     description: Retrieve JSONB draft data for an assessment (supports 5-step wizard)
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assessment ID
 *     responses:
 *       200:
 *         description: Draft data retrieved successfully
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
 *                     draft_data:
 *                       type: object
 *                     current_step_number:
 *                       type: number
 *                     last_saved_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/draft', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify access
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    const isOwner = assessment.beneficiary_id === req.user.id;
    const isConsultant = assessment.consultant_id === req.user.id;
    const isAdmin = ['ADMIN', 'ORGANIZATION_ADMIN', 'ORG_ADMIN'].includes(req.user.role);

    if (!isOwner && !isConsultant && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access',
      });
    }

    const draft = await getDraftByAssessmentId(id);

    if (!draft) {
      return res.status(200).json({
        status: 'success',
        data: {
          draft_data: {},
          current_step_number: 0,
          last_saved_at: null,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: draft,
    });
  } catch (error) {
    logger.error('Get draft error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch draft',
    });
  }
});

/**
 * @swagger
 * /api/assessments/{id}/draft/step:
 *   put:
 *     summary: Update a specific step in the draft
 *     description: Update step 1-5 in the assessment wizard
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - step_number
 *               - step_data
 *             properties:
 *               step_number:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               step_data:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Step updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/draft/step', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    const validation = updateDraftStepSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues.map((e) => e.message),
      });
    }

    const { step_number, step_data } = validation.data;

    // Verify access (only owner can update)
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    if (assessment.beneficiary_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the assessment owner can update the draft',
      });
    }

    // Update draft step
    const updatedDraft = await updateDraftStep(id, step_number, step_data);

    // Get completion stats
    const stats = await getDraftCompletionStats(id);

    // Update assessment progress
    await updateAssessment(id, {
      current_step: stats.currentStep,
      progress_percentage: stats.completion.percentage,
      status: stats.isComplete ? 'SUBMITTED' : 'IN_PROGRESS',
    });

    // If step 3 (competencies), extract to structured table
    if (step_number === 3 && step_data.competencies) {
      await extractAndSaveCompetencies(id);
    }

    await createAuditLog(
      req.user.id,
      'ASSESSMENT_DRAFT_UPDATED',
      'assessment',
      id,
      { step: step_number },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: `Step ${step_number} updated successfully`,
      data: {
        draft: updatedDraft,
        completion: stats.completion,
        is_complete: stats.isComplete,
      },
    });
  } catch (error) {
    logger.error('Update draft step error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update draft step',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/assessments/{id}/draft:
 *   put:
 *     summary: Save complete draft data
 *     description: Replace entire draft_data JSONB object
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - draft_data
 *             properties:
 *               draft_data:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/draft', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    const validation = saveDraftSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data',
        errors: validation.error.issues.map((e) => e.message),
      });
    }

    const { draft_data } = validation.data;

    // Verify access (only owner can update)
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    if (assessment.beneficiary_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Only the assessment owner can update the draft',
      });
    }

    // Save complete draft
    const updatedDraft = await saveDraftData(id, draft_data);

    // Get completion stats
    const stats = await getDraftCompletionStats(id);

    // Update assessment progress
    await updateAssessment(id, {
      current_step: stats.currentStep,
      progress_percentage: stats.completion.percentage,
      status: stats.isComplete ? 'SUBMITTED' : 'IN_PROGRESS',
    });

    // Extract competencies if present
    if (draft_data.step3 && draft_data.step3.competencies) {
      await extractAndSaveCompetencies(id);
    }

    await createAuditLog(
      req.user.id,
      'ASSESSMENT_DRAFT_SAVED',
      'assessment',
      id,
      null,
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: 'Draft saved successfully',
      data: {
        draft: updatedDraft,
        completion: stats.completion,
        is_complete: stats.isComplete,
      },
    });
  } catch (error) {
    logger.error('Save draft error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save draft',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /api/assessments/{id}/draft/stats:
 *   get:
 *     summary: Get draft completion statistics
 *     description: Retrieve completion percentage and progress for each step
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/draft/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify access
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    const isOwner = assessment.beneficiary_id === req.user.id;
    const isConsultant = assessment.consultant_id === req.user.id;
    const isAdmin = ['ADMIN', 'ORGANIZATION_ADMIN', 'ORG_ADMIN'].includes(req.user.role);

    if (!isOwner && !isConsultant && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access',
      });
    }

    const stats = await getDraftCompletionStats(id);
    const summary = await getDraftSummary(id);

    return res.status(200).json({
      status: 'success',
      data: {
        ...stats,
        summary,
      },
    });
  } catch (error) {
    logger.error('Get draft stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch draft statistics',
    });
  }
});

/**
 * @swagger
 * /api/assessments/{id}/competencies:
 *   get:
 *     summary: Get extracted competencies
 *     description: Retrieve structured competencies extracted from draft step 3
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Competencies retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id/competencies', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify access
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    const isOwner = assessment.beneficiary_id === req.user.id;
    const isConsultant = assessment.consultant_id === req.user.id;
    const isAdmin = ['ADMIN', 'ORGANIZATION_ADMIN', 'ORG_ADMIN'].includes(req.user.role);

    if (!isOwner && !isConsultant && !isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized access',
      });
    }

    const competencies = await getAssessmentCompetencies(id);

    return res.status(200).json({
      status: 'success',
      data: competencies,
    });
  } catch (error) {
    logger.error('Get competencies error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch competencies',
    });
  }
});

/**
 * @swagger
 * /api/assessments/{id}/competencies/extract:
 *   post:
 *     summary: Extract competencies from draft
 *     description: Manually trigger extraction of competencies from draft step 3 data to structured table
 *     tags: [Assessments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Competencies extracted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     extracted_count:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/competencies/extract', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    const { id } = req.params;

    // Verify access (only owner or consultant)
    const assessment = await getAssessment(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assessment not found',
      });
    }

    const isOwner = assessment.beneficiary_id === req.user.id;
    const isConsultant = assessment.consultant_id === req.user.id;

    if (!isOwner && !isConsultant) {
      return res.status(403).json({
        status: 'error',
        message: 'Only owner or consultant can extract competencies',
      });
    }

    const extractedCount = await extractAndSaveCompetencies(id);

    await createAuditLog(
      req.user.id,
      'COMPETENCIES_EXTRACTED',
      'assessment',
      id,
      { count: extractedCount },
      req.ip
    );

    return res.status(200).json({
      status: 'success',
      message: `Extracted ${extractedCount} competencies`,
      data: {
        extracted_count: extractedCount,
      },
    });
  } catch (error) {
    logger.error('Extract competencies error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to extract competencies',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

