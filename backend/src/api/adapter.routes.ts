// src/api/adapter.routes.ts
// Adapter Routes - Proxy to testapi.xpress.ph

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { testAPIAdapter } from '../services/testapi-adapter.service.js';

// Routes plugin
export default async function adapterRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // ========================================
  // DRIVERS (Proxy to testapi)
  // ========================================

  // POST /api/adapter/drivers - Get drivers list
  fastify.post('/drivers', async (request, reply) => {
    const body = request.body as any;
    const data = await testAPIAdapter.getDrivers({
      pageNumber: body.pageNumber || 1,
      pageSize: body.pageSize || 50,
      status: body.status,
    });
    return data;
  });

  // POST /api/adapter/drivers/:id - Get driver detail
  fastify.post('/drivers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await testAPIAdapter.getDriverDetail(id);
    return data;
  });

  // POST /api/adapter/drivers/:id/location - Get driver location
  fastify.post('/drivers/:id/location', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await testAPIAdapter.getDriverLocation(id);
    return data;
  });

  // ========================================
  // ORDERS (Proxy to testapi)
  // ========================================

  // POST /api/adapter/orders - Get orders list
  fastify.post('/orders', async (request, reply) => {
    const body = request.body as any;
    const data = await testAPIAdapter.getOrders({
      pageNumber: body.pageNumber || 1,
      pageSize: body.pageSize || 50,
      status: body.status,
    });
    return data;
  });

  // POST /api/adapter/orders/:id - Get order detail
  fastify.post('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = await testAPIAdapter.getOrderDetail(id);
    return data;
  });

  // POST /api/adapter/orders/live-map - Get live map orders
  fastify.post('/orders/live-map', async (request, reply) => {
    const data = await testAPIAdapter.getLiveMapOrders();
    return data;
  });

  // ========================================
  // ASSIGNMENT (Proxy to testapi/Google ODRD)
  // ========================================

  // POST /api/adapter/assign/nearby - Get nearby drivers
  fastify.post('/assign/nearby', async (request, reply) => {
    const body = request.body as any;
    const data = await testAPIAdapter.getNearbyDrivers({
      latitude: body.latitude,
      longitude: body.longitude,
      radius: body.radius,
    });
    return data;
  });

  // POST /api/adapter/assign/driver - Assign driver to order
  fastify.post('/assign/driver', async (request, reply) => {
    const { orderId, driverId } = request.body as any;
    const data = await testAPIAdapter.assignDriver(orderId, driverId);
    return data;
  });

  // POST /api/adapter/assign/offer - Offer order to driver
  fastify.post('/assign/offer', async (request, reply) => {
    const { orderId, driverId } = request.body as any;
    const data = await testAPIAdapter.offerOrder(orderId, driverId);
    return data;
  });

  // ========================================
  // DASHBOARD (Proxy to testapi)
  // ========================================

  // POST /api/adapter/dashboard/stats - Get dashboard stats
  fastify.post('/dashboard/stats', async (request, reply) => {
    const data = await testAPIAdapter.getDashboardStats();
    return data;
  });
}
