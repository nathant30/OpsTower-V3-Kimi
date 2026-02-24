// Error Dashboard - Centralized error tracking and monitoring
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import {
  AlertTriangle,
  Bug,
  CheckCircle,
  RefreshCw,
  Trash2,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Error types
interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  source: string;
  userId?: string;
  userAgent?: string;
  timestamp: string;
  acknowledged: boolean;
  count: number;
  context?: Record<string, unknown>;
}

interface ErrorStats {
  total: number;
  fatal: number;
  error: number;
  warning: number;
  info: number;
  unresolved: number;
  trend: number;
}

// Mock data
const mockErrorStats: ErrorStats = {
  total: 1247,
  fatal: 3,
  error: 45,
  warning: 189,
  info: 1010,
  unresolved: 48,
  trend: -12.5,
};

const mockErrors: ErrorLog[] = [
  {
    id: '1',
    message: 'Failed to fetch driver location',
    stack: 'Error: Network request failed\n    at apiClient.fetch (/src/lib/api/client.ts:45)\n    at async getDriverLocation (/src/services/driver.service.ts:23)',
    severity: 'error',
    source: 'driver.service',
    userId: 'user_123',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    acknowledged: false,
    count: 23,
    context: { driverId: 'drv_456', endpoint: '/api/drivers/location' },
  },
  {
    id: '2',
    message: 'Payment gateway timeout',
    stack: 'TimeoutError: Request timeout after 30000ms\n    at PaymentService.process (/src/services/payments/payments.service.ts:78)',
    severity: 'fatal',
    source: 'payments.service',
    userId: 'user_789',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    acknowledged: false,
    count: 5,
    context: { paymentId: 'pay_abc', amount: 1500 },
  },
  {
    id: '3',
    message: 'Deprecated API usage detected',
    severity: 'warning',
    source: 'analytics.service',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    acknowledged: true,
    count: 156,
  },
  {
    id: '4',
    message: 'SignalR reconnection successful',
    severity: 'info',
    source: 'signalrClient',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    acknowledged: true,
    count: 42,
  },
];

const ErrorDashboard = () => {
  const queryClient = useQueryClient();
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['errors', 'stats', timeRange],
    queryFn: async (): Promise<ErrorStats> => {
      // In production, fetch from error tracking API
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockErrorStats;
    },
  });

  const { data: errors, isLoading: errorsLoading } = useQuery({
    queryKey: ['errors', 'list', filterSeverity, showAcknowledged, timeRange],
    queryFn: async (): Promise<ErrorLog[]> => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      let filtered = [...mockErrors];
      if (filterSeverity !== 'all') {
        filtered = filtered.filter((e) => e.severity === filterSeverity);
      }
      if (!showAcknowledged) {
        filtered = filtered.filter((e) => !e.acknowledged);
      }
      return filtered;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (errorId: string) => {
      // In production, call API to acknowledge error
      await new Promise((resolve) => setTimeout(resolve, 200));
      return errorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      setSelectedError(null);
    },
  });

  const clearMutation = useMutation({
    mutationFn: async (errorId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return errorId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errors'] });
      setSelectedError(null);
    },
  });

  const getSeverityBadgeVariant = (severity: string): 'alert' | 'warning' | 'info' | 'offline' => {
    switch (severity) {
      case 'fatal':
        return 'alert';
      case 'error':
        return 'warning';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'offline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'fatal':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <Bug className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Bug className="w-5 h-5 text-gray-500" />;
    }
  };

  if (statsLoading || errorsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f14]">
        <div className="text-gray-400">Loading error tracking data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Tracking</h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage application errors and exceptions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <div className="flex items-center gap-1 bg-[#12121a] border border-gray-800 rounded-lg p-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {range === '1h' ? '1 Hour' : range === '24h' ? '24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          <XpressButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['errors'] })}
          >
            Refresh
          </XpressButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <XpressKpiCard
          title="Total Errors"
          value={stats?.total.toLocaleString() || '0'}
          subtext="vs last period"
          trend={stats?.trend && stats.trend < 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats?.trend || 0)}%`}
          color="blue"
          icon={<Bug className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Fatal"
          value={stats?.fatal.toString() || '0'}
          subtext="Requires immediate attention"
          trend="neutral"
          color="red"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Errors"
          value={stats?.error.toString() || '0'}
          subtext="Standard errors"
          trend="neutral"
          color="amber"
          icon={<Bug className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Warnings"
          value={stats?.warning.toString() || '0'}
          subtext="Non-critical issues"
          trend="neutral"
          color="amber"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Unresolved"
          value={stats?.unresolved.toString() || '0'}
          subtext="Pending acknowledgment"
          trend="neutral"
          color="purple"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">Filter:</span>
        </div>
        
        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-1.5 bg-[#12121a] border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="fatal">Fatal</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        {/* Show Acknowledged Toggle */}
        <label className="flex items-center gap-2 px-3 py-1.5 bg-[#12121a] border border-gray-800 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={showAcknowledged}
            onChange={(e) => setShowAcknowledged(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600"
          />
          <span className="text-sm text-gray-300">Show Acknowledged</span>
        </label>
      </div>

      {/* Error List */}
      <XpressCard title="Error Log" icon={<Bug className="w-5 h-5" />}>
        <div className="space-y-3">
          {errors?.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <div className="text-gray-300 font-medium">No errors found</div>
              <div className="text-gray-500 text-sm mt-1">
                {showAcknowledged 
                  ? 'All errors have been resolved!' 
                  : 'No unacknowledged errors. Toggle "Show Acknowledged" to see history.'}
              </div>
            </div>
          ) : (
            errors?.map((error) => (
              <div
                key={error.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedError?.id === error.id
                    ? 'bg-blue-500/10 border-blue-500/50'
                    : 'bg-[#12121a] border-gray-800 hover:border-gray-700'
                } ${error.acknowledged ? 'opacity-60' : ''}`}
                onClick={() => setSelectedError(selectedError?.id === error.id ? null : error)}
              >
                <div className="flex items-start gap-4">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white truncate">
                        {error.message}
                      </span>
                      <XpressBadge
                        variant={getSeverityBadgeVariant(error.severity)}
                      >
                        {error.severity.toUpperCase()}
                      </XpressBadge>
                      {error.acknowledged && (
                        <XpressBadge variant="active">Acknowledged</XpressBadge>
                      )}
                      {error.count > 1 && (
                        <XpressBadge variant="info">{error.count} occurrences</XpressBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(error.timestamp).toLocaleString()}
                      </span>
                      <span>Source: {error.source}</span>
                      {error.userId && <span>User: {error.userId}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!error.acknowledged && (
                      <XpressButton
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          acknowledgeMutation.mutate(error.id);
                        }}
                        loading={acknowledgeMutation.isPending}
                      >
                        Acknowledge
                      </XpressButton>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMutation.mutate(error.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {selectedError?.id === error.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedError?.id === error.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    {error.stack && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-300 mb-2">Stack Trace:</div>
                        <pre className="bg-[#0f0f14] p-3 rounded-lg text-xs text-gray-400 overflow-x-auto font-mono">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {error.context && Object.keys(error.context).length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-300 mb-2">Context:</div>
                        <pre className="bg-[#0f0f14] p-3 rounded-lg text-xs text-gray-400 overflow-x-auto font-mono">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </div>
                    )}
                    {error.userAgent && (
                      <div className="text-xs text-gray-500">
                        User Agent: {error.userAgent}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </XpressCard>

      {/* Error Tracking Configuration */}
      <XpressCard title="Error Tracking Configuration" icon={<ExternalLink className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#12121a] rounded-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-300 mb-2">Current Provider</div>
            <div className="text-white font-semibold">Console + Local Storage</div>
            <div className="text-xs text-gray-500 mt-1">
              Errors are logged to console and stored locally
            </div>
          </div>
          <div className="p-4 bg-[#12121a] rounded-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-300 mb-2">Sample Rate</div>
            <div className="text-white font-semibold">100%</div>
            <div className="text-xs text-gray-500 mt-1">
              All errors are being captured
            </div>
          </div>
          <div className="p-4 bg-[#12121a] rounded-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-300 mb-2">Environment</div>
            <div className="text-white font-semibold capitalize">
              {import.meta.env.MODE || 'development'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Error tracking is {import.meta.env.PROD ? 'enabled' : 'disabled'} in this environment
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-400">
            <strong>Note:</strong> To enable advanced error tracking with Sentry or similar services,
            configure your DSN in the environment variables. See{' '}
            <code className="bg-blue-500/20 px-1 rounded">src/lib/monitoring/errorTracking.ts</code>
          </div>
        </div>
      </XpressCard>
    </div>
  );
};

export default ErrorDashboard;
