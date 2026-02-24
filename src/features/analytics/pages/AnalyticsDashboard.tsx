// Analytics Dashboard - KPIs, charts, and real-time monitoring
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { RevenueChart } from '../charts/RevenueChart';
import { UserActivityChart } from '../charts/UserActivityChart';
import { OrderDistributionChart } from '../charts/OrderDistributionChart';

import {
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  RefreshCw,
  Calendar,

  Activity,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type DateRange = '7' | '30' | '90' | 'custom';

// Mock data for analytics
const mockAnalyticsData = {
  kpis: {
    totalRevenue: 2847500,
    revenueChange: 12.5,
    activeUsers: 3247,
    usersChange: 8.3,
    ordersToday: 847,
    ordersChange: -2.1,
    completionRate: 94.5,
    completionChange: 3.2,
  },
  revenueChart: Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    revenue: 80000 + Math.random() * 40000,
  })),
  userActivity: Array.from({ length: 7 }, (_, i) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      day: days[i],
      active: 1500 + Math.floor(Math.random() * 1000),
      new: 200 + Math.floor(Math.random() * 300),
    };
  }),
  orderDistribution: [
    { status: 'Completed', count: 650, color: '#22c55e' },
    { status: 'Pending', count: 125, color: '#f59e0b' },
    { status: 'Cancelled', count: 45, color: '#ef4444' },
    { status: 'Processing', count: 27, color: '#3b82f6' },
  ],
  topRoutes: [
    { id: '1', origin: 'Makati CBD', destination: 'BGC', rides: 1245, revenue: 45000 },
    { id: '2', origin: 'Quezon City', destination: 'Ortigas', rides: 982, revenue: 38000 },
    { id: '3', origin: 'Manila', destination: 'Makati CBD', rides: 876, revenue: 32000 },
    { id: '4', origin: 'BGC', destination: 'Airport', rides: 654, revenue: 52000 },
    { id: '5', origin: 'Pasig', destination: 'Mandaluyong', rides: 543, revenue: 21000 },
  ],
};

const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics-dashboard', dateRange],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAnalyticsData;
    },
    refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
  });

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f14]">
        <div className="text-gray-400">Loading analytics dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0f0f14]">
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
          Error loading analytics data. Please try again.
        </div>
      </div>
    );
  }

  const analyticsData = data || mockAnalyticsData;

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Real-time analytics and performance monitoring
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 bg-[#12121a] border border-gray-800 rounded-lg p-1">
            {(['7', '30', '90'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleDateRangeChange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Last {range} days
              </button>
            ))}
            <button
              onClick={() => handleDateRangeChange('custom')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                dateRange === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Custom
            </button>
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-[#12121a] border-gray-800 text-gray-400 hover:text-white'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            {autoRefresh ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            <span className="text-sm">Auto</span>
          </button>

          <XpressButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={handleRefresh}
          >
            Refresh
          </XpressButton>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {dateRange === 'custom' && (
        <XpressCard className="max-w-md">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </XpressCard>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <XpressKpiCard
          title="Total Revenue"
          value={`₱${analyticsData.kpis.totalRevenue.toLocaleString()}`}
          subtext="vs last period"
          trend="up"
          trendValue={`${analyticsData.kpis.revenueChange}%`}
          color="green"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Active Users"
          value={analyticsData.kpis.activeUsers.toLocaleString()}
          subtext="vs last period"
          trend="up"
          trendValue={`${analyticsData.kpis.usersChange}%`}
          color="blue"
          icon={<Users className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Orders Today"
          value={analyticsData.kpis.ordersToday.toLocaleString()}
          subtext="vs yesterday"
          trend={analyticsData.kpis.ordersChange >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(analyticsData.kpis.ordersChange)}%`}
          color="purple"
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <XpressKpiCard
          title="Completion Rate"
          value={`${analyticsData.kpis.completionRate}%`}
          subtext="vs last period"
          trend="up"
          trendValue={`${analyticsData.kpis.completionChange}%`}
          color="cyan"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={analyticsData.revenueChart} />
        </div>
        <OrderDistributionChart data={analyticsData.orderDistribution} />
      </div>

      {/* Charts Row 2 */}
      <UserActivityChart data={analyticsData.userActivity} />

      {/* Top Routes Table */}
      <XpressCard title="Top Routes" icon={<Activity className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Origin
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">
                  Destination
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Rides
                </th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium text-sm">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="border-b border-gray-800/50 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white">{route.origin}</td>
                  <td className="py-3 px-4 text-white">{route.destination}</td>
                  <td className="py-3 px-4 text-white text-right">
                    {route.rides.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-400">
                    ₱{route.revenue.toLocaleString()}
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

export default AnalyticsDashboard;
