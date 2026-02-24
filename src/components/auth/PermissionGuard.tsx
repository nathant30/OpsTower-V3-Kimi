/**
 * PermissionGuard Component
 *
 * A wrapper component that conditionally renders children based on user permissions.
 * Use this to protect UI elements that require specific permissions.
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { Permission } from '@/types/auth.types';
import type { ReactNode } from 'react';

interface PermissionGuardProps {
  /** Single permission or array of permissions required to view the children */
  permission: Permission | Permission[] | string | string[];
  /** Whether all permissions are required (default: false = any permission grants access) */
  requireAll?: boolean;
  /** Optional fallback content to render when permission is not granted */
  fallback?: ReactNode;
  /** Content to render when permission is granted */
  children: ReactNode;
  /** Optional redirect path when permission is denied (instead of showing fallback) */
  redirectTo?: string;
  /** Whether to show access denied UI instead of fallback/redirect */
  showAccessDenied?: boolean;
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
 * // With redirect on denial
 * <PermissionGuard permission="view:audit" redirectTo="/unauthorized">
 *   <AuditLogs />
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
  redirectTo,
  showAccessDenied = false,
}: PermissionGuardProps) {
  const { user, hasPermission, hasAllPermissions } = useAuthStore();

  // If no user is logged in, redirect to login or show fallback
  if (!user) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return fallback;
  }

  // Normalize permissions to array
  const permissionsToCheck = Array.isArray(permission) ? permission : [permission];

  // Check permissions using store methods
  const hasAccess = requireAll
    ? hasAllPermissions(permissionsToCheck as Permission[])
    : hasPermission(permissionsToCheck as Permission[]);

  if (!hasAccess) {
    // Redirect if specified
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Show access denied UI if requested
    if (showAccessDenied) {
      return <AccessDeniedMessage />;
    }

    // Otherwise show fallback
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Simple access denied message component
 */
function AccessDeniedMessage() {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p className="text-red-400 text-sm">
        You don't have permission to access this feature.
      </p>
    </div>
  );
}

interface PermissionRouteGuardProps {
  /** Single permission or array of permissions required */
  permission: Permission | Permission[];
  /** Whether all permissions are required */
  requireAll?: boolean;
  /** Redirect path when permission is denied */
  redirectTo?: string;
  /** Content to render when permission is granted */
  children: ReactNode;
}

/**
 * PermissionRouteGuard - For use in route definitions
 * Automatically redirects to unauthorized page on permission denial
 */
export function PermissionRouteGuard({
  permission,
  requireAll = false,
  redirectTo = '/unauthorized',
  children,
}: PermissionRouteGuardProps) {
  return (
    <PermissionGuard
      permission={permission}
      requireAll={requireAll}
      redirectTo={redirectTo}
    >
      {children}
    </PermissionGuard>
  );
}

export default PermissionGuard;
