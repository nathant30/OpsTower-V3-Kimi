import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types/auth.types';

interface AuthStore extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Initial state - no default user (require actual authentication)
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'opstower-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Development helper to create a mock session (REMOVE IN PRODUCTION)
export const createDevSession = () => {
  if (!import.meta.env.DEV) return;
  
  const devUser: User = {
    id: 'dev-admin-001',
    email: 'admin@opstower.com',
    firstName: 'Dev',
    lastName: 'Admin',
    role: 'SuperAdmin',
    permissions: ['*:*'],
    avatar: undefined,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  useAuthStore.getState().login('dev-token', devUser);
};
