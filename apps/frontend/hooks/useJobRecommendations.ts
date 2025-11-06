'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getHeadersWithCsrf } from '@/lib/csrfHelper';

/**
 * Type definitions for job recommendations
 */

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  contractType?: string;
  matchScore?: number;
  matchReasons?: string[];
  url?: string;
  createdAt?: string;
}

export interface SavedJob extends Job {
  savedAt: string;
  status: 'interested' | 'applied' | 'saved';
  notes?: string;
}

export interface RomeCode {
  code: string;
  label: string;
  description?: string;
  relatedJobs?: number;
  avgSalary?: number;
  salaryRange?: {
    min: number;
    max: number;
  };
}

export interface RecommendationFilters {
  competencyIds?: string[];
  minSalary?: number;
  maxSalary?: number;
  location?: string;
  contractTypes?: string[];
  limit?: number;
}

export interface RecommendationResponse {
  status: 'success' | 'error';
  data?: {
    recommendations: Job[];
    count: number;
    filters?: {
      competencies: string[];
      romeMatches: Array<{ code: string; label: string }>;
    };
  };
  message?: string;
}

export interface SavedJobsResponse {
  status: 'success' | 'error';
  data?: {
    jobs: SavedJob[];
    count: number;
    pagination: {
      limit: number;
      offset: number;
    };
  };
  message?: string;
}

export interface RomeCodeResponse {
  status: 'success' | 'error';
  data?: RomeCode;
  message?: string;
}

export interface RomeCodeSearchResponse {
  status: 'success' | 'error';
  data?: {
    results: RomeCode[];
    count: number;
    query: string;
  };
  message?: string;
}

/**
 * Hook for managing job recommendations API interactions
 *
 * @example
 * const {
 *   recommendations,
 *   loading,
 *   error,
 *   getJobRecommendations,
 *   saveJob,
 *   getSavedJobs,
 * } = useJobRecommendations();
 */
export function useJobRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState({ limit: 10, offset: 0, total: 0 });

  /**
   * Get request headers
   * 🔒 SECURITY: Auth handled via HttpOnly cookies, CSRF token included
   */
  const getHeaders = useCallback(() => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    return getHeadersWithCsrf({
      'Content-Type': 'application/json',
    });
  }, [user]);

  /**
   * Fetch job recommendations based on filters
   */
  const getJobRecommendations = useCallback(
    async (filters: RecommendationFilters = {}) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const headers = getHeaders();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/recommendations/jobs`,
          {
            method: 'POST',
            headers,
            credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
            body: JSON.stringify({
              limit: filters.limit || 10,
              ...filters,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch recommendations');
        }

        const data: RecommendationResponse = await response.json();

        if (data.status === 'success' && data.data) {
          setRecommendations(data.data.recommendations);
          setPageInfo({
            limit: filters.limit || 10,
            offset: 0,
            total: data.data.count,
          });
        } else {
          throw new Error(data.message || 'Failed to fetch recommendations');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Save a job to user's list
   */
  const saveJob = useCallback(
    async (jobId: string, notes?: string, status: 'interested' | 'applied' | 'saved' = 'saved') => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        setError(null);
        const headers = getHeaders();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/recommendations/${jobId}/save`,
          {
            method: 'POST',
            headers,
            credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
            body: JSON.stringify({ notes, status }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save job');
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Refresh saved jobs list
          await getSavedJobs(user.id);
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to save job');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Get user's saved jobs
   */
  const getSavedJobs = useCallback(
    async (userId?: string, limit: number = 20, offset: number = 0) => {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const targetUserId = userId || user.id;
        const headers = getHeaders();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/recommendations/${targetUserId}/saved-jobs?limit=${limit}&offset=${offset}`,
          {
            method: 'GET',
            headers,
            credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch saved jobs');
        }

        const data: SavedJobsResponse = await response.json();

        if (data.status === 'success' && data.data) {
          setSavedJobs(data.data.jobs);
          setPageInfo({
            limit: data.data.pagination.limit,
            offset: data.data.pagination.offset,
            total: data.data.count,
          });
        } else {
          throw new Error(data.message || 'Failed to fetch saved jobs');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setSavedJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Get ROME code details
   */
  const getRomeCodeDetails = useCallback(
    async (code: string) => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        setError(null);
        const headers = getHeaders();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/recommendations/rome-codes/${code}`,
          {
            method: 'GET',
            headers,
            credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch ROME code details');
        }

        const data: RomeCodeResponse = await response.json();

        if (data.status === 'success' && data.data) {
          return data.data;
        } else {
          throw new Error(data.message || 'Failed to fetch ROME code details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Search ROME codes by keyword
   */
  const searchRomeCodes = useCallback(
    async (query: string, limit: number = 10) => {
      if (!user) {
        setError('User not authenticated');
        return [];
      }

      try {
        setError(null);
        const headers = getHeaders();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/recommendations/rome-codes/search?query=${encodeURIComponent(query)}&limit=${limit}`,
          {
            method: 'GET',
            headers,
            credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to search ROME codes');
        }

        const data: RomeCodeSearchResponse = await response.json();

        if (data.status === 'success' && data.data) {
          return data.data.results;
        } else {
          throw new Error(data.message || 'Failed to search ROME codes');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return [];
      }
    },
    [user, getAuthHeader]
  );

  /**
   * Remove a job from saved list
   */
  const removeSavedJob = useCallback(
    async (jobId: string) => {
      if (!user) {
        setError('User not authenticated');
        return false;
      }

      try {
        setError(null);
        // Note: This would require a DELETE endpoint on the backend
        // For now, we'll update the local state
        setSavedJobs((prev) => prev.filter((job) => job.id !== jobId));
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      }
    },
    [user]
  );

  /**
   * Update a saved job's notes or status
   */
  const updateSavedJob = useCallback(
    async (jobId: string, updates: { notes?: string; status?: 'interested' | 'applied' | 'saved' }) => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        setError(null);
        // Note: This would require a PATCH endpoint on the backend
        // For now, we'll update the local state
        setSavedJobs((prev) =>
          prev.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  ...updates,
                }
              : job
          )
        );
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      }
    },
    [user]
  );

  return {
    // State
    recommendations,
    savedJobs,
    loading,
    error,
    pageInfo,

    // Methods
    getJobRecommendations,
    saveJob,
    getSavedJobs,
    getRomeCodeDetails,
    searchRomeCodes,
    removeSavedJob,
    updateSavedJob,

    // Utilities
    clearError: () => setError(null),
    clearRecommendations: () => setRecommendations([]),
  };
}
