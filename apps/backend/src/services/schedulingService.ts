/**
 * Scheduling Service
 * Handles all business logic for appointment scheduling, availability management, and session booking
 */

import { supabase } from './supabaseService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface AvailabilitySlot {
  id: string;
  consultant_id: string;
  organization_id: string;
  day_of_week?: number; // 0=Monday, 6=Sunday
  date_specific?: string; // Date for one-time slots
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_concurrent_bookings: number;
  timezone: string;
  is_recurring: boolean;
  recurring_until?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SessionBooking {
  id: string;
  bilan_id: string;
  consultant_id: string;
  beneficiary_id: string;
  organization_id: string;
  availability_slot_id?: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  duration_minutes: number;
  timezone: string;
  session_type: 'INITIAL_MEETING' | 'FOLLOW_UP' | 'REVIEW' | 'FINAL';
  meeting_format: 'IN_PERSON' | 'VIDEO' | 'PHONE';
  meeting_location?: string;
  meeting_link?: string;
  beneficiary_notes?: string;
  consultant_notes?: string;
  preparation_materials?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  attended?: boolean;
  cancellation_reason?: string;
  beneficiary_rating?: number;
  beneficiary_feedback?: string;
  bilan_phase_at_booking?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  deleted_at?: string;
}

export interface SessionReminder {
  id: string;
  session_booking_id: string;
  reminder_type:
    | 'BENEFICIARY_24H'
    | 'BENEFICIARY_1H'
    | 'CONSULTANT_24H'
    | 'CONSULTANT_1H'
    | 'BENEFICIARY_POST_SESSION';
  scheduled_time: string;
  sent_at?: string;
  failed: boolean;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface SessionAnalytics {
  id: string;
  organization_id: string;
  consultant_id: string;
  session_date: string;
  total_sessions_scheduled: number;
  total_sessions_completed: number;
  total_sessions_no_show: number;
  total_sessions_cancelled: number;
  average_rating?: number;
  total_hours_completed?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Scheduling Service Class
 */
class SchedulingService {
  /**
   * Create a new availability slot for a consultant
   */
  async createAvailabilitySlot(
    organizationId: string,
    consultantId: string,
    data: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    try {
      // Validate time ranges
      if (data.start_time && data.end_time) {
        if (data.start_time >= data.end_time) {
          throw new Error('Start time must be before end time');
        }
      }

      const slotData = {
        id: uuidv4(),
        consultant_id: consultantId,
        organization_id: organizationId,
        day_of_week: data.day_of_week,
        date_specific: data.date_specific,
        start_time: data.start_time,
        end_time: data.end_time,
        duration_minutes: data.duration_minutes || 120,
        max_concurrent_bookings: data.max_concurrent_bookings || 1,
        timezone: data.timezone || 'UTC',
        is_recurring: data.is_recurring || false,
        recurring_until: data.recurring_until,
        is_available: data.is_available !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: slot, error } = await supabase
        .from('availability_slots')
        .insert(slotData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating availability slot', error);
        throw error;
      }

      return slot;
    } catch (error) {
      logger.error('SchedulingService.createAvailabilitySlot failed', error);
      throw error;
    }
  }

  /**
   * Get available slots for a consultant
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
      let query = supabase
        .from('availability_slots')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('organization_id', organizationId)
        .eq('is_available', true)
        .is('deleted_at', null)
        .order('date_specific', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters?.dayOfWeek !== undefined) {
        query = query.eq('day_of_week', filters.dayOfWeek);
      }

      if (filters?.dateFrom) {
        query = query.gte('date_specific', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('date_specific', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching available slots', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('SchedulingService.getAvailableSlotsForConsultant failed', error);
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
      let query = supabase
        .from('session_bookings')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('scheduled_date', scheduledDate)
        .in('status', ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'])
        .is('deleted_at', null);

      if (excludeBookingId) {
        query = query.neq('id', excludeBookingId);
      }

      const { data: conflictingBookings, error } = await query;

      if (error) {
        logger.error('Error checking booking conflicts', error);
        throw error;
      }

      // Check if any existing bookings overlap with the proposed time
      if (conflictingBookings && conflictingBookings.length > 0) {
        for (const booking of conflictingBookings) {
          const bookingStart = booking.scheduled_start_time;
          const bookingEnd = booking.scheduled_end_time;

          // Check for time overlap
          if (startTime < bookingEnd && endTime > bookingStart) {
            return true; // Conflict found
          }
        }
      }

      return false; // No conflicts
    } catch (error) {
      logger.error('SchedulingService.checkBookingConflicts failed', error);
      throw error;
    }
  }

  /**
   * Get bilan details and validate hours for session booking
   */
  async validateBilanForBooking(bilanId: string): Promise<{
    valid: boolean;
    message?: string;
    bilanPhase?: string;
  }> {
    try {
      const { data: bilan, error } = await supabase
        .from('bilans')
        .select('*')
        .eq('id', bilanId)
        .is('deleted_at', null)
        .single();

      if (error || !bilan) {
        return { valid: false, message: 'Bilan not found' };
      }

      // Check if bilan is in a valid state for booking
      if (bilan.status === 'ARCHIVED' || bilan.status === 'COMPLETED') {
        return { valid: false, message: 'This bilan cannot have new sessions' };
      }

      return {
        valid: true,
        bilanPhase: bilan.phase,
      };
    } catch (error) {
      logger.error('SchedulingService.validateBilanForBooking failed', error);
      throw error;
    }
  }

  /**
   * Create a session booking
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
        throw new Error(bilanValidation.message || 'Invalid bilan for booking');
      }

      // Check for conflicts
      const hasConflict = await this.checkBookingConflicts(
        consultantId,
        data.scheduled_date || '',
        data.scheduled_start_time || '',
        data.scheduled_end_time || ''
      );

      if (hasConflict) {
        throw new Error('Consultant has a conflicting booking at this time');
      }

      const bookingData = {
        id: uuidv4(),
        bilan_id: bilanId,
        consultant_id: consultantId,
        beneficiary_id: beneficiaryId,
        organization_id: organizationId,
        availability_slot_id: data.availability_slot_id,
        scheduled_date: data.scheduled_date,
        scheduled_start_time: data.scheduled_start_time,
        scheduled_end_time: data.scheduled_end_time,
        duration_minutes: data.duration_minutes || 120,
        timezone: data.timezone || 'UTC',
        session_type: data.session_type || 'FOLLOW_UP',
        meeting_format: data.meeting_format || 'VIDEO',
        meeting_location: data.meeting_location,
        meeting_link: data.meeting_link,
        beneficiary_notes: data.beneficiary_notes,
        consultant_notes: data.consultant_notes,
        preparation_materials: data.preparation_materials,
        status: 'SCHEDULED',
        bilan_phase_at_booking: bilanValidation.bilanPhase,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: booking, error } = await supabase
        .from('session_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating session booking', error);
        throw error;
      }

      // Create reminder entries for the booking
      await this.createSessionReminders(booking.id, booking.scheduled_date, booking.scheduled_start_time);

      return booking;
    } catch (error) {
      logger.error('SchedulingService.createSessionBooking failed', error);
      throw error;
    }
  }

  /**
   * Create reminder entries for a booking
   */
  private async createSessionReminders(
    bookingId: string,
    sessionDate: string,
    sessionStartTime: string
  ): Promise<void> {
    try {
      const sessionDateTime = new Date(`${sessionDate}T${sessionStartTime}`);
      const reminders = [
        {
          id: uuidv4(),
          session_booking_id: bookingId,
          reminder_type: 'BENEFICIARY_24H',
          scheduled_time: new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          failed: false,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          session_booking_id: bookingId,
          reminder_type: 'BENEFICIARY_1H',
          scheduled_time: new Date(sessionDateTime.getTime() - 60 * 60 * 1000).toISOString(),
          failed: false,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          session_booking_id: bookingId,
          reminder_type: 'CONSULTANT_24H',
          scheduled_time: new Date(sessionDateTime.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          failed: false,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          session_booking_id: bookingId,
          reminder_type: 'CONSULTANT_1H',
          scheduled_time: new Date(sessionDateTime.getTime() - 60 * 60 * 1000).toISOString(),
          failed: false,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase.from('session_reminders').insert(reminders);

      if (error) {
        logger.error('Error creating session reminders', error);
        throw error;
      }
    } catch (error) {
      logger.error('SchedulingService.createSessionReminders failed', error);
      throw error;
    }
  }

  /**
   * Confirm a booking (consultant action)
   */
  async confirmBooking(bookingId: string, consultantId: string): Promise<SessionBooking> {
    try {
      const { data: booking, error: fetchError } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('id', bookingId)
        .eq('consultant_id', consultantId)
        .single();

      if (fetchError || !booking) {
        throw new Error('Booking not found');
      }

      if (booking.status !== 'SCHEDULED') {
        throw new Error('Only scheduled bookings can be confirmed');
      }

      const { data: updatedBooking, error } = await supabase
        .from('session_bookings')
        .update({
          status: 'CONFIRMED',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedBooking;
    } catch (error) {
      logger.error('SchedulingService.confirmBooking failed', error);
      throw error;
    }
  }

  /**
   * Get bookings for a beneficiary
   */
  async getBeneficiaryBookings(
    beneficiaryId: string,
    organizationId: string,
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<SessionBooking[]> {
    try {
      let query = supabase
        .from('session_bookings')
        .select('*')
        .eq('beneficiary_id', beneficiaryId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_start_time', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('SchedulingService.getBeneficiaryBookings failed', error);
      throw error;
    }
  }

  /**
   * Get bookings for a consultant
   */
  async getConsultantBookings(
    consultantId: string,
    organizationId: string,
    filters?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<SessionBooking[]> {
    try {
      let query = supabase
        .from('session_bookings')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_start_time', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('SchedulingService.getConsultantBookings failed', error);
      throw error;
    }
  }

  /**
   * Complete a session
   */
  async completeSession(
    bookingId: string,
    attended: boolean,
    data?: {
      beneficiary_rating?: number;
      beneficiary_feedback?: string;
    }
  ): Promise<SessionBooking> {
    try {
      const { data: booking, error: fetchError } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (fetchError || !booking) {
        throw new Error('Booking not found');
      }

      const updateData = {
        status: attended ? 'COMPLETED' : 'NO_SHOW',
        attended,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(data?.beneficiary_rating && { beneficiary_rating: data.beneficiary_rating }),
        ...(data?.beneficiary_feedback && { beneficiary_feedback: data.beneficiary_feedback }),
      };

      const { data: updatedBooking, error } = await supabase
        .from('session_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update analytics if session was completed
      if (attended) {
        await this.updateSessionAnalytics(booking.consultant_id, booking.organization_id, booking.scheduled_date);
      }

      return updatedBooking;
    } catch (error) {
      logger.error('SchedulingService.completeSession failed', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, cancellationReason: string): Promise<SessionBooking> {
    try {
      const { data: updatedBooking, error } = await supabase
        .from('session_bookings')
        .update({
          status: 'CANCELLED',
          cancellation_reason: cancellationReason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return updatedBooking;
    } catch (error) {
      logger.error('SchedulingService.cancelBooking failed', error);
      throw error;
    }
  }

  /**
   * Update session analytics
   */
  private async updateSessionAnalytics(
    consultantId: string,
    organizationId: string,
    sessionDate: string
  ): Promise<void> {
    try {
      // Get or create analytics record for this consultant and date
      const { data: existingAnalytics, error: fetchError } = await supabase
        .from('session_analytics')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('organization_id', organizationId)
        .eq('session_date', sessionDate)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Get session counts for the day
      const { data: sessions, error: countError } = await supabase
        .from('session_bookings')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('organization_id', organizationId)
        .eq('scheduled_date', sessionDate)
        .is('deleted_at', null);

      if (countError) {
        throw countError;
      }

      const stats = {
        total_sessions_scheduled: sessions?.filter((s) => s.status === 'SCHEDULED').length || 0,
        total_sessions_completed: sessions?.filter((s) => s.status === 'COMPLETED').length || 0,
        total_sessions_no_show: sessions?.filter((s) => s.status === 'NO_SHOW').length || 0,
        total_sessions_cancelled: sessions?.filter((s) => s.status === 'CANCELLED').length || 0,
        average_rating:
          sessions?.filter((s) => s.beneficiary_rating).reduce((sum, s) => sum + (s.beneficiary_rating || 0), 0) /
            (sessions?.filter((s) => s.beneficiary_rating).length || 1) || null,
        total_hours_completed:
          (sessions?.filter((s) => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0) / 60,
      };

      if (existingAnalytics) {
        // Update existing record
        await supabase
          .from('session_analytics')
          .update({
            ...stats,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAnalytics.id);
      } else {
        // Create new record
        await supabase
          .from('session_analytics')
          .insert({
            id: uuidv4(),
            consultant_id: consultantId,
            organization_id: organizationId,
            session_date: sessionDate,
            ...stats,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      logger.error('SchedulingService.updateSessionAnalytics failed', error);
      // Don't throw - analytics update failure shouldn't break the main operation
    }
  }

  /**
   * Get session analytics for a consultant
   */
  async getConsultantAnalytics(
    consultantId: string,
    organizationId: string,
    dateRange?: {
      dateFrom?: string;
      dateTo?: string;
    }
  ): Promise<SessionAnalytics[]> {
    try {
      let query = supabase
        .from('session_analytics')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('organization_id', organizationId)
        .order('session_date', { ascending: false });

      if (dateRange?.dateFrom) {
        query = query.gte('session_date', dateRange.dateFrom);
      }

      if (dateRange?.dateTo) {
        query = query.lte('session_date', dateRange.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('SchedulingService.getConsultantAnalytics failed', error);
      throw error;
    }
  }
}

export default new SchedulingService();
