/**
 * ProtectedRoute Component
 * Handles authentication and authorization guards
 * 
 * Features:
 * - Authentication check (redirects to /rbac/login)
 * - Role-based access control (allowedRoles)
 * - Permission-based access control (requiredPermission, requiredPermissions)
 * - Device-type restrictions (allowedDevices)
 * - Loading states
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { UserRole, Permission } from '@/types/auth.types';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedDevices?: DeviceType[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  /** Single permission required to access this route */
  requiredPermission?: Permission;
  /** Multiple permissions required to access this route */
  requiredPermissions?: Permission[];
  /** Whether ALL permissions are required (default: false = any permission grants access) */
  requireAll?: boolean;
}

// Detect device type based on screen width and user agent
function getDeviceType(): DeviceType {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for mobile/tablet in user agent
  const isMobile = /iphone|ipod|android.*mobile|windows phone/.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(userAgent);
  
  if (isMobile || width < 640) return 'mobile';
  if (isTablet || (width >= 640 && width < 1024)) return 'tablet';
  return 'desktop';
}

// Check if user has required role
function hasRequiredRole(userRole: UserRole, allowedRoles?: UserRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (allowedRoles.includes(userRole)) return true;
  
  // SuperAdmin bypass
  if (userRole === 'SuperAdmin') return true;
  
  // Role hierarchy for broader access
  const roleHierarchy: Record<UserRole, number> = {
    'SuperAdmin': 100,
    'CCHead': 90,
    'CCManager': 80,
    'CCTeamLead': 70,
    'CCOperator': 60,
    'DepotManager': 70,
    'UtilityCrew': 50,
    'ERT': 60,
    'FieldOperator': 55,
    'Compliance': 65,
    'Audit': 50,
    'Finance': 60,
    'Support': 50,
    'OperationsDirector': 85,
    'OperationsManager': 75,
    'FleetManager': 70,
    'FinanceManager': 70,
    'SupportAgent': 50,
    'Viewer': 10,
  };
  
  // If user role has higher hierarchy than any allowed role, grant access
  const userLevel = roleHierarchy[userRole] || 0;
  const minRequiredLevel = Math.min(...allowedRoles.map(r => roleHierarchy[r] || 0));
  
  return userLevel >= minRequiredLevel;
}

// Check if device is allowed
function isDeviceAllowed(currentDevice: DeviceType, allowedDevices?: DeviceType[]): boolean {
  if (!allowedDevices || allowedDevices.length === 0) return true;
  return allowedDevices.includes(currentDevice);
}

// Check if user has required permission
function hasPermission(userPermissions: Permission[], required: Permission): boolean {
  return userPermissions.includes('*:*') || userPermissions.includes(required);
}

// Check if user has any of the required permissions
function hasAnyPermission(userPermissions: Permission[], required: Permission[]): boolean {
  if (userPermissions.includes('*:*')) return true;
  return required.some(perm => userPermissions.includes(perm));
}

// Check if user has all required permissions
function hasAllPermissions(userPermissions: Permission[], required: Permission[]): boolean {
  if (userPermissions.includes('*:*')) return true;
  return required.every(perm => userPermissions.includes(perm));
}

export function ProtectedRoute({
  children,
  allowedRoles,
  allowedDevices,
  requireAuth = true,
  fallback,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
}: ProtectedRouteProps): React.ReactElement {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const deviceType = getDeviceType();
  
  // Not authenticated - redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/rbac/login" state={{ from: location }} replace />;
  }
  
  // Authenticated but no user data (edge case)
  if (requireAuth && isAuthenticated && !user) {
    return <Navigate to="/rbac/login" state={{ from: location }} replace />;
  }
  
  // Check role permissions
  if (user && allowedRoles && !hasRequiredRole(user.role, allowedRoles)) {
    // Show access denied or redirect
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0f] p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            Your role ({user.role}) does not have permission to access this module.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check single permission
  if (user && requiredPermission && !hasPermission(user.permissions, requiredPermission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0f] p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Permission Denied</h2>
          <p className="text-gray-400 mb-6">
            You don't have the required permission to access this feature.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check multiple permissions
  if (user && requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(user.permissions, requiredPermissions)
      : hasAnyPermission(user.permissions, requiredPermissions);

    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0f] p-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Permission Denied</h2>
            <p className="text-gray-400 mb-6">
              You don't have the required permissions to access this feature.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }
  
  // Check device restrictions
  if (allowedDevices && !isDeviceAllowed(deviceType, allowedDevices)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0f] p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Device Not Supported</h2>
          <p className="text-gray-400 mb-6">
            This module requires a {allowedDevices.join(' or ')} device. 
            You are currently on a {deviceType}.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // All checks passed - render children
  return <>{children}</>;
}

export default ProtectedRoute;
