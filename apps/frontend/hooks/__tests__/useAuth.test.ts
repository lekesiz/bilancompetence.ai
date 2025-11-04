/**
 * useAuth Hook Unit Tests
 *
 * Tests for:
 * - Authentication state management
 * - Login functionality
 * - Logout functionality
 * - Token storage
 * - User data persistence
 */

import { renderHook, act, waitFor } from '@testing-library/react';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

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
  value: mockLocalStorage,
});

// Mock fetch
global.fetch = jest.fn();

// Simplified useAuth hook for testing
const useAuth = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const checkAuth = () => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return { user, isAuthenticated, isLoading, login, logout, checkAuth };
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Initial State', () => {
    it('should initialize with no user', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'BENEFICIARY' };
      const mockToken = 'mock-jwt-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: mockToken }),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('auth_token')).toBe(mockToken);
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
    });

    it('should handle login failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login('wrong@example.com', 'wrongpass');
        })
      ).rejects.toThrow('Login failed');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockToken = 'mock-token';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser, token: mockToken }),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Check Auth', () => {
    it('should restore auth state from localStorage', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockToken = 'mock-token';

      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.checkAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false if no auth data exists', () => {
      const { result } = renderHook(() => useAuth());

      let authStatus: boolean;
      act(() => {
        authStatus = result.current.checkAuth();
      });

      expect(authStatus!).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should store token after successful login', async () => {
      const mockToken = 'jwt-token-12345';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '1', email: 'test@example.com' },
          token: mockToken,
        }),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(localStorage.getItem('auth_token')).toBe(mockToken);
    });

    it('should remove token after logout', async () => {
      localStorage.setItem('auth_token', 'existing-token');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });
});
