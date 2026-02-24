/**
 * Safety Feature Module
 * Exports safety dashboard components, hooks, and types
 */

// Hooks
export {
  useSafetyIncidents,
  useSafetyIncident,
  useSafetyMetrics,
  useEmergencyResponses,
  useDriverRankings,
  useSafetyAlerts,
  useSOSEvents,
  useAcknowledgeIncident,
  useResolveIncident,
  useDispatchEmergency,
  useAcknowledgeAlert,
  type SafetyIncident,
  type SafetyMetrics,
  type DriverSafetyRanking,
  type SafetyAlert,
  type SOSEvent,
} from './hooks/useSafety';

// Components
export { SafetyIncidentCard } from './components/SafetyIncidentCard';
export { EmergencyPanel } from './components/EmergencyPanel';

// Pages
export { default as SafetyDashboard } from './pages/SafetyDashboard';
