import axios, { AxiosInstance, AxiosError } from 'axios';
import { getCsrfToken } from './csrfHelper';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
  organization_id?: string;
}

class BilanAPI {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 🔒 SECURITY: Enable HttpOnly cookie support
    });

    // 🔒 SECURITY: Request interceptor to add CSRF token
    this.api.interceptors.request.use(
      (config) => {
        // Add CSRF token for mutating requests
        const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        if (config.method && mutatingMethods.includes(config.method.toUpperCase())) {
          const csrfToken = getCsrfToken();
          if (csrfToken) {
            config.headers['x-csrf-token'] = csrfToken;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If 401 and not a retry, try to refresh token
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
          originalRequest.headers['X-Retry'] = 'true';

          try {
            // Attempt token refresh (backend will use refresh token from cookie)
            await this.api.post('/api/auth/refresh');
            // Retry the original request
            return this.api(originalRequest);
          } catch (err) {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            throw err;
          }
        }

        return Promise.reject(error);
      }
    );
  }


  /**
   * Register a new user
   * 🔒 SECURITY: Tokens are now stored in HttpOnly cookies by the backend
   */
  async register(
    email: string,
    password: string,
    fullName: string,
    role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN' = 'BENEFICIARY'
  ): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string; expiresIn: string }>> {
    try {
      const response = await this.api.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
        role,
      });

      // Cookies are automatically set by the backend
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Login user
   * 🔒 SECURITY: Tokens are now stored in HttpOnly cookies by the backend
   */
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await this.api.post('/api/auth/login', {
        email,
        password,
      });

      // Cookies are automatically set by the backend
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Logout user
   * 🔒 SECURITY: Backend will clear HttpOnly cookies
   */
  async logout(): Promise<void> {
    await this.api.post('/api/auth/logout');
    // Cookies are automatically cleared by the backend
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.get('/api/auth/verify');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * 🔒 SECURITY: Verifies with backend using HttpOnly cookies
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.verifyToken();
      return response.status === 'success';
    } catch {
      return false;
    }
  }

  /**
   * Expose axios GET method for general API calls
   */
  async get<T = any>(url: string, config?: any): Promise<any> {
    return this.api.get(url, config);
  }

  /**
   * Expose axios POST method for general API calls
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<any> {
    return this.api.post(url, data, config);
  }

  /**
   * Expose axios PUT method for general API calls
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<any> {
    return this.api.put(url, data, config);
  }

  /**
   * Expose axios DELETE method for general API calls
   */
  async delete<T = any>(url: string, config?: any): Promise<any> {
    return this.api.delete(url, config);
  }

  /**
   * Expose axios PATCH method for general API calls
   */
  async patch<T = any>(url: string, data?: any, config?: any): Promise<any> {
    return this.api.patch(url, data, config);
  }
}

// Export singleton instance
export const api = new BilanAPI();

export type { ApiResponse, AuthTokens, User };
