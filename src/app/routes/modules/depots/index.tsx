/**
 * Depots Module Routes
 * 
 * Routes for:
 * - /depots - Depot overview
 * - /depots/prep - Vehicle prep tasks (Utility Crew)
 * - /depots/checkout - Checkout approval gate (Depot Manager)
 * - /depots/damage-log - Damage logging
 * - /depots/:vehicleId - Vehicle detail
 * 
 * Access: CCHead, CCManager, DepotManager, UtilityCrew
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const FleetPage = lazy(() => import('@/features/fleet/pages/FleetPage'));
const FleetDetailPage = lazy(() => import('@/features/fleet/pages/FleetDetailPage'));

const depotRoles = ['CCHead', 'CCManager', 'DepotManager', 'UtilityCrew', 'SuperAdmin'] as const;
const checkoutRoles = ['DepotManager', 'CCHead', 'SuperAdmin'] as const;
const damageRoles = ['DepotManager', 'UtilityCrew', 'Compliance', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const depotsRoutes = {
  path: 'depots',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...depotRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FleetPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'prep',
      element: (
        <ProtectedRoute allowedRoles={['DepotManager', 'UtilityCrew', 'CCHead', 'SuperAdmin']}>
          <Suspense fallback={<PageLoader />}>
            <FleetPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'checkout',
      element: (
        <ProtectedRoute allowedRoles={[...checkoutRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FleetDetailPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'damage-log',
      element: (
        <ProtectedRoute allowedRoles={[...damageRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FleetDetailPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: ':vehicleId',
      element: (
        <ProtectedRoute allowedRoles={[...depotRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FleetDetailPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default depotsRoutes;
