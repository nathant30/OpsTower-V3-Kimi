/**
 * Dashboard Feature Module
 * Dashboard components, hooks, and pages
 */

// Components
export { KpiRibbon } from './components/KpiRibbon';
export { FleetStatusPanel } from './components/FleetStatusPanel';
export { FleetStatusCompact } from './components/FleetStatusCompact';
export { IncidentsPanel } from './components/IncidentsPanel';
export { ShiftAlertsPanel } from './components/ShiftAlertsPanel';
export { SystemStatusBar } from './components/SystemStatusBar';
export { TacticalMap } from './components/TacticalMap';
export { DemandHeatmap } from './components/DemandHeatmap';
export { DriverRankings } from './components/DriverRankings';
export { VehicleDistributionTab } from './components/VehicleDistributionTab';
export { DriverPerformanceTab } from './components/DriverPerformanceTab';
export { FleetStatusTab } from './components/FleetStatusTab';
export { IncidentsTab } from './components/IncidentsTab';
export { PlaybackControls } from './components/PlaybackControls';

// Hooks
export { useDashboardStats } from './hooks/useDashboardStats';
export { useLiveMapOrders } from './hooks/useLiveMapOrders';
export { useMapData } from './hooks/useMapData';

// Pages
export { default as DashboardPage } from './pages/DashboardPage';
