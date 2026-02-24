// RBAC Feature
// Role-Based Access Control components and hooks

// Pages
export { default as RBACDemo } from './pages/RBACDemo';
export { default as RBACLogin } from './pages/RBACLogin';

// Components
export { PermissionGuard } from './components/PermissionGuard';
export { RoleGuard, MinimumRoleGuard, getRoleLevel, hasMinimumRole } from './components/RoleGuard';

// Hooks
export { usePermissions } from './hooks/usePermissions';

// Re-export RBAC library for convenience
export {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  getRoleLevel as getRoleLevelFromLib,
  hasMinimumRole as hasMinimumRoleFromLib,
  getRoleDefinition,
  getRolePermissions,
  checkPermission,
  hasAnyPermission,
  hasAllPermissions,
  type RoleDefinition,
} from '@/lib/rbac/rbac';
