/**
 * Support Module Routes
 * 
 * Routes for:
 * - /support - Support dashboard
 * - /support/orders - Order management
 * - /support/orders/:orderId - Order detail
 * - /support/passengers - Passenger list
 * - /support/passengers/:id - Passenger profile
 * 
 * Access: CCHead, CCManager, CCTeamLead, Support, SupportAgent
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const SupportDashboard = lazy(() => import('@/features/support/pages/SupportDashboard'));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));
const PassengersList = lazy(() => import('@/features/passengers/pages/PassengersList'));
const PassengerProfile = lazy(() => import('@/features/passengers/pages/PassengerProfile'));

const supportRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'Support', 'SupportAgent', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const supportRoutes = {
  path: 'support',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...supportRoles]}>
          <Suspense fallback={<PageLoader />}>
            <SupportDashboard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'orders',
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute allowedRoles={[...supportRoles]}>
              <Suspense fallback={<PageLoader />}>
                <OrdersPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: ':orderId',
          element: (
            <ProtectedRoute allowedRoles={[...supportRoles]}>
              <Suspense fallback={<PageLoader />}>
                <OrderDetailPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: 'passengers',
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute allowedRoles={[...supportRoles]}>
              <Suspense fallback={<PageLoader />}>
                <PassengersList />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: ':id',
          element: (
            <ProtectedRoute allowedRoles={[...supportRoles]}>
              <Suspense fallback={<PageLoader />}>
                <PassengerProfile />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
};

export default supportRoutes;
