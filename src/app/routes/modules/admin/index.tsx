/**
 * Admin Module Routes
 * 
 * Routes for:
 * - /admin/settings - System settings
 * - /admin/rbac - RBAC management
 * - /admin/compliance - Compliance page
 * 
 * Access: CCHead, SuperAdmin only
 * 
 * Note: /admin/rbac/login and /admin/god-mode are defined as public routes
 * in the main router (outside of MainLayout)
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));
const RBACDemo = lazy(() => import('@/features/rbac/pages/RBACDemo'));
const CompliancePage = lazy(() => import('@/features/compliance/pages/CompliancePage'));
const ErrorDashboard = lazy(() => import('@/features/errors/pages/ErrorDashboard'));

const adminRoles = ['CCHead', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const adminRoutes = {
  path: 'admin',
  children: [
    {
      path: 'settings',
      element: (
        <ProtectedRoute allowedRoles={[...adminRoles]}>
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'rbac',
      element: (
        <ProtectedRoute allowedRoles={[...adminRoles]}>
          <Suspense fallback={<PageLoader />}>
            <RBACDemo />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'compliance',
      element: (
        <ProtectedRoute allowedRoles={[...adminRoles, 'Compliance']}>
          <Suspense fallback={<PageLoader />}>
            <CompliancePage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'errors',
      element: (
        <ProtectedRoute allowedRoles={[...adminRoles]}>
          <Suspense fallback={<PageLoader />}>
            <ErrorDashboard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default adminRoutes;
