/**
 * WebSocket Event Handlers Index
 * Export all event handlers for easy importing
 */

// Order handlers
export {
  handleOrderCreated,
  handleOrderUpdated,
  handleOrderAssigned,
  handleOrderCompleted,
  handleOrderCancelled,
  subscribeToOrderEvents,
} from './orderHandlers';

// Driver handlers
export {
  handleDriverStatusChanged,
  handleDriverLocationUpdated,
  handleDriverShiftStarted,
  handleDriverShiftEnded,
  subscribeToDriverEvents,
} from './driverHandlers';

// Vehicle handlers
export {
  handleVehicleLocationUpdated,
  handleVehicleStatusChanged,
  subscribeToVehicleEvents,
} from './vehicleHandlers';

// Incident handlers
export {
  handleIncidentCreated,
  handleIncidentUpdated,
  subscribeToIncidentEvents,
  setSoundAlertsEnabled,
  isSoundAlertsEnabled,
} from './incidentHandlers';
