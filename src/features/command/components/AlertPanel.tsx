import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { Badge } from '@/components/ui/Badge';
import type { CommandAlert, AlertSeverity, AlertStatus } from '@/services/command/command.service';
import {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Check,
  Filter,
  Bell,
} from 'lucide-react';

interface AlertPanelProps {
  alerts?: CommandAlert[];
  isLoading?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  maxItems?: number;
}

const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; color: string; label: string }> = {
  critical: {
    icon: <XCircle className="w-4 h-4" />,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Critical',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'Warning',
  },
  info: {
    icon: <Info className="w-4 h-4" />,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    label: 'Info',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    label: 'Success',
  },
};

const statusBadges: Record<AlertStatus, { variant: 'alert' | 'warning' | 'default'; label: string }> = {
  active: { variant: 'alert', label: 'Active' },
  acknowledged: { variant: 'warning', label: 'Ack' },
  resolved: { variant: 'default', label: 'Resolved' },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

function AlertItemRow({
  alert,
  onAcknowledge,
  onResolve,
}: {
  alert: CommandAlert;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}) {
  const severity = severityConfig[alert.severity];
  const status = statusBadges[alert.status];
  const isActive = alert.status === 'active';
  const isAcknowledged = alert.status === 'acknowledged';

  return (
    <div className={cn(
      "p-4 border-l-2 transition-all",
      isActive ? "border-red-500 bg-red-500/5" : "border-gray-700 hover:bg-white/5",
      "group"
    )}>
      <div className="flex items-start gap-3">
        {/* Severity Icon */}
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
          severity.color
        )}>
          {severity.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-white">{alert.title}</p>
                <Badge variant={status.variant} className="text-[10px]">
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">{alert.message}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(alert.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3" />
                {alert.source}
              </div>
              {alert.assignedTo && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {alert.assignedTo}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isActive && (
                <XpressButton
                  variant="ghost"
                  size="xs"
                  onClick={() => onAcknowledge?.(alert.id)}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Ack
                </XpressButton>
              )}
              {(isActive || isAcknowledged) && (
                <XpressButton
                  variant="success"
                  size="xs"
                  onClick={() => onResolve?.(alert.id)}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resolve
                </XpressButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertPanelSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border-l-2 border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AlertPanel({
  alerts = [],
  isLoading,
  onAcknowledge,
  onResolve,
  maxItems = 20,
}: AlertPanelProps) {
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all');

  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || alert.status === filter)
    .slice(0, maxItems);

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  const filters: Array<{ value: AlertStatus | 'all'; label: string; count: number }> = [
    { value: 'all', label: 'All', count: alerts.length },
    { value: 'active', label: 'Active', count: alerts.filter(a => a.status === 'active').length },
    { value: 'acknowledged', label: 'Ack', count: alerts.filter(a => a.status === 'acknowledged').length },
    { value: 'resolved', label: 'Resolved', count: alerts.filter(a => a.status === 'resolved').length },
  ];

  return (
    <XpressCard
      title="Alerts & Notifications"
      subtitle="Critical issues requiring attention"
      badge={criticalCount > 0 ? `${criticalCount} critical` : `${activeCount} active`}
      badgeVariant={criticalCount > 0 ? 'alert' : activeCount > 0 ? 'warning' : 'success'}
      className="h-full"
      headerAction={
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as AlertStatus | 'all')}
            className="bg-gray-900 border border-gray-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            {filters.map(f => (
              <option key={f.value} value={f.value}>
                {f.label} ({f.count})
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 -mt-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            )}
          >
            {f.label}
            <span className={cn(
              "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
              filter === f.value ? "bg-blue-500/30" : "bg-gray-700"
            )}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="space-y-2 -mx-5 -mb-5">
        {isLoading ? (
          <AlertPanelSkeleton />
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">No alerts to display</p>
            <p className="text-xs text-gray-500 mt-1">
              {filter === 'all' 
                ? 'All systems are operating normally' 
                : `No ${filter} alerts found`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredAlerts.map((alert) => (
              <AlertItemRow
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onResolve={onResolve}
              />
            ))}
          </div>
        )}
      </div>
    </XpressCard>
  );
}

export default AlertPanel;
