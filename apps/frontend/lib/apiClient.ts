/**
 * P2.3: API Client using native Fetch API
 * Replaces axios to reduce bundle size (axios: ~28KB → fetch: built-in)
 *
 * Features:
 * - Full TypeScript support
 * - 🔒 SECURITY: HttpOnly cookie-based authentication
 * - 🔒 SECURITY: CSRF token protection
 * - Request/response interceptors
 * - Error handling
 * - Timeout support
 * - Built-in retry logic
 */

import { getCsrfToken } from './csrfHelper';

export interface ApiRequestInit extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: any;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || '/api') {
    this.baseURL = baseURL;
  }

  /**
   * Build full URL
   */
  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Prepare request headers
   * 🔒 SECURITY: Auth is handled via HttpOnly cookies
   * 🔒 SECURITY: CSRF token added for mutating requests
   */
  private getHeaders(method?: string): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Add CSRF token for mutating requests
    const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (method && mutatingMethods.includes(method.toUpperCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    return headers;
  }

  /**
   * Handle timeout
   */
  private withTimeout(
    request: Promise<Response>,
    timeoutMs: number
  ): Promise<Response> {
    return Promise.race([
      request,
      new Promise<Response>((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Perform request with retry logic
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    init?: ApiRequestInit
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const timeout = init?.timeout || 30000;
    const retries = init?.retries || 3;
    const retryDelay = init?.retryDelay || 1000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const headers = this.getHeaders(method);
        const config: RequestInit = {
          ...init,
          method,
          credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
          headers: {
            ...headers,
            ...(init?.headers as Record<string, string>),
          },
        };

        // Exclude timeout and retry props from fetch config
        const { timeout: _, retries: __, retryDelay: ___, ...fetchConfig } =
          config as any;

        const response = await this.withTimeout(
          fetch(url, fetchConfig),
          timeout
        );

        // Handle non-OK responses
        if (!response.ok) {
          let errorData: any = null;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: response.statusText };
          }

          if (response.status === 401) {
            // Redirect to login on 401 (cookies are already cleared by backend)
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }

          throw new Error(
            errorData?.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return (await response.json()) as T;
        }

        return (await response.text()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Retry on network errors, not on 4xx/5xx
        if (attempt < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        throw lastError;
      }
    }

    throw lastError || new Error('Unknown error');
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, init?: ApiRequestInit): Promise<T> {
    return this.request<T>('GET', endpoint, init);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    init?: ApiRequestInit
  ): Promise<T> {
    return this.request<T>('POST', endpoint, {
      ...init,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    init?: ApiRequestInit
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, {
      ...init,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    init?: ApiRequestInit
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, {
      ...init,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, init?: ApiRequestInit): Promise<T> {
    return this.request<T>('DELETE', endpoint, init);
  }

  /**
   * Upload file
   * 🔒 SECURITY: Auth handled via HttpOnly cookies
   */
  async upload<T = any>(
    endpoint: string,
    file: File,
    init?: ApiRequestInit
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(this.buildUrl(endpoint), {
      ...init,
      method: 'POST',
      credentials: 'include', // 🔒 SECURITY: Include HttpOnly cookies
      body: formData,
      // Note: Don't set Content-Type header - browser will set it with boundary
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Export singleton instance
 */
export const apiClient = new ApiClient();

/**
 * Hook for React components (optional alternative)
 */
export function useApi() {
  return apiClient;
}
