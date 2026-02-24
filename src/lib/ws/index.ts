/**
 * WebSocket Module Index
 * Centralized exports for all WebSocket/SingalR functionality
 */

// Core client
export { 
  signalRClient, 
  useConnectionStatus,
  type ConnectionStatus,
  type EventCallback,
} from './signalrClient';

// React hooks
export {
  useWebSocket,
  useWebSocketEvents,
  useWebSocketInvoke,
  useWebSocketStatus,
  useWebSocketAuth,
  useOptimisticUpdate,
  type WebSocketEvents,
  type WebSocketEventName,
  type UseWebSocketOptions,
  type OrderCreatedEvent,
  type OrderUpdatedEvent,
  type OrderAssignedEvent,
  type OrderCompletedEvent,
  type OrderCancelledEvent,
  type DriverStatusChangedEvent,
  type DriverLocationUpdatedEvent,
  type DriverShiftEvent,
  type VehicleLocationUpdatedEvent,
  type VehicleStatusChangedEvent,
  type IncidentCreatedEvent,
  type IncidentUpdatedEvent,
  type DashboardStatsUpdatedEvent,
} from './useWebSocket';

// Context Provider
export {
  WebSocketProvider,
  useWebSocketContext,
  ConnectionStatusBadge,
} from './WebSocketProvider';

// Event handlers
export {
  // Order handlers
  handleOrderCreated,
  handleOrderUpdated,
  handleOrderAssigned,
  handleOrderCompleted,
  handleOrderCancelled,
  subscribeToOrderEvents,
  
  // Driver handlers
  handleDriverStatusChanged,
  handleDriverLocationUpdated,
  handleDriverShiftStarted,
  handleDriverShiftEnded,
  subscribeToDriverEvents,
  
  // Vehicle handlers
  handleVehicleLocationUpdated,
  handleVehicleStatusChanged,
  subscribeToVehicleEvents,
  
  // Incident handlers
  handleIncidentCreated,
  handleIncidentUpdated,
  subscribeToIncidentEvents,
  setSoundAlertsEnabled,
  isSoundAlertsEnabled,
} from './handlers';
