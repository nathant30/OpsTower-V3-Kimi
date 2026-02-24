/**
 * Safety Incident Card Component
 * Displays detailed information about a safety incident
 */

import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  Car,
  Clock,
  CheckCircle,
  Shield,
} from 'lucide-react';
import type { SafetyIncident } from '@/services/safety/safety.service';

interface SafetyIncidentCardProps {
  incident: SafetyIncident;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onViewDetails?: (incident: SafetyIncident) => void;
  compact?: boolean;
}

const severityConfig = {
  critical: { variant: 'alert' as const, icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  high: { variant: 'warning' as const, icon: AlertTriangle, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  medium: { variant: 'warning' as const, icon: Shield, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  low: { variant: 'active' as const, icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

const statusConfig = {
  reported: { variant: 'warning' as const, label: 'Reported' },
  acknowledged: { variant: 'warning' as const, label: 'Acknowledged' },
  responding: { variant: 'alert' as const, label: 'Responding' },
  resolved: { variant: 'active' as const, label: 'Resolved' },
  closed: { variant: 'default' as const, label: 'Closed' },
};

const typeLabels: Record<string, string> = {
  emergency: 'Emergency',
  accident: 'Accident',
  harassment: 'Harassment',
  panic_button: 'Panic Button',
  speeding: 'Speeding',
  route_deviation: 'Route Deviation',
  unsafe_driving: 'Unsafe Driving',
  vehicle_malfunction: 'Vehicle Malfunction',
  medical: 'Medical Emergency',
  security: 'Security',
  other: 'Other',
};

export function SafetyIncidentCard({
  incident,
  onAcknowledge,
  onResolve,
  onViewDetails,
  compact = false,
}: SafetyIncidentCardProps) {
  const severity = severityConfig[incident.severity];
  const status = statusConfig[incident.status];
  const SeverityIcon = severity.icon;

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeAgo = (date: string) => {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (compact) {
    return (
      <div
        className="p-4 bg-[#12121a] border border-white/10 rounded-lg hover:border-white/20 transition-all cursor-pointer"
        onClick={() => onViewDetails?.(incident)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${severity.bgColor} flex items-center justify-center flex-shrink-0`}>
              <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={severity.variant}>{incident.severity.toUpperCase()}</Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
                {incident.panicButton && (
                  <Badge variant="alert" className="animate-pulse">
                    <Phone className="w-3 h-3 mr-1" />
                    SOS
                  </Badge>
                )}
              </div>
              <h4 className="text-white font-medium mt-1 truncate">{incident.title}</h4>
              <p className="text-gray-500 text-sm mt-0.5">{getTimeAgo(incident.reportedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <XpressCard className="overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl ${severity.bgColor} flex items-center justify-center flex-shrink-0`}>
              <SeverityIcon className={`w-6 h-6 ${severity.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant={severity.variant}>{incident.severity.toUpperCase()}</Badge>
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  {typeLabels[incident.type]}
                </span>
                {incident.panicButton && (
                  <Badge variant="alert" className="animate-pulse">
                    <Phone className="w-3 h-3 mr-1" />
                    PANIC BUTTON
                  </Badge>
                )}
              </div>
              <h3 className="text-white font-semibold text-lg">{incident.title}</h3>
              <p className="text-gray-400 text-sm mt-1">{incident.description}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-white font-mono">{incident.id}</p>
            <p className="text-sm text-gray-500">{getTimeAgo(incident.reportedAt)}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {incident.driver && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-500">Driver</p>
                <p className="text-white font-medium">{incident.driver.name}</p>
                {incident.driver.safetyScore && (
                  <p className="text-xs text-gray-500">Safety Score: {incident.driver.safetyScore}</p>
                )}
              </div>
            </div>
          )}

          {incident.passenger && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-500">Passenger</p>
                <p className="text-white font-medium">{incident.passenger.name}</p>
              </div>
            </div>
          )}

          {incident.vehicle && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Car className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-gray-500">Vehicle</p>
                <p className="text-white font-medium">{incident.vehicle.plateNumber}</p>
                <p className="text-xs text-gray-500">{incident.vehicle.model}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="text-white font-medium truncate max-w-[200px]">{incident.location.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-500">Reported</p>
              <p className="text-white font-medium">{formatTime(incident.reportedAt)}</p>
            </div>
          </div>

          {incident.responseTime && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-500">Response Time</p>
                <p className="text-white font-medium">{incident.responseTime} minutes</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {incident.notes && incident.notes.length > 0 && (
          <div className="bg-[#0f0f14] rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
            <ul className="space-y-1">
              {incident.notes.map((note, index) => (
                <li key={index} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-gray-600">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          {incident.status === 'reported' && onAcknowledge && (
            <Button variant="secondary" onClick={() => onAcknowledge(incident.id)}>
              Acknowledge
            </Button>
          )}
          {(incident.status === 'reported' || incident.status === 'acknowledged' || incident.status === 'responding') && onResolve && (
            <Button variant="primary" onClick={() => onResolve(incident.id)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
          )}
          {onViewDetails && (
            <Button variant="outline" onClick={() => onViewDetails(incident)}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </XpressCard>
  );
}

export default SafetyIncidentCard;
