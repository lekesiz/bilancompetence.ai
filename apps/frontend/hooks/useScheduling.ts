/**
 * useScheduling Hook
 * Main hook for managing scheduling state and operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import SchedulingAPI, {
  AvailabilitySlot,
  SessionBooking,
  SessionAnalytics,
  CreateAvailabilitySlotRequest,
  UpdateAvailabilitySlotRequest,
  CreateSessionBookingRequest,
  CompleteSessionRequest,
  CancelBookingRequest,
  QueryFilters,
} from '@/lib/schedulingAPI';
import axios from 'axios';
import { useState, useCallback } from 'react';

// Initialize API client with axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const schedulingAPI = new SchedulingAPI(apiClient);

/**
 * Hook for fetching availability slots
 */
export function useAvailability(
  consultantId?: string,
  filters?: QueryFilters,
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['availability', consultantId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      if (!consultantId) throw new Error('Consultant ID required');
      return schedulingAPI.getAvailability(organizationId, filters);
    },
    enabled: enabled && !!organizationId && !!consultantId,
  });
}

/**
 * Hook for creating availability slot
 */
export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: (data: CreateAvailabilitySlotRequest) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.createAvailabilitySlot(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to create availability slot';
      setError(message);
    },
  });
}

/**
 * Hook for updating availability slot
 */
export function useUpdateAvailabilitySlot() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: ({ slotId, data }: { slotId: string; data: UpdateAvailabilitySlotRequest }) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.updateAvailabilitySlot(organizationId, slotId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to update availability slot';
      setError(message);
    },
  });
}

/**
 * Hook for deleting availability slot
 */
export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: (slotId: string) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.deleteAvailabilitySlot(organizationId, slotId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to delete availability slot';
      setError(message);
    },
  });
}

/**
 * Hook for fetching available slots for a consultant (for booking)
 */
export function useAvailableSlotsForConsultant(
  consultantId: string,
  filters?: QueryFilters,
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['available-slots', consultantId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.getAvailableSlotsForConsultant(organizationId, consultantId, filters);
    },
    enabled: enabled && !!organizationId && !!consultantId,
  });
}

/**
 * Hook for fetching consultant's bookings
 */
export function useConsultantBookings(
  consultantId?: string,
  filters?: QueryFilters,
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['consultant-bookings', consultantId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      if (!consultantId) throw new Error('Consultant ID required');
      return schedulingAPI.getConsultantBookings(organizationId, consultantId, filters);
    },
    enabled: enabled && !!organizationId && !!consultantId,
  });
}

/**
 * Hook for fetching beneficiary's bookings
 */
export function useBeneficiaryBookings(
  beneficiaryId?: string,
  filters?: QueryFilters,
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['beneficiary-bookings', beneficiaryId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      if (!beneficiaryId) throw new Error('Beneficiary ID required');
      return schedulingAPI.getBeneficiaryBookings(organizationId, beneficiaryId, filters);
    },
    enabled: enabled && !!organizationId && !!beneficiaryId,
  });
}

/**
 * Hook for fetching bilan bookings
 */
export function useBilanBookings(
  bilanId?: string,
  filters?: QueryFilters,
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['bilan-bookings', bilanId, filters],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      if (!bilanId) throw new Error('Bilan ID required');
      return schedulingAPI.getBilanBookings(organizationId, bilanId, filters);
    },
    enabled: enabled && !!organizationId && !!bilanId,
  });
}

/**
 * Hook for creating session booking
 */
export function useCreateSessionBooking() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: (data: CreateSessionBookingRequest) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.createSessionBooking(organizationId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['beneficiary-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bilan-bookings'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to create session booking';
      setError(message);
    },
  });
}

/**
 * Hook for confirming booking
 */
export function useConfirmBooking() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: (bookingId: string) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.confirmBooking(organizationId, bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to confirm booking';
      setError(message);
    },
  });
}

/**
 * Hook for completing session
 */
export function useCompleteSession() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: CompleteSessionRequest }) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.completeSession(organizationId, bookingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to complete session';
      setError(message);
    },
  });
}

/**
 * Hook for cancelling booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();
  const { organizationId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) => {
      if (!organizationId) throw new Error('Organization ID required');
      return schedulingAPI.cancelBooking(organizationId, bookingId, { cancellation_reason: reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['consultant-bookings'] });
      setError(null);
    },
    onError: (err: any) => {
      const message = err.response?.data?.error || 'Failed to cancel booking';
      setError(message);
    },
  });
}

/**
 * Hook for fetching analytics
 */
export function useConsultantAnalytics(
  consultantId?: string,
  dateRange?: { dateFrom?: string; dateTo?: string },
  enabled: boolean = true
) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', consultantId, dateRange],
    queryFn: () => {
      if (!organizationId) throw new Error('Organization ID required');
      if (!consultantId) throw new Error('Consultant ID required');
      return schedulingAPI.getConsultantAnalytics(organizationId, consultantId, dateRange);
    },
    enabled: enabled && !!organizationId && !!consultantId,
  });
}

/**
 * Utility hook to get current consultant's data
 */
export function useConsultantSchedule(consultantId?: string) {
  const bookings = useConsultantBookings(consultantId);
  const availability = useAvailability(consultantId);
  const analytics = useConsultantAnalytics(consultantId);

  return {
    bookings,
    availability,
    analytics,
    isLoading: bookings.isLoading || availability.isLoading || analytics.isLoading,
    error: bookings.error || availability.error || analytics.error,
  };
}
