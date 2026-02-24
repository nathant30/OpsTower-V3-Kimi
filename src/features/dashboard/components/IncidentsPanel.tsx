import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { 
  AlertTriangle, 
  AlertCircle, 
  Car,
  UserX,
  MapPin,
  Clock,
  ChevronRight,
  Bell,
  Phone,
  Navigation,
  CheckCircle
} from 'lucide-react';

interface Incident {
  id: string;
  type: 'breakdown' | 'sos' | 'offline' | 'accident';
  title: string;
  description: string;
  location: string;
  driver?: string;
  driverId?: string;
  time: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'in_progress' | 'resolved';
}

const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'breakdown',
    title: 'Vehicle Breakdown',
    description: 'Engine failure detected at Quezon Ave. Recovery dispatched.',
    location: 'Quezon City',
    driverId: 'DRV-010',
    time: '2m ago',
    severity: 'critical',
    status: 'in_progress',
  },
  {
    id: '2',
    type: 'sos',
    title: 'Driver SOS Alert',
    description: 'Silent panic triggered. Audio surveillance activated.',
    location: 'Makati CBD',
    driver: 'John R.',
    driverId: 'DRV-015',
    time: '12m ago',
    severity: 'critical',
    status: 'open',
  },
  {
    id: '3',
    type: 'offline',
    title: 'Offline Vehicle',
    description: 'Unit 1293 has been offline for 45+ minutes.',
    location: 'BGC',
    time: '1h ago',
    severity: 'warning',
    status: 'open',
  },
  {
    id: '4',
    type: 'accident',
    title: 'Accident Report',
    description: 'Minor collision reported. No injuries. Police on scene.',
    location: 'EDSA-Ortigas',
    time: '2h ago',
    severity: 'warning',
    status: 'resolved',
  },
];

const incidentIcons = {
  breakdown: Car,
  sos: AlertCircle,
  offline: UserX,
  accident: AlertTriangle,
};

const severityStyles = {
  critical: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    badge: 'alert' as const,
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    badge: 'warning' as const,
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    badge: 'default' as const,
  },
};

function IncidentCard({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  const Icon = incidentIcons[incident.type];
  const styles = severityStyles[incident.severity];

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border transition-colors cursor-pointer group",
        styles.border,
        styles.bg,
        "hover:bg-opacity-20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg bg-black/20", styles.icon)}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-medium text-white truncate">{incident.title}</h4>
            <Badge variant={styles.badge} className="text-[9px] px-1.5 py-0">
              {incident.severity}
            </Badge>
          </div>
          
          <p className="text-[10px] text-gray-400 line-clamp-2 mb-2">
            {incident.description}
          </p>
          
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {incident.location}
            </span>
            {incident.driver && (
              <span className="flex items-center gap-1">
                <UserX className="w-3 h-3" />
                {incident.driver}
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              {incident.time}
            </span>
          </div>
        </div>
        
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 shrink-0" />
      </div>
    </div>
  );
}

function IncidentDetailModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const navigate = useNavigate();
  const Icon = incidentIcons[incident.type];
  const styles = severityStyles[incident.severity];

  return (
    <Modal isOpen={!!incident} onClose={onClose} title="Incident Details" size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-xl", styles.bg, styles.icon)}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={styles.badge}>{incident.severity}</Badge>
              <span className={cn(
                "text-xs",
                incident.status === 'resolved' ? "text-green-400" :
                incident.status === 'in_progress' ? "text-amber-400" :
                "text-red-400"
              )}>
                {incident.status === 'resolved' ? 'Resolved' : 
                 incident.status === 'in_progress' ? 'In Progress' : 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-3 rounded-lg bg-white/5">
          <p className="text-sm text-gray-300">{incident.description}</p>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{incident.location}</span>
          </div>
          {incident.driver && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <UserX className="w-4 h-4" />
              <span>{incident.driver} ({incident.driverId})</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Reported {incident.time}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button className="flex-1">
            <Navigation className="w-4 h-4 mr-1" />
            Dispatch Team
          </Button>
          {incident.driverId && (
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => { navigate(`/drivers/${incident.driverId}`); onClose(); }}
            >
              <Phone className="w-4 h-4 mr-1" />
              Contact Driver
            </Button>
          )}
        </div>

        {incident.status !== 'resolved' && (
          <Button 
            variant="ghost" 
            className="w-full text-green-400 hover:text-green-300"
            onClick={onClose}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark as Resolved
          </Button>
        )}
      </div>
    </Modal>
  );
}

export function IncidentsPanel() {
  const navigate = useNavigate();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const criticalCount = mockIncidents.filter(i => i.severity === 'critical').length;

  return (
    <>
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Incidents & Alerts</h3>
            {criticalCount > 0 && (
              <Badge variant="alert" className="text-[10px]">{criticalCount}</Badge>
            )}
          </div>
          <button 
            onClick={() => navigate('/incidents')}
            className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2 flex-1 overflow-auto">
          {mockIncidents.map((incident) => (
            <IncidentCard 
              key={incident.id} 
              incident={incident} 
              onClick={() => setSelectedIncident(incident)}
            />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-gray-500">Alert Settings</span>
          </div>
          <button className="text-[10px] text-blue-400 hover:text-blue-300">
            Configure
          </button>
        </div>
      </div>

      {selectedIncident && (
        <IncidentDetailModal 
          incident={selectedIncident} 
          onClose={() => setSelectedIncident(null)} 
        />
      )}
    </>
  );
}
