import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

class MobileAPIClient {
  private api: AxiosInstance;
  private readonly baseURL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const tokens = await this.getStoredTokens();
          if (tokens?.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        } catch (error) {
          console.error('Error retrieving token:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and refresh token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for token refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const tokens = await this.getStoredTokens();
            if (tokens?.refreshToken) {
              const response = await this.api.post('/auth/refresh', {
                refreshToken: tokens.refreshToken,
              });

              const newToken = response.data.data.accessToken;
              await this.storeTokens(newToken, tokens.refreshToken);

              this.api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Notify all waiting requests
              this.refreshSubscribers.forEach((subscriber) => subscriber(newToken));
              this.refreshSubscribers = [];

              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            await this.clearTokens();
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get stored tokens from secure storage
   */
  private async getStoredTokens(): Promise<StoredTokens | null> {
    try {
      const stored = await SecureStore.getItemAsync('auth_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading tokens:', error);
      return null;
    }
  }

  /**
   * Store tokens in secure storage
   */
  public async storeTokens(accessToken: string, refreshToken: string) {
    try {
      const tokens: StoredTokens = { accessToken, refreshToken };
      await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Clear stored tokens
   */
  public async clearTokens() {
    try {
      await SecureStore.deleteItemAsync('auth_tokens');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Register user
   */
  public async register(email: string, password: string, fullName: string) {
    return this.api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
  }

  /**
   * Login user
   */
  public async login(email: string, password: string) {
    return this.api.post('/auth/login', {
      email,
      password,
    });
  }

  /**
   * Verify token
   */
  public async verifyToken() {
    return this.api.get('/auth/verify');
  }

  /**
   * Get user profile
   */
  public async getUserProfile() {
    return this.api.get('/users/profile');
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(data: Record<string, any>) {
    return this.api.put('/users/profile', data);
  }

  /**
   * Get user assessments
   */
  public async getUserAssessments(limit = 10) {
    return this.api.get(`/assessments?limit=${limit}`);
  }

  /**
   * Get assessment details
   */
  public async getAssessment(assessmentId: string) {
    return this.api.get(`/assessments/${assessmentId}`);
  }

  /**
   * Start assessment
   */
  public async startAssessment(assessmentId: string) {
    return this.api.post(`/assessments/${assessmentId}/start`);
  }

  /**
   * Submit assessment answer
   */
  public async submitAnswer(assessmentId: string, questionId: string, answer: string) {
    return this.api.post(`/assessments/${assessmentId}/answers`, {
      question_id: questionId,
      answer,
    });
  }

  /**
   * Complete assessment
   */
  public async completeAssessment(assessmentId: string) {
    return this.api.post(`/assessments/${assessmentId}/complete`);
  }

  /**
   * Get notifications
   */
  public async getNotifications(limit = 20) {
    return this.api.get(`/notifications?limit=${limit}`);
  }

  /**
   * Mark notification as read
   */
  public async markNotificationAsRead(notificationId: string) {
    return this.api.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Get user conversations
   */
  public async getConversations(limit = 50) {
    return this.api.get(`/chat/conversations?limit=${limit}`);
  }

  /**
   * Get conversation messages
   */
  public async getConversationMessages(conversationId: string, limit = 100, offset = 0) {
    return this.api.get(
      `/chat/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  /**
   * Send message via API (for persistence)
   */
  public async sendMessage(conversationId: string, content: string) {
    return this.api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
    });
  }

  /**
   * Get analytics
   */
  public async getAnalytics() {
    return this.api.get('/analytics/user-activity');
  }

  /**
   * Generic GET request
   */
  public get(endpoint: string, config?: any) {
    return this.api.get(endpoint, config);
  }

  /**
   * Generic POST request
   */
  public post(endpoint: string, data?: any, config?: any) {
    return this.api.post(endpoint, data, config);
  }

  /**
   * Generic PUT request
   */
  public put(endpoint: string, data?: any, config?: any) {
    return this.api.put(endpoint, data, config);
  }

  /**
   * Generic DELETE request
   */
  public delete(endpoint: string, config?: any) {
    return this.api.delete(endpoint, config);
  }
}

export const api = new MobileAPIClient();
export default api;
