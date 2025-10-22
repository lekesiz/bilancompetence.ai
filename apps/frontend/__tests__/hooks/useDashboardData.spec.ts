/**
 * useDashboardData Hook Unit Tests
 *
 * Tests for:
 * - Endpoint selection based on role
 * - Data fetching and loading states
 * - Error handling
 * - Auto-refresh functionality
 * - Manual refetch
 * - TypeScript variants
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardData, useBeneficiaryDashboardData } from '@/app/(protected)/dashboard/hooks/useDashboardData';

// Mock fetch
global.fetch = jest.fn();

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('@/hooks/useAuth');

describe('useDashboardData Hook', () => {
  const mockBeneficiaryUser = {
    id: 'user-1',
    email: 'beneficiary@test.com',
    full_name: 'Test Beneficiary',
    role: 'BENEFICIARY' as const,
  };

  const mockConsultantUser = {
    id: 'user-2',
    email: 'consultant@test.com',
    full_name: 'Test Consultant',
    role: 'CONSULTANT' as const,
  };

  const mockAdminUser = {
    id: 'user-3',
    email: 'admin@test.com',
    full_name: 'Test Admin',
    role: 'ORG_ADMIN' as const,
  };

  const mockBeneficiaryData = {
    status: 'success',
    data: {
      bilans: [{ id: '1', title: 'Assessment 1', status: 'COMPLETED', progress: 100, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }],
      recommendations: [{ id: '1', title: 'Rec 1', description: 'Description', type: 'JOB_MATCH', source: 'AI', createdAt: '2025-01-01T00:00:00Z' }],
      stats: { totalBilans: 5, completedBilans: 3, pendingBilans: 2, averageSatisfaction: 4.5 },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockBeneficiaryUser });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockBeneficiaryData,
    });
    localStorage.getItem = jest.fn().mockReturnValue('test-token');
  });

  describe('Endpoint Selection', () => {
    it('should fetch from /api/dashboard/beneficiary for BENEFICIARY role', async () => {
      useAuth.mockReturnValue({ user: mockBeneficiaryUser });

      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard/beneficiary'),
          expect.any(Object)
        );
      });
    });

    it('should fetch from /api/dashboard/consultant for CONSULTANT role', async () => {
      useAuth.mockReturnValue({ user: mockConsultantUser });

      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard/consultant'),
          expect.any(Object)
        );
      });
    });

    it('should fetch from /api/dashboard/admin for ORG_ADMIN role', async () => {
      useAuth.mockReturnValue({ user: mockAdminUser });

      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard/admin'),
          expect.any(Object)
        );
      });
    });

    it('should not fetch if user is null', () => {
      useAuth.mockReturnValue({ user: null });

      renderHook(() => useDashboardData());

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Data States', () => {
    it('should initialize with loading=true', () => {
      const { result } = renderHook(() => useDashboardData());

      expect(result.current.loading).toBe(true);
    });

    it('should set loading=false after data fetch', async () => {
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should populate data after successful fetch', async () => {
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.data).toEqual(mockBeneficiaryData.data);
      });
    });

    it('should set error=null on successful fetch', async () => {
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should set error on failed fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('Network error');
      });
    });

    it('should handle 401 unauthorized error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('Unauthorized');
      });
    });

    it('should handle 403 forbidden error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toContain('Access denied');
      });
    });

    it('should set loading=false even on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Authorization Header', () => {
    it('should include Bearer token in Authorization header', async () => {
      // Mock localStorage properly
      Object.defineProperty(window, 'localStorage', {
        value: { getItem: jest.fn(() => 'test-token') },
      });

      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const calls = (global.fetch as jest.Mock).mock.calls;
        expect(calls[0][1].headers.Authorization).toBe('Bearer test-token');
      });
    });

    it('should make fetch request with proper headers', async () => {
      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/dashboard'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Refetch Functionality', () => {
    it('should have refetch function', async () => {
      const { result } = renderHook(() => useDashboardData());

      expect(typeof result.current.refetch).toBe('function');
    });

    it('should refetch data when refetch is called', async () => {
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.refetch();
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should clear error on successful refetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockBeneficiaryData,
      });

      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Auto-Refresh Interval', () => {
    it('should set up auto-refresh interval', async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      jest.clearAllMocks();

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000);

      // Auto-refresh should have triggered
      expect(global.fetch).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('should have refetch function available', async () => {
      const { result } = renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('TypeScript Variants', () => {
    it('useBeneficiaryDashboardData should return typed data', async () => {
      const { result } = renderHook(() => useBeneficiaryDashboardData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBeneficiaryData.data);
      expect(typeof result.current.refetch).toBe('function');
    });

    it('typed hook should have correct data structure', async () => {
      const { result } = renderHook(() => useBeneficiaryDashboardData());

      await waitFor(() => {
        if (result.current.data) {
          expect(result.current.data).toHaveProperty('bilans');
          expect(result.current.data).toHaveProperty('recommendations');
          expect(result.current.data).toHaveProperty('stats');
        }
      });
    });
  });

  describe('Content-Type Header', () => {
    it('should set Content-Type header to application/json', async () => {
      renderHook(() => useDashboardData());

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });
  });
});
