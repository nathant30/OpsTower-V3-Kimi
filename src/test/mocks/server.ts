/**
 * MSW Mock Server Setup
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockUsers, mockDashboardStats, mockDrivers, mockOrders } from '@/lib/mocks/data';

// Mock API handlers
export const handlers = [
  // Auth endpoints
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'admin@opstower.com' && body.password === 'admin123') {
      return HttpResponse.json({
        user: {
          id: 'admin-001',
          email: body.email,
          firstName: 'Admin',
          lastName: 'User',
          role: 'SuperAdmin',
          permissions: ['*:*'],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        token: 'mock-token-123',
        refreshToken: 'mock-refresh-token-123',
      });
    }
    
    return new HttpResponse(
      JSON.stringify({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
      { status: 401 }
    );
  }),

  http.post('*/api/auth/refresh', () => {
    return HttpResponse.json({
      token: 'new-mock-token-456',
      refreshToken: 'new-mock-refresh-token-456',
    });
  }),

  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Dashboard endpoints
  http.get('*/api/v1/dashboard/stats', () => {
    return HttpResponse.json({
      totalOrders: 1250,
      activeOrders: 45,
      totalDrivers: 180,
      activeDrivers: 120,
      revenue: 125000,
      avgDeliveryTime: 28,
    });
  }),

  http.get('*/api/v1/live/orders', () => {
    return HttpResponse.json([
      { id: 'order-1', status: 'in_progress', lat: 14.5995, lng: 120.9842 },
      { id: 'order-2', status: 'pending', lat: 14.6095, lng: 120.9942 },
    ]);
  }),

  http.get('*/api/v1/live/drivers', () => {
    return HttpResponse.json([
      { id: 'driver-1', status: 'online', lat: 14.5995, lng: 120.9842 },
      { id: 'driver-2', status: 'busy', lat: 14.6095, lng: 120.9942 },
    ]);
  }),

  // Drivers endpoints
  http.get('*/api/v1/drivers', () => {
    return HttpResponse.json({
      data: mockDrivers.slice(0, 10),
      total: mockDrivers.length,
    });
  }),

  http.get('*/api/v1/drivers/:id', ({ params }) => {
    const driver = mockDrivers.find(d => d.driverId === params.id);
    if (driver) {
      return HttpResponse.json(driver);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // Orders endpoints
  http.get('*/api/v1/orders', () => {
    return HttpResponse.json({
      data: mockOrders.slice(0, 10),
      total: mockOrders.length,
    });
  }),

  http.get('*/api/v1/orders/:id', ({ params }) => {
    const order = mockOrders.find(o => o.orderId === params.id);
    if (order) {
      return HttpResponse.json(order);
    }
    return new HttpResponse(null, { status: 404 });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);
