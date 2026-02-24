/**
 * Ground Operations Module Routes
 * 
 * Routes for:
 * - /ground - Main ground ops dashboard
 * - /ground/ert - ERT specific view
 * - /ground/hubs - Hub management
 * - /ground/dashcams - Dashcam management
 * - /ground/verifications - Driver verification review
 * 
 * Access: CCHead, CCManager, ERT, FieldOperator, UtilityCrew, DepotManager
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const OperationsPage = lazy(() => import('@/features/operations/pages/OperationsPage'));
const FleetPage = lazy(() => import('@/features/fleet/pages/FleetPage'));
const DashcamManagement = lazy(() => import('@/features/dashcam/pages/DashcamManagement'));
const VerificationReview = lazy(() => import('@/features/verification/pages/VerificationReview'));

const groundRoles = ['CCHead', 'CCManager', 'ERT', 'FieldOperator', 'UtilityCrew', 'DepotManager', 'SuperAdmin'] as const;
const ertRoles = ['CCHead', 'CCManager', 'ERT', 'SuperAdmin'] as const;
const hubRoles = ['CCHead', 'CCManager', 'DepotManager', 'UtilityCrew', 'SuperAdmin'] as const;
const complianceRoles = ['CCHead', 'CCManager', 'DepotManager', 'Compliance', 'Audit', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const groundOpsRoutes = {
  path: 'ground',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...groundRoles]}>
          <Suspense fallback={<PageLoader />}>
            <OperationsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'ert',
      element: (
        <ProtectedRoute allowedRoles={[...ertRoles]}>
          <Suspense fallback={<PageLoader />}>
            <OperationsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'hubs',
      element: (
        <ProtectedRoute allowedRoles={[...hubRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FleetPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'dashcams',
      lazy: async () => {
        try {
          const { default: Component } = await import('@/features/dashcam/pages/DashcamManagement');
          return { Component: () => (
            <ProtectedRoute allowedRoles={[...complianceRoles]}>
              <Component />
            </ProtectedRoute>
          )};
        } catch (err) {
          console.error('Failed to load DashcamManagement:', err);
          return { Component: () => <div style={{padding: 20, color: 'red'}}>Failed to load: {String(err)}</div> };
        }
      },
    },
    {
      path: 'verifications',
      element: (
        <ProtectedRoute allowedRoles={['CCHead', 'CCManager', 'Compliance', 'DepotManager', 'SuperAdmin']}>
          <Suspense fallback={<PageLoader />}>
            <VerificationReview />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default groundOpsRoutes;
