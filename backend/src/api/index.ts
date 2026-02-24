// src/api/index.ts
// Central route registration for all agents

import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes.js';
import { driverRoutes } from './driver.routes.js';
import { bondRoutes } from './bond.routes.js';
import { shiftRoutes } from './shift.routes.js';
import { incidentRoutes } from './incident.routes.js';
import kpiRoutes from './kpi.routes.js';
import locationRoutes from './location.routes.js';
import financeRoutes from './finance.routes.js';
import fleetRoutes from './fleet.routes.js';

/**
 * Register all API routes under /api/v1
 */
export async function registerRoutes(app: FastifyInstance) {
  // Register all routes under /api/v1 prefix
  await app.register(async (v1) => {
    // Auth Agent - Authentication and authorization
    await v1.register(authRoutes, { prefix: '/auth' });

    // Drivers Agent - Driver management, tiers, and DXP
    await v1.register(driverRoutes, { prefix: '/drivers' });

    // Fleet Agent - Vehicle/Asset management
    await v1.register(fleetRoutes, { prefix: '/fleet' });

    // Financials Agent - Bond management
    await v1.register(bondRoutes, { prefix: '/bonds' });

    // Shifts Agent - Shift management and operations
    await v1.register(shiftRoutes, { prefix: '/shifts' });

    // Incidents Agent - Incident tracking and resolution
    await v1.register(incidentRoutes, { prefix: '/incidents' });

    // Realtime Agent - KPIs and analytics
    await v1.register(kpiRoutes, { prefix: '/kpi' });

    // Realtime Agent - Location tracking
    await v1.register(locationRoutes, { prefix: '/location' });

    // Finance Agent - Transaction management
    await v1.register(financeRoutes, { prefix: '/finance' });
  }, { prefix: '/api/v1' });

  console.log('✅ All API routes registered');
}
