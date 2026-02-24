/**
 * Backend Configuration
 * Connects to custom backend (localhost:8001) instead of testapi directly
 */

export const BACKEND_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// Backend API endpoints (our custom backend)
export const BACKEND_ENDPOINTS = {
  // Adapter (proxies to testapi)
  adapter: {
    drivers: '/api/adapter/drivers',
    driverDetail: (id: string) => `/api/adapter/drivers/${id}`,
    driverLocation: (id: string) => `/api/adapter/drivers/${id}/location`,
    orders: '/api/adapter/orders',
    orderDetail: (id: string) => `/api/adapter/orders/${id}`,
    liveMap: '/api/adapter/orders/live-map',
    nearbyDrivers: '/api/adapter/assign/nearby',
    assignDriver: '/api/adapter/assign/driver',
    offerOrder: '/api/adapter/assign/offer',
    dashboardStats: '/api/adapter/dashboard/stats',
  },
  
  // Custom Features
  incidents: {
    list: '/api/incidents',
    create: '/api/incidents',
    detail: (id: string) => `/api/incidents/${id}`,
    update: (id: string) => `/api/incidents/${id}`,
    resolve: (id: string) => `/api/incidents/${id}/resolve`,
    addEvidence: (id: string) => `/api/incidents/${id}/evidence`,
    timeline: (id: string) => `/api/incidents/${id}/timeline`,
    deductible: (id: string) => `/api/incidents/${id}/deductible`,
    driverIncidents: (driverId: string) => `/api/incidents/driver/${driverId}`,
  },
  
  shifts: {
    list: '/api/shifts',
    create: '/api/shifts',
    detail: (id: string) => `/api/shifts/${id}`,
    clockIn: (id: string) => `/api/shifts/${id}/clock-in`,
    clockOut: (id: string) => `/api/shifts/${id}/clock-out`,
    startBreak: (id: string) => `/api/shifts/${id}/start-break`,
    endBreak: (id: string) => `/api/shifts/${id}/end-break`,
    driverShifts: (driverId: string) => `/api/shifts/driver/${driverId}`,
  },
  
  drivers: {
    list: '/api/drivers',
    detail: (id: string) => `/api/drivers/${id}`,
    tier: (id: string) => `/api/drivers/${id}/tier`,
    evaluateTier: (id: string) => `/api/drivers/${id}/tier/evaluate`,
    tierThresholds: '/api/drivers/tiers/thresholds',
    tierAnalytics: '/api/drivers/tiers/analytics',
  },
  
  bonds: {
    transactions: '/api/bonds/transactions',
    createTransaction: '/api/bonds/transactions',
    driverBalance: (driverId: string) => `/api/bonds/drivers/${driverId}/bond-balance`,
    driverHistory: (driverId: string) => `/api/bonds/drivers/${driverId}/bond-history`,
    canStartShift: (driverId: string) => `/api/bonds/drivers/${driverId}/can-start-shift`,
    deduct: '/api/bonds/deduct',
  },
} as const;

// Query keys for React Query
export const BACKEND_QUERY_KEYS = {
  adapter: {
    drivers: 'adapterDrivers',
    driver: (id: string) => ['adapterDriver', id],
    orders: 'adapterOrders',
    order: (id: string) => ['adapterOrder', id],
    liveMap: 'adapterLiveMap',
    dashboardStats: 'adapterDashboardStats',
  },
  incidents: {
    list: 'incidentsList',
    detail: (id: string) => ['incident', id],
    timeline: (id: string) => ['incidentTimeline', id],
    driverIncidents: (driverId: string) => ['driverIncidents', driverId],
  },
  shifts: {
    list: 'shiftsList',
    detail: (id: string) => ['shift', id],
    driverShifts: (driverId: string) => ['driverShifts', driverId],
  },
  drivers: {
    list: 'backendDrivers',
    detail: (id: string) => ['backendDriver', id],
    tier: (id: string) => ['driverTier', id],
    tierThresholds: 'tierThresholds',
    tierAnalytics: 'tierAnalytics',
  },
  bonds: {
    transactions: 'bondTransactions',
    driverBalance: (driverId: string) => ['bondBalance', driverId],
    driverHistory: (driverId: string) => ['bondHistory', driverId],
    canStartShift: (driverId: string) => ['canStartShift', driverId],
  },
} as const;
