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
  /** Single permission or array of permissions required to view the children */
  permission: Permission | Permission[] | string;
  /** Whether all permissions are required (default: false = any permission grants access) */
  requireAll?: boolean;
  /** Optional fallback content to render when permission is not granted */
  fallback?: ReactNode;
  /** Content to render when permission is granted */
  children: ReactNode;
}

/**
 * PermissionGuard - Renders children only if user has the required permission(s)
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGuard permission="view:finance">
 *   <FinanceReport />
 * </PermissionGuard>
 *
 * // Any of multiple permissions
 * <PermissionGuard permission={['edit:orders', 'cancel:orders']}>
 *   <OrderActions />
 * </PermissionGuard>
 *
 * // All permissions required
 * <PermissionGuard permission={['manage:users', 'manage:settings']} requireAll>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * // With fallback
 * <PermissionGuard
 *   permission="view:audit"
 *   fallback={<p>You don't have access to view audit logs</p>}
 * >
 *   <AuditLogs />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in, don't render
  if (!user) {
    return fallback;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const userPermissions = user.permissions;

  // Super admin has all permissions
  if (userPermissions.includes('*:*')) {
    return children;
  }

  // Check permissions
  const hasAccess = requireAll
    ? permissions.every(perm => userPermissions.includes(perm as Permission))
    : permissions.some(perm => userPermissions.includes(perm as Permission));

  if (!hasAccess) {
    return fallback;
  }

  return children;
}

export default PermissionGuard;
