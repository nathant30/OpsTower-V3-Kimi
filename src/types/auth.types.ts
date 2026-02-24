/**
 * Authentication related type definitions
 * Updated with personas-based authorization model
 */

// Core personas from the organizational structure
export type UserRole = 
  // Command Center
  | 'CCHead'           // CC Head - full approval authority
  | 'CCManager'        // CC Manager - approve/propose
  | 'CCTeamLead'       // CC Team Lead - approve/propose
  | 'CCOperator'       // CC Operator - view/propose only
  // Ground Operations
  | 'ERT'              // Emergency Response Team - execute
  | 'FieldOperator'    // Field Operator - execute
  | 'UtilityCrew'      // Utility Crew - prep tasks
  // Depots
  | 'DepotManager'     // Depot Manager - approve checkout
  // Support Functions
  | 'Compliance'       // Compliance - propose (recommend)
  | 'Audit'            // Audit/Data Intelligence - view only
  | 'Finance'          // Finance - financial operations
  | 'Support'          // Support Agent - customer support
  // Legacy roles (for backward compatibility)
  | 'SuperAdmin'
  | 'OperationsDirector'
  | 'OperationsManager'
  | 'FleetManager'
  | 'FinanceManager'
  | 'SupportAgent'
  | 'Viewer';

// Permission matrix aligned with module structure
export type Permission =
  // ============ NEW MODULE-BASED PERMISSIONS ============
  // Command Center Module
  | 'command:view'           // View dashboard and live ops
  | 'command:propose'        // Create requests/recommendations
  | 'command:approve'        // Approve requests
  | 'command:dispatch'       // Execute dispatch operations
  | 'command:incident.manage' // Manage incidents
  // Ground Operations Module
  | 'ground:view'
  | 'ground:task.execute'    // Execute tasks
  | 'ground:ert.execute'     // ERT specific operations
  | 'ground:hub.manage'      // Hub operations
  // Depots Module
  | 'depots:view'
  | 'depots:prep'            // Utility crew prep tasks
  | 'depots:checkout.approve' // Depot manager approval
  | 'depots:damage.log'      // Log damage
  // Drivers Module
  | 'drivers:view'
  | 'drivers:manage'
  | 'drivers:verify'         // Driver onboarding/verification
  | 'drivers:shift.manage'   // Shift management
  // Finance Module
  | 'finance:view'           // View only (CC Head, Finance)
  | 'finance:process'        // Process transactions
  | 'finance:export'         // Export reports
  // Insights Module
  | 'insights:view'          // Analytics view
  | 'insights:audit'         // Audit log access
  | 'insights:reports'       // Generate reports
  // Support Module
  | 'support:view'
  | 'support:ticket.manage'  // Handle support tickets
  | 'support:passenger.view' // View passenger data
  // Admin Module
  | 'admin:system'           // System settings
  | 'admin:rbac'             // Access control management
  | 'admin:users'            // User management
  
  // ============ LEGACY PERMISSIONS (Backward Compatibility) ============
  // Dashboard
  | 'view:dashboard'
  | 'view:analytics'
  // Orders
  | 'view:orders'
  | 'create:orders'
  | 'edit:orders'
  | 'cancel:orders'
  | 'assign:drivers'
  // Drivers
  | 'view:drivers'
  | 'edit:drivers'
  | 'suspend:drivers'
  | 'verify:drivers'
  // Fleet
  | 'view:fleet'
  | 'edit:fleet'
  | 'manage:maintenance'
  // Incidents
  | 'view:incidents'
  | 'create:incidents'
  | 'edit:incidents'
  | 'investigate:incidents'
  | 'resolve:incidents'
  // Finance (legacy)
  | 'process:payouts'
  | 'adjust:transactions'
  | 'export:transactions'
  | 'reverse:transactions'
  // Admin (legacy)
  | 'manage:users'
  | 'manage:settings'
  | 'view:audit'
  
  // Wildcard (super admin)
  | '*:*';

// Legacy permission type for backward compatibility
export type LegacyPermission = 
  | 'view:dashboard' | 'view:analytics' | 'view:orders' | 'create:orders'
  | 'edit:orders' | 'cancel:orders' | 'assign:drivers' | 'view:drivers'
  | 'edit:drivers' | 'suspend:drivers' | 'verify:drivers' | 'view:fleet'
  | 'edit:fleet' | 'manage:maintenance' | 'view:incidents' | 'create:incidents'
  | 'edit:incidents' | 'investigate:incidents' | 'resolve:incidents'
  | 'process:payouts' | 'adjust:transactions' | 'export:transactions'
  | 'reverse:transactions' | 'manage:users' | 'manage:settings' | 'view:audit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Device preferences
  preferredDevice?: 'desktop' | 'tablet' | 'mobile';
  // Module preferences
  defaultModule?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// Role metadata for UI display
export const ROLE_METADATA: Record<UserRole, { label: string; description: string; level: number }> = {
  // Command Center
  CCHead: { label: 'CC Head', description: 'Full approval authority over command center operations', level: 90 },
  CCManager: { label: 'CC Manager', description: 'Approve and propose command center actions', level: 80 },
  CCTeamLead: { label: 'CC Team Lead', description: 'Team lead with approval authority', level: 70 },
  CCOperator: { label: 'CC Operator', description: 'View and propose actions', level: 60 },
  // Ground Ops
  ERT: { label: 'ERT', description: 'Emergency Response Team - field execution', level: 60 },
  FieldOperator: { label: 'Field Operator', description: 'Field operations execution', level: 55 },
  UtilityCrew: { label: 'Utility Crew', description: 'Prep tasks and ground support', level: 50 },
  // Depots
  DepotManager: { label: 'Depot Manager', description: 'Depot operations and checkout approval', level: 70 },
  // Support Functions
  Compliance: { label: 'Compliance', description: 'Propose recommendations and compliance checks', level: 65 },
  Audit: { label: 'Audit', description: 'View-only audit and data intelligence', level: 50 },
  Finance: { label: 'Finance', description: 'Financial operations and reporting', level: 60 },
  Support: { label: 'Support', description: 'Customer support operations', level: 50 },
  // Legacy
  SuperAdmin: { label: 'Super Admin', description: 'System administrator with full access', level: 100 },
  OperationsDirector: { label: 'Operations Director', description: 'Director level oversight', level: 85 },
  OperationsManager: { label: 'Operations Manager', description: 'Operations management', level: 75 },
  FleetManager: { label: 'Fleet Manager', description: 'Fleet operations management', level: 70 },
  FinanceManager: { label: 'Finance Manager', description: 'Finance department management', level: 70 },
  SupportAgent: { label: 'Support Agent', description: 'Customer support', level: 50 },
  Viewer: { label: 'Viewer', description: 'Read-only access', level: 10 },
};
