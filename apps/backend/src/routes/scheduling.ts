/**
 * Scheduling/Appointment System Routes
 * Handles all API endpoints for availability management, session booking, and appointment tracking
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import SchedulingService from '../services/schedulingServiceNeon.js';
import { logger } from '../utils/logger.js';

const router = Router();

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * Schema for creating availability slot
 */
const createAvailabilitySlotSchema = z.object({
  day_of_week: z.number().min(0).max(6).optional(), // 0=Monday, 6=Sunday
  date_specific: z.string().date().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/), // HH:MM or HH:MM:SS
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  duration_minutes: z.number().positive().default(120).optional(),
  max_concurrent_bookings: z.number().positive().default(1).optional(),
  timezone: z.string().default('UTC').optional(),
  is_recurring: z.boolean().default(false).optional(),
  recurring_until: z.string().date().optional(),
});

/**
 * Schema for updating availability slot
 */
const updateAvailabilitySlotSchema = createAvailabilitySlotSchema.partial();

/**
 * Schema for creating session booking
 */
const createSessionBookingSchema = z.object({
  bilan_id: z.string().uuid(),
  consultant_id: z.string().uuid(),
  scheduled_date: z.string().date(),
  scheduled_start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  scheduled_end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  duration_minutes: z.number().positive().default(120).optional(),
  timezone: z.string().default('UTC').optional(),
  session_type: z
    .enum(['INITIAL_MEETING', 'FOLLOW_UP', 'REVIEW', 'FINAL'])
    .default('FOLLOW_UP')
    .optional(),
  meeting_format: z.enum(['IN_PERSON', 'VIDEO', 'PHONE']).default('VIDEO').optional(),
  meeting_location: z.string().max(255).optional(),
  meeting_link: z.string().url().optional(),
  beneficiary_notes: z.string().optional(),
  preparation_materials: z.string().optional(),
  availability_slot_id: z.string().uuid().optional(),
});

/**
 * Schema for confirming a booking
 */
const confirmBookingSchema = z.object({
  notes: z.string().max(500).optional(),
});

/**
 * Schema for completing a session
 */
const completeSessionSchema = z.object({
  attended: z.boolean(),
  beneficiary_rating: z.number().min(1).max(5).optional(),
  beneficiary_feedback: z.string().max(1000).optional(),
});

/**
 * Schema for cancelling a booking
 */
const cancelBookingSchema = z.object({
  cancellation_reason: z.string().min(1).max(500),
});

/**
 * Schema for availability query parameters
 */
const availabilityQuerySchema = z.object({
  day_of_week: z
    .string()
    .transform((v) => parseInt(v))
    .optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  limit: z
    .string()
    .transform((v) => parseInt(v))
    .default('50')
    .optional(),
  offset: z
    .string()
    .transform((v) => parseInt(v))
    .default('0')
    .optional(),
});

/**
 * Schema for booking query parameters
 */
const bookingQuerySchema = z.object({
  status: z.string().optional(),
  date_from: z.string().date().optional(),
  date_to: z.string().date().optional(),
  limit: z
    .string()
    .transform((v) => parseInt(v))
    .default('50')
    .optional(),
  offset: z
    .string()
    .transform((v) => parseInt(v))
    .default('0')
    .optional(),
});

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Extract organization ID from user context
 */
const getOrganizationId = async (req: Request): Promise<string> => {
  // This would typically come from auth context/session
  // For now, we expect it from headers or can extract from user roles
  const organizationId = req.headers['x-organization-id'] as string;
  if (!organizationId) {
    throw new Error('Organization ID is required');
  }
  return organizationId;
};

// ============================================
// AVAILABILITY SLOTS ROUTES
// ============================================

/**
 * @swagger
 * /api/scheduling/availability:
 *   get:
 *     summary: Get consultant availability slots
 *     description: Retrieve available time slots for scheduling appointments with consultants
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: consultant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by consultant ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for availability search (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for availability search (YYYY-MM-DD)
 *       - in: query
 *         name: day_of_week
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: Filter by day of week (0=Monday, 6=Sunday)
 *     responses:
 *       200:
 *         description: List of available time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       consultant_id:
 *                         type: string
 *                         format: uuid
 *                       start_time:
 *                         type: string
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         example: "11:00"
 *                       date:
 *                         type: string
 *                         format: date
 *                       is_booked:
 *                         type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/availability', authMiddleware, async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrganizationId(req);
    const consultantId = (req as any).user?.id;

    if (!consultantId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate query parameters
    const queryParams = availabilityQuerySchema.safeParse(req.query);
    if (!queryParams.success) {
      return res
        .status(400)
        .json({ error: 'Invalid query parameters', details: queryParams.error });
    }

    const slots = await SchedulingService.getAvailableSlotsForConsultant(
      consultantId,
      organizationId,
      {
        dayOfWeek: queryParams.data.day_of_week,
        dateFrom: queryParams.data.date_from,
        dateTo: queryParams.data.date_to,
      }
    );

    res.json({
      success: true,
      data: slots,
      total: slots.length,
    });
  } catch (error) {
    logger.error('GET /api/scheduling/availability failed', error);
    res.status(500).json({ error: 'Failed to fetch availability slots' });
  }
});

/**
 * POST /api/scheduling/availability
 * Create a new availability slot
 */
router.post(
  '/availability',
  authMiddleware,
  requireRole('CONSULTANT', 'ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const consultantId = (req as any).user?.id;

      if (!consultantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const validation = createAvailabilitySlotSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request body', details: validation.error });
      }

      const slot = await SchedulingService.createAvailabilitySlot(
        organizationId,
        consultantId,
        validation.data
      );

      res.status(201).json({
        success: true,
        data: slot,
        message: 'Availability slot created successfully',
      });
    } catch (error) {
      logger.error('POST /api/scheduling/availability failed', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create availability slot';
      res.status(400).json({ error: errorMessage });
    }
  }
);

/**
 * PUT /api/scheduling/availability/:slotId
 * Update an availability slot
 */
router.put(
  '/availability/:slotId',
  authMiddleware,
  requireRole('CONSULTANT', 'ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { slotId } = req.params;

      // Validate request body
      const validation = updateAvailabilitySlotSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request body', details: validation.error });
      }

      const { supabase } = await import('../config/supabase.js');

      // Verify ownership
      const { data: slot, error: fetchError } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('id', slotId)
        .eq('organization_id', organizationId)
        .single();

      if (fetchError || !slot) {
        return res.status(404).json({ error: 'Availability slot not found' });
      }

      const { data: updatedSlot, error } = await supabase
        .from('availability_slots')
        .update({
          ...validation.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: updatedSlot,
        message: 'Availability slot updated successfully',
      });
    } catch (error) {
      logger.error(`PUT /api/scheduling/availability/${req.params.slotId} failed`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update availability slot';
      res.status(400).json({ error: errorMessage });
    }
  }
);

/**
 * DELETE /api/scheduling/availability/:slotId
 * Delete (soft delete) an availability slot
 */
router.delete(
  '/availability/:slotId',
  authMiddleware,
  requireRole('CONSULTANT', 'ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { slotId } = req.params;

      const { supabase } = await import('../config/supabase.js');

      // Verify ownership
      const { data: slot, error: fetchError } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('id', slotId)
        .eq('organization_id', organizationId)
        .single();

      if (fetchError || !slot) {
        return res.status(404).json({ error: 'Availability slot not found' });
      }

      const { error } = await supabase
        .from('availability_slots')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId);

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Availability slot deleted successfully',
      });
    } catch (error) {
      logger.error(`DELETE /api/scheduling/availability/${req.params.slotId} failed`, error);
      res.status(500).json({ error: 'Failed to delete availability slot' });
    }
  }
);

// ============================================
// SESSION BOOKING ROUTES
// ============================================

/**
 * GET /api/scheduling/availability/:consultantId/slots
 * Get available slots for a specific consultant (for beneficiary booking)
 */
router.get(
  '/availability/:consultantId/slots',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { consultantId } = req.params;

      // Validate query parameters
      const queryParams = availabilityQuerySchema.safeParse(req.query);
      if (!queryParams.success) {
        return res
          .status(400)
          .json({ error: 'Invalid query parameters', details: queryParams.error });
      }

      const slots = await SchedulingService.getAvailableSlotsForConsultant(
        consultantId,
        organizationId,
        {
          dayOfWeek: queryParams.data.day_of_week,
          dateFrom: queryParams.data.date_from,
          dateTo: queryParams.data.date_to,
        }
      );

      res.json({
        success: true,
        data: slots,
        total: slots.length,
      });
    } catch (error) {
      logger.error(
        `GET /api/scheduling/availability/${req.params.consultantId}/slots failed`,
        error
      );
      res.status(500).json({ error: 'Failed to fetch available slots' });
    }
  }
);

/**
 * POST /api/scheduling/bookings
 * Create a new session booking
 */
router.post('/bookings', authMiddleware, async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrganizationId(req);
    const beneficiaryId = (req as any).user?.id;

    if (!beneficiaryId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validation = createSessionBookingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validation.error });
    }

    const booking = await SchedulingService.createSessionBooking(
      organizationId,
      validation.data.bilan_id,
      validation.data.consultant_id,
      beneficiaryId,
      validation.data
    );

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Session booking created successfully',
    });
  } catch (error) {
    logger.error('POST /api/scheduling/bookings failed', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create session booking';
    res.status(400).json({ error: errorMessage });
  }
});

/**
 * GET /api/scheduling/bookings/:bilanId
 * Get all bookings for a specific bilan
 */
router.get('/bookings/:bilanId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrganizationId(req);
    const beneficiaryId = (req as any).user?.id;
    const { bilanId } = req.params;

    // Validate query parameters
    const queryParams = bookingQuerySchema.safeParse(req.query);
    if (!queryParams.success) {
      return res
        .status(400)
        .json({ error: 'Invalid query parameters', details: queryParams.error });
    }

    const bookings = await SchedulingService.getBeneficiaryBookings(beneficiaryId, organizationId, {
      status: queryParams.data.status,
      dateFrom: queryParams.data.date_from,
      dateTo: queryParams.data.date_to,
    });

    // Filter by bilan ID - Handle union type
    const bookingList = Array.isArray(bookings) ? bookings : bookings.data;
    const bilanBookings = bookingList.filter((b) => b.bilan_id === bilanId);

    res.json({
      success: true,
      data: bilanBookings,
      total: bilanBookings.length,
    });
  } catch (error) {
    logger.error(`GET /api/scheduling/bookings/${req.params.bilanId} failed`, error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * GET /api/scheduling/bookings/beneficiary/:beneficiaryId
 * Get all bookings for a beneficiary
 */
router.get(
  '/beneficiary/:beneficiaryId/bookings',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { beneficiaryId } = req.params;

      // Validate query parameters
      const queryParams = bookingQuerySchema.safeParse(req.query);
      if (!queryParams.success) {
        return res
          .status(400)
          .json({ error: 'Invalid query parameters', details: queryParams.error });
      }

      const bookings = await SchedulingService.getBeneficiaryBookings(
        beneficiaryId,
        organizationId,
        {
          status: queryParams.data.status,
          dateFrom: queryParams.data.date_from,
          dateTo: queryParams.data.date_to,
        }
      );

      // Handle union type for response
      const bookingList = Array.isArray(bookings) ? bookings : bookings.data;
      const total = Array.isArray(bookings)
        ? bookings.length
        : (bookings as any).count || bookingList.length;

      res.json({
        success: true,
        data: bookingList,
        total,
      });
    } catch (error) {
      logger.error(
        `GET /api/scheduling/beneficiary/${req.params.beneficiaryId}/bookings failed`,
        error
      );
      res.status(500).json({ error: 'Failed to fetch beneficiary bookings' });
    }
  }
);

/**
 * GET /api/scheduling/consultant/:consultantId/bookings
 * Get all bookings for a consultant
 */
router.get(
  '/consultant/:consultantId/bookings',
  authMiddleware,
  requireRole('CONSULTANT', 'ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { consultantId } = req.params;

      // Validate query parameters
      const queryParams = bookingQuerySchema.safeParse(req.query);
      if (!queryParams.success) {
        return res
          .status(400)
          .json({ error: 'Invalid query parameters', details: queryParams.error });
      }

      const bookings = await SchedulingService.getConsultantBookings(consultantId, organizationId, {
        status: queryParams.data.status,
        dateFrom: queryParams.data.date_from,
        dateTo: queryParams.data.date_to,
      });

      // Handle union type for response
      const bookingList = Array.isArray(bookings) ? bookings : bookings.data;
      const total = Array.isArray(bookings)
        ? bookings.length
        : (bookings as any).count || bookingList.length;

      res.json({
        success: true,
        data: bookingList,
        total,
      });
    } catch (error) {
      logger.error(
        `GET /api/scheduling/consultant/${req.params.consultantId}/bookings failed`,
        error
      );
      res.status(500).json({ error: 'Failed to fetch consultant bookings' });
    }
  }
);

/**
 * PUT /api/scheduling/bookings/:bookingId/confirm
 * Confirm a booking (consultant action)
 */
router.put(
  '/bookings/:bookingId/confirm',
  authMiddleware,
  requireRole('CONSULTANT', 'ORG_ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const consultantId = (req as any).user?.id;
      const { bookingId } = req.params;

      if (!consultantId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate request body
      const validation = confirmBookingSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: 'Invalid request body', details: validation.error });
      }

      const booking = await SchedulingService.confirmBooking(bookingId, consultantId);

      res.json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully',
      });
    } catch (error) {
      logger.error(`PUT /api/scheduling/bookings/${req.params.bookingId}/confirm failed`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm booking';
      res.status(400).json({ error: errorMessage });
    }
  }
);

/**
 * PUT /api/scheduling/bookings/:bookingId/complete
 * Complete a session
 */
router.put('/bookings/:bookingId/complete', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    // Validate request body
    const validation = completeSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validation.error });
    }

    const booking = await SchedulingService.completeSession(
      bookingId,
      validation.data.attended,
      validation.data.beneficiary_rating,
      validation.data.beneficiary_feedback
    );

    res.json({
      success: true,
      data: booking,
      message: 'Session completed successfully',
    });
  } catch (error) {
    logger.error(`PUT /api/scheduling/bookings/${req.params.bookingId}/complete failed`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete session';
    res.status(400).json({ error: errorMessage });
  }
});

/**
 * PUT /api/scheduling/bookings/:bookingId/cancel
 * Cancel a booking
 */
router.put('/bookings/:bookingId/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    // Validate request body
    const validation = cancelBookingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validation.error });
    }

    const booking = await SchedulingService.cancelBooking(
      bookingId,
      validation.data.cancellation_reason
    );

    res.json({
      success: true,
      data: booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    logger.error(`PUT /api/scheduling/bookings/${req.params.bookingId}/cancel failed`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel booking';
    res.status(400).json({ error: errorMessage });
  }
});

/**
 * GET /api/scheduling/analytics/consultant/:consultantId
 * Get session analytics for a consultant
 */
router.get(
  '/analytics/consultant/:consultantId',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const organizationId = await getOrganizationId(req);
      const { consultantId } = req.params;

      // Parse date range from query
      const dateFrom = (req.query.date_from as string) || undefined;
      const dateTo = (req.query.date_to as string) || undefined;

      const analytics = await SchedulingService.getConsultantAnalytics(
        consultantId,
        organizationId,
        {
          dateFrom,
          dateTo,
        }
      );

      res.json({
        success: true,
        data: analytics,
        total: analytics.length,
      });
    } catch (error) {
      logger.error(
        `GET /api/scheduling/analytics/consultant/${req.params.consultantId} failed`,
        error
      );
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

export default router;
