/**
 * Mock Data Module
 * Provides mock data and API simulation for development
 */

// Data exports
export {
  mockDrivers,
  mockVehicles,
  mockOrders,
  mockIncidents,
  mockTransactions,
  mockWallets,
  mockSettlements,
  mockDashboardStats,
  mockLiveMapOrders,
  mockLiveMapDrivers,
  mockUsers,
  paginateData,
  sortData,
  filterData,
  getPeakHourMultiplier,
} from './data';

// Handler exports
export { handleMockRequest } from './handlers';

// Browser setup exports
export {
  enableMocks,
  disableMocks,
  setupMocks,
  areMocksEnabled,
  getMockStatus,
} from './browser';

// Default export
export { default } from './browser';
