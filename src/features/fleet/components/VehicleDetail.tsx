import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { 
  useVehicle, 
  useVehicleMaintenanceHistory,
  useVehicleUtilization 
} from '@/features/fleet/hooks/useVehicle';
import type { VehicleStatus, ServiceRecord } from '@/types/domain.types';
import { 
  Car, 
  Bike, 
  Package, 
  User, 
  MapPin, 
  Clock, 
  Wrench, 
  TrendingUp,
  Calendar,
  Gauge,
  PhilippinePeso,
  AlertCircle,
  FileText,
  Edit2,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export interface VehicleDetailProps {
  vehicleId: string;
  onEdit?: () => void;
  onViewDriver?: (driverId: string) => void;
  onViewMap?: () => void;
}

const vehicleTypeIcons: Record<string, React.ReactNode> = {
  'Taxi': <Car className="w-6 h-6" />,
  'Moto': <Bike className="w-6 h-6" />,
  'Delivery': <Package className="w-6 h-6" />,
  'Idle': <Car className="w-6 h-6" />,
  'Urban Demand': <Car className="w-6 h-6" />,
};

function getStatusBadgeVariant(status: VehicleStatus): 'active' | 'idle' | 'offline' | 'alert' | 'warning' | 'default' {
  switch (status) {
    case 'Active':
      return 'active';
    case 'Idle':
      return 'idle';
    case 'Maintenance':
      return 'alert';
    case 'Offline':
      return 'offline';
    case 'Decommissioned':
      return 'warning';
    default:
      return 'default';
  }
}

function getTypeBadgeColor(type: string): string {
  switch (type) {
    case 'Taxi':
      return 'bg-blue-500/20 text-blue-400';
    case 'Moto':
      return 'bg-green-500/20 text-green-400';
    case 'Delivery':
      return 'bg-purple-500/20 text-purple-400';
    case 'Idle':
      return 'bg-amber-500/20 text-amber-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function ServiceRecordCard({ record }: { record: ServiceRecord }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-xpress-bg-secondary rounded-lg">
      <div className="w-8 h-8 rounded-full bg-xpress-accent-blue/20 flex items-center justify-center flex-shrink-0">
        <Wrench className="w-4 h-4 text-xpress-accent-blue" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-xpress-text-primary">{record.type}</span>
          <span className="text-xs text-xpress-text-muted">
            {format(new Date(record.date), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="text-sm text-xpress-text-secondary mt-1">{record.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-xpress-text-muted">
          <span className="flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            {record.mileage.toLocaleString()} km
          </span>
          <span className="flex items-center gap-1">
            <PhilippinePeso className="w-3 h-3" />
            {record.cost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function VehicleDetail({ 
  vehicleId, 
  onEdit, 
  onViewDriver,
  onViewMap 
}: VehicleDetailProps) {
  const { data: vehicle, isLoading: isLoadingVehicle } = useVehicle(vehicleId);
  const { data: maintenanceHistory } = useVehicleMaintenanceHistory(vehicleId);
  const { data: utilization } = useVehicleUtilization(vehicleId);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'utilization'>('overview');

  if (isLoadingVehicle) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-xpress-bg-tertiary rounded-lg" />
          <div className="h-64 bg-xpress-bg-tertiary rounded-lg" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-xpress-text-muted mx-auto mb-4" />
        <p className="text-xpress-text-secondary">Vehicle not found</p>
      </div>
    );
  }

  const isServiceDue = vehicle.maintenance.nextServiceDue && 
    new Date(vehicle.maintenance.nextServiceDue) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="xpress-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`
              w-16 h-16 rounded-xl flex items-center justify-center
              ${getTypeBadgeColor(vehicle.type)}
            `}>
              {vehicleTypeIcons[vehicle.type] || <Car className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-xpress-text-primary">
                  {vehicle.make} {vehicle.model}
                </h2>
                <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                  {vehicle.status}
                </Badge>
              </div>
              <p className="text-lg font-mono text-xpress-text-secondary mt-1">
                {vehicle.plateNumber}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-xpress-text-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {vehicle.year}
                </span>
                <span className="flex items-center gap-1">
                  {vehicleTypeIcons[vehicle.type]}
                  {vehicle.type}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />} onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-xpress-border">
        {(['overview', 'maintenance', 'utilization'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 text-sm font-medium capitalize transition-colors
              ${activeTab === tab 
                ? 'text-xpress-accent-blue border-b-2 border-xpress-accent-blue' 
                : 'text-xpress-text-secondary hover:text-xpress-text-primary'}
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Current Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-xpress-accent-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-xpress-text-muted">Location</p>
                    {vehicle.currentLocation ? (
                      <button 
                        onClick={onViewMap}
                        className="text-sm text-xpress-text-primary hover:text-xpress-accent-blue transition-colors"
                      >
                        {vehicle.currentLocation.lat.toFixed(4)}, {vehicle.currentLocation.lng.toFixed(4)}
                      </button>
                    ) : (
                      <p className="text-sm text-xpress-text-muted">No location data</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center">
                    <Clock className="w-5 h-5 text-xpress-accent-green" />
                  </div>
                  <div>
                    <p className="text-xs text-xpress-text-muted">Last Updated</p>
                    <p className="text-sm text-xpress-text-primary">
                      {format(new Date(vehicle.updatedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Driver */}
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Assigned Driver
              </h3>
              {vehicle.assignedDriver ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-xpress-accent-blue/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-xpress-accent-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-xpress-text-primary">
                        {vehicle.assignedDriver.name}
                      </p>
                      <p className="text-sm text-xpress-text-muted">
                        {vehicle.assignedDriver.phone}
                      </p>
                      {vehicle.assignedDriver.assignedAt && (
                        <p className="text-xs text-xpress-text-muted">
                          Assigned since {format(new Date(vehicle.assignedDriver.assignedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDriver?.(vehicle.assignedDriver!.driverId)}
                  >
                    View Profile
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <User className="w-12 h-12 text-xpress-text-muted mx-auto mb-2" />
                  <p className="text-xpress-text-secondary">No driver assigned</p>
                  <Button variant="secondary" size="sm" className="mt-3">
                    Assign Driver
                  </Button>
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Documents
              </h3>
              <div className="space-y-2">
                {vehicle.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-xpress-bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-xpress-text-muted" />
                      <div>
                        <p className="text-sm font-medium text-xpress-text-primary">{doc.name}</p>
                        <p className="text-xs text-xpress-text-muted">
                          Expires: {doc.expiresAt ? format(new Date(doc.expiresAt), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={doc.status === 'Approved' ? 'active' : 'warning'}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Utilization Quick Stats */}
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Utilization
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xpress-text-secondary">Total Trips</span>
                    <span className="font-medium text-xpress-text-primary">
                      {vehicle.utilization.tripsCompleted.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xpress-text-secondary">Revenue Generated</span>
                    <span className="font-medium text-xpress-text-primary">
                      ₱{vehicle.utilization.revenueGenerated.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xpress-text-secondary">Distance Traveled</span>
                    <span className="font-medium text-xpress-text-primary">
                      {vehicle.utilization.distanceTraveled.toLocaleString()} km
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xpress-text-secondary">Hours Active</span>
                    <span className="font-medium text-xpress-text-primary">
                      {vehicle.utilization.hoursActive.toLocaleString()} hrs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Quick Stats */}
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Maintenance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-xpress-text-secondary">Current Mileage</span>
                    <span className="font-medium text-xpress-text-primary">
                      {vehicle.maintenance.mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>
                {vehicle.maintenance.lastService && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xpress-text-secondary">Last Service</span>
                      <span className="font-medium text-xpress-text-primary">
                        {format(new Date(vehicle.maintenance.lastService), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                )}
                {vehicle.maintenance.nextServiceDue && (
                  <div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xpress-text-secondary">Next Service Due</span>
                      <span className={`font-medium ${isServiceDue ? 'text-xpress-status-alert' : 'text-xpress-text-primary'}`}>
                        {format(new Date(vehicle.maintenance.nextServiceDue), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {isServiceDue && (
                      <p className="text-xs text-xpress-status-alert mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Service overdue or due soon
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-xpress-accent-blue" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Current Mileage</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    {vehicle.maintenance.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>
            </div>
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-xpress-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Total Services</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    {vehicle.maintenance.serviceHistory.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-bg-elevated flex items-center justify-center">
                  <PhilippinePeso className="w-5 h-5 text-xpress-accent-amber" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Total Maintenance Cost</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    ₱{maintenanceHistory?.totalCost.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="xpress-card p-4">
            <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
              Service History
            </h3>
            <div className="space-y-3">
              {vehicle.maintenance.serviceHistory.length > 0 ? (
                vehicle.maintenance.serviceHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <ServiceRecordCard key={record.id} record={record} />
                  ))
              ) : (
                <p className="text-center text-xpress-text-muted py-8">
                  No service records found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Utilization Tab */}
      {activeTab === 'utilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-accent-blue/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-xpress-accent-blue" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Total Trips</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    {vehicle.utilization.tripsCompleted.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-accent-green/20 flex items-center justify-center">
                  <PhilippinePeso className="w-5 h-5 text-xpress-accent-green" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Revenue Generated</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    ₱{vehicle.utilization.revenueGenerated.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-accent-purple/20 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-xpress-accent-purple" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Distance Traveled</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    {vehicle.utilization.distanceTraveled.toLocaleString()} km
                  </p>
                </div>
              </div>
            </div>
            <div className="xpress-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-xpress-accent-amber/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-xpress-accent-amber" />
                </div>
                <div>
                  <p className="text-xs text-xpress-text-muted">Hours Active</p>
                  <p className="text-lg font-semibold text-xpress-text-primary">
                    {vehicle.utilization.hoursActive.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {utilization?.comparison && (
            <div className="xpress-card p-4">
              <h3 className="text-sm font-medium text-xpress-text-secondary uppercase tracking-wider mb-4">
                Performance Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-xs text-xpress-text-muted">vs Last Week</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className={`w-4 h-4 ${
                      utilization.comparison.vsLastWeek >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`} />
                    <span className={`font-medium ${
                      utilization.comparison.vsLastWeek >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`}>
                      {utilization.comparison.vsLastWeek >= 0 ? '+' : ''}
                      {utilization.comparison.vsLastWeek.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-xs text-xpress-text-muted">vs Last Month</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className={`w-4 h-4 ${
                      utilization.comparison.vsLastMonth >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`} />
                    <span className={`font-medium ${
                      utilization.comparison.vsLastMonth >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`}>
                      {utilization.comparison.vsLastMonth >= 0 ? '+' : ''}
                      {utilization.comparison.vsLastMonth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-xs text-xpress-text-muted">vs Fleet Average</p>
                  <div className="flex items-center gap-2 mt-1">
                    <TrendingUp className={`w-4 h-4 ${
                      utilization.comparison.vsFleetAverage >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`} />
                    <span className={`font-medium ${
                      utilization.comparison.vsFleetAverage >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
                    }`}>
                      {utilization.comparison.vsFleetAverage >= 0 ? '+' : ''}
                      {utilization.comparison.vsFleetAverage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VehicleDetail;
