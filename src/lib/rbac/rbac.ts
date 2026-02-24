/**
 * RBAC (Role-Based Access Control) Core Library
 *
 * Centralized permission and role definitions for OpsTower.
 * Use these helpers for consistent permission checking across the application.
 */

import type { Permission, UserRole } from '@/types/auth.types';

// Flexible permission type for backward compatibility
type FlexiblePermission = Permission | string;

/**
 * Role definitions with their associated permissions
 */
export interface RoleDefinition {
  id: string;
  name: UserRole;
  description: string;
  color: string;
  permissions: FlexiblePermission[];
}

/**
 * All defined roles in the system
 */
export const ROLES: RoleDefinition[] = [
  {
    id: '1',
    name: 'SuperAdmin',
    description: 'Full system access',
    color: '#ef4444',
    permissions: ['*:*'],
  },
  {
    id: '2',
    name: 'OperationsDirector',
    description: 'Operations oversight',
    color: '#f97316',
    permissions: [
      'view:dashboard', 'view:analytics',
      'view:orders', 'create:orders', 'edit:orders', 'cancel:orders',
      'view:drivers', 'edit:drivers', 'suspend:drivers', 'verify:drivers',
      'view:fleet', 'edit:fleet', 'manage:maintenance',
      'view:incidents', 'create:incidents', 'edit:incidents', 'resolve:incidents', 'investigate:incidents',
      'process:payouts', 'export:transactions',
      'manage:users', 'manage:settings', 'view:audit',
      // New module permissions
      'module:command', 'module:ground', 'module:depots', 'module:drivers',
      'module:finance', 'module:insights', 'module:support', 'module:admin',
    ],
  },
  {
    id: '3',
    name: 'OperationsManager',
    description: 'Day-to-day operations',
    color: '#eab308',
    permissions: [
      'view:dashboard', 'view:analytics',
      'view:orders', 'create:orders', 'edit:orders',
      'view:drivers', 'edit:drivers', 'verify:drivers',
      'view:fleet', 'edit:fleet',
      'view:incidents', 'create:incidents', 'edit:incidents', 'resolve:incidents',
      'export:transactions',
      // New module permissions
      'module:command', 'module:ground', 'module:depots', 'module:drivers',
      'module:insights', 'module:support',
    ],
  },
  {
    id: '4',
    name: 'FleetManager',
    description: 'Fleet operations',
    color: '#22c55e',
    permissions: [
      'view:dashboard',
      'view:fleet', 'edit:fleet', 'manage:maintenance',
      'view:drivers', 'verify:drivers',
      'view:incidents',
      // New module permissions
      'module:depots', 'module:drivers',
    ],
  },
  {
    id: '5',
    name: 'FinanceManager',
    description: 'Financial management',
    color: '#3b82f6',
    permissions: [
      'view:dashboard', 'view:analytics',
      'process:payouts', 'adjust:transactions', 'export:transactions', 'reverse:transactions',
      'view:drivers',
      // New module permissions
      'module:finance', 'module:insights',
    ],
  },
  {
    id: '6',
    name: 'SupportAgent',
    description: 'Customer support',
    color: '#8b5cf6',
    permissions: [
      'view:dashboard',
      'view:orders', 'edit:orders',
      'view:drivers',
      'view:incidents', 'create:incidents',
      // New module permissions
      'module:support',
    ],
  },
  {
    id: '7',
    name: 'Viewer',
    description: 'Read-only access',
    color: '#6b7280',
    permissions: [
      'view:dashboard',
      'view:orders',
      'view:drivers',
      'view:fleet',
      'view:incidents',
      // New module permissions
      'module:insights',
    ],
  },
];

/**
 * All permission strings defined in the system (for reference)
 */
export const PERMISSIONS: FlexiblePermission[] = [
  // Legacy permissions
  'view:dashboard',
  'view:analytics',
  'view:orders',
  'create:orders',
  'edit:orders',
  'cancel:orders',
  'assign:drivers',
  'view:drivers',
  'edit:drivers',
  'suspend:drivers',
  'verify:drivers',
  'view:fleet',
  'edit:fleet',
  'manage:maintenance',
  'view:incidents',
  'create:incidents',
  'edit:incidents',
  'investigate:incidents',
  'resolve:incidents',
  'process:payouts',
  'adjust:transactions',
  'export:transactions',
  'reverse:transactions',
  'manage:users',
  'manage:settings',
  'view:audit',
  '*:*',
  // New module-based permissions
  'module:command',
  'module:ground',
  'module:depots',
  'module:drivers',
  'module:finance',
  'module:insights',
  'module:support',
  'module:admin',
];

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
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * Get role definition by role name
 */
export function getRoleDefinition(role: UserRole): RoleDefinition | undefined {
  return ROLES.find(r => r.name === role);
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): FlexiblePermission[] {
  const roleDef = getRoleDefinition(role);
  if (!roleDef) return [];
  if (roleDef.permissions.includes('*:*')) {
    return [...PERMISSIONS];
  }
  return roleDef.permissions;
}

/**
 * Check if user has a specific permission
 * @param userPermissions - Array of user's permissions
 * @param requiredPermission - Permission to check for
 */
export function checkPermission(
  userPermissions: FlexiblePermission[],
  requiredPermission: FlexiblePermission
): boolean {
  // Super admin has all permissions
  if (userPermissions.includes('*:*')) return true;
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has any of the required permissions
 * @param userPermissions - Array of user's permissions
 * @param requiredPermissions - Array of permissions (user needs at least one)
 */
export function hasAnyPermission(
  userPermissions: FlexiblePermission[],
  requiredPermissions: FlexiblePermission[]
): boolean {
  if (userPermissions.includes('*:*')) return true;
  return requiredPermissions.some(perm =>
    userPermissions.includes(perm)
  );
}

/**
 * Check if user has all of the required permissions
 * @param userPermissions - Array of user's permissions
 * @param requiredPermissions - Array of permissions (user needs all)
 */
export function hasAllPermissions(
  userPermissions: FlexiblePermission[],
  requiredPermissions: FlexiblePermission[]
): boolean {
  if (userPermissions.includes('*:*')) return true;
  return requiredPermissions.every(perm =>
    userPermissions.includes(perm)
  );
}
