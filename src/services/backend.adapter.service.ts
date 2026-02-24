/**
 * Backend Adapter Service
 * Proxies requests to testapi via our custom backend
 */

import { backendApi } from './backend.api';
import { BACKEND_ENDPOINTS } from '../config/backend.config';

export interface GetDriversParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

export interface GetOrdersParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
}

export const backendAdapterService = {
  // Dashboard
  async getDashboardStats() {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.dashboardStats);
  },

  // Drivers
  async getDrivers(params: GetDriversParams = {}) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.drivers, {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 50,
      status: params.status,
    });
  },

  async getDriverDetail(driverId: string) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.driverDetail(driverId), {});
  },

  async getDriverLocation(driverId: string) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.driverLocation(driverId), {});
  },

  // Orders
  async getOrders(params: GetOrdersParams = {}) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.orders, {
      pageNumber: params.pageNumber || 1,
      pageSize: params.pageSize || 50,
      status: params.status,
    });
  },

  async getOrderDetail(orderId: string) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.orderDetail(orderId), {});
  },

  async getLiveMapOrders() {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.liveMap, {});
  },

  // Assignment
  async getNearbyDrivers(latitude: number, longitude: number, radius?: number) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.nearbyDrivers, {
      latitude,
      longitude,
      radius,
    });
  },

  async assignDriver(orderId: string, driverId: string) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.assignDriver, {
      orderId,
      driverId,
    });
  },

  async offerOrder(orderId: string, driverId: string) {
    return backendApi.post(BACKEND_ENDPOINTS.adapter.offerOrder, {
      orderId,
      driverId,
    });
  },
};

export default backendAdapterService;
