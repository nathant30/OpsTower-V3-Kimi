/**
 * OpsTower V2 - Feature Modules Export
 * 
 * This file serves as the central export point for all feature modules
 * in the OpsTower V2 application. It enables clean imports across the
 * codebase and provides a single source of truth for feature availability.
 * 
 * @module Features
 * @version 2.0.0
 */

// ============================================================================
// CORE FEATURES (Existing)
// ============================================================================

// Note: Individual feature exports are available from their respective modules
// to avoid naming conflicts. Import directly from the feature module:
// import { LoginPage } from '@/features/auth';
// import { DashboardPage } from '@/features/dashboard';

// IMPORTANT: Do NOT add named exports that re-export from feature modules below.
// This causes duplicate export conflicts (TS2308). Import directly from the feature module instead.

// ============================================================================
// PHASE 1 FEATURES (Critical)
// ============================================================================

/** Fraud Detection & Trust Scoring */
// export * from './fraud';  // Import directly from '@/features/fraud' to avoid conflicts

/** Payment Processing (Maya/GCash) */
// export * from './payments';  // Import directly from '@/features/payments' to avoid conflicts

/** Role-Based Access Control */
// export * from './rbac';  // Import directly from '@/features/rbac' to avoid conflicts

/** Analytics & Reporting */
// export * from './analytics';  // Import directly from '@/features/analytics' to avoid conflicts

// ============================================================================
// PHASE 2 FEATURES (High Value)
// ============================================================================

/** Live Operations & Real-time Tracking */
// export * from './live';  // Import directly from '@/features/live' to avoid conflicts

/** Dispatch Management */
// export * from './dispatch';  // Import directly from '@/features/dispatch' to avoid conflicts

/** Safety & Emergency Response */
// export * from './safety';  // Import directly from '@/features/safety' to avoid conflicts

/** Audit Logging & Compliance */
// export * from './audit';  // Import directly from '@/features/audit' to avoid conflicts

/** Passenger Management */
// export * from './passengers';  // Import directly from '@/features/passengers' to avoid conflicts

/** Support Ticketing System */
// export * from './support';  // Import directly from '@/features/support' to avoid conflicts

/** Command Center (NOC) */
// export * from './command';  // Import directly from '@/features/command' to avoid conflicts

/** Operations Management */
// export * from './operations';  // Import directly from '@/features/operations' to avoid conflicts

/** Dashcam Integration */
// export * from './dashcam';  // Import directly from '@/features/dashcam' to avoid conflicts

/** Document Verification */
// export * from './verification';  // Import directly from '@/features/verification' to avoid conflicts

/** Mobile App Management */
// export * from './mobile';  // Import directly from '@/features/mobile' to avoid conflicts

/** User Profile Management */
// export * from './profile';  // Import directly from '@/features/profile' to avoid conflicts

/** Booking Management */
// export * from './bookings';  // Import directly from '@/features/bookings' to avoid conflicts

/** Billing & Invoicing */
// export * from './billing';  // Import directly from '@/features/billing' to avoid conflicts

/** Driver Earnings Tracking */
// export * from './earnings';  // Import directly from '@/features/earnings' to avoid conflicts

/** Driver Tier Management */
// export * from './tiers';  // Import directly from '@/features/tiers' to avoid conflicts

// ============================================================================
// FEATURE REGISTRY (Metadata)
// ============================================================================

/**
 * Feature metadata for dynamic feature management
 */
export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  phase: 1 | 2 | 3 | 4;
  status: 'complete' | 'in-progress' | 'pending';
  requiredRoles?: string[];
  icon?: string;
}

/**
 * Complete feature registry
 */
export const FEATURE_REGISTRY: FeatureMetadata[] = [
  // Core Features
  { id: 'dashboard', name: 'Dashboard', description: 'Main operations dashboard', phase: 1, status: 'complete' },
  { id: 'drivers', name: 'Drivers', description: 'Driver management', phase: 1, status: 'complete' },
  { id: 'fleet', name: 'Fleet', description: 'Vehicle fleet management', phase: 1, status: 'complete' },
  { id: 'orders', name: 'Orders', description: 'Order management', phase: 1, status: 'complete' },
  { id: 'incidents', name: 'Incidents', description: 'Incident tracking', phase: 1, status: 'complete' },
  { id: 'finance', name: 'Finance', description: 'Financial management', phase: 1, status: 'complete' },
  { id: 'shifts', name: 'Shifts', description: 'Shift management', phase: 1, status: 'complete' },
  { id: 'bonds', name: 'Bonds', description: 'Driver bonds', phase: 1, status: 'complete' },
  { id: 'compliance', name: 'Compliance', description: 'Compliance tracking', phase: 1, status: 'complete' },
  { id: 'settings', name: 'Settings', description: 'System settings', phase: 1, status: 'complete' },
  
  // Phase 1 Features
  { id: 'fraud', name: 'Fraud Detection', description: 'AI-powered fraud detection', phase: 1, status: 'complete' },
  { id: 'payments', name: 'Payments', description: 'Maya/GCash integration', phase: 1, status: 'complete' },
  { id: 'rbac', name: 'RBAC', description: 'Role-based access control', phase: 1, status: 'complete' },
  { id: 'analytics', name: 'Analytics', description: 'Analytics dashboard', phase: 1, status: 'complete' },
  
  // Phase 2 Features
  { id: 'live', name: 'Live Operations', description: 'Real-time tracking', phase: 2, status: 'complete' },
  { id: 'dispatch', name: 'Dispatch', description: 'Dispatch console', phase: 2, status: 'complete' },
  { id: 'safety', name: 'Safety', description: 'Safety monitoring', phase: 2, status: 'complete' },
  { id: 'audit', name: 'Audit', description: 'Audit logging', phase: 2, status: 'complete' },
  { id: 'passengers', name: 'Passengers', description: 'Passenger management', phase: 2, status: 'complete' },
  { id: 'support', name: 'Support', description: 'Support ticketing', phase: 2, status: 'complete' },
  { id: 'command', name: 'Command Center', description: 'NOC operations', phase: 2, status: 'complete' },
  { id: 'operations', name: 'Operations', description: 'Operations management', phase: 2, status: 'complete' },
  { id: 'dashcam', name: 'Dashcams', description: 'Dashcam management', phase: 2, status: 'complete' },
  { id: 'verification', name: 'Verification', description: 'Document verification', phase: 2, status: 'complete' },
  { id: 'mobile', name: 'Mobile', description: 'Mobile app management', phase: 2, status: 'complete' },
  { id: 'profile', name: 'Profile', description: 'User profile', phase: 2, status: 'complete' },
  { id: 'bookings', name: 'Bookings', description: 'Booking management', phase: 2, status: 'complete' },
  { id: 'billing', name: 'Billing', description: 'Billing & invoicing', phase: 2, status: 'complete' },
  { id: 'earnings', name: 'Earnings', description: 'Earnings tracking', phase: 2, status: 'complete' },
  { id: 'tiers', name: 'Tiers', description: 'Driver tier management', phase: 2, status: 'complete' },
  
  // Phase 3 Features (Enhancing)
  { id: 'errors', name: 'Error Tracking', description: 'Centralized error monitoring', phase: 3, status: 'complete' },
  { id: 'signalr', name: 'SignalR Integration', description: 'Real-time WebSocket connection', phase: 3, status: 'complete' },
  { id: 'ai-management', name: 'AI Management', description: 'AI model training & monitoring', phase: 3, status: 'complete' },
  { id: 'alerts', name: 'Alerts', description: 'Advanced alert management', phase: 3, status: 'complete' },
];

/**
 * Get features by phase
 */
export const getFeaturesByPhase = (phase: 1 | 2 | 3 | 4): FeatureMetadata[] => {
  return FEATURE_REGISTRY.filter(f => f.phase === phase);
};

/**
 * Get feature by ID
 */
export const getFeatureById = (id: string): FeatureMetadata | undefined => {
  return FEATURE_REGISTRY.find(f => f.id === id);
};

/**
 * Check if feature is complete
 */
export const isFeatureComplete = (id: string): boolean => {
  const feature = getFeatureById(id);
  return feature?.status === 'complete';
};

/**
 * Get complete feature count
 */
export const getCompleteFeatureCount = (): number => {
  return FEATURE_REGISTRY.filter(f => f.status === 'complete').length;
};

/**
 * Get total feature count
 */
export const getTotalFeatureCount = (): number => {
  return FEATURE_REGISTRY.length;
};

/**
 * Get feature completion percentage
 */
export const getFeatureCompletionPercentage = (): number => {
  const total = getTotalFeatureCount();
  if (total === 0) return 0;
  return Math.round((getCompleteFeatureCount() / total) * 100);
};

export default FEATURE_REGISTRY;
