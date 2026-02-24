// CACHE BUST v1002
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useLiveMapOrders, useLiveMapDrivers } from '@/features/dashboard/hooks/useLiveMapOrders';
import { KpiRibbon } from '@/features/dashboard/components/KpiRibbon';
import { TacticalMap } from '@/features/dashboard/components/TacticalMap';
import { useLastUpdatedText } from '@/features/orders/hooks/useOrders';
import { toast } from '@/components/auth/ToastProvider';
import { RefreshCw, Clock, Users, Car, Award, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Tab components
import { FleetStatusTab } from '@/features/dashboard/components/FleetStatusTab';
import { VehicleDistributionTab } from '@/features/dashboard/components/VehicleDistributionTab';
import { DriverPerformanceTab } from '@/features/dashboard/components/DriverPerformanceTab';
import { IncidentsTab } from '@/features/dashboard/components/IncidentsTab';

type TabType = 'fleet' | 'vehicles' | 'drivers' | 'incidents';
type ServiceTypeFilter = 'All' | 'TNVS' | 'TWG' | '2W Salary' | '4W Salary' | '4W Taxi';

const tabs = [
  { id: 'fleet' as TabType, label: 'Fleet Status', icon: Users },
  { id: 'vehicles' as TabType, label: 'Vehicles', icon: Car },
  { id: 'drivers' as TabType, label: 'Drivers', icon: Award },
  { id: 'incidents' as TabType, label: 'Incidents', icon: AlertTriangle },
];

const serviceTypeFilters: ServiceTypeFilter[] = ['All', 'TNVS', 'TWG', '2W Salary', '4W Salary', '4W Taxi'];

// Service type filter chip colors
const serviceTypeColors: Record<ServiceTypeFilter, string> = {
  'All': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'TNVS': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'TWG': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '2W Salary': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  '4W Salary': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '4W Taxi': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('fleet');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceTypeFilter>('All');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(() => Date.now());
  const queryClient = useQueryClient();

  // Memoize the request to prevent constant refetching
  const statsRequest = useMemo(() => ({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    serviceType: selectedServiceType === 'All' ? undefined : selectedServiceType,
  }), [selectedServiceType]);

  const { 
    data: stats, 
    error: statsError,
    isFetching: isFetchingStats,
    dataUpdatedAt: statsUpdatedAt,
  } = useDashboardStats(statsRequest);

  const { isFetching: isFetchingOrders } = useLiveMapOrders();
  const { isFetching: isFetchingDrivers } = useLiveMapDrivers();

  const lastUpdatedText = useLastUpdatedText(statsUpdatedAt || lastRefreshTime);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setLastRefreshTime(Date.now());
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    toast.success('Dashboard refreshed');
  }, [queryClient]);

  useEffect(() => {
    if (statsError) toast.error('Failed to load dashboard statistics');
  }, [statsError]);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'fleet':
        return <FleetStatusTab serviceType={selectedServiceType} />;
      case 'vehicles':
        return <VehicleDistributionTab serviceType={selectedServiceType} />;
      case 'drivers':
        return <DriverPerformanceTab serviceType={selectedServiceType} />;
      case 'incidents':
        return <IncidentsTab serviceType={selectedServiceType} />;
      default:
        return <FleetStatusTab serviceType={selectedServiceType} />;
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with refresh status */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Title and Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-white">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Real-time operations overview
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Last updated indicator */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Updated {lastUpdatedText}</span>
            </div>
            
            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isFetchingStats}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                'bg-gray-800 border border-gray-700',
                'text-gray-400 hover:text-white',
                'transition-colors disabled:opacity-50',
                isFetchingStats && 'cursor-wait'
              )}
              title="Refresh data (R)"
            >
              <RefreshCw className={cn('w-4 h-4', isFetchingStats && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
        
        {/* Service Type Filter Chips - Scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
          {serviceTypeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedServiceType(filter)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap',
                'hover:scale-105 active:scale-95 min-h-[32px]',
                selectedServiceType === filter
                  ? cn(serviceTypeColors[filter], 'ring-2 ring-offset-2 ring-offset-[#0a0a0f] ring-white/30')
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Ribbon */}
      <KpiRibbon stats={stats} />

      {/* Loading indicator for background refresh */}
      {(isFetchingStats || isFetchingOrders || isFetchingDrivers) && (
        <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Syncing data...</span>
        </div>
      )}

      {/* Main Content: Responsive layout - stacked on mobile, side-by-side on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: Tabs (full width on mobile, 50% on desktop) */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0 overflow-hidden">
          {/* Tab Navigation - Scrollable on mobile */}
          <div className="border-b border-white/10 mb-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap min-h-[44px]",
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            {renderTabContent()}
          </div>
        </div>

        {/* Right Panel: Map (full width on mobile, 50% on desktop, hidden on small mobile) */}
        <div className="hidden sm:flex w-full lg:w-1/2 flex-col min-h-0 overflow-hidden">
          <TacticalMap />
        </div>
      </div>
    </div>
  );
}
