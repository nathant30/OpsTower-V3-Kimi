/**
 * RecentIncidentsList Component
 * Displays list of recent incidents with severity indicators
 */

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import type { DashboardIncident } from '@/services/dashboard.service';
import { 
  AlertTriangle, 
  AlertCircle, 
  Car, 
  MapPin, 
  Clock,
  ChevronRight,
  ShieldAlert,
  Siren,
  UserX,
  FileWarning
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecentIncidentsListProps {
  incidents: DashboardIncident[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
}

const incidentIcons: Record<DashboardIncident['type'], typeof AlertTriangle> = {
  'BREAKDOWN': Car,
  'SOS': Siren,
  'ACCIDENT': AlertTriangle,
  'INTEGRITY_ALERT': ShieldAlert,
  'CUSTOMER_COMPLAINT': UserX,
  'TRAFFIC_VIOLATION': FileWarning,
};

const severityConfig = {
  'Critical': {
    badge: 'alert' as const,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  'High': {
    badge: 'warning' as const,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  'Medium': {
    badge: 'default' as const,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  'Low': {
    badge: 'default' as const,
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
  },
};

// Status labels for incident status display
// const statusLabels: Record<string, string> = {
//   'OPEN': 'Open',
//   'INVESTIGATING': 'Investigating',
//   'PENDING_DOCUMENTATION': 'Pending Doc',
//   'AUDIT_FAIL': 'Audit Fail',
//   'RESOLVED': 'Resolved',
//   'ESCALATED': 'Escalated',
// };

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function IncidentRow({ incident, onClick }: { 
  incident: DashboardIncident; 
  onClick: () => void;
}) {
  const Icon = incidentIcons[incident.type] || AlertCircle;
  const config = severityConfig[incident.severity];
  const isResolved = incident.status === 'RESOLVED';

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer group",
        config.bgColor,
        config.borderColor,
        "hover:bg-opacity-20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg bg-black/20 shrink-0",
          config.iconColor
        )}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={cn(
              "text-sm font-medium truncate",
              isResolved ? "text-gray-500" : "text-white"
            )}>
              {incident.title}
            </h4>
            <Badge 
              variant={config.badge} 
              className="text-[10px] px-1.5 py-0 shrink-0"
            >
              {incident.severity}
            </Badge>
          </div>

          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {incident.description}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{incident.location}</span>
            </span>
            {incident.driverId && (
              <span className="flex items-center gap-1">
                <span className="text-gray-600">Driver:</span>
                <span className="truncate max-w-[60px]">{incident.driverId}</span>
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(incident.occurredAt)}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0 self-center" />
      </div>
    </div>
  );
}

export function RecentIncidentsList({
  incidents,
  isLoading = false,
  className,
  maxItems = 5,
}: RecentIncidentsListProps) {
  const navigate = useNavigate();
  const displayIncidents = incidents.slice(0, maxItems);

  const criticalCount = incidents.filter(i => i.severity === 'Critical').length;
  const openCount = incidents.filter(i => i.status !== 'RESOLVED').length;

  if (isLoading) {
    return (
      <div className={cn(
        "bg-[#12121a] border border-white/10 rounded-xl p-4",
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            <div className="w-24 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-[#12121a] border border-white/10 rounded-xl p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Incidents</h3>
            <p className="text-xs text-gray-500">
              {openCount > 0 ? `${openCount} open issues` : 'All incidents resolved'}
            </p>
          </div>
        </div>
        {criticalCount > 0 && (
          <Badge variant="alert" className="text-[10px]">
            {criticalCount} Critical
          </Badge>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-black/20 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{incidents.length}</p>
          <p className="text-[10px] text-gray-500">Total</p>
        </div>
        <div className="bg-black/20 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-amber-400">{openCount}</p>
          <p className="text-[10px] text-gray-500">Open</p>
        </div>
        <div className="bg-black/20 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-red-400">{criticalCount}</p>
          <p className="text-[10px] text-gray-500">Critical</p>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-2">
        {displayIncidents.length > 0 ? (
          displayIncidents.map((incident) => (
            <IncidentRow
              key={incident.id}
              incident={incident}
              onClick={() => navigate(`/incidents/${incident.id}`)}
            />
          ))
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-sm text-gray-400">No recent incidents</p>
            <p className="text-xs text-gray-600 mt-1">All systems operational</p>
          </div>
        )}
      </div>

      {/* View All Link */}
      <button
        onClick={() => navigate('/incidents')}
        className="w-full mt-3 pt-3 border-t border-white/5 text-center text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
      >
        View All Incidents
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}

export default RecentIncidentsList;
