import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
  avatar_url?: string;
  phone?: string;
  bio?: string;
  created_at: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (email: string, password: string, fullName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Register new user
  register: async (email: string, password: string, fullName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.register(email, password, fullName);

      if (response.data?.data?.access_token && response.data?.data?.refresh_token) {
        await api.storeTokens(response.data.data.access_token, response.data.data.refresh_token);

        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Login user
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.login(email, password);

      if (response.data?.data?.access_token && response.data?.data?.refresh_token) {
        await api.storeTokens(response.data.data.access_token, response.data.data.refresh_token);

        set({
          user: response.data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: 'Logout failed' });
    }
  },

  // Verify authentication status
  verifyAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await api.verifyToken();
      if (response.data?.status === 'success') {
        set({
          user: response.data.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        await get().logout();
      }
    } catch (error: any) {
      await get().logout();
    }
  },

  // Update user profile
  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.updateUserProfile(data);

      if (response.data?.data) {
        set({
          user: {
            ...get().user!,
            ...response.data.data,
          },
          isLoading: false,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Update failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
