import axios, { AxiosInstance, AxiosError } from 'axios';

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
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth header
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
          originalRequest.headers['X-Retry'] = 'true';

          if (this.refreshToken) {
            try {
              const response = await this.refreshAccessToken();
              this.setTokens(response.accessToken, response.refreshToken);
              return this.api(originalRequest);
            } catch (err) {
              this.clearTokens();
              throw err;
            }
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage
    this.loadTokens();
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  /**
   * Save tokens to localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  /**
   * Clear tokens from memory and localStorage
   */
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  /**
   * Register a new user
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

      // Save tokens if registration successful
      if (response.data.status === 'success' && response.data.data?.accessToken) {
        this.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }

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

      if (response.data.status === 'success' && response.data.data?.accessToken) {
        this.setTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }

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
   */
  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
    } finally {
      this.clearTokens();
    }
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
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<AuthTokens> {
    try {
      const response = await this.api.post('/api/auth/refresh', {
        refreshToken: this.refreshToken,
      });

      if (response.data.status === 'success') {
        return response.data.data.tokens;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null;
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
