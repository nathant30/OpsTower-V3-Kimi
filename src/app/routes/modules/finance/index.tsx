/**
 * Finance Module Routes
 * 
 * Routes for:
 * - /finance - Main finance dashboard
 * - /finance/billing - Billing management
 * - /finance/earnings - Earnings dashboard
 * - /finance/payments - Payments management
 * 
 * Access: CCHead, Finance, FinanceManager only
 * Note: Restricted to CC Head and Finance team
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const FinancePage = lazy(() => import('@/features/finance/pages/FinancePage'));
const BillingPage = lazy(() => import('@/features/billing/pages/BillingPage'));
const EarningsDashboard = lazy(() => import('@/features/earnings/pages/EarningsDashboard'));
const PaymentsPage = lazy(() => import('@/features/payments/pages/PaymentsPage'));

const financeRoles = ['CCHead', 'Finance', 'FinanceManager', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const financeRoutes = {
  path: 'finance',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...financeRoles]}>
          <Suspense fallback={<PageLoader />}>
            <FinancePage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'billing',
      element: (
        <ProtectedRoute allowedRoles={[...financeRoles]}>
          <Suspense fallback={<PageLoader />}>
            <BillingPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'earnings',
      element: (
        <ProtectedRoute allowedRoles={[...financeRoles]}>
          <Suspense fallback={<PageLoader />}>
            <EarningsDashboard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'payments',
      element: (
        <ProtectedRoute allowedRoles={[...financeRoles]}>
          <Suspense fallback={<PageLoader />}>
            <PaymentsPage />
          </Suspense>
        </ProtectedRoute>
      ),
    },
  ],
};

export default financeRoutes;
