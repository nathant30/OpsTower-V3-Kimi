// Hooks
export {
  useIncidents,
  useIncident,
  useCreateIncident,
  useUpdateIncident,
  useChangePriority,
  useBulkUpdateStatus,
} from './hooks/useIncidents';

export {
  useAssignInvestigator,
  useSaveInvestigation,
  useTakeDisciplinaryAction,
  useScheduleHearing,
  useResolveIncident,
  useCloseIncident,
  useReopenIncident,
  useAddEvidence,
} from './hooks/useInvestigation';

// Components
export { IncidentsTable } from './components/IncidentsTable';
export { IncidentDetail } from './components/IncidentDetail';
export { IncidentTimeline } from './components/IncidentTimeline';
export { EvidenceGallery } from './components/EvidenceGallery';
export { InvestigationPanel } from './components/InvestigationPanel';
export { ActionPanel } from './components/ActionPanel';
export { CreateIncidentModal } from './components/CreateIncidentModal';
export { IncidentCard } from './components/IncidentCard';

// Types
export type { IncidentsFilters } from './hooks/useIncidents';
