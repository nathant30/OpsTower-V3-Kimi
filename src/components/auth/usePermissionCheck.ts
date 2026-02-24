/**
 * usePermissionCheck Hook
 *
 * Custom hook for checking permissions and roles with toast notifications.
 * Use this for action buttons that need permission checks before executing.
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { Permission, UserRole } from '@/types/auth.types';
import { hasMinimumRole } from './RoleGuard';

// Simple toast notification type
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

/**
 * Simple toast notification function using a custom event
 * This allows any component to listen for toast notifications
 */
function showToast(options: ToastOptions): void {
  const event = new CustomEvent('opstower:toast', {
    detail: {
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 3000,
    },
  });
  window.dispatchEvent(event);
}

interface UsePermissionCheckReturn {
  /** Check if user has a specific permission */
  hasPermission: (permission: Permission) => boolean;
  /** Check if user has a specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if user has at least the minimum role level */
  hasMinimumRole: (minimumRole: UserRole) => boolean;
  /** Check permission and show toast if denied */
  checkPermission: (permission: Permission, actionName?: string) => boolean;
  /** Check role and show toast if denied */
  checkRole: (allowedRoles: UserRole[], actionName?: string) => boolean;
  /** Check minimum role and show toast if denied */
  checkMinimumRole: (minimumRole: UserRole, actionName?: string) => boolean;
}

/**
 * usePermissionCheck - Hook for permission checking with toast notifications
 *
 * @example
 * ```tsx
 * const { checkPermission, checkMinimumRole } = usePermissionCheck();
 *
 * const handleCancelOrder = () => {
 *   if (!checkPermission('cancel:orders', 'cancel orders')) return;
 *   // Proceed with cancel order
 * };
 *
 * const handleSuspendDriver = () => {
 *   if (!checkMinimumRole('OperationsDirector', 'suspend drivers')) return;
 *   // Proceed with suspend driver
 * };
 * ```
 */
export function usePermissionCheck(): UsePermissionCheckReturn {
  const { user } = useAuthStore();

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
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

  const hasMinimumRoleCheck = useCallback(
    (minimumRole: UserRole): boolean => {
      if (!user) return false;
      return hasMinimumRole(user.role, minimumRole);
    },
    [user]
  );

  const checkPermission = useCallback(
    (permission: Permission, actionName?: string): boolean => {
      if (!user) {
        showToast({
          message: 'Please log in to perform this action',
          type: 'warning',
        });
        return false;
      }

      const hasAccess = user.permissions.includes(permission);

      if (!hasAccess) {
        const action = actionName || 'perform this action';
        showToast({
          message: `You don't have permission to ${action}. Required permission: ${permission}`,
          type: 'error',
        });
      }

      return hasAccess;
    },
    [user]
  );

  const checkRole = useCallback(
    (allowedRoles: UserRole[], actionName?: string): boolean => {
      if (!user) {
        showToast({
          message: 'Please log in to perform this action',
          type: 'warning',
        });
        return false;
      }

      const hasAccess = allowedRoles.includes(user.role);

      if (!hasAccess) {
        const action = actionName || 'perform this action';
        const roles = allowedRoles.join(', ');
        showToast({
          message: `You don't have permission to ${action}. Required roles: ${roles}`,
          type: 'error',
        });
      }

      return hasAccess;
    },
    [user]
  );

  const checkMinimumRole = useCallback(
    (minimumRole: UserRole, actionName?: string): boolean => {
      if (!user) {
        showToast({
          message: 'Please log in to perform this action',
          type: 'warning',
        });
        return false;
      }

      const hasAccess = hasMinimumRole(user.role, minimumRole);

      if (!hasAccess) {
        const action = actionName || 'perform this action';
        showToast({
          message: `You don't have permission to ${action}. Minimum role required: ${minimumRole}`,
          type: 'error',
        });
      }

      return hasAccess;
    },
    [user]
  );

  return {
    hasPermission,
    hasRole,
    hasMinimumRole: hasMinimumRoleCheck,
    checkPermission,
    checkRole,
    checkMinimumRole,
  };
}

export default usePermissionCheck;
