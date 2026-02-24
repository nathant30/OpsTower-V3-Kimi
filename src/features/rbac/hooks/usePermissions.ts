/**
 * usePermissions Hook
 *
 * Custom hook for checking user permissions and roles.
 * Use this in components to conditionally render or enable features.
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { Permission, UserRole } from '@/types/auth.types';

interface UsePermissionsReturn {
  /** Check if user has a specific permission */
  hasPermission: (permission: Permission | string) => boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (permissions: (Permission | string)[]) => boolean;
  /** Check if user has all of the specified permissions */
  hasAllPermissions: (permissions: (Permission | string)[]) => boolean;
  /** Check if user has a specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roles: UserRole[]) => boolean;
  /** Check if user has at least the minimum role level */
  hasMinimumRole: (minimumRole: UserRole) => boolean;
  /** Get all user permissions */
  permissions: Permission[];
  /** Current user role */
  role: UserRole | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Role hierarchy for checking minimum role requirements
 * Higher index = higher privilege
 */
const ROLE_HIERARCHY: UserRole[] = [
  'Viewer',
  'SupportAgent',
  'FinanceManager',
  'FleetManager',
  'OperationsManager',
  'OperationsDirector',
  'SuperAdmin',
];

/**
 * Get the numeric level of a role (higher = more privileged)
 */
function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * usePermissions - Hook for permission and role checking
 *
 * @example
 * ```tsx
 * const { hasPermission, hasRole, hasMinimumRole } = usePermissions();
 *
 * // Check single permission
 * if (hasPermission('view:finance')) {
 *   showFinanceReport();
 * }
 *
 * // Check role
 * if (hasRole('SuperAdmin')) {
 *   showAdminPanel();
 * }
 *
 * // Check minimum role level
 * if (hasMinimumRole('OperationsManager')) {
 *   showManagementFeatures();
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { user, isAuthenticated } = useAuthStore();

  const hasPermission = useCallback(
    (permission: Permission | string): boolean => {
      if (!user) return false;
      if (user.permissions.includes('*:*')) return true;
      return user.permissions.includes(permission as Permission);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissions: (Permission | string)[]): boolean => {
      if (!user) return false;
      if (user.permissions.includes('*:*')) return true;
      return permissions.some(perm =>
        user.permissions.includes(perm as Permission)
      );
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: (Permission | string)[]): boolean => {
      if (!user) return false;
      if (user.permissions.includes('*:*')) return true;
      return permissions.every(perm =>
        user.permissions.includes(perm as Permission)
      );
    },
    [user]
  );

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const hasMinimumRole = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!user) return false;
      return getRoleLevel(user.role) >= getRoleLevel(minimumRole);
    },
    [user]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasMinimumRole,
    permissions: user?.permissions || [],
    role: user?.role || null,
    isAuthenticated,
  };
}

export default usePermissions;
