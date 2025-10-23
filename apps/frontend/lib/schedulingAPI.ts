/**
 * Scheduling API Client
 * Handles all API calls for availability management, session booking, and analytics
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SCHEDULING_BASE = `${API_BASE_URL}/api/scheduling`;

/**
 * Type definitions for scheduling domain
 */
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

export interface CreateAvailabilitySlotRequest {
  day_of_week?: number;
  date_specific?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  max_concurrent_bookings?: number;
  timezone?: string;
  is_recurring?: boolean;
  recurring_until?: string;
}

export interface UpdateAvailabilitySlotRequest extends Partial<CreateAvailabilitySlotRequest> {}

export interface CreateSessionBookingRequest {
  bilan_id: string;
  consultant_id: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  duration_minutes?: number;
  timezone?: string;
  session_type?: 'INITIAL_MEETING' | 'FOLLOW_UP' | 'REVIEW' | 'FINAL';
  meeting_format?: 'IN_PERSON' | 'VIDEO' | 'PHONE';
  meeting_location?: string;
  meeting_link?: string;
  beneficiary_notes?: string;
  preparation_materials?: string;
  availability_slot_id?: string;
}

export interface CompleteSessionRequest {
  attended: boolean;
  beneficiary_rating?: number;
  beneficiary_feedback?: string;
}

export interface CancelBookingRequest {
  cancellation_reason: string;
}

export interface ConfirmBookingRequest {
  notes?: string;
}

export interface QueryFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  day_of_week?: number;
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  details?: any;
}

/**
 * Scheduling API Client Class
 */
class SchedulingAPI {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  /**
   * Availability Management Endpoints
   */

  /**
   * Create a new availability slot
   */
  async createAvailabilitySlot(
    organizationId: string,
    data: CreateAvailabilitySlotRequest
  ): Promise<AvailabilitySlot> {
    const response = await this.api.post<ApiResponse<AvailabilitySlot>>(
      `${SCHEDULING_BASE}/availability`,
      data,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get all availability slots for consultant
   */
  async getAvailability(
    organizationId: string,
    filters?: QueryFilters
  ): Promise<AvailabilitySlot[]> {
    const params = new URLSearchParams();
    if (filters?.day_of_week !== undefined) params.append('day_of_week', String(filters.day_of_week));
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const response = await this.api.get<ApiResponse<AvailabilitySlot[]>>(
      `${SCHEDULING_BASE}/availability?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get available slots for a specific consultant (for booking)
   */
  async getAvailableSlotsForConsultant(
    organizationId: string,
    consultantId: string,
    filters?: QueryFilters
  ): Promise<AvailabilitySlot[]> {
    const params = new URLSearchParams();
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.day_of_week !== undefined) params.append('day_of_week', String(filters.day_of_week));

    const response = await this.api.get<ApiResponse<AvailabilitySlot[]>>(
      `${SCHEDULING_BASE}/availability/${consultantId}/slots?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Update an availability slot
   */
  async updateAvailabilitySlot(
    organizationId: string,
    slotId: string,
    data: UpdateAvailabilitySlotRequest
  ): Promise<AvailabilitySlot> {
    const response = await this.api.put<ApiResponse<AvailabilitySlot>>(
      `${SCHEDULING_BASE}/availability/${slotId}`,
      data,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailabilitySlot(organizationId: string, slotId: string): Promise<void> {
    await this.api.delete(`${SCHEDULING_BASE}/availability/${slotId}`, {
      headers: {
        'x-organization-id': organizationId,
      },
    });
  }

  /**
   * Session Booking Endpoints
   */

  /**
   * Create a new session booking
   */
  async createSessionBooking(
    organizationId: string,
    data: CreateSessionBookingRequest
  ): Promise<SessionBooking> {
    const response = await this.api.post<ApiResponse<SessionBooking>>(
      `${SCHEDULING_BASE}/bookings`,
      data,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get bookings for a specific bilan
   */
  async getBilanBookings(
    organizationId: string,
    bilanId: string,
    filters?: QueryFilters
  ): Promise<SessionBooking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const response = await this.api.get<ApiResponse<SessionBooking[]>>(
      `${SCHEDULING_BASE}/bookings/${bilanId}?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get all bookings for a beneficiary
   */
  async getBeneficiaryBookings(
    organizationId: string,
    beneficiaryId: string,
    filters?: QueryFilters
  ): Promise<SessionBooking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const response = await this.api.get<ApiResponse<SessionBooking[]>>(
      `${SCHEDULING_BASE}/beneficiary/${beneficiaryId}/bookings?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get all bookings for a consultant
   */
  async getConsultantBookings(
    organizationId: string,
    consultantId: string,
    filters?: QueryFilters
  ): Promise<SessionBooking[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);

    const response = await this.api.get<ApiResponse<SessionBooking[]>>(
      `${SCHEDULING_BASE}/consultant/${consultantId}/bookings?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Confirm a booking (consultant action)
   */
  async confirmBooking(
    organizationId: string,
    bookingId: string,
    data?: ConfirmBookingRequest
  ): Promise<SessionBooking> {
    const response = await this.api.put<ApiResponse<SessionBooking>>(
      `${SCHEDULING_BASE}/bookings/${bookingId}/confirm`,
      data || {},
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Complete a session
   */
  async completeSession(
    organizationId: string,
    bookingId: string,
    data: CompleteSessionRequest
  ): Promise<SessionBooking> {
    const response = await this.api.put<ApiResponse<SessionBooking>>(
      `${SCHEDULING_BASE}/bookings/${bookingId}/complete`,
      data,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    organizationId: string,
    bookingId: string,
    data: CancelBookingRequest
  ): Promise<SessionBooking> {
    const response = await this.api.put<ApiResponse<SessionBooking>>(
      `${SCHEDULING_BASE}/bookings/${bookingId}/cancel`,
      data,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }

  /**
   * Analytics Endpoints
   */

  /**
   * Get session analytics for a consultant
   */
  async getConsultantAnalytics(
    organizationId: string,
    consultantId: string,
    dateRange?: { dateFrom?: string; dateTo?: string }
  ): Promise<SessionAnalytics[]> {
    const params = new URLSearchParams();
    if (dateRange?.dateFrom) params.append('date_from', dateRange.dateFrom);
    if (dateRange?.dateTo) params.append('date_to', dateRange.dateTo);

    const response = await this.api.get<ApiResponse<SessionAnalytics[]>>(
      `${SCHEDULING_BASE}/analytics/consultant/${consultantId}?${params}`,
      {
        headers: {
          'x-organization-id': organizationId,
        },
      }
    );
    return response.data.data;
  }
}

export default SchedulingAPI;
