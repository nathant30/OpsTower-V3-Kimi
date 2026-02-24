/**
 * PermissionGuard Component
 *
 * A wrapper component that conditionally renders children based on user permissions.
 * Use this to protect UI elements that require specific permissions.
 */

import { useAuthStore } from '@/lib/stores/auth.store';
import type { Permission } from '@/types/auth.types';
import type { ReactNode } from 'react';

interface PermissionGuardProps {
  /** The required permission to view the children */
  permission: Permission;
  /** Optional fallback content to render when permission is not granted */
  fallback?: ReactNode;
  /** Content to render when permission is granted */
  children: ReactNode;
}

/**
 * PermissionGuard - Renders children only if user has the required permission
 *
 * @example
 * ```tsx
 * <PermissionGuard permission="cancel:orders" fallback={<span>Unauthorized</span>}>
 *   <Button>Cancel Order</Button>
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({ permission, fallback = null, children }: PermissionGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in, don't render
  if (!user) {
    return fallback;
  }

  // Check if user has the required permission
  const hasPermission = user.permissions.includes(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
}

export default PermissionGuard;
