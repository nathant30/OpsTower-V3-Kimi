/**
 * Protected Route Component
 * Guards routes based on authentication status and user permissions
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import type { Permission, UserRole } from '@/types/auth.types';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  requiredRole?: UserRole;
  minimumRole?: UserRole;
  fallback?: ReactNode;
}

/**
 * Check if user has required permission
 */
function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  return userPermissions.includes('*:*') || userPermissions.includes(required);
}

/**
 * Check if user has any of the required permissions
 */
function hasAnyPermission(userPermissions: Permission[], required: Permission[]): boolean {
  if (userPermissions.includes('*:*')) return true;
  return required.some(perm => userPermissions.includes(perm));
}

/**
 * Check if user has all required permissions
 */
function hasAllPermissions(userPermissions: Permission[], required: Permission[]): boolean {
  if (userPermissions.includes('*:*')) return true;
  return required.every(perm => userPermissions.includes(perm));
}

/**
 * Role hierarchy for checking minimum role
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
 * Get role level (higher = more privileged)
 */
function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if user meets minimum role requirement
 */
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * ProtectedRoute - Guards routes based on auth and permissions
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  requiredRole,
  minimumRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && user.role !== requiredRole) {
    return (
      <AccessDenied 
        message={`This area requires the ${requiredRole} role.`}
        fallback={fallback}
      />
    );
  }

  // Check minimum role requirement
  if (minimumRole && !hasMinimumRole(user.role, minimumRole)) {
    return (
      <AccessDenied 
        message={`This area requires at least ${minimumRole} level access.`}
        fallback={fallback}
      />
    );
  }

  // Check single permission
  if (requiredPermission && !hasPermission(user.permissions, requiredPermission)) {
    return (
      <AccessDenied 
        message="You don't have permission to access this feature."
        fallback={fallback}
      />
    );
  }

  // Check multiple permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll 
      ? hasAllPermissions(user.permissions, requiredPermissions)
      : hasAnyPermission(user.permissions, requiredPermissions);

    if (!hasAccess) {
      return (
        <AccessDenied 
          message="You don't have the required permissions to access this feature."
          fallback={fallback}
        />
      );
    }
  }

  // All checks passed - render children
  return <>{children}</>;
}

/**
 * Access Denied Component
 */
function AccessDenied({ 
  message, 
  fallback 
}: { 
  message: string;
  fallback?: ReactNode;
}) {
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <XpressCard
        title="Access Denied"
        icon={<Shield className="w-6 h-6 text-red-500" />}
        className="max-w-md w-full"
      >
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto" />
          <p className="text-gray-400">{message}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
        </div>
      </XpressCard>
    </div>
  );
}

/**
 * Public Route - Only accessible when NOT authenticated
 * Redirects to home if already logged in
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

/**
 * Admin Route - Only accessible by SuperAdmin
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="SuperAdmin">
      {children}
    </ProtectedRoute>
  );
}

/**
 * Permission Route - Requires specific permission
 */
export function PermissionRoute({ 
  permission, 
  children 
}: { 
  permission: Permission;
  children: ReactNode;
}) {
  return (
    <ProtectedRoute requiredPermission={permission}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
