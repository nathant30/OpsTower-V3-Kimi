import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../auth.store';
import { mockLocalStorage } from '@/test/utils';
import type { User } from '@/types/auth.types';

// Mock zustand persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

describe('useAuthStore', () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    mockLocalStorage(storage);
    // Reset store to initial state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'Viewer',
    permissions: ['view:dashboard'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should set user and token on login', () => {
      const { login } = useAuthStore.getState();
      
      login('test-token', mockUser);
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set isAuthenticated to true after login', () => {
      const { login } = useAuthStore.getState();
      
      login('test-token', mockUser);
      
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should handle login with different user roles', () => {
      const { login } = useAuthStore.getState();
      
      const adminUser: User = { ...mockUser, role: 'SuperAdmin', permissions: ['*:*'] };
      login('admin-token', adminUser);
      
      expect(useAuthStore.getState().user?.role).toBe('SuperAdmin');
      expect(useAuthStore.getState().user?.permissions).toContain('*:*');
    });
  });

  describe('logout', () => {
    it('should clear all auth data on logout', () => {
      const { login, logout } = useAuthStore.getState();
      
      // First login
      login('test-token', mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      
      // Then logout
      logout();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should call localStorage.removeItem for token and user', () => {
      const { login, logout } = useAuthStore.getState();
      
      login('test-token', mockUser);
      logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should handle logout when not logged in', () => {
      const { logout } = useAuthStore.getState();
      
      // Should not throw
      expect(() => logout()).not.toThrow();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should update user data', () => {
      const { login, setUser } = useAuthStore.getState();
      
      login('test-token', mockUser);
      
      const updatedUser: User = { ...mockUser, firstName: 'Updated' };
      setUser(updatedUser);
      
      expect(useAuthStore.getState().user?.firstName).toBe('Updated');
    });

    it('should set user to null', () => {
      const { login, setUser } = useAuthStore.getState();
      
      login('test-token', mockUser);
      setUser(null);
      
      expect(useAuthStore.getState().user).toBeNull();
    });

    it('should keep other state unchanged when setting user', () => {
      const { login, setUser } = useAuthStore.getState();
      
      login('test-token', mockUser);
      setUser({ ...mockUser, firstName: 'Updated' });
      
      const state = useAuthStore.getState();
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('State Persistence', () => {
    it('should persist auth state changes', () => {
      const { login } = useAuthStore.getState();
      
      login('persist-token', mockUser);
      
      // Verify state is set
      expect(useAuthStore.getState().token).toBe('persist-token');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should handle multiple sequential logins', () => {
      const { login } = useAuthStore.getState();
      
      const user1: User = { ...mockUser, id: 'user-1', email: 'user1@example.com' };
      const user2: User = { ...mockUser, id: 'user-2', email: 'user2@example.com' };
      
      login('token-1', user1);
      expect(useAuthStore.getState().user?.id).toBe('user-1');
      
      login('token-2', user2);
      expect(useAuthStore.getState().user?.id).toBe('user-2');
      expect(useAuthStore.getState().token).toBe('token-2');
    });
  });

  describe('User Permissions', () => {
    it('should store user permissions correctly', () => {
      const { login } = useAuthStore.getState();
      
      const userWithPermissions: User = {
        ...mockUser,
        permissions: ['view:dashboard', 'view:orders', 'create:orders'],
      };
      
      login('token', userWithPermissions);
      
      expect(useAuthStore.getState().user?.permissions).toHaveLength(3);
      expect(useAuthStore.getState().user?.permissions).toContain('view:dashboard');
    });

    it('should handle user with all permissions wildcard', () => {
      const { login } = useAuthStore.getState();
      
      const adminUser: User = {
        ...mockUser,
        role: 'SuperAdmin',
        permissions: ['*:*'],
      };
      
      login('admin-token', adminUser);
      
      expect(useAuthStore.getState().user?.role).toBe('SuperAdmin');
      expect(useAuthStore.getState().user?.permissions).toEqual(['*:*']);
    });
  });

  describe('User Profile Data', () => {
    it('should store complete user profile', () => {
      const { login } = useAuthStore.getState();
      
      const completeUser: User = {
        ...mockUser,
        avatar: 'https://example.com/avatar.jpg',
        lastLoginAt: '2024-01-15T10:00:00Z',
      };
      
      login('token', completeUser);
      
      const storedUser = useAuthStore.getState().user;
      expect(storedUser?.avatar).toBe('https://example.com/avatar.jpg');
      expect(storedUser?.lastLoginAt).toBe('2024-01-15T10:00:00Z');
    });
  });
});
