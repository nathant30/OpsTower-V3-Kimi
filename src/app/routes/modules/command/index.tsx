/**
 * Command Center Module Routes
 * 
 * Routes for:
 * - /command - Main command center dashboard
 * - /command/live - Live map operations
 * - /command/dispatch - Dispatch console
 * - /command/incidents - Incident management
 * 
 * Access: CCHead, CCManager, CCTeamLead, CCOperator, FieldOperator, ERT
 * Device: Desktop/Tablet (dispatch is desktop-only)
 */

import { lazy, Suspense } from 'react';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

const CommandCenter = lazy(() => import('@/features/command/pages/CommandCenter'));
const LiveMap = lazy(() => import('@/features/live/pages/LiveMap'));
const DispatchConsole = lazy(() => import('@/features/dispatch/pages/DispatchConsole'));
const IncidentsPage = lazy(() => import('@/features/incidents/pages/IncidentsPage'));
const IncidentDetailPage = lazy(() => import('@/features/incidents/pages/IncidentDetailPage'));

// Role groups for Command Center
const ccRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'CCOperator', 'FieldOperator', 'ERT', 'SuperAdmin'] as const;
const ccManagerRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'ERT', 'SuperAdmin'] as const;
const incidentRoles = ['CCHead', 'CCManager', 'CCTeamLead', 'CCOperator', 'Compliance', 'Audit', 'SuperAdmin'] as const;

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-xpress-bg-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-xpress-accent-blue" />
    </div>
  );
}

export const commandCenterRoutes = {
  path: 'command',
  children: [
    {
      index: true,
      element: (
        <ProtectedRoute allowedRoles={[...ccRoles]}>
          <Suspense fallback={<PageLoader />}>
            <CommandCenter />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'live',
      element: (
        <ProtectedRoute allowedRoles={[...ccRoles]} allowedDevices={['desktop', 'tablet']}>
          <Suspense fallback={<PageLoader />}>
            <LiveMap />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'dispatch',
      element: (
        <ProtectedRoute allowedRoles={[...ccManagerRoles]} allowedDevices={['desktop']}>
          <Suspense fallback={<PageLoader />}>
            <DispatchConsole />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: 'incidents',
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute allowedRoles={[...incidentRoles]}>
              <Suspense fallback={<PageLoader />}>
                <IncidentsPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
        {
          path: ':incidentId',
          element: (
            <ProtectedRoute allowedRoles={[...incidentRoles]}>
              <Suspense fallback={<PageLoader />}>
                <IncidentDetailPage />
              </Suspense>
            </ProtectedRoute>
          ),
        },
      ],
    },
  ],
};

export default commandCenterRoutes;
