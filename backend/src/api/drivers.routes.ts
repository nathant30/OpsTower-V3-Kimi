// src/api/drivers.routes.ts
// Driver Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { driverService } from '../services/driver.service.js';

const listDriversSchema = z.object({
  status: z.string().optional(),
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'UNRANKED']).optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

// Routes plugin
export default async function driverRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // GET /api/drivers - List drivers
  fastify.get('/', async (request, reply) => {
    const query = request.query as any;
    
    const filters = {
      status: query.status,
      tier: query.tier,
      search: query.search,
    };

    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 20;

    const result = await driverService.list(filters, page, limit);
    return result;
  });

  // GET /api/drivers/:id - Get driver by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const driver = await driverService.getById(id);
    return driver;
  });

  // GET /api/drivers/:id/tier - Get driver tier
  fastify.get('/:id/tier', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tier = await driverService.getTier(id);
    return tier;
  });

  // POST /api/drivers/:id/tier/evaluate - Evaluate driver for promotion
  fastify.post('/:id/tier/evaluate', async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await driverService.evaluateTier(id);
    return result;
  });

  // GET /api/tiers/thresholds - Get tier thresholds
  fastify.get('/tiers/thresholds', async (request, reply) => {
    const thresholds = driverService.getTierThresholds();
    return { thresholds };
  });

  // GET /api/analytics/tiers - Get tier distribution
  fastify.get('/tiers/analytics', async (request, reply) => {
    const distribution = await driverService.getTierDistribution();
    return { distribution };
  });
}
