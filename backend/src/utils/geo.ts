// src/utils/geo.ts
// Geofence utilities for the Shifts Agent

import type { GeoPoint } from '../shared/types/index.js';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a point is within a geofence (circular)
 */
export interface GeofenceCheckResult {
  within: boolean;
  distanceMeters: number;
  radiusMeters: number;
}

export function checkGeofence(
  location: GeoPoint,
  center: GeoPoint,
  radiusMeters: number
): GeofenceCheckResult {
  const distance = calculateDistance(location, center);

  return {
    within: distance <= radiusMeters,
    distanceMeters: Math.round(distance),
    radiusMeters,
  };
}

/**
 * Validate GPS accuracy
 */
export function isGPSAccurate(location: GeoPoint, maxAccuracyMeters: number = 100): boolean {
  if (!location.accuracyMeters) {
    return true; // Assume accurate if not provided
  }
  return location.accuracyMeters <= maxAccuracyMeters;
}
