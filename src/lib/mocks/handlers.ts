/**
 * MSW-style Mock API Handlers - SIMPLIFIED VERSION
 * Uses simple string matching instead of complex regex
 */

import {
  mockDrivers,
  mockOrders,
  mockIncidents,
  mockTransactions,
  mockDashboardStats,
  mockLiveMapOrders,
  mockUsers,
  mockWallets,
} from './data';

// ==================== SIMPLIFIED ROUTER ====================

// Type for handler functions
interface MockResponse {
  status: number;
  body: any;
}

type HandlerFunction = (req: { url: string; method: string; params?: Record<string, string>; body?: any }) => Promise<MockResponse> | MockResponse;

// Map of endpoint keys to handlers
const handlers: Record<string, HandlerFunction> = {
  // Dashboard
  'AdminDashboard/GetDashboardStats': async () => ({
    status: 200,
    body: { success: true, data: mockDashboardStats },
  }),
  
  'AdminDashboard/GetServiceTypeDashboard': async () => ({
    status: 200,
    body: {
      success: true,
      data: {
        items: [
          { serviceType: 'Taxi', totalOrders: 567, activeOrders: 78, completedOrders: 478, cancelledOrders: 11, revenue: 89234.5, averageOrderValue: 186.75, activeDrivers: 42, utilizationRate: 78 },
          { serviceType: 'Moto', totalOrders: 423, activeOrders: 52, completedOrders: 365, cancelledOrders: 6, revenue: 42345.0, averageOrderValue: 100.11, activeDrivers: 31, utilizationRate: 75 },
          { serviceType: 'Delivery', totalOrders: 257, activeOrders: 26, completedOrders: 246, cancelledOrders: 25, revenue: 25210.0, averageOrderValue: 98.09, activeDrivers: 16, utilizationRate: 52 },
        ],
        totalRevenue: 156789.5,
        totalOrders: 1247,
      },
    },
  }),
  
  // Orders
  'AdminDeliveryOrder/GetOrdersList': async (req) => {
    const { pageNumber = 1, pageSize = 50, status, serviceType, search } = req.body || {};
    let filtered = [...mockOrders];
    
    if (status && status.length > 0) {
      filtered = filtered.filter(o => status.includes(o.status));
    }
    if (serviceType && serviceType.length > 0) {
      filtered = filtered.filter(o => serviceType.includes(o.serviceType));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(o => 
        o.orderId.toLowerCase().includes(searchLower) ||
        o.customer.name.toLowerCase().includes(searchLower)
      );
    }
    
    const start = (pageNumber - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);
    
    return {
      status: 200,
      body: {
        success: true,
        data: {
          items: paginated,
          total: filtered.length,
          pageNumber,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      },
    };
  },
  
  'AdminDeliveryOrder/GetOrderDetail': async (req) => {
    const { orderId } = req.body || {};
    const order = mockOrders.find(o => o.orderId === orderId);
    return {
      status: order ? 200 : 404,
      body: { success: !!order, data: order || null, message: order ? 'Success' : 'Order not found' },
    };
  },
  
  'AdminDeliveryOrder/AssignRider': async () => ({
    status: 200,
    body: { success: true, message: 'Driver assigned successfully' },
  }),
  
  'AdminDeliveryOrder/CancelDeliveryOrder': async () => ({
    status: 200,
    body: { success: true, message: 'Order cancelled successfully' },
  }),
  
  'AdminDeliveryOrder/GetLiveMapActiveOrders': async () => ({
    status: 200,
    body: { success: true, data: mockLiveMapOrders },
  }),
  
  // Riders/Drivers
  'AdminXpressRider/GetRidersList': async (req) => {
    const { pageNumber = 1, pageSize = 50, status } = req.body || {};
    let filtered = [...mockDrivers];
    
    if (status && status.length > 0) {
      filtered = filtered.filter(d => status.includes(d.status));
    }
    
    const start = (pageNumber - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);
    
    return {
      status: 200,
      body: {
        success: true,
        data: {
          items: paginated,
          total: filtered.length,
          pageNumber,
          pageSize,
        },
      },
    };
  },
  
  'AdminXpressRider/GetRiderDetail': async (req) => {
    const { driverId } = req.body || {};
    const driver = mockDrivers.find(d => d.driverId === driverId);
    return {
      status: driver ? 200 : 404,
      body: { success: !!driver, data: driver || null },
    };
  },
  
  'AdminDeliveryOrder/GetRiderWalletInfo': async (req) => {
    const { xpressRiderId } = req.body || {};
    const wallet = mockWallets.find(w => w.userId === xpressRiderId);
    return {
      status: wallet ? 200 : 404,
      body: { success: !!wallet, data: wallet || null },
    };
  },
  
  // Incidents
  'AdminDisciplinary/GetRidersDisciplinaries': async (req) => {
    const { pageNumber = 1, pageSize = 50, status } = req.body || {};
    let filtered = [...mockIncidents];
    
    if (status && status.length > 0) {
      filtered = filtered.filter(i => status.includes(i.status));
    }
    
    const start = (pageNumber - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);
    
    return {
      status: 200,
      body: {
        success: true,
        data: {
          items: paginated,
          total: filtered.length,
          pageNumber,
          pageSize,
        },
      },
    };
  },
  
  'AdminDisciplinary/GetDetailDisciplinary': async (req) => {
    const { disciplinaryId } = req.body || {};
    const incident = mockIncidents.find(i => i.incidentId === disciplinaryId);
    return {
      status: incident ? 200 : 404,
      body: { success: !!incident, data: incident || null },
    };
  },
  
  // Finance
  'AdminDeliveryOrder/GetTransactions': async (req) => {
    const { pageNumber = 1, pageSize = 100 } = req.body || {};
    const start = (pageNumber - 1) * pageSize;
    const paginated = mockTransactions.slice(start, start + pageSize);
    
    return {
      status: 200,
      body: {
        success: true,
        data: {
          items: paginated,
          total: mockTransactions.length,
          pageNumber,
          pageSize,
        },
      },
    };
  },
  
  // Auth - Old format
  'Auth/Login': async (req) => {
    const { email, password } = req.body || {};
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'password') {
      return {
        status: 401,
        body: { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
      };
    }
    
    return {
      status: 200,
      body: {
        success: true,
        data: {
          user,
          token: `mock_token_${user.id}_${Date.now()}`,
          refreshToken: `mock_refresh_${user.id}_${Date.now()}`,
        },
      },
    };
  },
  
  // Auth - Real backend format
  '/api/auth/login': async (req) => {
    const { email, password } = req.body || {};
    if (email === 'admin@opstower.com' && password === 'admin123') {
      return {
        status: 200,
        body: {
          success: true,
          user: { id: 'admin-001', email: 'admin@opstower.com', firstName: 'Admin', lastName: 'User', role: 'admin', status: 'active' },
          token: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
        },
      };
    }
    return { status: 401, body: { success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } };
  },
  
  'api/auth/login': async (req) => {
    const { email, password } = req.body || {};
    if (email === 'admin@opstower.com' && password === 'admin123') {
      return {
        status: 200,
        body: {
          success: true,
          user: { id: 'admin-001', email: 'admin@opstower.com', firstName: 'Admin', lastName: 'User', role: 'admin', status: 'active' },
          token: `mock_jwt_token_${Date.now()}`,
          refreshToken: `mock_refresh_token_${Date.now()}`,
        },
      };
    }
    return { status: 401, body: { success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' } };
  },
  
  'Auth/RefreshToken': async () => ({
    status: 200,
    body: {
      success: true,
      data: {
        token: `mock_token_refreshed_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
      },
    },
  }),
  
  'Auth/Logout': async () => ({
    status: 200,
    body: { success: true, message: 'Logged out successfully' },
  }),
};

// ==================== MAIN HANDLER ====================

export const handleMockRequest = async (
  url: string,
  method: string,
  params?: Record<string, string>,
  body?: any
): Promise<MockResponse> => {
  // Mock received request
  
  // Extract the path from full URL
  let urlObj: URL;
  try {
    urlObj = new URL(url, 'http://localhost');
  } catch (e) {
    console.error(`[Mock] Invalid URL: ${url}`);
    return {
      status: 400,
      body: { success: false, message: `Invalid URL: ${url}`, code: 'INVALID_URL' },
    };
  }
  
  const path = urlObj.pathname;
  
  // Remove base path to get endpoint key
  // Handle both /v1/api/... and /api/... paths
  const endpointKey = path.replace(/^\/v1\//, '').replace(/^\//, '');
  
  console.log(`[Mock] Looking for handler: ${endpointKey}`);
  
  // Find handler - try exact match first, then with leading slash stripped
  let handler = handlers[endpointKey];
  
  // Try without leading slash
  if (!handler && endpointKey.startsWith('/')) {
    const noSlashKey = endpointKey.substring(1);
    // Mock trying without leading slash
    handler = handlers[noSlashKey];
  }
  
  // Try legacy format (Auth/Login instead of api/auth/login)
  if (!handler && endpointKey.includes('/')) {
    const legacyKey = endpointKey.replace(/^\//, '').replace(/^api\//, '');
    if (legacyKey !== endpointKey) {
      // Mock trying legacy key
      handler = handlers[legacyKey];
    }
  }
  
  if (!handler) {
    console.warn(`[Mock] No handler for: ${method} ${endpointKey}`);
    console.warn(`[Mock] Available handlers:`, Object.keys(handlers).slice(0, 10).join(', ') + '...');
    return {
      status: 404,
      body: { success: false, message: `Endpoint not found: ${endpointKey}`, code: 'NOT_FOUND' },
    };
  }
  
  // Call handler
  try {
    const result = await handler({ url, method, params, body });
    return result;
  } catch (error) {
    console.error(`[Mock] Error handling ${endpointKey}:`, error);
    return {
      status: 500,
      body: { success: false, message: 'Internal server error', code: 'INTERNAL_ERROR' },
    };
  }
};

// Export for testing
export { handlers };
