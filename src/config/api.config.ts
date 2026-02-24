/**
 * API Configuration
 * Base URL and settings for testapi.xpress.ph
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001',
  version: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const SIGNALR_CONFIG = {
  hubUrl: import.meta.env.VITE_SIGNALR_HUB_URL || 'https://testapi.xpress.ph/hubs',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
} as const;

// API endpoint paths (using backend adapter)
export const ENDPOINTS = {
  // Auth
  auth: {
    login: 'api/auth/login',
    refresh: 'api/auth/refresh',
    logout: 'api/auth/logout',
  },
  
  // Dashboard
  dashboard: {
    stats: 'api/adapter/dashboard/stats',
    serviceType: 'AdminDashboard/GetServiceTypeDashboard',
    driversReport: 'AdminDashboard/GetReportDriversDashboard',
    customersReport: 'AdminDashboard/GetReportCustomersDashboard',
    revenueReport: 'AdminDashboard/GetReportRevenueDashboard',
    transaction: 'AdminDashboard/GetTransactionDashboard',
  },
  
  // Orders
  orders: {
    list: 'api/adapter/orders',
    detail: 'api/adapter/orders',
    assign: 'api/adapter/assign/driver',
    cancel: 'AdminDeliveryOrder/CancelDeliveryOrder',
    complete: 'AdminDeliveryOrder/CompleteOrder',
    liveMap: 'api/adapter/orders/live-map',
    nearbyDrivers: 'api/adapter/assign/nearby',
  },
  
  // Riders/Drivers
  riders: {
    list: 'api/adapter/drivers',
    detail: 'api/adapter/drivers',
    performance: 'AdminXpressRider/GetRiderPerformance',
    wallet: 'AdminDeliveryOrder/GetRiderWalletInfo',
  },
  
  // Fleet/Vehicles
  fleet: {
    list: 'AdminXpressOperator/GetVehicleList',
    detail: 'AdminXpressOperator/GetVehicleDetail',
    create: 'AdminXpressOperator/CreateVehicle',
    update: 'AdminXpressOperator/UpdateVehicle',
    delete: 'AdminXpressOperator/DeleteVehicle',
    assignDriver: 'AdminXpressOperator/AssignDriverToVehicle',
    unassignDriver: 'AdminXpressOperator/UnassignDriverFromVehicle',
    maintenance: 'AdminXpressOperator/GetVehicleMaintenanceHistory',
    addMaintenance: 'AdminXpressOperator/AddMaintenanceRecord',
    stats: 'AdminXpressOperator/GetFleetStats',
    utilization: 'AdminXpressOperator/GetVehicleUtilization',
    locationHistory: 'AdminXpressOperator/GetVehicleLocationHistory',
    trips: 'AdminXpressOperator/GetVehicleTripHistory',
    bulkUpdate: 'AdminXpressOperator/BulkUpdateVehicleStatus',
    updateStatus: 'AdminXpressOperator/UpdateVehicleStatus',
    scheduleMaintenance: 'AdminXpressOperator/ScheduleMaintenance',
  },
  
  // Incidents/Disciplinary
  incidents: {
    list: 'AdminDisciplinary/GetRidersDisciplinaries',
    detail: 'AdminDisciplinary/GetDetailDisciplinary',
    create: 'AdminDisciplinary/AddOrUpdateDisciplinary',
    assignInvestigator: 'AdminDisciplinary/SetInvestigativeUserAndSetStatusInvestigation',
    saveInvestigation: 'AdminDisciplinary/SaveInvestigationAndSetStatusPending',
    saveAction: 'AdminDisciplinary/SaveDisciplinaryAction',
    changePriority: 'AdminDisciplinary/ChangePriority',
  },
  
  // Finance
  finance: {
    transactions: 'AdminDeliveryOrder/GetTransactions',
    topups: 'AdminDeliveryOrder/GetTopUps',
    cashout: 'AdminDeliveryOrder/GetCashOut',
    guaranteedPay: 'AdminDeliveryOrder/GetGuaranteedPay',
  },
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  dashboard: {
    stats: 'dashboardStats',
    serviceType: 'dashboardServiceType',
    reports: 'dashboardReports',
  },
  orders: {
    list: 'ordersList',
    detail: (id: string) => ['order', id],
    liveMap: 'liveMapOrders',
  },
  riders: {
    list: 'ridersList',
    detail: (id: string) => ['rider', id],
    performance: (id: string) => ['riderPerformance', id],
    wallet: (id: string) => ['riderWallet', id],
  },
  fleet: {
    list: 'fleetList',
    detail: (id: string) => ['vehicle', id],
    maintenance: (id: string) => ['vehicleMaintenance', id],
    stats: 'fleetStats',
    utilization: (id: string) => ['vehicleUtilization', id],
    trips: (id: string) => ['vehicleTrips', id],
    location: (id: string) => ['vehicleLocation', id],
  },
  incidents: {
    list: 'incidentsList',
    detail: (id: string) => ['incident', id],
  },
  finance: {
    transactions: 'transactions',
    topups: 'topups',
    cashout: 'cashout',
  },
} as const;
