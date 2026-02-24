import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { useAuthStore } from '@/lib/stores/auth.store';

/**
 * API Error class with typed error information
 */
export class ApiError extends Error {
  status: number;
  code: string;
  data?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

/**
 * Global API client instance
 * Configured with interceptors for auth, logging, and error handling
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Base URL without /api suffix - endpoints include full path
    const baseURL = API_CONFIG.baseURL;
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.headers['X-Request-Time'] = new Date().toISOString();
        
        // Add request ID for tracing (use crypto API if available)
        const requestId = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        config.headers['X-Request-ID'] = requestId;
        
        // Debug logging only in development, never log sensitive data
        if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
          // API request logging
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Debug logging only in development
        if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true') {
          // API response logging
        }
        return response;
      },
      async (error: AxiosError) => {
        const handledError = this.handleError(error);
        return Promise.reject(handledError);
      }
    );
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { code?: string; message?: string };
      
      // Handle 401 Unauthorized
      if (status === 401) {
        useAuthStore.getState().logout();
        return new ApiError(
          401,
          'UNAUTHORIZED',
          'Session expired. Please log in again.',
          data
        );
      }
      
      // Handle 403 Forbidden
      if (status === 403) {
        return new ApiError(
          403,
          'FORBIDDEN',
          data?.message || 'You do not have permission to perform this action.',
          data
        );
      }
      
      // Handle 500+ Server errors
      if (status >= 500) {
        return new ApiError(
          status,
          'SERVER_ERROR',
          'Server error occurred. Please try again later.',
          data
        );
      }
      
      // Generic API error
      return new ApiError(
        status,
        data?.code || 'API_ERROR',
        data?.message || 'An error occurred while processing your request.',
        data
      );
    }
    
    // Network errors
    if (error.request) {
      return new ApiError(
        0,
        'NETWORK_ERROR',
        'Network error. Please check your connection and try again.'
      );
    }
    
    // Other errors
    return new ApiError(
      0,
      'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred.'
    );
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
