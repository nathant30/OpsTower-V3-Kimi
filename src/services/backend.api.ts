/**
 * Backend API Client
 * Connects to custom backend (localhost:3000)
 */

import { BACKEND_CONFIG } from '../config/backend.config';

// Base API client for backend
export const backendApi = {
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, BACKEND_CONFIG.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: BACKEND_CONFIG.headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = new URL(endpoint, BACKEND_CONFIG.baseURL);
    
    // DEBUG
    // Backend API POST request

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: BACKEND_CONFIG.headers,
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = new URL(endpoint, BACKEND_CONFIG.baseURL);

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: BACKEND_CONFIG.headers,
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

export default backendApi;
