/**
 * RoleGuard Component
 *
 * A wrapper component that conditionally renders children based on user roles.
 * Use this to protect UI elements that require specific role levels.
 */

import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserRole } from '@/types/auth.types';
import type { ReactNode } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';

interface RoleGuardProps {
  /** Array of allowed roles that can view the children */
  allowedRoles: UserRole[];
  /** Optional fallback content to render when role is not allowed */
  fallback?: ReactNode;
  /** Content to render when role is allowed */
  children: ReactNode;
  /** Optional redirect path when role is denied (instead of showing fallback) */
  redirectTo?: string;
  /** Whether to show access denied UI instead of fallback/redirect */
  showAccessDenied?: boolean;
  /** Custom access denied message */
  accessDeniedMessage?: string;
}

/**
 * Role hierarchy for checking minimum role requirements
 * Higher index = higher privilege
 */
export const ROLE_HIERARCHY: UserRole[] = [
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

/**
 * Get the numeric level of a role (higher = more privileged)
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Check if a user role meets the minimum required role level
 * This checks if user's role level >= minimum required role level
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * RoleGuard - Renders children only if user has one of the allowed roles
 *
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={['OperationsManager', 'OperationsDirector', 'SuperAdmin']}>
 *   <IncidentManagement />
 * </RoleGuard>
 *
 * // With redirect on denial
 * <RoleGuard allowedRoles={['SuperAdmin']} redirectTo="/unauthorized">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // With access denied UI
 * <RoleGuard allowedRoles={['Finance', 'FinanceManager']} showAccessDenied>
 *   <FinanceReport />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  allowedRoles,
  fallback = null,
  children,
  redirectTo,
  showAccessDenied = false,
  accessDeniedMessage,
}: RoleGuardProps) {
  const { user, hasRole } = useAuthStore();

  // If no user is logged in, redirect to login or show fallback
  if (!user) {
    if (redirectTo) {
      return <Navigate to="/login" replace />;
    }
    return fallback;
  }

  // Check if user's role is in the allowed roles list using store method
  const hasAllowedRole = hasRole(allowedRoles);

  if (!hasAllowedRole) {
    // Redirect if specified
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Show access denied UI if requested
    if (showAccessDenied) {
      return (
        <AccessDeniedPage
          message={accessDeniedMessage || `This area requires one of the following roles: ${allowedRoles.join(', ')}`}
        />
      );
    }

    // Otherwise show fallback
    return fallback;
  }

  return <>{children}</>;
}

interface MinimumRoleGuardProps {
  /** Minimum required role level */
  minimumRole: UserRole;
  /** Optional fallback content to render when role is not sufficient */
  fallback?: ReactNode;
  /** Content to render when role requirement is met */
  children: ReactNode;
  /** Optional redirect path when role is denied */
  redirectTo?: string;
  /** Whether to show access denied UI */
  showAccessDenied?: boolean;
}

/**
 * MinimumRoleGuard - Renders children only if user has at least the minimum required role level
 *
 * @example
 * ```tsx
 * <MinimumRoleGuard minimumRole="OperationsManager">
 *   <SensitiveFeature />
 * </MinimumRoleGuard>
 *
 * // With access denied UI
 * <MinimumRoleGuard minimumRole="CCManager" showAccessDenied>
 *   <ApprovalPanel />
 * </MinimumRoleGuard>
 * ```
 */
export function MinimumRoleGuard({
  minimumRole,
  fallback = null,
  children,
  redirectTo,
  showAccessDenied = false,
}: MinimumRoleGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in, redirect to login or show fallback
  if (!user) {
    if (redirectTo) {
      return <Navigate to="/login" replace />;
    }
    return fallback;
  }

  // Check if user's role meets the minimum requirement
  const meetsRoleRequirement = hasMinimumRole(user.role, minimumRole);

  if (!meetsRoleRequirement) {
    // Redirect if specified
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Show access denied UI if requested
    if (showAccessDenied) {
      return (
        <AccessDeniedPage
          message={`This area requires at least ${minimumRole} level access.`}
        />
      );
    }

    // Otherwise show fallback
    return fallback;
  }

  return <>{children}</>;
}

interface AdminGuardProps {
  /** Content to render for admin users */
  children: ReactNode;
  /** Optional fallback content */
  fallback?: ReactNode;
  /** Optional redirect path */
  redirectTo?: string;
  /** Whether to show access denied UI */
  showAccessDenied?: boolean;
}

/**
 * AdminGuard - Renders children only if user is an admin (SuperAdmin, CCHead, etc.)
 *
 * @example
 * ```tsx
 * <AdminGuard>
 *   <AdminPanel />
 * </AdminGuard>
 * ```
 */
export function AdminGuard({
  children,
  fallback = null,
  redirectTo,
  showAccessDenied = false,
}: AdminGuardProps) {
  const { isAdmin } = useAuthStore();
  const userIsAdmin = isAdmin();

  if (!userIsAdmin) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    if (showAccessDenied) {
      return (
        <AccessDeniedPage message="This area requires administrator privileges." />
      );
    }

    return fallback;
  }

  return <>{children}</>;
}

interface SuperAdminGuardProps {
  /** Content to render for SuperAdmin users */
  children: ReactNode;
  /** Optional fallback content */
  fallback?: ReactNode;
  /** Optional redirect path */
  redirectTo?: string;
}

/**
 * SuperAdminGuard - Renders children only if user is SuperAdmin
 *
 * @example
 * ```tsx
 * <SuperAdminGuard>
 *   <SystemSettings />
 * </SuperAdminGuard>
 * ```
 */
export function SuperAdminGuard({
  children,
  fallback = null,
  redirectTo,
}: SuperAdminGuardProps) {
  const { isSuperAdmin } = useAuthStore();
  const userIsSuperAdmin = isSuperAdmin();

  if (!userIsSuperAdmin) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    return fallback;
  }

  return <>{children}</>;
}

/**
 * Access Denied Page Component
 */
function AccessDeniedPage({ message }: { message: string }) {
  const navigate = useNavigate();

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
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </XpressCard>
    </div>
  );
}

export default RoleGuard;
