import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { CreateIncidentModal } from '@/features/incidents/components/CreateIncidentModal';
import { IncidentCard } from '@/features/incidents/components/IncidentCard';
import { usePermissionCheck } from '@/components/auth';
import { useIncidents } from '@/features/incidents/hooks/useIncidents';
import type { IncidentStatus, Severity, Incident } from '@/types/domain.types';
import { cn } from '@/lib/utils/cn';
import { 
  Plus, AlertTriangle, Clock, CheckCircle, AlertCircle,
  Search, Filter, Download, X, RotateCcw, LayoutGrid, List,
  ShieldAlert, Shield, FileWarning, RefreshCw,
  Activity, Flame
} from 'lucide-react';

// Severity tab configuration
const SEVERITY_TABS = [
  { key: 'all', label: 'All', count: null, icon: Shield },
  { key: 'Critical', label: 'Critical', color: 'red', icon: ShieldAlert },
  { key: 'High', label: 'High', color: 'amber', icon: FileWarning },
  { key: 'Medium', label: 'Medium', color: 'blue', icon: Shield },
  { key: 'Low', label: 'Low', color: 'gray', icon: Shield },
] as const;

// Status filter options
const STATUS_OPTIONS: { value: IncidentStatus; label: string; color: string }[] = [
  { value: 'New', label: 'Open', color: 'red' },
  { value: 'Reviewing', label: 'Reviewing', color: 'amber' },
  { value: 'Investigating', label: 'In Progress', color: 'blue' },
  { value: 'PendingAction', label: 'Pending', color: 'orange' },
  { value: 'Hearing', label: 'Hearing', color: 'purple' },
  { value: 'Resolved', label: 'Resolved', color: 'green' },
  { value: 'Closed', label: 'Closed', color: 'gray' },
];

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'amber' | 'orange' | 'green';
  isLoading?: boolean;
}

function KpiCard({ title, value, subtext, icon, color, isLoading }: KpiCardProps) {
  const colorStyles = {
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    orange: 'from-orange-500/20 to-amber-500/5 border-orange-500/20 text-orange-400',
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
  };

  if (isLoading) {
    return (
      <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className={cn(
      "relative h-24 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg bg-current/10 shrink-0",
          color === 'blue' && 'text-blue-400',
          color === 'red' && 'text-red-400',
          color === 'amber' && 'text-amber-400',
          color === 'orange' && 'text-orange-400',
          color === 'green' && 'text-green-400'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Incident Activity Item for Right Panel
function ActivityItem({ incident, timeAgo }: { incident: Incident; timeAgo: string }) {
  const severityColors = {
    Critical: 'text-red-400 border-red-500/30 bg-red-500/10',
    High: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Medium: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    Low: 'text-gray-400 border-gray-500/30 bg-gray-500/10',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
      <div className={cn(
        "w-2 h-2 mt-2 rounded-full shrink-0",
        incident.severity === 'Critical' ? 'bg-red-500 animate-pulse' :
        incident.severity === 'High' ? 'bg-amber-500' :
        incident.severity === 'Medium' ? 'bg-blue-500' :
        'bg-gray-500'
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{incident.description.summary}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border", severityColors[incident.severity])}>
            {incident.severity}
          </span>
          <span className="text-xs text-gray-500">{incident.incidentId}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 shrink-0">{timeAgo}</span>
    </div>
  );
}

// Incident Heatmap Component for Right Panel
function IncidentHeatmap({ incidents }: { incidents: Incident[] }) {
  // Generate mock heatmap data based on incidents
  const severityCounts = {
    Critical: incidents.filter(i => i.severity === 'Critical').length,
    High: incidents.filter(i => i.severity === 'High').length,
    Medium: incidents.filter(i => i.severity === 'Medium').length,
    Low: incidents.filter(i => i.severity === 'Low').length,
  };

  const statusCounts = {
    New: incidents.filter(i => i.status === 'New').length,
    Reviewing: incidents.filter(i => i.status === 'Reviewing').length,
    Investigating: incidents.filter(i => i.status === 'Investigating').length,
    PendingAction: incidents.filter(i => i.status === 'PendingAction').length,
    Resolved: incidents.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div className="space-y-4">
      {/* Severity Distribution */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Severity Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(severityCounts).map(([severity, count]) => {
            const colors = {
              Critical: 'bg-red-500',
              High: 'bg-amber-500',
              Medium: 'bg-blue-500',
              Low: 'bg-gray-500',
            };
            const maxCount = Math.max(...Object.values(severityCounts), 1);
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={severity} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{severity}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", colors[severity as keyof typeof colors])}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Status Breakdown
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="p-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-lg font-semibold text-white">{count}</p>
              <p className="text-xs text-gray-500">{status.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Format relative time
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Hook for last updated text
function useLastUpdatedText(timestamp: number): string {
  return useMemo(() => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }, [timestamp]);
}

export default function IncidentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissionCheck();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeSeverityTab, setActiveSeverityTab] = useState<string>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>(['New', 'Reviewing', 'Investigating']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  
  // Fetch incidents
  const { 
    data: incidentsData, 
    isLoading, 
    error, 
    refetch,
    isFetching,
    dataUpdatedAt 
  } = useIncidents({
    pageSize: 100,
    severity: activeSeverityTab === 'all' ? undefined : [activeSeverityTab as Severity],
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    searchQuery: searchQuery || undefined,
  });
  
  const incidents = incidentsData?.items || [];
  const lastUpdatedText = useLastUpdatedText(dataUpdatedAt || lastRefreshTime);

  // Calculate KPI stats
  const stats = useMemo(() => {
    const allIncidents = incidentsData?.items || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      total: allIncidents.length,
      criticalHigh: allIncidents.filter(i => i.severity === 'Critical' || i.severity === 'High').length,
      open: allIncidents.filter(i => ['New', 'Reviewing', 'Investigating'].includes(i.status)).length,
      pendingAction: allIncidents.filter(i => i.status === 'PendingAction').length,
      resolvedToday: allIncidents.filter(i => {
        if (i.status !== 'Resolved' || !i.timeline.resolved) return false;
        const resolvedDate = new Date(i.timeline.resolved);
        return resolvedDate >= today;
      }).length,
    };
  }, [incidentsData]);

  // KPI Data
  const kpiData = useMemo(() => [
    {
      title: 'Total Incidents',
      value: stats.total,
      subtext: 'All time incidents',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Critical/High Priority',
      value: stats.criticalHigh,
      subtext: 'Requires attention',
      icon: <ShieldAlert className="w-5 h-5" />,
      color: 'red' as const,
    },
    {
      title: 'Open Cases',
      value: stats.open,
      subtext: 'New, Reviewing, Investigating',
      icon: <Clock className="w-5 h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Pending Action',
      value: stats.pendingAction,
      subtext: 'Awaiting decision',
      icon: <Activity className="w-5 h-5" />,
      color: 'orange' as const,
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday,
      subtext: 'Completed today',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'green' as const,
    },
  ], [stats]);

  // Filter chips
  const activeFilters = useMemo(() => {
    const filters: { label: string; onRemove: () => void }[] = [];
    
    if (activeSeverityTab !== 'all') {
      const tab = SEVERITY_TABS.find(t => t.key === activeSeverityTab);
      filters.push({
        label: `Severity: ${tab?.label}`,
        onRemove: () => setActiveSeverityTab('all'),
      });
    }
    
    selectedStatuses.forEach(status => {
      const option = STATUS_OPTIONS.find(o => o.value === status);
      filters.push({
        label: `Status: ${option?.label}`,
        onRemove: () => setSelectedStatuses(prev => prev.filter(s => s !== status)),
      });
    });
    
    if (searchQuery) {
      filters.push({
        label: `Search: "${searchQuery}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    
    return filters;
  }, [activeSeverityTab, selectedStatuses, searchQuery]);

  const canCreate = hasPermission('create:incidents');
  const canExport = hasPermission('view:incidents');

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setLastRefreshTime(Date.now());
    await queryClient.invalidateQueries({ queryKey: ['incidents', 'list'] });
    refetch();
  }, [queryClient, refetch]);

  // Handle status toggle
  const toggleStatus = (status: IncidentStatus) => {
    setSelectedIds([]); // Clear selection when filters change
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveSeverityTab('all');
    setSelectedStatuses(['New', 'Reviewing', 'Investigating']);
    setSearchQuery('');
    setSelectedIds([]);
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['ID', 'Type', 'Severity', 'Status', 'Reported By', 'Date'].join(','),
      ...incidents.map(i => [
        i.incidentId,
        i.type,
        i.severity,
        i.status,
        i.reportedBy.name,
        new Date(i.timeline.reportedAt).toLocaleDateString(),
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incidents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // Get recent activity
  const recentActivity = useMemo(() => {
    return [...incidents]
      .sort((a, b) => new Date(b.timeline.reportedAt).getTime() - new Date(a.timeline.reportedAt).getTime())
      .slice(0, 5);
  }, [incidents]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-xpress-bg-elevated rounded animate-pulse" />
            <div className="h-4 w-64 bg-xpress-bg-elevated rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-xpress-bg-elevated rounded animate-pulse" />
        </div>
        
        {/* KPI skeleton */}
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          <div className="w-3/5 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-xpress-bg-tertiary rounded-lg border border-xpress-border animate-pulse" />
            ))}
          </div>
          <div className="w-2/5 bg-xpress-bg-tertiary rounded-lg border border-xpress-border animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-xpress-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-xpress-text-primary mb-2">
            Failed to Load Incidents
          </h2>
          <p className="text-xpress-text-muted mb-4">
            {error instanceof Error ? error.message : 'An error occurred while loading incidents'}
          </p>
          <Button variant="primary" onClick={() => refetch()}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-xpress-text-primary">Incident Management</h1>
          <p className="text-sm text-xpress-text-muted">
            Track and resolve safety incidents
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last updated indicator */}
          <div className="flex items-center gap-2 text-sm text-xpress-text-muted">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdatedText}</span>
          </div>
          
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
              'bg-xpress-bg-tertiary border border-xpress-border',
              'text-xpress-text-secondary hover:text-xpress-text-primary',
              'transition-colors disabled:opacity-50',
              isFetching && 'cursor-wait'
            )}
            title="Refresh data"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Report Incident button */}
          {canCreate && (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              Report Incident
            </Button>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-5 gap-4">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Loading indicator for background refresh */}
      {isFetching && (
        <div className="flex items-center gap-2 text-xs text-xpress-text-muted animate-pulse">
          <div className="w-2 h-2 bg-xpress-accent-blue rounded-full" />
          <span>Syncing data...</span>
        </div>
      )}

      {/* Main Content: 60% Left (Filters + Data) | 40% Right (Heatmap/Activity) */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Left Panel: 60% - Severity Tabs, Filters, Incident Cards */}
        <div className="w-3/5 flex flex-col min-h-0 overflow-hidden gap-4">
          {/* Severity Filter Tabs */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {SEVERITY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSeverityTab === tab.key;
              const count = tab.key === 'all' 
                ? incidents.length 
                : incidents.filter(i => i.severity === tab.key).length;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveSeverityTab(tab.key);
                    setSelectedIds([]);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive 
                      ? tab.key === 'all'
                        ? "bg-xpress-bg-elevated text-xpress-text-primary ring-1 ring-xpress-border"
                        : tab.color === 'red'
                          ? "bg-xpress-accent-red/20 text-xpress-accent-red ring-1 ring-xpress-accent-red/50"
                          : tab.color === 'amber'
                            ? "bg-xpress-accent-amber/20 text-xpress-accent-amber ring-1 ring-xpress-accent-amber/50"
                            : "bg-xpress-accent-blue/20 text-xpress-accent-blue ring-1 ring-xpress-accent-blue/50"
                      : "bg-xpress-bg-tertiary text-xpress-text-secondary hover:bg-xpress-bg-elevated border border-xpress-border"
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                  <Badge 
                    variant={isActive ? 'default' : 'idle'} 
                    className="ml-1"
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {activeFilters.length > 0 && (
                <span className="ml-1.5 bg-xpress-accent-blue text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFilters.length}
                </span>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-xpress-bg-tertiary rounded-lg border border-xpress-border p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'grid' 
                    ? "bg-xpress-accent-blue text-white" 
                    : "text-xpress-text-secondary hover:text-xpress-text-primary"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' 
                    ? "bg-xpress-accent-blue text-white" 
                    : "text-xpress-text-secondary hover:text-xpress-text-primary"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export button */}
            {canExport && (
              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => setShowExportModal(true)}
              >
                Export
              </Button>
            )}
          </div>

          {/* Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="text-sm text-xpress-text-muted">Active filters:</span>
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-xpress-bg-elevated rounded-md text-xs text-xpress-text-secondary"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="hover:text-xpress-accent-red"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs text-xpress-accent-blue hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">Status Filter</h3>
                <button
                  onClick={() => setSelectedStatuses(['New', 'Reviewing', 'Investigating'])}
                  className="text-xs text-blue-400 hover:underline"
                >
                  Reset to Open
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = selectedStatuses.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => toggleStatus(option.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                        isSelected
                          ? option.color === 'red'
                            ? "bg-xpress-accent-red/20 text-xpress-accent-red border-xpress-accent-red/50"
                            : option.color === 'amber'
                              ? "bg-xpress-accent-amber/20 text-xpress-accent-amber border-xpress-accent-amber/50"
                              : option.color === 'green'
                                ? "bg-xpress-accent-green/20 text-xpress-accent-green border-xpress-accent-green/50"
                                : option.color === 'blue'
                                  ? "bg-xpress-accent-blue/20 text-xpress-accent-blue border-xpress-accent-blue/50"
                                  : "bg-xpress-bg-elevated text-xpress-text-primary border-xpress-border"
                          : "bg-xpress-bg-secondary text-xpress-text-muted border-xpress-border hover:border-xpress-text-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Incidents List */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-4">
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-xpress-text-secondary">
                Showing <span className="font-medium text-xpress-text-primary">{incidents.length}</span> incidents
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-xpress-text-secondary">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {incidents.length === 0 ? (
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-xpress-bg-elevated flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-xpress-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No Incidents Found
                </h3>
                <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
                  {activeFilters.length > 0 
                    ? "Try adjusting your filters to see more results."
                    : "There are no incidents matching your criteria. New incidents will appear here when reported."
                  }
                </p>
                {activeFilters.length > 0 && (
                  <Button variant="secondary" onClick={clearFilters}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              /* Grid View */
              <div className={cn(
                "grid gap-4",
                viewMode === 'grid' 
                  ? "grid-cols-1 lg:grid-cols-2" 
                  : "grid-cols-1"
              )}>
                {incidents.map((incident) => (
                  <IncidentCard
                    key={incident.incidentId}
                    incident={incident}
                    selected={selectedIds.includes(incident.incidentId)}
                    onSelect={() => {
                      setSelectedIds(prev => 
                        prev.includes(incident.incidentId)
                          ? prev.filter(id => id !== incident.incidentId)
                          : [...prev, incident.incidentId]
                      );
                    }}
                    onClick={() => navigate(`/incidents/${incident.incidentId}`)}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: 40% - Heatmap and Recent Activity */}
        <div className="w-2/5 flex flex-col min-h-0 overflow-hidden gap-4">
          {/* Heatmap */}
          <div className="flex-1 overflow-y-auto pr-1 min-h-0">
            <IncidentHeatmap incidents={incidents} />
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 shrink-0 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-xpress-accent-blue" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {recentActivity.length > 0 ? (
                recentActivity.map((incident) => (
                  <ActivityItem 
                    key={incident.incidentId} 
                    incident={incident} 
                    timeAgo={formatTimeAgo(incident.timeline.reportedAt)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Incident Modal */}
      <CreateIncidentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Incidents"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-xpress-text-secondary">
            Export <span className="font-medium text-xpress-text-primary">{incidents.length}</span> incidents as a CSV file.
          </p>
          <div className="p-3 bg-xpress-bg-secondary rounded-lg border border-xpress-border">
            <div className="text-xs text-xpress-text-muted mb-2">Export includes:</div>
            <ul className="text-sm text-xpress-text-secondary space-y-1">
              <li>• Incident ID, Type, Severity, Status</li>
              <li>• Reporter information</li>
              <li>• Timeline and dates</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
