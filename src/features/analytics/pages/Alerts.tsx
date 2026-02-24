// Alerts Page - Alert management and notification settings
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { XpressBadge } from '@/components/ui/XpressBadge';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  CheckCircle,
  Filter,
} from 'lucide-react';

// Alert Types
interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  recipients: string[];
  createdAt: string;
}

interface ActiveAlert {
  id: string;
  rule: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

interface AlertHistory {
  id: string;
  rule: string;
  severity: 'critical' | 'warning' | 'info';
  triggeredAt: string;
  acknowledgedAt?: string;
}

interface AlertsData {
  active: ActiveAlert[];
  rules: AlertRule[];
  history: AlertHistory[];
}

// Mock Data
const mockAlertsData: AlertsData = {
  active: [
    {
      id: '1',
      rule: 'High API Error Rate',
      message: 'API error rate exceeded 5% threshold (current: 7.2%)',
      severity: 'warning',
      triggeredAt: new Date(Date.now() - 300000).toISOString(),
      acknowledged: false,
    },
    {
      id: '2',
      rule: 'Low Driver Availability',
      message: 'Available drivers below 20% in Makati CBD zone',
      severity: 'critical',
      triggeredAt: new Date(Date.now() - 600000).toISOString(),
      acknowledged: false,
    },
    {
      id: '3',
      rule: 'Payment Gateway Latency',
      message: 'Average payment processing time > 3 seconds',
      severity: 'warning',
      triggeredAt: new Date(Date.now() - 900000).toISOString(),
      acknowledged: true,
      acknowledgedAt: new Date(Date.now() - 600000).toISOString(),
    },
  ],
  rules: [
    {
      id: '1',
      name: 'High API Error Rate',
      condition: 'error_rate > threshold',
      threshold: 5,
      severity: 'warning',
      enabled: true,
      recipients: ['ops@xpress.ph', 'dev@xpress.ph'],
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: '2',
      name: 'Low Driver Availability',
      condition: 'available_drivers < threshold',
      threshold: 20,
      severity: 'critical',
      enabled: true,
      recipients: ['ops@xpress.ph', 'dispatch@xpress.ph'],
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    },
    {
      id: '3',
      name: 'Payment Gateway Latency',
      condition: 'payment_latency > threshold',
      threshold: 3000,
      severity: 'warning',
      enabled: true,
      recipients: ['payments@xpress.ph'],
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: '4',
      name: 'Fraud Detection Alert',
      condition: 'fraud_score > threshold',
      threshold: 80,
      severity: 'critical',
      enabled: false,
      recipients: ['security@xpress.ph', 'fraud@xpress.ph'],
      createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    },
  ],
  history: Array.from({ length: 50 }, (_, i) => ({
    id: `hist-${i}`,
    rule: ['High API Error Rate', 'Low Driver Availability', 'Payment Gateway Latency'][i % 3],
    severity: ['critical', 'warning', 'info'][i % 3] as 'critical' | 'warning' | 'info',
    triggeredAt: new Date(Date.now() - i * 3600000).toISOString(),
    acknowledgedAt: new Date(Date.now() - i * 3600000 + 300000).toISOString(),
  })),
};

const Alerts = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: '',
    condition: '',
    threshold: 0,
    severity: 'warning',
    enabled: true,
    recipients: [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: async (): Promise<AlertsData> => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockAlertsData;
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<AlertRule>) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowCreateModal(false);
      setNewRule({
        name: '',
        condition: '',
        threshold: 0,
        severity: 'warning',
        enabled: true,
        recipients: [],
      });
    },
  });

  const updateRuleMutation = useMutation({
    mutationFn: async ({ ruleId, enabled }: { ruleId: string; enabled: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { ruleId, enabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return ruleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const handleAcknowledge = (alertId: string) => {
    acknowledgeMutation.mutate(alertId);
  };

  const handleToggleRule = (ruleId: string, currentEnabled: boolean) => {
    updateRuleMutation.mutate({ ruleId, enabled: !currentEnabled });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      deleteRuleMutation.mutate(ruleId);
    }
  };

  const handleCreateRule = () => {
    if (newRule.name && newRule.condition) {
      createRuleMutation.mutate(newRule);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XpressBadge variant="alert">Critical</XpressBadge>;
      case 'warning':
        return <XpressBadge variant="warning">Warning</XpressBadge>;
      case 'info':
        return <XpressBadge variant="info">Info</XpressBadge>;
      default:
        return <XpressBadge variant="default">{severity}</XpressBadge>;
    }
  };

  const filteredHistory =
    filterSeverity === 'all'
      ? data?.history || []
      : (data?.history || []).filter((alert) => alert.severity === filterSeverity);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f14]">
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Alerts Management</h1>
          <p className="text-gray-400 mt-1">
            Configure and monitor system alerts and notifications
          </p>
        </div>
        <XpressButton onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
          Create Alert Rule
        </XpressButton>
      </div>

      {/* Active Alerts Section */}
      <XpressCard title={`Active Alerts (${data?.active.length || 0})`} icon={<Bell className="w-5 h-5" />}>
        {(data?.active || []).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <div className="text-white font-medium">No active alerts</div>
            <div className="text-sm mt-1">All systems operating normally.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.active.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-[#12121a] rounded-lg border border-gray-800"
              >
                <div className="flex items-start gap-4 flex-1">
                  <Bell className="w-5 h-5 text-orange-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white">{alert.rule}</span>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{alert.message}</div>
                    <div className="text-xs text-gray-500">
                      Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <XpressButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    loading={acknowledgeMutation.isPending}
                  >
                    Acknowledge
                  </XpressButton>
                )}
              </div>
            ))}
          </div>
        )}
      </XpressCard>

      {/* Notification Channels */}
      <XpressCard title="Notification Channels" icon={<Send className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Email', icon: Mail, enabled: true },
            { name: 'SMS', icon: MessageSquare, enabled: true },
            { name: 'Push', icon: Smartphone, enabled: false },
            { name: 'Slack', icon: Send, enabled: true },
          ].map((channel) => (
            <div
              key={channel.name}
              className={`p-4 rounded-lg border ${
                channel.enabled
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-[#12121a] border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <channel.icon
                  className={`w-5 h-5 ${
                    channel.enabled ? 'text-green-400' : 'text-gray-500'
                  }`}
                />
                <XpressBadge variant={channel.enabled ? 'active' : 'offline'}>
                  {channel.enabled ? 'Active' : 'Inactive'}
                </XpressBadge>
              </div>
              <div className="font-medium text-white">{channel.name}</div>
            </div>
          ))}
        </div>
      </XpressCard>

      {/* Alert Rules Table */}
      <XpressCard title={`Alert Rules (${data?.rules.length || 0})`} icon={<Bell className="w-5 h-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Rule Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Condition</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Threshold</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Severity</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.rules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white font-medium">{rule.name}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{rule.condition}</td>
                  <td className="py-3 px-4 text-center text-white">{rule.threshold}</td>
                  <td className="py-3 px-4 text-center">{getSeverityBadge(rule.severity)}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleRule(rule.id, rule.enabled)}
                      className="flex items-center justify-center mx-auto"
                    >
                      {rule.enabled ? (
                        <Bell className="w-5 h-5 text-green-400" />
                      ) : (
                        <BellOff className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <XpressButton
                        variant="secondary"
                        size="sm"
                        onClick={() => alert('Test alert sent!')}
                        disabled={!rule.enabled}
                      >
                        Test
                      </XpressButton>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </XpressCard>

      {/* Alert History */}
      <XpressCard
        title="Alert History"
        icon={<Filter className="w-5 h-5" />}
        headerAction={
          <div className="flex gap-2">
            {(['all', 'critical', 'warning', 'info'] as const).map((severity) => (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterSeverity === severity
                    ? 'bg-orange-500 text-white'
                    : 'bg-[#12121a] text-gray-400 hover:bg-gray-800'
                }`}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Rule</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium text-sm">Severity</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Triggered At</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Acknowledged At</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.slice(0, 20).map((alert) => (
                <tr key={alert.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-white">{alert.rule}</td>
                  <td className="py-3 px-4 text-center">{getSeverityBadge(alert.severity)}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </XpressCard>

      {/* Create Alert Rule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <XpressCard className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">Create Alert Rule</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., High API Error Rate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
                <input
                  type="text"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., error_rate > threshold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Threshold</label>
                <input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                <select
                  value={newRule.severity}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      severity: e.target.value as 'critical' | 'warning' | 'info',
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipients (comma-separated emails)
                </label>
                <input
                  type="text"
                  value={newRule.recipients?.join(', ')}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      recipients: e.target.value.split(',').map((r) => r.trim()),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="ops-team@xpress.ph, alerts@xpress.ph"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <XpressButton
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </XpressButton>
                <XpressButton
                  className="flex-1"
                  onClick={handleCreateRule}
                  loading={createRuleMutation.isPending}
                  disabled={!newRule.name || !newRule.condition}
                >
                  Create Rule
                </XpressButton>
              </div>
            </div>
          </XpressCard>
        </div>
      )}
    </div>
  );
};

export default Alerts;
