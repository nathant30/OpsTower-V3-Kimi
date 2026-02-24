// src/services/location.service.ts
// Location Tracking Service - Simplified for deployment

import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// ============================================================================
// TYPES
// ============================================================================

export interface LocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: Date;
}

export interface GeofenceCheck {
  latitude: number;
  longitude: number;
  geofenceId?: string;
}

export interface NearbyDriver {
  driverId: string;
  distance: number; // in meters
  latitude: number;
  longitude: number;
  status: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ============================================================================
// LOCATION OPERATIONS - PLACEHOLDER IMPLEMENTATION
// ============================================================================

// Note: The Driver model doesn't have currentLat, currentLng, locationUpdatedAt fields
// This is a simplified implementation for deployment. To enable full location tracking,
// add these fields to the Prisma schema:
//   currentLat        Decimal? @db.Decimal(10, 8)
//   currentLng        Decimal? @db.Decimal(11, 8)
//   locationUpdatedAt DateTime?

/**
 * Update driver location
 */
export async function updateLocation(input: LocationUpdate): Promise<void> {
  // Placeholder - location tracking requires schema changes
  console.log(`[Location] Update requested for driver ${input.driverId}: ${input.latitude}, ${input.longitude}`);
}

/**
 * Get driver's current location
 */
export async function getDriverLocation(_driverId: string) {
  // Placeholder - location tracking requires schema changes
  return null;
}

/**
 * Check if point is within geofence
 */
export async function checkGeofence(input: GeofenceCheck): Promise<{
  withinGeofence: boolean;
  distance: number;
  geofenceId?: string;
}> {
  // Simplified implementation without database
  console.log(`[Location] Geofence check: ${input.latitude}, ${input.longitude}`);
  return { withinGeofence: false, distance: Infinity };
}

/**
 * Get nearby drivers
 */
export async function getNearbyDrivers(
  latitude: number,
  longitude: number,
  radius: number = 5000, // 5km default
  _status?: string
): Promise<NearbyDriver[]> {
  // Placeholder - location tracking requires schema changes
  console.log(`[Location] Nearby drivers requested: ${latitude}, ${longitude}, radius: ${radius}`);
  return [];
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const locationService = {
  updateLocation,
  getDriverLocation,
  checkGeofence,
  getNearbyDrivers,
};

export default locationService;
