// src/api/kpi.routes.ts
// KPI Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { kpiService } from '../services/kpi.service.js';

// Routes plugin
export default async function kpiRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/kpis/dashboard - Dashboard KPIs
  fastify.get('/dashboard', async (request, reply) => {
    const kpis = await kpiService.getDashboardKPIs();
    return kpis;
  });

  // GET /api/kpis/drivers/:driverId - Driver KPIs
  fastify.get('/drivers/:driverId', async (request, reply) => {
    const { driverId } = request.params as { driverId: string };
    const kpis = await kpiService.getDriverKPIs(driverId);
    
    if (!kpis) {
      return reply.status(404).send({ error: 'Driver not found' });
    }
    
    return kpis;
  });

  // GET /api/kpis/fleet - Fleet KPIs
  fastify.get('/fleet', async (request, reply) => {
    const kpis = await kpiService.getFleetKPIs();
    return kpis;
  });

  // GET /api/kpis/shifts - Shift compliance KPIs
  fastify.get('/shifts', async (request, reply) => {
    const query = request.query as any;
    const date = query.date ? new Date(query.date) : undefined;
    const kpis = await kpiService.getShiftComplianceKPIs(date);
    return kpis;
  });
}
