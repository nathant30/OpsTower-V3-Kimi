/**
 * RoleGuard Component
 *
 * A wrapper component that conditionally renders children based on user roles.
 * Use this to protect UI elements that require specific role levels.
 */

import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserRole } from '@/types/auth.types';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  /** Array of allowed roles that can view the children */
  allowedRoles: UserRole[];
  /** Optional fallback content to render when role is not allowed */
  fallback?: ReactNode;
  /** Content to render when role is allowed */
  children: ReactNode;
}

/**
 * Role hierarchy for checking minimum role requirements
 * Higher index = higher privilege
 */
export const ROLE_HIERARCHY: UserRole[] = [
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
 * ```
 */
export function RoleGuard({ allowedRoles, fallback = null, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in, don't render
  if (!user) {
    return fallback;
  }

  // Check if user's role is in the allowed roles list
  const hasAllowedRole = allowedRoles.includes(user.role);

  if (!hasAllowedRole) {
    return fallback;
  }

  return children;
}

interface MinimumRoleGuardProps {
  /** Minimum required role level */
  minimumRole: UserRole;
  /** Optional fallback content to render when role is not sufficient */
  fallback?: ReactNode;
  /** Content to render when role requirement is met */
  children: ReactNode;
}

/**
 * MinimumRoleGuard - Renders children only if user has at least the minimum required role level
 *
 * @example
 * ```tsx
 * <MinimumRoleGuard minimumRole="OperationsManager">
 *   <SensitiveFeature />
 * </MinimumRoleGuard>
 * ```
 */
export function MinimumRoleGuard({ minimumRole, fallback = null, children }: MinimumRoleGuardProps) {
  const { user } = useAuthStore();

  // If no user is logged in, don't render
  if (!user) {
    return fallback;
  }

  // Check if user's role meets the minimum requirement
  const meetsRoleRequirement = hasMinimumRole(user.role, minimumRole);

  if (!meetsRoleRequirement) {
    return fallback;
  }

  return children;
}

export default RoleGuard;
