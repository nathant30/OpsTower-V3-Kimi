/**
 * Auth Service
 * Connects to custom backend for authentication
 */

import { backendApi } from './backend.api';
import type { User, UserRole, Permission } from '@/types/auth.types';

const AUTH_BASE = '/api/auth';

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  success: boolean;
  message: string;
}

export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(input: LoginInput): Promise<AuthResult> {
    const result = await backendApi.post<AuthResult>(`${AUTH_BASE}/login`, input);
    
    // Store tokens
    localStorage.setItem('token', result.token);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    
    return result;
  },

  async logout(): Promise<void> {
    // Call backend logout endpoint if available
    try {
      await backendApi.post(`${AUTH_BASE}/logout`, {});
    } catch {
      // Ignore errors from logout endpoint
    }
    
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Fetch current user info from backend
   * Uses GET /api/auth/me endpoint
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const user = await backendApi.get<User>(`${AUTH_BASE}/me`);
      
      // Update stored user data
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // Fallback to localStorage if API fails
      const userJson = localStorage.getItem('user');
      if (!userJson) return null;
      return JSON.parse(userJson);
    }
  },

  /**
   * Change user password
   * Uses POST /api/auth/change-password endpoint
   */
  async changePassword(input: ChangePasswordInput): Promise<ChangePasswordResult> {
    try {
      const result = await backendApi.post<ChangePasswordResult>(`${AUTH_BASE}/change-password`, input);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const result = await backendApi.post<{ token: string; refreshToken: string }>(
        `${AUTH_BASE}/refresh`,
        { refreshToken }
      );
      
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      return result.token;
    } catch {
      // If refresh fails, clear auth data
      await this.logout();
      return null;
    }
  },
};

export default authService;
