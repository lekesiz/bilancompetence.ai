import { renderHook, waitFor, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { api } from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api', () => ({
  api: {
    isAuthenticated: jest.fn(),
    verifyToken: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('useAuth', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'BENEFICIARY',
    organization_id: 'org-456',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: user is not authenticated
    (api.isAuthenticated as jest.Mock).mockReturnValue(false);
  });

  describe('Initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should verify authentication on mount when token exists', async () => {
      (api.isAuthenticated as jest.Mock).mockReturnValue(true);
      (api.verifyToken as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(api.verifyToken).toHaveBeenCalledTimes(1);
    });

    it('should handle verification failure gracefully', async () => {
      (api.isAuthenticated as jest.Mock).mockReturnValue(true);
      (api.verifyToken as jest.Mock).mockRejectedValue(
        new Error('Token expired')
      );

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading to false when no token exists', async () => {
      (api.isAuthenticated as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(api.verifyToken).not.toHaveBeenCalled();
    });

    it('should extract organization ID from user', async () => {
      (api.isAuthenticated as jest.Mock).mockReturnValue(true);
      (api.verifyToken as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.organizationId).toBe('org-456');
      });
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      (api.register as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      let registerSuccess = false;

      await act(async () => {
        registerSuccess = await result.current.register(
          'new@example.com',
          'password123',
          'New User'
        );
      });

      expect(registerSuccess).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      expect(api.register).toHaveBeenCalledWith(
        'new@example.com',
        'password123',
        'New User',
        'BENEFICIARY'
      );
    });

    it('should handle registration failure with error message', async () => {
      (api.register as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Email already exists',
      });

      const { result } = renderHook(() => useAuth());

      let registerSuccess = false;

      await act(async () => {
        registerSuccess = await result.current.register(
          'existing@example.com',
          'password123',
          'User'
        );
      });

      expect(registerSuccess).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });

    it('should handle registration exception', async () => {
      (api.register as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth());

      let registerSuccess = false;

      await act(async () => {
        registerSuccess = await result.current.register(
          'test@example.com',
          'password123',
          'User'
        );
      });

      expect(registerSuccess).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should set loading state during registration', async () => {
      let resolveRegister: any;
      (api.register as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveRegister = resolve;
        })
      );

      const { result } = renderHook(() => useAuth());

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start registration
      let registerPromise: Promise<boolean>;
      act(() => {
        registerPromise = result.current.register(
          'test@example.com',
          'password123',
          'User'
        );
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the registration
      act(() => {
        resolveRegister({
          status: 'success',
          data: { user: mockUser },
        });
      });

      await act(async () => {
        await registerPromise!;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear previous errors on new registration', async () => {
      // First, cause an error
      (api.register as jest.Mock).mockResolvedValueOnce({
        status: 'error',
        message: 'First error',
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register('test@example.com', 'pass', 'User');
      });

      expect(result.current.error).toBe('First error');

      // Second registration should clear the error
      (api.register as jest.Mock).mockResolvedValueOnce({
        status: 'success',
        data: { user: mockUser },
      });

      await act(async () => {
        await result.current.register('test@example.com', 'pass', 'User');
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login(
          'test@example.com',
          'password123'
        );
      });

      expect(loginSuccess).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
      expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should handle login failure with error message', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Invalid credentials',
      });

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login(
          'wrong@example.com',
          'wrongpass'
        );
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle login exception', async () => {
      (api.login as jest.Mock).mockRejectedValue(
        new Error('Server unavailable')
      );

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login(
          'test@example.com',
          'password123'
        );
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.error).toBe('Server unavailable');
    });

    it('should set loading state during login', async () => {
      let resolveLogin: any;
      (api.login as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );

      const { result } = renderHook(() => useAuth());

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start login
      let loginPromise: Promise<boolean>;
      act(() => {
        loginPromise = result.current.login('test@example.com', 'password123');
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the login
      act(() => {
        resolveLogin({
          status: 'success',
          data: { user: mockUser },
        });
      });

      await act(async () => {
        await loginPromise!;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle missing user data in success response', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: {},
      });

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login(
          'test@example.com',
          'password123'
        );
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.error).toBe('Login failed');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // First, login
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      (api.logout as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
      expect(api.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle logout errors gracefully', async () => {
      // First, login
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Logout with error
      (api.logout as jest.Mock).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear user state despite error
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading state during logout', async () => {
      // First, login
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Setup delayed logout
      let resolveLogout: any;
      (api.logout as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveLogout = resolve;
        })
      );

      // Start logout
      let logoutPromise: Promise<void>;
      act(() => {
        logoutPromise = result.current.logout();
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve the logout
      act(() => {
        resolveLogout();
      });

      await act(async () => {
        await logoutPromise!;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      // Cause an error
      (api.login as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Test error',
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should be safe to call when no error exists', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login attempts', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Start multiple concurrent logins
      await act(async () => {
        await Promise.all([
          result.current.login('test1@example.com', 'pass1'),
          result.current.login('test2@example.com', 'pass2'),
          result.current.login('test3@example.com', 'pass3'),
        ]);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(api.login).toHaveBeenCalledTimes(3);
    });

    it('should handle empty email and password', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'error',
        message: 'Email and password required',
      });

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login('', '');
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.error).toBe('Email and password required');
    });

    it('should handle user without organization', async () => {
      const userWithoutOrg = { ...mockUser, organization_id: null };

      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: userWithoutOrg },
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.organizationId).toBeNull();
    });

    it('should preserve user state across re-renders', async () => {
      (api.login as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      const { result, rerender } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      const userBeforeRerender = result.current.user;

      rerender();

      expect(result.current.user).toBe(userBeforeRerender);
    });

    it('should handle API returning non-Error objects', async () => {
      (api.login as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useAuth());

      let loginSuccess = false;

      await act(async () => {
        loginSuccess = await result.current.login(
          'test@example.com',
          'password123'
        );
      });

      expect(loginSuccess).toBe(false);
      expect(result.current.error).toBe('An error occurred');
    });
  });
});
