/**
 * Dispatch Service
 * Ride assignment and dispatch management
 */

import { apiClient } from '@/lib/api/client';
import type { 
  DispatchRide, 
  DispatchDriver, 
  Assignment 
} from '@/features/dispatch/hooks/useDispatch';

export interface AssignmentRequest {
  rideId: string;
  driverId: string;
  notes?: string;
}

export interface BatchAssignmentRequest {
  assignments: AssignmentRequest[];
}

export interface AssignmentResult {
  success: boolean;
  assignmentId?: string;
  rideId: string;
  driverId: string;
  error?: string;
}

export interface DispatchStats {
  pendingRides: number;
  availableDrivers: number;
  assignedToday: number;
  completedToday: number;
  averageAssignmentTime: number;
  successRate: number;
}

export const dispatchService = {
  /**
   * Get all pending ride requests awaiting assignment
   */
  async getPendingRides(): Promise<DispatchRide[]> {
    try {
      // In production: return apiClient.get('/api/dispatch/pending-rides');
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    } catch (error) {
      console.error('Failed to fetch pending rides:', error);
      throw error;
    }
  },

  /**
   * Get all available drivers for assignment
   */
  async getAvailableDrivers(): Promise<DispatchDriver[]> {
    try {
      // In production: return apiClient.get('/api/dispatch/available-drivers');
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [];
    } catch (error) {
      console.error('Failed to fetch available drivers:', error);
      throw error;
    }
  },

  /**
   * Assign a ride to a driver
   */
  async assignRide(request: AssignmentRequest): Promise<AssignmentResult> {
    try {
      // In production:
      // return apiClient.post('/api/dispatch/assign', request);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      return {
        success: true,
        assignmentId: `ASN-${Date.now()}`,
        rideId: request.rideId,
        driverId: request.driverId,
      };
    } catch (error) {
      console.error('Failed to assign ride:', error);
      return {
        success: false,
        rideId: request.rideId,
        driverId: request.driverId,
        error: error instanceof Error ? error.message : 'Assignment failed',
      };
    }
  },

  /**
   * Batch assign multiple rides to drivers
   */
  async batchAssign(requests: BatchAssignmentRequest): Promise<AssignmentResult[]> {
    try {
      // In production:
      // return apiClient.post('/api/dispatch/batch-assign', requests);
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      return requests.assignments.map((req) => ({
        success: true,
        assignmentId: `ASN-${Date.now()}-${req.rideId}`,
        rideId: req.rideId,
        driverId: req.driverId,
      }));
    } catch (error) {
      console.error('Failed to batch assign rides:', error);
      throw error;
    }
  },

  /**
   * Cancel an existing assignment
   */
  async cancelAssignment(assignmentId: string, reason?: string): Promise<void> {
    try {
      // In production:
      // return apiClient.post(`/api/dispatch/assignments/${assignmentId}/cancel`, { reason });
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (error) {
      console.error(`Failed to cancel assignment ${assignmentId}:`, error);
      throw error;
    }
  },

  /**
   * Get assignment history
   */
  async getAssignmentHistory(params: {
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ assignments: Assignment[]; total: number }> {
    try {
      // In production:
      // return apiClient.get('/api/dispatch/assignments', { params });
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { assignments: [], total: 0 };
    } catch (error) {
      console.error('Failed to fetch assignment history:', error);
      throw error;
    }
  },

  /**
   * Get auto-suggested driver for a ride based on proximity and availability
   */
  async getSuggestedDriver(rideId: string): Promise<DispatchDriver | null> {
    try {
      // In production:
      // return apiClient.get(`/api/dispatch/suggest-driver/${rideId}`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return null;
    } catch (error) {
      console.error(`Failed to get suggested driver for ride ${rideId}:`, error);
      throw error;
    }
  },

  /**
   * Get dispatch statistics
   */
  async getStats(): Promise<DispatchStats> {
    try {
      // In production: return apiClient.get('/api/dispatch/stats');
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      return {
        pendingRides: 0,
        availableDrivers: 0,
        assignedToday: 0,
        completedToday: 0,
        averageAssignmentTime: 0,
        successRate: 0,
      };
    } catch (error) {
      console.error('Failed to fetch dispatch stats:', error);
      throw error;
    }
  },

  /**
   * Auto-assign pending rides to nearest available drivers
   */
  async autoAssign(options: {
    maxAssignments?: number;
    maxDistanceKm?: number;
    priorityOnly?: boolean;
  } = {}): Promise<AssignmentResult[]> {
    try {
      // In production:
      // return apiClient.post('/api/dispatch/auto-assign', options);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [];
    } catch (error) {
      console.error('Failed to auto-assign rides:', error);
      throw error;
    }
  },

  /**
   * Force reassign a ride from current driver to new driver
   */
  async forceReassign(
    rideId: string,
    newDriverId: string,
    reason: string
  ): Promise<AssignmentResult> {
    try {
      // In production:
      // return apiClient.post(`/api/dispatch/rides/${rideId}/force-reassign`, {
      //   driverId: newDriverId,
      //   reason,
      // });
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      return {
        success: true,
        assignmentId: `ASN-${Date.now()}`,
        rideId,
        driverId: newDriverId,
      };
    } catch (error) {
      console.error('Failed to force reassign ride:', error);
      return {
        success: false,
        rideId,
        driverId: newDriverId,
        error: error instanceof Error ? error.message : 'Reassignment failed',
      };
    }
  },

  /**
   * Subscribe to real-time dispatch updates via WebSocket
   */
  subscribeToDispatchUpdates(callback: (update: {
    type: 'ride_requested' | 'ride_assigned' | 'ride_cancelled' | 'driver_available' | 'driver_busy';
    data: unknown;
    timestamp: string;
  }) => void): () => void {
    // Mock implementation
    const interval = setInterval(() => {
      const types: Array<'ride_requested' | 'ride_assigned' | 'ride_cancelled' | 'driver_available' | 'driver_busy'> = [
        'ride_requested',
        'driver_available',
        'ride_assigned',
      ];
      
      callback({
        type: types[Math.floor(Math.random() * types.length)],
        data: {},
        timestamp: new Date().toISOString(),
      });
    }, 15000);

    return () => clearInterval(interval);
  },

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Utility function for client-side distance calculations
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  /**
   * Estimate ETA based on distance and traffic conditions
   */
  estimateEta(distanceKm: number, trafficFactor = 1.0): number {
    // Average speed of 25 km/h in Metro Manila
    const averageSpeed = 25 * trafficFactor;
    const hours = distanceKm / averageSpeed;
    return Math.ceil(hours * 60); // Return minutes
  },
};

export default dispatchService;
