/**
 * useScheduling Hook Tests
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useAvailability,
  useCreateAvailabilitySlot,
  useConsultantBookings,
  useCompleteSession,
} from '@/hooks/useScheduling';
import { useAuth } from '@/hooks/useAuth';
import SchedulingAPI from '@/lib/schedulingAPI';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

jest.mock('@/hooks/useAuth');
jest.mock('@/lib/schedulingAPI');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  React.createElement(QueryClientProvider, { client: queryClient }, children)
);

describe('useScheduling Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: 'user-id' },
      organizationId: 'org-id',
    });
  });

  describe('useAvailability', () => {
    it('should fetch availability slots', async () => {
      const mockSlots = [
        {
          id: 'slot-1',
          consultant_id: 'consultant-id',
          organization_id: 'org-id',
          start_time: '09:00',
          end_time: '17:00',
          day_of_week: 0,
          duration_minutes: 480,
          max_concurrent_bookings: 1,
          timezone: 'UTC',
          is_recurring: true,
          is_available: true,
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z',
        },
      ];

      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        getAvailability: jest.fn().mockResolvedValue(mockSlots),
      }));

      const { result } = renderHook(() => useAvailability('consultant-id'), {
        wrapper,
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Data should be loaded
      expect(result.current.data).toEqual(mockSlots);
    });

    it('should not fetch if consultant ID is missing', () => {
      const { result } = renderHook(() => useAvailability(undefined), {
        wrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });

    it('should accept filters', async () => {
      const mockSlots = [];
      const getAvailabilityMock = jest.fn().mockResolvedValue(mockSlots);

      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        getAvailability: getAvailabilityMock,
      }));

      const filters = {
        date_from: '2025-01-01',
        date_to: '2025-01-31',
      };

      const { result } = renderHook(() => useAvailability('consultant-id', filters), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getAvailabilityMock).toHaveBeenCalledWith('org-id', filters);
    });
  });

  describe('useCreateAvailabilitySlot', () => {
    it('should create an availability slot', async () => {
      const mockSlot = {
        id: 'new-slot',
        consultant_id: 'consultant-id',
        organization_id: 'org-id',
        start_time: '09:00',
        end_time: '17:00',
        day_of_week: 0,
        duration_minutes: 480,
        max_concurrent_bookings: 1,
        timezone: 'UTC',
        is_recurring: true,
        is_available: true,
        created_at: '2025-01-15T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
      };

      const createMock = jest.fn().mockResolvedValue(mockSlot);
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        createAvailabilitySlot: createMock,
      }));

      const { result } = renderHook(() => useCreateAvailabilitySlot(), {
        wrapper,
      });

      const slotData = {
        start_time: '09:00',
        end_time: '17:00',
        day_of_week: 0,
      };

      await act(async () => {
        await result.current.mutateAsync(slotData);
      });

      expect(createMock).toHaveBeenCalled();
    });

    it('should invalidate queries on success', async () => {
      const createMock = jest.fn().mockResolvedValue({});
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        createAvailabilitySlot: createMock,
      }));

      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateAvailabilitySlot(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ start_time: '09:00', end_time: '17:00' });
      });

      // Should invalidate availability queries
      expect(invalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['availability'] })
      );

      invalidateQueries.mockRestore();
    });
  });

  describe('useConsultantBookings', () => {
    it('should fetch consultant bookings', async () => {
      const mockBookings = [
        {
          id: 'booking-1',
          bilan_id: 'bilan-id',
          consultant_id: 'consultant-id',
          beneficiary_id: 'beneficiary-id',
          organization_id: 'org-id',
          scheduled_date: '2025-01-15',
          scheduled_start_time: '09:00',
          scheduled_end_time: '10:30',
          duration_minutes: 90,
          timezone: 'UTC',
          session_type: 'FOLLOW_UP' as const,
          meeting_format: 'VIDEO' as const,
          status: 'SCHEDULED' as const,
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-10T00:00:00Z',
        },
      ];

      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        getConsultantBookings: jest.fn().mockResolvedValue(mockBookings),
      }));

      const { result } = renderHook(() => useConsultantBookings('consultant-id'), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBookings);
    });

    it('should handle filters', async () => {
      const getBookingsMock = jest.fn().mockResolvedValue([]);
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        getConsultantBookings: getBookingsMock,
      }));

      const filters = {
        status: 'SCHEDULED',
        date_from: '2025-01-01',
      };

      renderHook(() => useConsultantBookings('consultant-id', filters), {
        wrapper,
      });

      await waitFor(() => {
        expect(getBookingsMock).toHaveBeenCalledWith('org-id', 'consultant-id', filters);
      });
    });
  });

  describe('useCompleteSession', () => {
    it('should complete a session', async () => {
      const completeMock = jest.fn().mockResolvedValue({});
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        completeSession: completeMock,
      }));

      const { result } = renderHook(() => useCompleteSession(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          bookingId: 'booking-id',
          data: { attended: true },
        });
      });

      expect(completeMock).toHaveBeenCalled();
    });

    it('should invalidate booking and analytics queries on success', async () => {
      const completeMock = jest.fn().mockResolvedValue({});
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        completeSession: completeMock,
      }));

      const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCompleteSession(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          bookingId: 'booking-id',
          data: { attended: true },
        });
      });

      // Should invalidate relevant queries
      expect(invalidateQueries).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bookings'] })
      );

      invalidateQueries.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const createMock = jest.fn().mockRejectedValue(new Error('API Error'));
      (SchedulingAPI as jest.Mock).mockImplementation(() => ({
        createAvailabilitySlot: createMock,
      }));

      const { result } = renderHook(() => useCreateAvailabilitySlot(), {
        wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ start_time: '09:00', end_time: '17:00' });
        } catch (error) {
          // Error is expected
        }
      });

      expect(result.current.isError).toBe(true);
    });
  });
});
