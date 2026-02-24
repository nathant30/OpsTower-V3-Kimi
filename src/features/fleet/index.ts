// Fleet Module Exports

// Hooks
export {
  useVehicles,
  useSearchVehicles,
  useVehiclesByStatus,
  useVehiclesByType,
  useFleetStats,
  useBulkUpdateVehicleStatus,
  useUpdateVehicleStatus,
  useAssignDriverToVehicle,
  useUnassignDriverFromVehicle,
} from './hooks/useVehicles';

export {
  useVehicle,
  useVehicleMaintenanceHistory,
  useVehicleUtilization,
  useVehicleLocationHistory,
  useVehicleTripHistory,
  useAddMaintenanceRecord,
  useUpdateVehicle,
  useScheduleMaintenance,
} from './hooks/useVehicle';

// Components
export { VehicleTable } from './components/VehicleTable';
export { VehicleDetail } from './components/VehicleDetail';
export { VehicleFilters } from './components/VehicleFilters';
export { BulkActions, ExtendedFleetBatchActions } from './components/BulkActions';

// Types
export type { VehicleTableProps } from './components/VehicleTable';
export type { VehicleDetailProps } from './components/VehicleDetail';
export type { VehicleFiltersProps, VehicleFiltersState } from './components/VehicleFilters';
export type { BulkActionsProps, ExtendedFleetBatchActionsProps } from './components/BulkActions';
export type { 
  VehiclesFilters, 
  VehiclesResponse, 
  BulkUpdateStatusRequest 
} from './hooks/useVehicles';
export type {
  VehicleDetailResponse,
  MaintenanceAlert,
  UtilizationDataPoint,
  TripSummary,
  MaintenanceHistoryResponse,
  VehicleLocationHistory,
} from './hooks/useVehicle';
