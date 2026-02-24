/**
 * Auth Components - Barrel Export
 *
 * This file exports all authentication-related components and utilities.
 */

// Permission Guard exports
export { 
  PermissionGuard, 
  PermissionRouteGuard 
} from './PermissionGuard';

// Role Guard exports
export { 
  RoleGuard, 
  MinimumRoleGuard, 
  AdminGuard, 
  SuperAdminGuard,
  hasMinimumRole, 
  getRoleLevel,
  ROLE_HIERARCHY
} from './RoleGuard';

// Other auth utilities
export { usePermissionCheck } from './usePermissionCheck';
export { ToastProvider, toast } from './ToastProvider';

// Default exports
export { default } from './PermissionGuard';
