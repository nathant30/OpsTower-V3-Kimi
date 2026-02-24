/**
 * Insights Module Routes
 * 
 * Routes for:
 * - /insights - Main analytics dashboard
 * - /insights/analytics - Analytics view
 * - /insights/reports - Reports generation
 * - /insights/monitoring - System monitoring
 * - /insights/audit - Audit logs (restricted)
 * 
 * Access: CCHead, CCManager, Audit, OperationsDirector
 * Note: Audit logs restricted to CC Head and Audit team
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const AnalyticsDashboard = lazy(() => import('@/features/analytics/pages/AnalyticsDashboard'));
const Reports = lazy(() => import('@/features/analytics/pages/Reports'));
const Monitoring = lazy(() => import('@/features/analytics/pages/Monitoring'));
const AuditViewer = lazy(() => import('@/features/audit/pages/AuditViewer'));
const AIManagement = lazy(() => import('@/features/analytics/pages/AIManagement'));
const Alerts = lazy(() => import('@/features/analytics/pages/Alerts'));

const insightsRoles = ['CCHead', 'CCManager', 'Audit', 'OperationsDirector', 'SuperAdmin'] as const;
const monitoringRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'Audit', 'SuperAdmin'] as const;
const auditRoles = ['CCHead', 'Audit', 'Compliance', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const insightsRoutes = {
  path: 'insights',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...insightsRoles]}>
          <Suspense fallback={<PageLoader />}>
            <AnalyticsDashboard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'analytics',
      element: (
        <ProtectedRoute allowedRoles={[...insightsRoles]}>
          <Suspense fallback={<PageLoader />}>
            <AnalyticsDashboard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'reports',
      element: (
        <ProtectedRoute allowedRoles={[...insightsRoles]}>
          <Suspense fallback={<PageLoader />}>
            <Reports />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'monitoring',
      element: (
        <ProtectedRoute allowedRoles={[...monitoringRoles]}>
          <Suspense fallback={<PageLoader />}>
            <Monitoring />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'audit',
      element: (
        <ProtectedRoute allowedRoles={[...auditRoles]}>
          <Suspense fallback={<PageLoader />}>
            <AuditViewer />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'ai',
      element: (
        <ProtectedRoute allowedRoles={[...insightsRoles]}>
          <Suspense fallback={<PageLoader />}>
            <AIManagement />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'alerts',
      element: (
        <ProtectedRoute allowedRoles={[...monitoringRoles]}>
          <Suspense fallback={<PageLoader />}>
            <Alerts />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default insightsRoutes;
