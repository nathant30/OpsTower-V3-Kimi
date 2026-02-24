import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole, Permission, AuthState } from '@/types/auth.types';

interface AuthStore extends AuthState {
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  
  // RBAC Helpers
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  getRoleLevel: () => number;
}

// Initial state - no default user (require actual authentication)
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Role hierarchy for level comparison (higher index = higher privilege)
const ROLE_HIERARCHY: UserRole[] = [
  'Viewer',
  'Audit',
  'Support',
  'SupportAgent',
  'UtilityCrew',
  'FieldOperator',
  'ERT',
  'Finance',
  'FinanceManager',
  'CCOperator',
  'Compliance',
  'CCTeamLead',
  'FleetManager',
  'DepotManager',
  'OperationsManager',
  'CCManager',
  'OperationsDirector',
  'CCHead',
  'SuperAdmin',
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({
          ...initialState,
        });
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({
          user: { ...currentUser, ...updates },
        });
      },

      /**
       * Check if user has a specific role or any of the specified roles
       */
      hasRole: (role: UserRole | UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;

        const rolesToCheck = Array.isArray(role) ? role : [role];
        return rolesToCheck.includes(user.role);
      },

      /**
       * Check if user has a specific permission or any of the specified permissions
       * SuperAdmin with '*:*' permission has all permissions
       */
      hasPermission: (permission: Permission | Permission[]): boolean => {
        const { user } = get();
        if (!user) return false;

        // SuperAdmin has all permissions
        if (user.permissions.includes('*:*')) return true;

        const permissionsToCheck = Array.isArray(permission) ? permission : [permission];
        return permissionsToCheck.some(perm => user.permissions.includes(perm));
      },

      /**
       * Check if user has ALL of the specified permissions
       * SuperAdmin with '*:*' permission has all permissions
       */
      hasAllPermissions: (permissions: Permission[]): boolean => {
        const { user } = get();
        if (!user) return false;

        // SuperAdmin has all permissions
        if (user.permissions.includes('*:*')) return true;

        return permissions.every(perm => user.permissions.includes(perm));
      },

      /**
       * Check if user is an admin (SuperAdmin, CCHead, or has admin:system permission)
       */
      isAdmin: (): boolean => {
        const { user } = get();
        if (!user) return false;

        return (
          user.role === 'SuperAdmin' ||
          user.role === 'CCHead' ||
          user.role === 'OperationsDirector' ||
          user.permissions.includes('admin:system') ||
          user.permissions.includes('*:*')
        );
      },

      /**
       * Check if user is SuperAdmin
       */
      isSuperAdmin: (): boolean => {
        const { user } = get();
        if (!user) return false;

        return user.role === 'SuperAdmin' || user.permissions.includes('*:*');
      },

      /**
       * Get the numeric level of the user's role (higher = more privileged)
       */
      getRoleLevel: (): number => {
        const { user } = get();
        if (!user) return -1;

        return ROLE_HIERARCHY.indexOf(user.role);
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
