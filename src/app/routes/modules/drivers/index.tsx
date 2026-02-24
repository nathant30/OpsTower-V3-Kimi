/**
 * Drivers Module Routes
 * 
 * Routes for:
 * - /drivers - Driver management
 * - /drivers/:driverId - Driver detail
 * - /shifts - Shift management
 * - /shifts/:shiftId - Shift detail
 * - /bonds - Driver bonds
 * - /tiers - Tier management
 * 
 * Access: CCHead, CCManager, CCTeamLead, DepotManager, Compliance, Audit
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const DriversPage = lazy(() => import('@/features/drivers/pages/DriversPage'));
const DriverDetailPage = lazy(() => import('@/features/drivers/pages/DriverDetailPage'));
const ShiftsPage = lazy(() => import('@/features/shifts/pages/ShiftsPage'));
const ShiftDetailPage = lazy(() => import('@/features/shifts/pages/ShiftDetailPage'));
const BondsPage = lazy(() => import('@/features/bonds/pages/BondsPage'));
const TierManagement = lazy(() => import('@/features/tiers/pages/TierManagement'));

const driverRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'DepotManager', 'Compliance', 'Audit', 'SuperAdmin'] as const;
const managerRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'DepotManager', 'SuperAdmin'] as const;
const financeRoles = ['CCHead', 'CCManager', 'Finance', 'FinanceManager', 'SuperAdmin'] as const;
const tierRoles = ['CCHead', 'CCManager', 'OperationsDirector', 'OperationsManager', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const driversRoutes = {
  path: 'drivers',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...driverRoles]}>
          <Suspense fallback={<PageLoader />}>
            <DriversPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: ':driverId',
      element: (
        <ProtectedRoute allowedRoles={[...managerRoles, 'Compliance']}>
          <Suspense fallback={<PageLoader />}>
            <DriverDetailPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export const shiftsRoutes = {
  path: 'shifts',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...managerRoles]}>
          <Suspense fallback={<PageLoader />}>
            <ShiftsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: ':shiftId',
      element: (
        <ProtectedRoute allowedRoles={[...managerRoles]}>
          <Suspense fallback={<PageLoader />}>
            <ShiftDetailPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export const bondsRoutes = {
  path: 'bonds',
  element: (
    <ProtectedRoute allowedRoles={[...financeRoles]}>
      <Suspense fallback={<PageLoader />}>
        <BondsPage />
      </Suspense>
    </ProtectedRoute>
  ),
};

export const tiersRoutes = {
  path: 'tiers',
  element: (
    <ProtectedRoute allowedRoles={[...tierRoles]}>
      <Suspense fallback={<PageLoader />}>
        <TierManagement />
      </Suspense>
    </ProtectedRoute>
  ),
};

export default { driversRoutes, shiftsRoutes, bondsRoutes, tiersRoutes };
