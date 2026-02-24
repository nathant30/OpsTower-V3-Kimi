// src/services/integrity.service.ts
// Incidents Agent - Integrity Service (Sabotage Detection)

import type { Incident } from '@prisma/client';
import type { IntegrityCheckResult } from '../shared/types/index.js';

import { createIntegrityAlert } from './incident.service.js';
import type { IntegrityAlertData } from '../types/index.js';
import Redis from 'ioredis';

// ============================================================================
// TYPES
// ============================================================================

export interface GPSData {
  speedKph: number;
  lat: number;
  lng: number;
}

export interface DashcamData {
  isObstructed: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const INTEGRITY = {
  velocityThresholdKph: 10,
  obstructionDurationSeconds: 30,
  checkIntervalSeconds: 5, // Assuming 5-second intervals
};

// Calculate how many consecutive checks needed to trigger alert
const THRESHOLD_CHECKS = Math.ceil(
  INTEGRITY.obstructionDurationSeconds / INTEGRITY.checkIntervalSeconds
); // 30s / 5s = 6 checks

// ============================================================================
// REDIS CLIENT
// ============================================================================

let redis: Redis | null = null;

/**
 * Get or create Redis client
 */
function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

    redis.on('error', (err) => console.error('Redis Client Error', err));
  }

  return redis;
}

// ============================================================================
// INTEGRITY CHECKING
// ============================================================================

/**
 * Check integrity for a driver
 * Called by Realtime Agent when GPS + dashcam data arrives
 *
 * Triggers integrity alert if:
 * - GPS velocity > 10 kph AND
 * - Dashcam obstructed for > 30 seconds (6+ consecutive checks)
 */
export async function checkIntegrity(
  driverId: string,
  gpsData: GPSData,
  dashcamData: DashcamData,
  shiftId?: string,
  assetId?: string
): Promise<IntegrityCheckResult> {
  const client = getRedisClient();
  const key = `integrity:${driverId}`;

  // Check if both conditions are met
  const isViolating =
    gpsData.speedKph > INTEGRITY.velocityThresholdKph && dashcamData.isObstructed;

  if (isViolating) {
    // Increment violation counter
    const count = await client.incr(key);

    // Set expiry to reset counter if no violation for 60 seconds
    await client.expire(key, 60);

    // Check if threshold reached
    if (count >= THRESHOLD_CHECKS) {
      // Create integrity alert
      const alertData: IntegrityAlertData = {
        driverId,
        alertType: 'DASHCAM_OBSTRUCTION',
        description: `Dashcam obstructed at ${gpsData.speedKph} kph`,
        severity: 2,
        locationLat: gpsData.lat,
        locationLng: gpsData.lng,
        shiftId,
        tripId: assetId,
      };

      const incident = await createIntegrityAlert(alertData);

      // Reset counter after creating alert
      await client.del(key);

      return {
        triggered: true,
        incidentId: incident.id,
      };
    }

    // Not yet at threshold
    return { triggered: false };
  } else {
    // Conditions not met - reset counter
    await client.del(key);
    return { triggered: false };
  }
}

/**
 * Get current integrity violation count for a driver
 * Used for monitoring/debugging
 */
export async function getIntegrityViolationCount(driverId: string): Promise<number> {
  const client = getRedisClient();
  const key = `integrity:${driverId}`;
  const count = await client.get(key);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Reset integrity violation counter for a driver
 * Used for testing or manual override
 */
export async function resetIntegrityCounter(driverId: string): Promise<void> {
  const client = getRedisClient();
  const key = `integrity:${driverId}`;
  await client.del(key);
}

/**
 * Close Redis connection (cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.disconnect();
    redis = null;
  }
}
