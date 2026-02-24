/**
 * Auth Service
 * Connects to custom backend for authentication
 */

import { backendApi } from './backend.api';

const AUTH_BASE = '/api/auth';

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<AuthResult['user'] | null> {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
