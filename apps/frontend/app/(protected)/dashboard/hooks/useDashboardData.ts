import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  BeneficiaryDashboardData,
  ConsultantDashboardData,
  AdminDashboardData,
  UseDashboardDataReturn,
} from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Generic hook for fetching dashboard data based on user role
 * Supports auto-refresh and manual refetch
 */
export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Determine endpoint based on user role
  const getEndpoint = useCallback(() => {
    if (!user) return null;

    switch (user.role) {
      case 'BENEFICIARY':
        return '/api/dashboard/beneficiary';
      case 'CONSULTANT':
        return '/api/dashboard/consultant';
      case 'ORG_ADMIN':
        return '/api/dashboard/admin';
      default:
        return null;
    }
  }, [user]);

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    const endpoint = getEndpoint();
    if (!endpoint) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        }
        if (response.status === 403) {
          throw new Error('Access denied to this resource');
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(new Error(errorMessage));
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [getEndpoint]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [user, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Typed hook for Beneficiary dashboard data
 */
export function useBeneficiaryDashboardData(): UseDashboardDataReturn<BeneficiaryDashboardData> {
  const dashboardData = useDashboardData() as any;
  return {
    data: dashboardData.data as BeneficiaryDashboardData | null,
    loading: dashboardData.loading,
    error: dashboardData.error,
    refetch: dashboardData.refetch,
  };
}

/**
 * Typed hook for Consultant dashboard data
 */
export function useConsultantDashboardData(): UseDashboardDataReturn<ConsultantDashboardData> {
  const dashboardData = useDashboardData() as any;
  return {
    data: dashboardData.data as ConsultantDashboardData | null,
    loading: dashboardData.loading,
    error: dashboardData.error,
    refetch: dashboardData.refetch,
  };
}

/**
 * Typed hook for Admin dashboard data
 */
export function useAdminDashboardData(): UseDashboardDataReturn<AdminDashboardData> {
  const dashboardData = useDashboardData() as any;
  return {
    data: dashboardData.data as AdminDashboardData | null,
    loading: dashboardData.loading,
    error: dashboardData.error,
    refetch: dashboardData.refetch,
  };
}
