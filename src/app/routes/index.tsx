import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/app/layouts/MainLayout';
import { lazy, Suspense } from 'react';
import type { UserRole, Permission } from '@/types/auth.types';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { RoleGuard, PermissionGuard } from '@/components/auth';

// ============ CORE PAGES ============
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const NotFoundPage = lazy(() => import('@/app/pages/NotFoundPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const MobileDashboard = lazy(() => import('@/features/mobile/pages/MobileDashboard'));
const ChangePasswordPage = lazy(() => import('@/features/auth/pages/ChangePasswordPage'));

// ============ PUBLIC PAGES (No Layout) ============
const RBACLogin = lazy(() => import('@/features/rbac/pages/RBACLogin'));
const GodModeLogin = lazy(() => import('@/features/auth/pages/GodModeLogin'));

// ============ MODULE ROUTES ============
import {
  commandCenterRoutes,
  groundOpsRoutes,
  depotsRoutes,
  driversRoutes,
  shiftsRoutes,
  bondsRoutes,
  tiersRoutes,
  financeRoutes,
  insightsRoutes,
  supportRoutes,
  adminRoutes,
} from './modules';

// ============ LOADING FALLBACK ============
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

// ============ ROUTE WRAPPER COMPONENTS ============
// These are components, not function calls, to avoid circular deps

function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

function ProtectedPage({ 
  children, 
  allowedRoles, 
  allowedDevices,
  requiredPermission,
  requiredPermissions,
  requireAllPermissions = false,
}: { 
  children: React.ReactNode; 
  allowedRoles?: UserRole[];
  allowedDevices?: ('desktop' | 'tablet' | 'mobile')[];
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
}) {
  return (
    <ProtectedRoute 
      allowedRoles={allowedRoles} 
      allowedDevices={allowedDevices}
      requiredPermission={requiredPermission}
      requiredPermissions={requiredPermissions}
      requireAll={requireAllPermissions}
    >
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ProtectedRoute>
  );
}

// ============ PROTECTED ROUTE CONFIGURATION ============

// User profile (accessible to all authenticated)
const profileRoute = {
  path: 'profile',
  element: <ProtectedPage allowedRoles={undefined}><ProfilePage /></ProtectedPage>,
};

// Change password page (accessible to all authenticated)
const changePasswordRoute = {
  path: 'change-password',
  element: (
    <ProtectedPage allowedRoles={undefined}>
      <ChangePasswordPage />
    </ProtectedPage>
  ),
};

// Mobile app route
const mobileRoute = {
  path: 'mobile',
  element: <ProtectedPage allowedRoles={undefined} allowedDevices={['mobile', 'tablet']}><MobileDashboard /></ProtectedPage>,
};

// Dashboard
const dashboardRoute = {
  index: true,
  element: <ProtectedPage allowedRoles={undefined}><DashboardPage /></ProtectedPage>,
};

// ============ MAIN ROUTER ============
export const router = createBrowserRouter([
  // ============ PUBLIC ROUTES (No MainLayout) ============
  {
    path: '/admin/rbac/login',
    element: <PublicRoute><RBACLogin /></PublicRoute>,
  },
  {
    path: '/admin/god-mode',
    element: <PublicRoute><GodModeLogin /></PublicRoute>,
  },
  // Legacy public routes
  {
    path: '/rbac/login',
    element: <Navigate to="/admin/rbac/login" replace />,
  },
  {
    path: '/login',
    element: <Navigate to="/admin/rbac/login" replace />,
  },
  {
    path: '/god',
    element: <Navigate to="/admin/god-mode" replace />,
  },
  {
    path: '/dev-login',
    element: <Navigate to="/admin/god-mode" replace />,
  },
  
  // ============ PROTECTED ROUTES (With MainLayout) ============
  {
    element: <MainLayout />,
    children: [
      dashboardRoute,
      
      // Module routes (imported from modules/)
      commandCenterRoutes,
      groundOpsRoutes,
      depotsRoutes,
      driversRoutes,
      shiftsRoutes,
      bondsRoutes,
      tiersRoutes,
      financeRoutes,
      insightsRoutes,
      supportRoutes,
      adminRoutes,
      profileRoute,
      changePasswordRoute,
      mobileRoute,
      
      // ============ RBAC PROTECTED ROUTE EXAMPLES ============
      // These demonstrate how to use RoleGuard and PermissionGuard for routes
      
      // Admin-only route using RoleGuard
      {
        path: 'admin-only',
        element: (
          <RoleGuard 
            allowedRoles={['SuperAdmin', 'CCHead']} 
            showAccessDenied
          >
            <Suspense fallback={<PageLoader />}>
              <div className="p-8 text-white">Admin Only Content</div>
            </Suspense>
          </RoleGuard>
        ),
      },
      
      // Permission-protected route using PermissionGuard
      {
        path: 'finance-reports',
        element: (
          <PermissionGuard 
            permission={['finance:view', 'finance:export']} 
            showAccessDenied
          >
            <Suspense fallback={<PageLoader />}>
              <div className="p-8 text-white">Finance Reports</div>
            </Suspense>
          </PermissionGuard>
        ),
      },
      
      // ============ LEGACY REDIRECTS ============
      {
        path: 'live/map',
        element: <Navigate to="/command/live" replace />,
      },
      {
        path: 'live/rides',
        element: <Navigate to="/command/live" replace />,
      },
      {
        path: 'live-map',
        element: <Navigate to="/command/live" replace />,
      },
      {
        path: 'live-rides',
        element: <Navigate to="/command/live" replace />,
      },
      {
        path: 'dispatch',
        element: <Navigate to="/command/dispatch" replace />,
      },
      {
        path: 'incidents',
        element: <Navigate to="/command/incidents" replace />,
      },
      {
        path: 'dashcams',
        element: <Navigate to="/ground/dashcams" replace />,
      },
      {
        path: 'dashcam',
        element: <Navigate to="/ground/dashcams" replace />,
      },
      {
        path: 'fleet',
        element: <Navigate to="/depots" replace />,
      },
      {
        path: 'analytics',
        element: <Navigate to="/insights" replace />,
      },
      {
        path: 'analytics/reports',
        element: <Navigate to="/insights/reports" replace />,
      },
      {
        path: 'analytics/monitoring',
        element: <Navigate to="/insights/monitoring" replace />,
      },
      {
        path: 'audit',
        element: <Navigate to="/insights/audit" replace />,
      },
      {
        path: 'operations',
        element: <Navigate to="/ground" replace />,
      },
      {
        path: 'orders',
        element: <Navigate to="/support/orders" replace />,
      },
      {
        path: 'fraud',
        element: <Navigate to="/insights" replace />,
      },
      {
        path: 'compliance',
        element: <Navigate to="/admin/compliance" replace />,
      },
      {
        path: 'passengers',
        element: <Navigate to="/support/passengers" replace />,
      },
      {
        path: 'billing',
        element: <Navigate to="/finance/billing" replace />,
      },
      {
        path: 'earnings',
        element: <Navigate to="/finance/earnings" replace />,
      },
      {
        path: 'payments',
        element: <Navigate to="/finance/payments" replace />,
      },
      {
        path: 'bookings',
        element: <Navigate to="/support" replace />,
      },
      {
        path: 'verifications',
        element: <Navigate to="/ground/verifications" replace />,
      },
      {
        path: 'verification',
        element: <Navigate to="/ground/verifications" replace />,
      },
      {
        path: 'rbac',
        element: <Navigate to="/admin/rbac" replace />,
      },
      {
        path: 'settings',
        element: <Navigate to="/admin/settings" replace />,
      },
      
      // 404 - accessible without auth to show not found
      {
        path: '*',
        element: <Suspense fallback={<PageLoader />}><NotFoundPage /></Suspense>,
      },
    ],
  },
]);

// ============ MODULE METADATA FOR SIDEBAR ============
export const MODULE_METADATA = {
  command: {
    label: 'Command Center',
    icon: 'Terminal',
    description: 'Live operations, dispatch, and incident management',
    defaultPath: '/command',
    allowedRoles: ['CCHead', 'CCManager', 'CCTeamLead', 'CCOperator', 'FieldOperator', 'ERT', 'SuperAdmin'] as UserRole[],
  },
  ground: {
    label: 'Ground Ops',
    icon: 'ClipboardList',
    description: 'Field operations, ERT, and hub management',
    defaultPath: '/ground',
    allowedRoles: ['CCHead', 'CCManager', 'ERT', 'FieldOperator', 'UtilityCrew', 'DepotManager', 'SuperAdmin'] as UserRole[],
  },
  depots: {
    label: 'Depots',
    icon: 'Warehouse',
    description: 'Vehicle prep, checkout, and damage logging',
    defaultPath: '/depots',
    allowedRoles: ['CCHead', 'CCManager', 'DepotManager', 'UtilityCrew', 'SuperAdmin'] as UserRole[],
  },
  drivers: {
    label: 'Drivers',
    icon: 'Users',
    description: 'Driver management, shifts, and tier programs',
    defaultPath: '/drivers',
    allowedRoles: ['CCHead', 'CCManager', 'CCTeamLead', 'DepotManager', 'Compliance', 'Audit', 'SuperAdmin'] as UserRole[],
  },
  finance: {
    label: 'Finance',
    icon: 'Wallet',
    description: 'Financial operations and reporting',
    defaultPath: '/finance',
    allowedRoles: ['CCHead', 'Finance', 'FinanceManager', 'SuperAdmin'] as UserRole[],
  },
  insights: {
    label: 'Insights',
    icon: 'BarChart3',
    description: 'Analytics, reports, and audit logs',
    defaultPath: '/insights',
    allowedRoles: ['CCHead', 'CCManager', 'Audit', 'OperationsDirector', 'SuperAdmin'] as UserRole[],
  },
  support: {
    label: 'Support',
    icon: 'Headphones',
    description: 'Customer support and order management',
    defaultPath: '/support',
    allowedRoles: ['CCHead', 'CCManager', 'Support', 'SupportAgent', 'SuperAdmin'] as UserRole[],
  },
  admin: {
    label: 'Admin',
    icon: 'Settings',
    description: 'System settings and access control',
    defaultPath: '/admin/settings',
    allowedRoles: ['CCHead', 'SuperAdmin'] as UserRole[],
  },
};

export default router;
