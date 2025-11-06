import { useState, useCallback, useEffect } from 'react';
import { api, User } from '@/lib/api';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  organizationId: string | null;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to prevent premature redirects
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from API
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.verifyToken();
        if (response.status === 'success' && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        setIsAuthenticated(false);
      } finally {
        // Always set loading to false after verification attempt
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.register(email, password, fullName, 'BENEFICIARY');

        if (response.status === 'success' && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          return true;
        } else {
          setError(response.message || 'Registration failed');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.login(email, password);

        if (response.status === 'success' && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          return true;
        } else {
          setError(response.message || 'Login failed');
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    organizationId: user?.organization_id || null,
    register,
    login,
    logout,
    clearError,
  };
}
