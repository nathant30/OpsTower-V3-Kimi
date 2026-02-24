/**
 * Mobile Dashboard Page
 * Mobile app admin panel for managing app versions, feature flags, push notifications, and analytics
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  useMobileDashboard,
  useMobileStats,
  useToggleFeatureFlag,
  useSendNotification,
  useCancelNotification,
} from '../hooks/useMobile';
import { AppVersionCard } from '../components/AppVersionCard';
import { FeatureFlagManager } from '../components/FeatureFlagManager';
import { PushNotificationPanel } from '../components/PushNotificationPanel';
import {
  Smartphone,
  Download,
  Users,
  AlertTriangle,
  Star,
  Bell,
  Flag,
  Code,
  TrendingUp,
  TrendingDown,
  Minus,
  Apple,
  Activity,
  Clock,
  BarChart3,
  Globe,
  RefreshCw,
  ChevronRight,
  XCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import type { CrashReport, AppStoreMetrics } from '@/services/mobile/types';

const MobileDashboard = () => {
  const [selectedCrash, setSelectedCrash] = useState<CrashReport | null>(null);
  const [showStoreMetrics, setShowStoreMetrics] = useState(false);

  const { data: dashboard, isLoading: isLoadingDashboard } = useMobileDashboard();
  const { data: stats, isLoading: isLoadingStats } = useMobileStats();
  const toggleFeatureFlag = useToggleFeatureFlag();
  const sendNotification = useSendNotification();
  const cancelNotification = useCancelNotification();

  const isLoading = isLoadingDashboard || isLoadingStats;

  const getSeverityIcon = (severity: CrashReport['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
  };

  const getSeverityColor = (severity: CrashReport['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
    }
  };

  const getStatusBadge = (status: CrashReport['status']) => {
    const variants = {
      open: 'default' as const,
      investigating: 'warning' as const,
      resolved: 'success' as const,
      closed: 'default' as const,
    };
    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'ios' ? (
      <Apple className="w-5 h-5 text-white" />
    ) : (
      <Smartphone className="w-5 h-5 text-green-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="h-full p-6 bg-[#0f0f14]">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#0f0f14]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Mobile App Management</h1>
            <p className="text-gray-500 mt-1">
              Manage app versions, feature flags, and monitor app performance
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowStoreMetrics(true)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Store Metrics
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <XpressKpiCard
            title="Total Installs"
            value={stats?.totalInstalls.toLocaleString() || '0'}
            subtext="Across all platforms"
            icon={<Download className="w-5 h-5" />}
            color="blue"
          />
          <XpressKpiCard
            title="Daily Active Users"
            value={stats?.activeToday.toLocaleString() || '0'}
            subtext="Today"
            trend="up"
            trendValue="5.2%"
            icon={<Users className="w-5 h-5" />}
            color="green"
          />
          <XpressKpiCard
            title="Crash Free Rate"
            value={`${stats?.crashFreeRate.toFixed(1) || 0}%`}
            subtext="Last 24 hours"
            trend="up"
            trendValue="0.3%"
            icon={<Activity className="w-5 h-5" />}
            color="purple"
          />
          <XpressKpiCard
            title="Average Rating"
            value={stats?.avgRating.toFixed(1) || '0.0'}
            subtext="App Store & Play Store"
            trend="neutral"
            trendValue="0.0"
            icon={<Star className="w-5 h-5" />}
            color="amber"
          />
        </div>

        {/* Device Breakdown */}
        <XpressCard title="Device Breakdown" icon={<Smartphone className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard?.deviceBreakdown.map((device) => (
              <div
                key={device.platform}
                className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg border border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      device.platform === 'ios' ? 'bg-gray-800' : 'bg-green-500/10'
                    }`}
                  >
                    {getPlatformIcon(device.platform)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-white capitalize">
                        {device.platform}
                      </span>
                      {getTrendIcon(device.trend)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {device.count.toLocaleString()} devices ({device.percentage}%)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      device.changePercentage > 0
                        ? 'text-green-400'
                        : device.changePercentage < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {device.changePercentage > 0 ? '+' : ''}
                    {device.changePercentage}% this week
                  </div>
                </div>
              </div>
            ))}
          </div>
        </XpressCard>

        {/* App Versions & Active Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AppVersionCard versions={dashboard?.versions || []} />
          
          <XpressCard
            title="Active Users"
            subtitle="User engagement metrics"
            icon={<Users className="w-5 h-5" />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-white">
                    {(dashboard?.activeUsers.dailyActive || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Daily Active</div>
                </div>
                <div className="text-center p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-white">
                    {(dashboard?.activeUsers.weeklyActive || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Weekly Active</div>
                </div>
                <div className="text-center p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-white">
                    {(dashboard?.activeUsers.monthlyActive || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Monthly Active</div>
                </div>
              </div>
              <div className="p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Retention Rates</span>
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {dashboard?.activeUsers.retentionDay1 || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Day 1</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {dashboard?.activeUsers.retentionDay7 || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Day 7</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {dashboard?.activeUsers.retentionDay30 || 0}%
                    </div>
                    <div className="text-xs text-gray-500">Day 30</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
                <span className="text-sm text-gray-400">Avg. Session Duration</span>
                <span className="font-semibold text-white">
                  {dashboard?.activeUsers.avgSessionDuration || 0} min
                </span>
              </div>
            </div>
          </XpressCard>
        </div>

        {/* Feature Flags & Push Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeatureFlagManager
            flags={dashboard?.featureFlags || []}
            onToggle={(id) => toggleFeatureFlag.mutate(id)}
            onDelete={(id) => {/* Delete flag: */ id}}
            onCreate={(flag) => {/* Create flag: */ void flag}}
          />
          <PushNotificationPanel
            notifications={dashboard?.recentNotifications || []}
            onSend={(id) => sendNotification.mutate(id)}
            onCancel={(id) => cancelNotification.mutate(id)}
            onCreate={(notification) => {/* Create notification: */ void notification}}
          />
        </div>

        {/* Crash Reports */}
        <XpressCard
          title="Recent Crash Reports"
          subtitle={`${stats?.totalCrashes24h || 0} crashes in last 24h`}
          icon={<AlertTriangle className="w-5 h-5" />}
          headerAction={
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-2">
            {dashboard?.recentCrashes.map((crash) => (
              <div
                key={crash.id}
                className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCrash(crash)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${getSeverityColor(crash.severity)}`}>
                    {getSeverityIcon(crash.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{crash.title}</span>
                      {getPlatformIcon(crash.platform)}
                      <span className="text-xs text-gray-500">v{crash.version}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{crash.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-white">{crash.affectedUsers.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">affected users</div>
                  </div>
                  {getStatusBadge(crash.status)}
                </div>
              </div>
            ))}

            {(!dashboard?.recentCrashes || dashboard.recentCrashes.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p>No recent crashes - Great job!</p>
              </div>
            )}
          </div>
        </XpressCard>

        {/* Remote Configuration */}
        <XpressCard
          title="Remote Configuration"
          subtitle={`${dashboard?.remoteConfigs.length || 0} active configurations`}
          icon={<Code className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard?.remoteConfigs.map((config) => (
              <div
                key={config.id}
                className="p-4 bg-[#0f0f14] rounded-lg border border-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <code className="text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                    {config.key}
                  </code>
                  <Badge variant={config.environment === 'production' ? 'success' : 'warning'}>
                    {config.environment}
                  </Badge>
                </div>
                <div className="text-white font-medium mb-1">
                  {typeof config.value === 'boolean'
                    ? config.value
                      ? 'true'
                      : 'false'
                    : config.value}
                </div>
                <p className="text-xs text-gray-500 mb-2">{config.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {getPlatformIcon(config.platform === 'all' ? 'android' : config.platform)}
                  <span className="capitalize">{config.platform}</span>
                  <span>•</span>
                  <span>{new Date(config.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </XpressCard>
      </div>

      {/* Crash Detail Modal */}
      <Modal
        isOpen={!!selectedCrash}
        onClose={() => setSelectedCrash(null)}
        title="Crash Report Details"
        footer={
          <Button variant="outline" onClick={() => setSelectedCrash(null)}>
            Close
          </Button>
        }
      >
        {selectedCrash && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${getSeverityColor(selectedCrash.severity)}`}>
                {getSeverityIcon(selectedCrash.severity)}
              </div>
              <div>
                <h3 className="font-semibold text-white">{selectedCrash.title}</h3>
                <p className="text-sm text-gray-500">
                  {selectedCrash.platform} • v{selectedCrash.version}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p className="text-white mt-1">{selectedCrash.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Affected Users</label>
                <p className="text-white font-medium">{selectedCrash.affectedUsers.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Occurrences</label>
                <p className="text-white font-medium">{selectedCrash.occurrences.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">First Seen</label>
                <p className="text-white">
                  {new Date(selectedCrash.firstSeen).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Last Seen</label>
                <p className="text-white">
                  {new Date(selectedCrash.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">{getStatusBadge(selectedCrash.status)}</div>
            </div>

            {selectedCrash.stackTrace && (
              <div>
                <label className="text-sm text-gray-500">Stack Trace</label>
                <pre className="mt-1 p-3 bg-gray-950 rounded-lg text-xs text-gray-400 overflow-x-auto">
                  {selectedCrash.stackTrace}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Store Metrics Modal */}
      <Modal
        isOpen={showStoreMetrics}
        onClose={() => setShowStoreMetrics(false)}
        title="App Store Metrics"
        size="lg"
        footer={
          <Button variant="outline" onClick={() => setShowStoreMetrics(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-6">
          {dashboard?.storeMetrics.map((metric) => (
            <StoreMetricCard key={metric.platform} metric={metric} />
          ))}
        </div>
      </Modal>
    </div>
  );
};

interface StoreMetricCardProps {
  metric: AppStoreMetrics;
}

function StoreMetricCard({ metric }: StoreMetricCardProps) {
  const ratingDistribution = [
    { stars: 5, count: metric.fiveStarCount },
    { stars: 4, count: metric.fourStarCount },
    { stars: 3, count: metric.threeStarCount },
    { stars: 2, count: metric.twoStarCount },
    { stars: 1, count: metric.oneStarCount },
  ];

  const maxCount = Math.max(...ratingDistribution.map((r) => r.count));

  return (
    <div className="p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
      <div className="flex items-center gap-3 mb-4">
        {metric.platform === 'ios' ? (
          <Apple className="w-6 h-6 text-white" />
        ) : (
          <Smartphone className="w-6 h-6 text-green-400" />
        )}
        <h3 className="font-semibold text-white capitalize">{metric.platform} Store</h3>
        {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
        {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-white">{metric.totalDownloads.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Downloads</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{metric.averageRating.toFixed(1)}</div>
          <div className="text-xs text-gray-500">Average Rating</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{metric.totalRatings.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Ratings</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{metric.reviewsCount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Reviews</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white mb-2">Rating Distribution</h4>
        <div className="space-y-1">
          {ratingDistribution.map((rating) => (
            <div key={rating.stars} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">{rating.stars}★</span>
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(rating.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right">
                {rating.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MobileDashboard;
