// Monitoring Page - System health and real-time metrics
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressBadge } from '@/components/ui/XpressBadge';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { XpressButton } from '@/components/ui/XpressButton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Database,
  Radio,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Server,
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
}

interface SystemError {
  id: string;
  timestamp: string;
  severity: 'error' | 'warning';
  message: string;
  stack: string;
}

interface SystemHealth {
  metrics: {
    activeConnections: number;
    requestsPerMin: number;
    errorRate: number;
    avgLatency: number;
  };
  services: ServiceStatus[];
  errors: SystemError[];
}

// Mock system health data
const mockSystemHealth: SystemHealth = {
  metrics: {
    activeConnections: 2847,
    requestsPerMin: 12543,
    errorRate: 0.42,
    avgLatency: 156,
  },
  services: [
    { name: 'REST API', status: 'healthy', uptime: 99.98, responseTime: 145 },
    { name: 'Database', status: 'healthy', uptime: 99.95, responseTime: 23 },
    { name: 'SignalR Hub', status: 'healthy', uptime: 99.92, responseTime: 89 },
    { name: 'Payment Gateway', status: 'healthy', uptime: 99.99, responseTime: 234 },
    { name: 'Auth Service', status: 'healthy', uptime: 99.97, responseTime: 67 },
    { name: 'Notification Service', status: 'degraded', uptime: 98.45, responseTime: 456 },
  ],
  errors: [
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      severity: 'error',
      message: 'Database connection timeout',
      stack: 'at Database.connect (/src/db/connection.ts:45)',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      severity: 'warning',
      message: 'High memory usage detected',
      stack: 'at Monitor.checkMemory (/src/monitor.ts:23)',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 32 * 60000).toISOString(),
      severity: 'warning',
      message: 'API rate limit approaching',
      stack: 'at RateLimiter.check (/src/rate-limiter.ts:78)',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 58 * 60000).toISOString(),
      severity: 'error',
      message: 'Failed to send push notification',
      stack: 'at NotificationService.send (/src/notifications.ts:112)',
    },
  ],
};

const Monitoring = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockSystemHealth;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f14]">
        <div className="text-gray-400">Loading system health...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0f0f14]">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          Error loading system health data. Using fallback data.
        </div>
      </div>
    );
  }

  const systemData = data || mockSystemHealth;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
      case 'down':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <XpressBadge variant="active">Healthy</XpressBadge>;
      case 'degraded':
        return <XpressBadge variant="warning">Degraded</XpressBadge>;
      case 'down':
        return <XpressBadge variant="alert">Down</XpressBadge>;
      default:
        return <XpressBadge variant="info">Unknown</XpressBadge>;
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('API')) return Activity;
    if (name.includes('Database')) return Database;
    if (name.includes('SignalR')) return Radio;
    if (name.includes('Payment')) return CreditCard;
    if (name.includes('Auth')) return Server;
    return Activity;
  };

  // Generate mock response time data for the chart
  const responseTimeData = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    time: `${59 - i}m`,
    latency: 150 + (i % 5) * 20 + (i % 3) * 10,
  })).reverse(), []);

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
          <p className="text-gray-400 mt-1">
            Real-time system health and performance metrics
          </p>
        </div>
        <XpressButton
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Refresh Data
        </XpressButton>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <XpressKpiCard
          title="Active Connections"
          value={systemData.metrics.activeConnections.toLocaleString()}
          subtext="Current users"
          color="blue"
          icon={<Users className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Requests/Min"
          value={systemData.metrics.requestsPerMin.toLocaleString()}
          subtext="Throughput"
          color="green"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Error Rate"
          value={`${systemData.metrics.errorRate.toFixed(2)}%`}
          subtext="Last hour"
          color="amber"
          icon={<AlertCircle className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Avg Latency"
          value={`${systemData.metrics.avgLatency}ms`}
          subtext="Response time"
          color="cyan"
          icon={<Zap className="w-5 h-5" />}
        />
      </div>

      {/* API Response Times Chart */}
      <XpressCard title="API Response Times (Last Hour)" icon={<Activity className="w-5 h-5" />}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="time" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121a',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${Math.round(Number(value))}ms`, 'Latency']}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              fill="url(#colorLatency)"
            />
          </LineChart>
        </ResponsiveContainer>
      </XpressCard>

      {/* Service Status Cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(systemData.services || []).map((service) => {
            const Icon = getServiceIcon(service.name);
            return (
              <XpressCard key={service.name} hoverable>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0f0f14] border border-gray-800">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{service.name}</div>
                      <div className="text-sm text-gray-400">
                        Uptime: {service.uptime.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(service.status)}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <div className="text-xs text-gray-400">Response Time</div>
                    <div className="text-lg font-semibold text-white">
                      {service.responseTime}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Status</div>
                    <div className="text-lg font-semibold text-white capitalize">
                      {service.status}
                    </div>
                  </div>
                </div>
              </XpressCard>
            );
          })}
        </div>
      </div>

      {/* Error Log Table */}
      <XpressCard title="Recent Errors (Last 50)" icon={<AlertCircle className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Severity
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Message
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Stack Trace
                </th>
              </tr>
            </thead>
            <tbody>
              {(systemData.errors || []).slice(0, 50).map((error) => (
                <tr
                  key={error.id}
                  className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(error.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <XpressBadge
                      variant={error.severity === 'error' ? 'alert' : 'warning'}
                    >
                      {error.severity.toUpperCase()}
                    </XpressBadge>
                  </td>
                  <td className="py-3 px-4 text-white">{error.message}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm font-mono truncate max-w-xs">
                    {error.stack}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </XpressCard>
    </div>
  );
};

export default Monitoring;
