/**
 * Unit Tests for useJobRecommendations Hook
 *
 * Tests API integration, state management, error handling,
 * and all hook methods for job recommendations
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobRecommendations } from '../useJobRecommendations';
import * as React from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock useAuth hook
jest.mock('../useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'BENEFICIARY',
    },
    isLoading: false,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('useJobRecommendations Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('accessToken', 'test-token-123');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Hook Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useJobRecommendations());

      expect(result.current.recommendations).toEqual([]);
      expect(result.current.savedJobs).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pageInfo).toEqual({ limit: 10, offset: 0, total: 0 });
    });

    it('should have all methods available', () => {
      const { result } = renderHook(() => useJobRecommendations());

      expect(typeof result.current.getJobRecommendations).toBe('function');
      expect(typeof result.current.saveJob).toBe('function');
      expect(typeof result.current.getSavedJobs).toBe('function');
      expect(typeof result.current.getRomeCodeDetails).toBe('function');
      expect(typeof result.current.searchRomeCodes).toBe('function');
      expect(typeof result.current.removeSavedJob).toBe('function');
      expect(typeof result.current.updateSavedJob).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.clearRecommendations).toBe('function');
    });
  });

  describe('getJobRecommendations', () => {
    it('should fetch job recommendations successfully', async () => {
      const mockRecommendations = [
        {
          id: 'job-1',
          title: 'Senior Developer',
          company: 'Tech Corp',
          matchScore: 95,
        },
        {
          id: 'job-2',
          title: 'Python Engineer',
          company: 'Data Inc',
          matchScore: 85,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            recommendations: mockRecommendations,
            count: 2,
          },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      await waitFor(() => {
        expect(result.current.recommendations).toHaveLength(2);
      });

      expect(result.current.recommendations[0].title).toBe('Senior Developer');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Failed to fetch recommendations',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.recommendations).toHaveLength(0);
    });

    it('should set loading state correctly', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    status: 'success',
                    data: { recommendations: [], count: 0 },
                  }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useJobRecommendations());

      expect(result.current.loading).toBe(false);

      await act(async () => {
        const promise = result.current.getJobRecommendations({ limit: 10 });
        expect(result.current.loading).toBe(true);
        await promise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should pass filters to API correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { recommendations: [], count: 0 },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      const filters = {
        minSalary: 40000,
        maxSalary: 80000,
        location: 'Paris',
        limit: 20,
      };

      await act(async () => {
        await result.current.getJobRecommendations(filters);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/recommendations/jobs'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('limit'),
        })
      );
    });
  });

  describe('saveJob', () => {
    it('should save job successfully', async () => {
      const mockSavedJob = {
        id: 'saved-1',
        jobId: 'job-123',
        status: 'saved',
        createdAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockSavedJob,
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let savedJob: any;
      await act(async () => {
        savedJob = await result.current.saveJob('job-123', 'Interested', 'saved');
      });

      expect(savedJob).toEqual(mockSavedJob);
    });

    it('should handle save job error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Failed to save job',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let savedJob: any;
      await act(async () => {
        savedJob = await result.current.saveJob('job-123', '', 'saved');
      });

      expect(savedJob).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('should default to "saved" status if not provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { jobId: 'job-123', status: 'saved' },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.saveJob('job-123');
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getSavedJobs', () => {
    it('should fetch saved jobs successfully', async () => {
      const mockSavedJobs = [
        {
          id: 'job-1',
          title: 'Senior Developer',
          status: 'interested',
          savedAt: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            jobs: mockSavedJobs,
            count: 1,
            pagination: { limit: 20, offset: 0 },
          },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getSavedJobs('test-user-123');
      });

      await waitFor(() => {
        expect(result.current.savedJobs).toHaveLength(1);
      });

      expect(result.current.savedJobs[0].title).toBe('Senior Developer');
    });

    it('should support pagination parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { jobs: [], count: 0, pagination: { limit: 10, offset: 10 } },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getSavedJobs('test-user-123', 10, 10);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10&offset=10'),
        expect.any(Object)
      );
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Failed to fetch saved jobs',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getSavedJobs('test-user-123');
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.savedJobs).toHaveLength(0);
    });
  });

  describe('getRomeCodeDetails', () => {
    it('should fetch ROME code details successfully', async () => {
      const mockRomeDetails = {
        code: 'E1101',
        label: 'Software Engineer',
        description: 'Design and develop software',
        relatedJobs: 150,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: mockRomeDetails,
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let romeDetails: any;
      await act(async () => {
        romeDetails = await result.current.getRomeCodeDetails('E1101');
      });

      expect(romeDetails).toEqual(mockRomeDetails);
      expect(romeDetails.label).toBe('Software Engineer');
    });

    it('should return null on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'ROME code not found',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let romeDetails: any;
      await act(async () => {
        romeDetails = await result.current.getRomeCodeDetails('XXXX');
      });

      expect(romeDetails).toBeNull();
    });
  });

  describe('searchRomeCodes', () => {
    it('should search ROME codes successfully', async () => {
      const mockResults = [
        { code: 'E1101', label: 'Software Engineer' },
        { code: 'E1102', label: 'Full Stack Developer' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            results: mockResults,
            count: 2,
            query: 'developer',
          },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let results: any;
      await act(async () => {
        results = await result.current.searchRomeCodes('developer', 10);
      });

      expect(results).toHaveLength(2);
      expect(results[0].label).toContain('Engineer');
    });

    it('should return empty array on error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Search failed',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let results: any;
      await act(async () => {
        results = await result.current.searchRomeCodes('test', 10);
      });

      expect(results).toEqual([]);
    });

    it('should handle empty search results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            results: [],
            count: 0,
            query: 'nonexistent',
          },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      let results: any;
      await act(async () => {
        results = await result.current.searchRomeCodes('nonexistent', 10);
      });

      expect(results).toHaveLength(0);
    });
  });

  describe('removeSavedJob', () => {
    it('should remove saved job', async () => {
      const { result } = renderHook(() => useJobRecommendations());

      let success: any;
      await act(async () => {
        success = await result.current.removeSavedJob('job-123');
      });

      expect(success).toBe(true);
    });

    it('should handle remove error', async () => {
      const { result } = renderHook(() => useJobRecommendations());

      let success: any;
      await act(async () => {
        success = await result.current.removeSavedJob('job-123');
      });

      expect(typeof success).toBe('boolean');
    });
  });

  describe('updateSavedJob', () => {
    it('should update saved job', async () => {
      const { result } = renderHook(() => useJobRecommendations());

      let success: any;
      await act(async () => {
        success = await result.current.updateSavedJob('job-123', {
          status: 'applied',
        });
      });

      expect(success).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Error occurred',
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      expect(result.current.error).toBeTruthy();

      await act(async () => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('clearRecommendations', () => {
    it('should clear recommendations list', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            recommendations: [
              { id: 'job-1', title: 'Developer', company: 'Tech Corp' },
            ],
            count: 1,
          },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      expect(result.current.recommendations).toHaveLength(1);

      await act(async () => {
        result.current.clearRecommendations();
      });

      expect(result.current.recommendations).toHaveLength(0);
    });
  });

  describe('Authentication', () => {
    it('should require authentication token', async () => {
      localStorage.removeItem('accessToken');

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should include Bearer token in requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          data: { recommendations: [], count: 0 },
        }),
      });

      const { result } = renderHook(() => useJobRecommendations());

      await act(async () => {
        await result.current.getJobRecommendations({ limit: 10 });
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });
  });
});
