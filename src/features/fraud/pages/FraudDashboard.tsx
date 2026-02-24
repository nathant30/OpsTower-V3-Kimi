// Fraud Detection Dashboard
// Displays fraud alerts, risk distribution, and ML performance metrics

import { useEffect, useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  DollarSign,
  Target
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types
interface FraudAlert {
  id: string;
  type: string;
  riskLevel: 'high' | 'medium' | 'low';
  status: 'pending' | 'investigating' | 'confirmed' | 'false_positive';
  target: {
    name: string;
    role: string;
  };
  confidence: number;
  indicators: string[];
  actions: string[];
  detectedAt: string;
}

interface FraudDashboardData {
  flaggedAccounts: number;
  blockedTransactions: number;
  falsePositiveRate: number;
  savings: number;
  riskDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  topFraudTypes: {
    type: string;
    count: number;
  }[];
  recentAlerts: FraudAlert[];
}

// Mock data for development
const mockFraudData: FraudDashboardData = {
  flaggedAccounts: 24,
  blockedTransactions: 156,
  falsePositiveRate: 2.3,
  savings: 450000,
  riskDistribution: {
    high: 8,
    medium: 16,
    low: 45,
  },
  topFraudTypes: [
    { type: 'Identity Theft', count: 45 },
    { type: 'Payment Fraud', count: 38 },
    { type: 'Location Spoofing', count: 32 },
    { type: 'Trip Manipulation', count: 28 },
    { type: 'Account Takeover', count: 21 },
  ],
  recentAlerts: [
    {
      id: '1',
      type: 'suspicious_location',
      riskLevel: 'high',
      status: 'investigating',
      target: { name: 'J. Santos', role: 'Driver' },
      confidence: 94,
      indicators: ['GPS spoofing detected', 'Multiple locations in short time', 'Unusual route pattern'],
      actions: ['Flagged for review', 'Temporarily suspended'],
      detectedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'payment_fraud',
      riskLevel: 'high',
      status: 'confirmed',
      target: { name: 'M. Cruz', role: 'Customer' },
      confidence: 98,
      indicators: ['Multiple failed payments', 'Stolen card used', 'Chargeback history'],
      actions: ['Account blocked', 'Transactions reversed'],
      detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'trip_manipulation',
      riskLevel: 'medium',
      status: 'pending',
      target: { name: 'A. Reyes', role: 'Driver' },
      confidence: 76,
      indicators: ['Trip duration anomaly', 'Route deviation', 'Customer complaint'],
      actions: ['Under investigation'],
      detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'account_takeover',
      riskLevel: 'medium',
      status: 'false_positive',
      target: { name: 'L. Garcia', role: 'Driver' },
      confidence: 82,
      indicators: ['New device login', 'Password changed', 'Location changed'],
      actions: ['Verified legitimate', 'Cleared'],
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

const FraudDashboard = () => {
  const [dashboardData, setDashboardData] = useState<FraudDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      // Simulate API call - replace with actual API when ready
      // const response = await getFraudDashboard();
      // setDashboardData(response.data);
      
      // Use mock data for now
      setTimeout(() => {
        setDashboardData(mockFraudData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load fraud dashboard', error);
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string): 'alert' | 'warning' | 'active' | 'default' => {
    switch (risk) {
      case 'high':
        return 'alert';
      case 'medium':
        return 'warning';
      case 'low':
        return 'active';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string): 'warning' | 'alert' | 'active' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'investigating':
        return 'alert';
      case 'confirmed':
        return 'alert';
      case 'false_positive':
        return 'active';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading fraud dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const riskChartData = [
    { name: 'High Risk', value: dashboardData.riskDistribution.high, color: '#ef4444' },
    { name: 'Medium Risk', value: dashboardData.riskDistribution.medium, color: '#eab308' },
    { name: 'Low Risk', value: dashboardData.riskDistribution.low, color: '#22c55e' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Protection</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time fraud detection and risk monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {autoRefresh && (
            <Badge variant="active">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-gray-300"
          >
            {autoRefresh ? 'Pause' : 'Resume'} Auto-refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Flagged Accounts</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {dashboardData.flaggedAccounts}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blocked Transactions</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">
                  {dashboardData.blockedTransactions}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">False Positive Rate</p>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {dashboardData.falsePositiveRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Savings</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  {formatCurrency(dashboardData.savings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Level Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Fraud Types */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Fraud Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.topFraudTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="type"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Fraud Alerts */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Fraud Alerts</h3>
          <div className="space-y-4">
            {dashboardData.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Badge variant={getRiskColor(alert.riskLevel) as any}>
                        {alert.riskLevel.toUpperCase()} RISK
                      </Badge>
                      <Badge variant={getStatusColor(alert.status) as any}>
                        {alert.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm font-semibold text-white uppercase">
                        {alert.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-white font-medium">
                        {alert.target.name} ({alert.target.role})
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-400">
                          Confidence: {alert.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">INDICATORS:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.indicators.map((indicator, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                            >
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">ACTIONS:</p>
                        <div className="flex flex-wrap gap-2">
                          {alert.actions.map((action, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded"
                            >
                              {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      {new Date(alert.detectedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FraudDashboard;
