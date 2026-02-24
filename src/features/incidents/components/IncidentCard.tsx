import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { cn } from '@/lib/utils/cn';
import type { Incident, Severity, IncidentStatus } from '@/types/domain.types';
import { format } from 'date-fns';
import { 
  Shield, Info,
  MapPin, Clock, User, ChevronRight,
  FileWarning, ShieldAlert
} from 'lucide-react';

interface IncidentCardProps {
  incident: Incident;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

// Severity configuration matching IncidentsPanel style
const severityConfig: Record<Severity, { 
  border: string; 
  bg: string; 
  iconBg: string;
  iconColor: string;
  badge: 'alert' | 'warning' | 'idle' | 'active';
  icon: React.ElementType;
}> = {
  Critical: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    badge: 'alert',
    icon: ShieldAlert,
  },
  High: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    badge: 'warning',
    icon: FileWarning,
  },
  Medium: {
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    badge: 'idle',
    icon: Info,
  },
  Low: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    badge: 'active',
    icon: Shield,
  },
};

// Status configuration
const statusConfig: Record<IncidentStatus, { label: string; color: string; variant: 'alert' | 'warning' | 'idle' | 'active' | 'offline' }> = {
  New: { label: 'Open', color: 'text-red-400', variant: 'alert' },
  Reviewing: { label: 'Reviewing', color: 'text-amber-400', variant: 'warning' },
  Investigating: { label: 'In Progress', color: 'text-blue-400', variant: 'idle' },
  PendingAction: { label: 'Pending', color: 'text-orange-400', variant: 'warning' },
  Hearing: { label: 'Hearing', color: 'text-purple-400', variant: 'idle' },
  Resolved: { label: 'Resolved', color: 'text-green-400', variant: 'active' },
  Closed: { label: 'Closed', color: 'text-gray-400', variant: 'offline' },
};

// Type labels
const typeLabels: Record<string, string> = {
  'Accident': 'Accident',
  'SafetyViolation': 'Safety Violation',
  'CustomerComplaint': 'Customer Complaint',
  'DriverMisconduct': 'Driver Misconduct',
  'VehicleIssue': 'Vehicle Issue',
  'PolicyViolation': 'Policy Violation',
  'Fraud': 'Fraud',
  'Other': 'Other',
};

export function IncidentCard({ 
  incident, 
  selected = false, 
  onSelect, 
  onClick,
  compact = false 
}: IncidentCardProps) {
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const Icon = severity.icon;
  
  // Calculate time ago
  const reportedDate = new Date(incident.timeline.reportedAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - reportedDate.getTime()) / (1000 * 60));
  const timeAgo = diffInMinutes < 60 
    ? `${diffInMinutes}m ago`
    : diffInMinutes < 1440
      ? `${Math.floor(diffInMinutes / 60)}h ago`
      : format(reportedDate, 'MMM d');

  if (compact) {
    // List view - horizontal layout
    return (
      <div 
        onClick={onClick}
        className={cn(
          "p-4 rounded-lg border transition-all cursor-pointer group flex items-center gap-4",
          "bg-[#12121a] hover:bg-opacity-80",
          severity.border,
          selected && "ring-1 ring-xpress-accent-blue bg-xpress-accent-blue/10"
        )}
      >
        {/* Checkbox */}
        {onSelect && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={selected} onChange={onSelect} />
          </div>
        )}
        
        {/* Icon */}
        <div className={cn("p-2.5 rounded-lg shrink-0", severity.iconBg, severity.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-white truncate">
                {typeLabels[incident.type] || incident.type}
              </h4>
            </div>
            <p className="text-xs text-gray-400 truncate">
              {incident.description.summary}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={severity.badge} className="text-[10px]">
              {incident.severity}
            </Badge>
            <Badge variant={status.variant} className="text-[10px]">
              {status.label}
            </Badge>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-gray-400">{timeAgo}</div>
            <div className="text-xs text-gray-500">{incident.reportedBy.name}</div>
          </div>
        </div>
        
        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 shrink-0" />
      </div>
    );
  }

  // Grid view - card layout matching IncidentsPanel
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border transition-all cursor-pointer group",
        "bg-[#12121a] hover:bg-opacity-80",
        severity.border,
        severity.bg,
        selected && "ring-1 ring-xpress-accent-blue"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox and Icon */}
        <div className="flex items-center gap-2 shrink-0">
          {onSelect && (
            <div onClick={(e) => e.stopPropagation()} className="mt-1">
              <Checkbox checked={selected} onChange={onSelect} />
            </div>
          )}
          <div className={cn("p-2.5 rounded-lg", severity.iconBg, severity.iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-white truncate">
              {typeLabels[incident.type] || incident.type}
            </h4>
            <Badge variant={severity.badge} className="text-[10px] px-1.5 py-0">
              {incident.severity}
            </Badge>
          </div>
          
          {/* Description */}
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">
            {incident.description.summary}
          </p>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
            {/* Status */}
            <span className={cn("flex items-center gap-1", status.color)}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                incident.status === 'Resolved' ? 'bg-green-400' :
                incident.status === 'Closed' ? 'bg-gray-400' :
                incident.status === 'New' ? 'bg-red-400 animate-pulse' :
                'bg-amber-400'
              )} />
              {status.label}
            </span>
            
            {/* Location */}
            {incident.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location recorded
              </span>
            )}
            
            {/* Involved count */}
            {(incident.involved.drivers.length + incident.involved.vehicles.length) > 0 && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {incident.involved.drivers.length + incident.involved.customers.length} parties
              </span>
            )}
            
            {/* Time */}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
          
          {/* Reporter info */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-xpress-bg-elevated flex items-center justify-center">
                <User className="w-3 h-3 text-gray-500" />
              </div>
              <span className="text-[11px] text-gray-400">
                {incident.reportedBy.name}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentCard;
