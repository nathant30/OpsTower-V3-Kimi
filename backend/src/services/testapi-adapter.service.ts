// src/services/testapi-adapter.service.ts
// Adapter service for testapi.xpress.ph

import axios, { AxiosInstance } from 'axios';

interface TestAPIConfig {
  baseURL: string;
  version: string;
  token: string;
}

class TestAPIAdapter {
  private client: AxiosInstance;

  constructor(config: TestAPIConfig) {
    this.client = axios.create({
      baseURL: `${config.baseURL}/${config.version}/api`,
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('testapi error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // ========================================
  // DRIVERS (Proxy to testapi)
  // ========================================

  async getDrivers(params: {
    pageNumber: number;
    pageSize: number;
    status?: string;
  }) {
    try {
      const response = await this.client.post(
        'AdminXpressRider/GetRidersListWithPagination',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // Return mock data for development
      return this.getMockDrivers();
    }
  }

  async getDriverDetail(riderId: string) {
    try {
      const response = await this.client.post(
        'AdminXpressRider/GetRiderDetail',
        { riderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching driver detail:', error);
      return null;
    }
  }

  async getDriverLocation(riderId: string) {
    try {
      const response = await this.client.post(
        'AdminXpressRider/GetRiderLocation',
        { riderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching driver location:', error);
      return null;
    }
  }

  // ========================================
  // ORDERS (Proxy to testapi)
  // ========================================

  async getOrders(params: {
    pageNumber: number;
    pageSize: number;
    status?: string;
  }) {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/GetDeliveryOrders',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return this.getMockOrders();
    }
  }

  async getOrderDetail(orderId: string) {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/GetOrderDetail',
        { orderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      return null;
    }
  }

  async getLiveMapOrders() {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/GetLiveMapActiveOrders',
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching live map orders:', error);
      return this.getMockLiveMapOrders();
    }
  }

  // ========================================
  // ASSIGNMENT (Proxy to testapi/Google ODRD)
  // ========================================

  async getNearbyDrivers(params: {
    latitude: number;
    longitude: number;
    radius?: number;
  }) {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/GetNearbyDriversForAssign',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby drivers:', error);
      return [];
    }
  }

  async assignDriver(orderId: string, riderId: string) {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/AssignRider',
        { orderId, riderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error assigning driver:', error);
      throw error;
    }
  }

  async offerOrder(orderId: string, riderId: string) {
    try {
      const response = await this.client.post(
        'AdminDeliveryOrder/OfferOrderToRider',
        { orderId, riderId }
      );
      return response.data;
    } catch (error) {
      console.error('Error offering order:', error);
      throw error;
    }
  }

  // ========================================
  // DASHBOARD (Proxy to testapi - optional)
  // ========================================

  async getDashboardStats() {
    try {
      const response = await this.client.post(
        'AdminDashboard/GetDashboardStats',
        {}
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return this.getMockDashboardStats();
    }
  }

  // ========================================
  // MOCK DATA (for development without testapi)
  // ========================================

  private getMockDrivers() {
    return {
      data: [
        {
          id: 'driver-1',
          firstName: 'Juan',
          lastName: 'Dela Cruz',
          phoneNumber: '+639123456789',
          status: 'ONLINE',
          currentLocation: {
            lat: 14.5995,
            lng: 120.9842,
          },
          rating: 4.8,
          totalDeliveries: 150,
        },
        {
          id: 'driver-2',
          firstName: 'Maria',
          lastName: 'Santos',
          phoneNumber: '+639987654321',
          status: 'BUSY',
          currentLocation: {
            lat: 14.6095,
            lng: 120.9942,
          },
          rating: 4.6,
          totalDeliveries: 89,
        },
      ],
      total: 2,
    };
  }

  private getMockOrders() {
    return {
      data: [
        {
          id: 'order-1',
          orderNumber: 'ORD-20260211-001',
          status: 'IN_TRANSIT',
          customerName: 'John Doe',
          customerPhone: '+639111111111',
          driverId: 'driver-1',
          driverName: 'Juan Dela Cruz',
          pickupLocation: {
            lat: 14.5995,
            lng: 120.9842,
            address: 'Makati City',
          },
          dropoffLocation: {
            lat: 14.6095,
            lng: 120.9942,
            address: 'Manila City',
          },
          total: 250.00,
        },
      ],
      total: 1,
    };
  }

  private getMockLiveMapOrders() {
    return [
      {
        orderId: 'order-1',
        orderNumber: 'ORD-20260211-001',
        status: 'IN_TRANSIT',
        riderId: 'driver-1',
        driverName: 'Juan Dela Cruz',
        pickupLocation: {
          latitude: 14.5995,
          longitude: 120.9842,
        },
        dropoffLocation: {
          latitude: 14.6095,
          longitude: 120.9942,
        },
        currentLocation: {
          latitude: 14.6045,
          longitude: 120.9892,
        },
        estimatedTimeRemaining: 15,
        isPriority: false,
      },
    ];
  }

  private getMockDashboardStats() {
    return {
      activeOrders: 12,
      activeDrivers: 8,
      availableDrivers: 3,
      revenueToday: 15420.50,
      revenuePerHour: 1927.56,
      utilizationRate: 75.5,
      completedOrdersToday: 45,
      onTimeDeliveryRate: 92.3,
      averageDeliveryTime: 28,
    };
  }
}

// Export singleton instance
export const testAPIAdapter = new TestAPIAdapter({
  baseURL: process.env.TESTAPI_BASE_URL || 'https://testapi.xpress.ph',
  version: process.env.TESTAPI_VERSION || 'v1',
  token: process.env.TESTAPI_TOKEN || '',
});

export default testAPIAdapter;
