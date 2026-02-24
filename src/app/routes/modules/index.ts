/**
 * Route Modules Index
 * 
 * Organized by persona-based module structure:
 * - command: Command Center operations (CC personas)
 * - ground: Ground operations (ERT, Field, Utility)
 * - depots: Depot management (Depot Manager, Utility)
 * - drivers: Driver management (CC, Depot, Compliance)
 * - finance: Financial operations (CC Head, Finance)
 * - insights: Analytics and audit (CC, Audit)
 * - support: Customer support (Support agents)
 * - admin: System administration (CC Head, SuperAdmin)
 */

export { commandCenterRoutes } from './command';
export { groundOpsRoutes } from './ground';
export { depotsRoutes } from './depots';
export { driversRoutes, shiftsRoutes, bondsRoutes, tiersRoutes } from './drivers';
export { financeRoutes } from './finance';
export { insightsRoutes } from './insights';
export { supportRoutes } from './support';
export { adminRoutes } from './admin';
