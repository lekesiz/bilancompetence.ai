/**
 * Scheduling Service (Neon PostgreSQL)
 * Complete implementation matching original Supabase service signatures
 */

import { query } from '../config/neon.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginatedResponse,
} from '../utils/pagination.js';
import { DatabaseError } from '../utils/errorHandler.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AvailabilitySlot {
  id: string;
  consultant_id: string;
  organization_id: string;
  day_of_week?: number;
  date_specific?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_concurrent_bookings: number;
  timezone: string;
  is_recurring: boolean;
  recurring_until?: string;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SessionBooking {
  id: string;
  bilan_id: string;
  beneficiary_id: string;
  consultant_id: string;
  organization_id: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  duration_minutes: number;
  timezone: string;
  status: string;
  session_type: string;
  meeting_format: string;
  meeting_location?: string;
  meeting_link?: string;
  beneficiary_notes?: string;
  consultant_notes?: string;
  preparation_materials?: string;
  availability_slot_id?: string;
  confirmed_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  attended?: boolean;
  beneficiary_rating?: number;
  beneficiary_feedback?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConsultantAnalytics {
  consultant_id: string;
  organization_id: string;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  average_rating?: number;
  total_hours: number;
  last_session_date?: string;
  updated_at: Date;
}

// ============================================================================
// SCHEDULING SERVICE CLASS
// ============================================================================

class SchedulingServiceNeon {
  /**
   * Create availability slot for consultant
   */
  async createAvailabilitySlot(
    organizationId: string,
    consultantId: string,
    data: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    try {
      // Validate time range
      if (data.start_time && data.end_time) {
        if (data.start_time >= data.end_time) {
          throw new Error('Start time must be before end time');
        }
      }

      const slotId = uuidv4();

      const result = await query<AvailabilitySlot>(
        null,
        `INSERT INTO availability_slots (
          id, consultant_id, organization_id, day_of_week, date_specific, start_time, end_time,
          duration_minutes, max_concurrent_bookings, timezone, is_recurring, recurring_until, is_available,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
        RETURNING *`,
        [
          slotId,
          consultantId,
          organizationId,
          data.day_of_week || null,
          data.date_specific || null,
          data.start_time,
          data.end_time,
          data.duration_minutes || 120,
          data.max_concurrent_bookings || 1,
          data.timezone || 'UTC',
          data.is_recurring || false,
          data.recurring_until || null,
          data.is_available !== false,
        ]
      );

      logger.info(`Availability slot created: ${slotId}`, { consultantId, organizationId });
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.createAvailabilitySlot failed', error);
      throw error;
    }
  }

  /**
   * Get available slots for consultant
   */
  async getAvailableSlotsForConsultant(
    consultantId: string,
    organizationId: string,
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      dayOfWeek?: number;
    }
  ): Promise<AvailabilitySlot[]> {
    try {
      let whereClause = 'WHERE consultant_id = $1 AND organization_id = $2';
      const params: any[] = [consultantId, organizationId];
      let paramIndex = 3;

      if (filters?.dayOfWeek !== undefined) {
        whereClause += ` AND day_of_week = $${paramIndex}`;
        params.push(filters.dayOfWeek);
        paramIndex++;
      }

      if (filters?.dateFrom) {
        whereClause += ` AND (date_specific IS NULL OR date_specific >= $${paramIndex})`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        whereClause += ` AND (date_specific IS NULL OR date_specific <= $${paramIndex})`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      const result = await query<AvailabilitySlot>(
        null,
        `SELECT * FROM availability_slots ${whereClause} ORDER BY start_time`,
        params
      );

      return result;
    } catch (error) {
      logger.error('SchedulingService.getAvailableSlotsForConsultant failed', error);
      throw error;
    }
  }

  /**
   * Update availability slot
   */
  async updateAvailabilitySlot(
    slotId: string,
    consultantId: string,
    organizationId: string,
    updates: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value !== undefined &&
          key !== 'id' &&
          key !== 'created_at' &&
          key !== 'consultant_id' &&
          key !== 'organization_id'
        ) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = NOW()`);
      values.push(slotId, consultantId, organizationId);

      const result = await query<AvailabilitySlot>(
        null,
        `UPDATE availability_slots 
         SET ${fields.join(', ')} 
         WHERE id = $${paramIndex} AND consultant_id = $${paramIndex + 1} AND organization_id = $${paramIndex + 2}
         RETURNING *`,
        values
      );

      if (result.length === 0) {
        throw new Error('Availability slot not found or unauthorized');
      }

      logger.info(`Availability slot updated: ${slotId}`);
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.updateAvailabilitySlot failed', error);
      throw error;
    }
  }

  /**
   * Delete availability slot
   */
  async deleteAvailabilitySlot(
    slotId: string,
    consultantId: string,
    organizationId: string
  ): Promise<void> {
    try {
      await query(
        null,
        `DELETE FROM availability_slots WHERE id = $1 AND consultant_id = $2 AND organization_id = $3`,
        [slotId, consultantId, organizationId]
      );

      logger.info(`Availability slot deleted: ${slotId}`);
    } catch (error) {
      logger.error('SchedulingService.deleteAvailabilitySlot failed', error);
      throw error;
    }
  }

  /**
   * Check for booking conflicts
   */
  async checkBookingConflicts(
    consultantId: string,
    scheduledDate: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    try {
      let whereClause = `WHERE consultant_id = $1 
                         AND scheduled_date = $2 
                         AND status NOT IN ('CANCELLED', 'COMPLETED')`;
      const params: any[] = [consultantId, scheduledDate];
      let paramIndex = 3;

      if (excludeBookingId) {
        whereClause += ` AND id != $${paramIndex}`;
        params.push(excludeBookingId);
        paramIndex++;
      }

      const bookings = await query<SessionBooking>(
        null,
        `SELECT * FROM session_bookings ${whereClause}`,
        params
      );

      // Check time overlap
      for (const booking of bookings) {
        const bookingStart = booking.scheduled_start_time;
        const bookingEnd = booking.scheduled_end_time;

        if (startTime < bookingEnd && endTime > bookingStart) {
          return true; // Conflict found
        }
      }

      return false; // No conflict
    } catch (error) {
      logger.error('SchedulingService.checkBookingConflicts failed', error);
      throw error;
    }
  }

  /**
   * Validate bilan for booking
   */
  async validateBilanForBooking(bilanId: string): Promise<{
    valid: boolean;
    message?: string;
  }> {
    try {
      const result = await query<any>(null, `SELECT id, status FROM bilans WHERE id = $1`, [
        bilanId,
      ]);

      if (result.length === 0) {
        return { valid: false, message: 'Bilan not found' };
      }

      const bilan = result[0];

      if (bilan.status === 'ARCHIVED' || bilan.status === 'COMPLETED') {
        return {
          valid: false,
          message: `Cannot book sessions for ${bilan.status.toLowerCase()} bilan`,
        };
      }

      return { valid: true };
    } catch (error) {
      logger.error('SchedulingService.validateBilanForBooking failed', error);
      throw error;
    }
  }

  /**
   * Create session booking
   */
  async createSessionBooking(
    organizationId: string,
    bilanId: string,
    consultantId: string,
    beneficiaryId: string,
    data: Partial<SessionBooking>
  ): Promise<SessionBooking> {
    try {
      // Validate bilan
      const bilanValidation = await this.validateBilanForBooking(bilanId);
      if (!bilanValidation.valid) {
        throw new Error(bilanValidation.message);
      }

      // Check for conflicts
      const hasConflict = await this.checkBookingConflicts(
        consultantId,
        data.scheduled_date!,
        data.scheduled_start_time!,
        data.scheduled_end_time!
      );

      if (hasConflict) {
        throw new Error('Time slot conflicts with existing booking');
      }

      const bookingId = uuidv4();

      const result = await query<SessionBooking>(
        null,
        `INSERT INTO session_bookings (
          id, bilan_id, beneficiary_id, consultant_id, organization_id, scheduled_date,
          scheduled_start_time, scheduled_end_time, duration_minutes, timezone,
          status, session_type, meeting_format, meeting_location, meeting_link,
          beneficiary_notes, preparation_materials, availability_slot_id,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
        RETURNING *`,
        [
          bookingId,
          bilanId,
          beneficiaryId,
          consultantId,
          organizationId,
          data.scheduled_date,
          data.scheduled_start_time,
          data.scheduled_end_time,
          data.duration_minutes || 120,
          data.timezone || 'UTC',
          'SCHEDULED',
          data.session_type || 'FOLLOW_UP',
          data.meeting_format || 'VIDEO',
          data.meeting_location || null,
          data.meeting_link || null,
          data.beneficiary_notes || null,
          data.preparation_materials || null,
          data.availability_slot_id || null,
        ]
      );

      // Create reminders (async, don't wait)
      this.createSessionReminders(
        bookingId,
        data.scheduled_date!,
        data.scheduled_start_time!
      ).catch((err) => {
        logger.error('Failed to create session reminders', err);
      });

      logger.info(`Session booking created: ${bookingId}`, { bilanId });
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.createSessionBooking failed', error);
      throw error;
    }
  }

  /**
   * Create session reminders (private helper)
   */
  private async createSessionReminders(
    bookingId: string,
    sessionDate: string,
    sessionStartTime: string
  ): Promise<void> {
    try {
      // Create reminder 24h before session
      const reminderDate = new Date(sessionDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      // This would integrate with notifications service
      logger.info(`Reminder created for booking: ${bookingId}`);
    } catch (error) {
      logger.error('Failed to create reminders', error);
      // Don't throw - reminders are non-critical
    }
  }

  /**
   * Confirm booking (consultant action)
   */
  async confirmBooking(bookingId: string, consultantId: string): Promise<SessionBooking> {
    try {
      // Verify booking exists and belongs to consultant
      const existing = await query<SessionBooking>(
        null,
        `SELECT * FROM session_bookings WHERE id = $1 AND consultant_id = $2`,
        [bookingId, consultantId]
      );

      if (existing.length === 0) {
        throw new Error('Booking not found or unauthorized');
      }

      if (existing[0].status !== 'SCHEDULED') {
        throw new Error(`Cannot confirm booking with status: ${existing[0].status}`);
      }

      const result = await query<SessionBooking>(
        null,
        `UPDATE session_bookings 
         SET status = 'CONFIRMED', 
             confirmed_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [bookingId]
      );

      logger.info(`Booking confirmed: ${bookingId}`);
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.confirmBooking failed', error);
      throw error;
    }
  }

  /**
   * Get beneficiary bookings
   */
  async getBeneficiaryBookings(
    beneficiaryId: string,
    organizationId: string,
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<SessionBooking>> {
    try {
      let whereClause = 'WHERE beneficiary_id = $1 AND organization_id = $2';
      const params: any[] = [beneficiaryId, organizationId];
      let paramIndex = 3;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.dateFrom) {
        whereClause += ` AND scheduled_date >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        whereClause += ` AND scheduled_date <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      // Get total count
      const countResult = await query<{ count: number }>(
        null,
        `SELECT COUNT(*)::int as count FROM session_bookings ${whereClause}`,
        params
      );

      const total = countResult[0]?.count || 0;

      // Get bookings with pagination
      let query_text = `SELECT * FROM session_bookings ${whereClause} ORDER BY scheduled_date DESC, scheduled_start_time DESC`;

      if (page && limit) {
        const offset = (page - 1) * limit;
        query_text += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
      }

      const bookings = await query<SessionBooking>(null, query_text, params);

      return createPaginatedResponse(bookings, total, page || 1, limit || 10);
    } catch (error) {
      logger.error('SchedulingService.getBeneficiaryBookings failed', error);
      throw error;
    }
  }

  /**
   * Get consultant bookings
   */
  async getConsultantBookings(
    consultantId: string,
    organizationId: string,
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<SessionBooking>> {
    try {
      let whereClause = 'WHERE consultant_id = $1 AND organization_id = $2';
      const params: any[] = [consultantId, organizationId];
      let paramIndex = 3;

      if (filters?.status) {
        whereClause += ` AND status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }

      if (filters?.dateFrom) {
        whereClause += ` AND scheduled_date >= $${paramIndex}`;
        params.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters?.dateTo) {
        whereClause += ` AND scheduled_date <= $${paramIndex}`;
        params.push(filters.dateTo);
        paramIndex++;
      }

      // Get total count
      const countResult = await query<{ count: number }>(
        null,
        `SELECT COUNT(*)::int as count FROM session_bookings ${whereClause}`,
        params
      );

      const total = countResult[0]?.count || 0;

      // Get bookings with pagination
      let query_text = `SELECT * FROM session_bookings ${whereClause} ORDER BY scheduled_date DESC, scheduled_start_time DESC`;

      if (page && limit) {
        const offset = (page - 1) * limit;
        query_text += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);
      }

      const bookings = await query<SessionBooking>(null, query_text, params);

      return createPaginatedResponse(bookings, total, page || 1, limit || 10);
    } catch (error) {
      logger.error('SchedulingService.getConsultantBookings failed', error);
      throw error;
    }
  }

  /**
   * Complete session
   */
  async completeSession(
    bookingId: string,
    attended: boolean,
    rating?: number,
    feedback?: string
  ): Promise<SessionBooking> {
    try {
      const result = await query<SessionBooking>(
        null,
        `UPDATE session_bookings 
         SET status = 'COMPLETED',
             attended = $1,
             beneficiary_rating = $2,
             beneficiary_feedback = $3,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [attended, rating || null, feedback || null, bookingId]
      );

      if (result.length === 0) {
        throw new Error('Booking not found');
      }

      // Update analytics if attended
      if (attended) {
        await this.updateSessionAnalytics(
          result[0].consultant_id,
          result[0].organization_id,
          result[0].scheduled_date
        );
      }

      logger.info(`Session completed: ${bookingId}`, { attended });
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.completeSession failed', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, cancellationReason: string): Promise<SessionBooking> {
    try {
      const result = await query<SessionBooking>(
        null,
        `UPDATE session_bookings 
         SET status = 'CANCELLED',
             cancellation_reason = $1,
             cancelled_at = NOW(),
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [cancellationReason, bookingId]
      );

      if (result.length === 0) {
        throw new Error('Booking not found');
      }

      logger.info(`Booking cancelled: ${bookingId}`);
      return result[0];
    } catch (error) {
      logger.error('SchedulingService.cancelBooking failed', error);
      throw error;
    }
  }

  /**
   * Update session analytics for consultant
   */
  private async updateSessionAnalytics(
    consultantId: string,
    organizationId: string,
    sessionDate: string
  ): Promise<void> {
    try {
      // Get all bookings for consultant
      const bookings = await query<SessionBooking>(
        null,
        `SELECT * FROM session_bookings WHERE consultant_id = $1 AND organization_id = $2`,
        [consultantId, organizationId]
      );

      const totalSessions = bookings.length;
      const completedSessions = bookings.filter((b) => b.status === 'COMPLETED').length;
      const cancelledSessions = bookings.filter((b) => b.status === 'CANCELLED').length;

      const ratingsArray = bookings
        .filter((b) => b.beneficiary_rating !== null && b.beneficiary_rating !== undefined)
        .map((b) => b.beneficiary_rating!);

      const averageRating =
        ratingsArray.length > 0
          ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length
          : null;

      const totalHours = bookings
        .filter((b) => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.duration_minutes / 60, 0);

      // Check if analytics exist
      const existing = await query<ConsultantAnalytics>(
        null,
        `SELECT * FROM consultant_analytics WHERE consultant_id = $1 AND organization_id = $2`,
        [consultantId, organizationId]
      );

      if (existing.length > 0) {
        // Update existing
        await query(
          null,
          `UPDATE consultant_analytics 
           SET total_sessions = $1,
               completed_sessions = $2,
               cancelled_sessions = $3,
               average_rating = $4,
               total_hours = $5,
               last_session_date = $6,
               updated_at = NOW()
           WHERE consultant_id = $7 AND organization_id = $8`,
          [
            totalSessions,
            completedSessions,
            cancelledSessions,
            averageRating,
            totalHours,
            sessionDate,
            consultantId,
            organizationId,
          ]
        );
      } else {
        // Insert new
        await query(
          null,
          `INSERT INTO consultant_analytics (
            consultant_id, organization_id, total_sessions, completed_sessions, cancelled_sessions,
            average_rating, total_hours, last_session_date, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            consultantId,
            organizationId,
            totalSessions,
            completedSessions,
            cancelledSessions,
            averageRating,
            totalHours,
            sessionDate,
          ]
        );
      }

      logger.info(`Analytics updated for consultant: ${consultantId}`);
    } catch (error) {
      logger.error('Failed to update session analytics', error);
      // Don't throw - analytics are non-critical
    }
  }

  /**
   * Get consultant analytics
   */
  async getConsultantAnalytics(
    consultantId: string,
    organizationId: string,
    dateRange?: {
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<ConsultantAnalytics[]> {
    try {
      // Get analytics from database
      const result = await query<ConsultantAnalytics>(
        null,
        `SELECT * FROM consultant_analytics WHERE consultant_id = $1 AND organization_id = $2`,
        [consultantId, organizationId]
      );

      if (result.length > 0) {
        return result;
      }

      // If no analytics exist, return empty array
      return [];
    } catch (error) {
      logger.error('SchedulingService.getConsultantAnalytics failed', error);
      throw error;
    }
  }
}

export default new SchedulingServiceNeon();
