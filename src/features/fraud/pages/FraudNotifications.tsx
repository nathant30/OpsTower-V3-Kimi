// Fraud Notifications Page
// Real-time fraud alert management with filters and quick actions

import { useEffect, useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import {
  AlertTriangle,
  Filter,
  Search,
  Eye,
  Ban,
  XCircle,
  CheckCircle,
  Target
} from 'lucide-react';

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
  detectedAt: string;
}

// Mock data for development
const mockAlerts: FraudAlert[] = [
  {
    id: 'FRA-001',
    type: 'fake_gps',
    riskLevel: 'high',
    status: 'investigating',
    target: { name: 'J. Santos', role: 'Driver' },
    confidence: 94,
    indicators: ['GPS spoofing detected', 'Multiple locations in short time', 'Unusual route pattern'],
    detectedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-002',
    type: 'payment_fraud',
    riskLevel: 'high',
    status: 'confirmed',
    target: { name: 'M. Cruz', role: 'Customer' },
    confidence: 98,
    indicators: ['Multiple failed payments', 'Stolen card used', 'Chargeback history'],
    detectedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-003',
    type: 'multiple_accounts',
    riskLevel: 'medium',
    status: 'pending',
    target: { name: 'A. Reyes', role: 'Driver' },
    confidence: 76,
    indicators: ['Same device used', 'Similar personal info', 'Linked phone numbers'],
    detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-004',
    type: 'identity_theft',
    riskLevel: 'high',
    status: 'investigating',
    target: { name: 'L. Garcia', role: 'Customer' },
    confidence: 88,
    indicators: ['Document mismatch', 'Photo verification failed', 'Behavioral anomaly'],
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-005',
    type: 'rating_manipulation',
    riskLevel: 'low',
    status: 'false_positive',
    target: { name: 'P. Mendoza', role: 'Driver' },
    confidence: 62,
    indicators: ['Unusual rating pattern', 'Multiple reviews from same IP'],
    detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'FRA-006',
    type: 'fake_gps',
    riskLevel: 'medium',
    status: 'pending',
    target: { name: 'R. dela Cruz', role: 'Driver' },
    confidence: 71,
    indicators: ['Location jump detected', 'Impossible travel speed'],
    detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

const FraudNotifications = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAlerts();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, riskFilter, statusFilter, typeFilter]);

  const loadAlerts = async () => {
    try {
      // Simulate API call - replace with actual API when ready
      // const response = await getFraudAlerts();
      // setAlerts(response.data);
      
      // Use mock data for now
      setTimeout(() => {
        setAlerts(mockAlerts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load fraud alerts', error);
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.riskLevel === riskFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((alert) => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
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

  const handleInvestigate = (alertId: string) => {
    // Investigate alert
    // TODO: Open investigation modal or navigate to detail page
  };

  const handleBlock = (alertId: string) => {
    // Block account
    // TODO: Block account and update alert status
  };

  const handleDismiss = (alertId: string) => {
    // Dismiss alert
    // TODO: Mark as false positive
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading fraud alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fraud Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time fraud alerts and suspicious activity monitoring
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-400">Total Alerts</p>
            <p className="text-2xl font-bold text-white mt-1">{alerts.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-400">High Risk</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {alerts.filter((a) => a.riskLevel === 'high').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-400">Investigating</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {alerts.filter((a) => a.status === 'investigating').length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-400">Pending Review</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {alerts.filter((a) => a.status === 'pending').length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="confirmed">Confirmed</option>
              <option value="false_positive">False Positive</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="fake_gps">Fake GPS</option>
              <option value="multiple_accounts">Multiple Accounts</option>
              <option value="payment_fraud">Payment Fraud</option>
              <option value="identity_theft">Identity Theft</option>
              <option value="rating_manipulation">Rating Manipulation</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Fraud Alerts ({filteredAlerts.length})</h3>
            <button className="text-sm text-orange-400 hover:underline">
              Export Results
            </button>
          </div>
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No fraud alerts found</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={getRiskColor(alert.riskLevel)}>
                          {alert.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <Badge variant={getStatusColor(alert.status)}>
                          {alert.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-sm font-semibold text-white uppercase">
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">ID: {alert.id}</span>
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
                          <span className="text-xs text-gray-500">
                            Detected: {new Date(alert.detectedAt).toLocaleString()}
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
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleInvestigate(alert.id)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Investigate"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlock(alert.id)}
                        className="p-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                        title="Block Account"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Dismiss"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FraudNotifications;
