import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { XpressCard, XpressButton, XpressBadge } from '@/components/ui';
import { VehicleDetail } from '@/features/fleet/components/VehicleDetail';
import { useVehicle, useUpdateVehicleStatus } from '@/features/fleet/hooks/useVehicle';
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  MoreVertical,
  Power,
  Wrench,
  PowerOff,
  UserPlus,
  Trash2,
  History,
  Car,
  Gauge,
  Calendar,
  Clock,
  Activity,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { showSuccess, showError } from '@/lib/stores/ui.store';
import type { VehicleStatus } from '@/types/domain.types';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

// ==================== Status Update Modal ====================
function StatusUpdateModal({ 
  isOpen, 
  onClose, 
  currentStatus,
  onUpdate 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentStatus: string;
  onUpdate: (status: VehicleStatus, reason?: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const statuses: { value: VehicleStatus; label: string; icon: React.ReactNode; description: string; variant: 'active' | 'idle' | 'alert' | 'offline' }[] = [
    { 
      value: 'Active', 
      label: 'Active', 
      icon: <Power className="w-5 h-5" />,
      description: 'Vehicle is operational and ready for trips',
      variant: 'active'
    },
    { 
      value: 'Idle', 
      label: 'Idle', 
      icon: <Power className="w-5 h-5" />,
      description: 'Vehicle is operational but not currently in use',
      variant: 'idle'
    },
    { 
      value: 'Maintenance', 
      label: 'Maintenance', 
      icon: <Wrench className="w-5 h-5" />,
      description: 'Vehicle is undergoing maintenance or repairs',
      variant: 'alert'
    },
    { 
      value: 'Offline', 
      label: 'Offline', 
      icon: <PowerOff className="w-5 h-5" />,
      description: 'Vehicle is temporarily out of service',
      variant: 'offline'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#12121a] border border-white/10 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-white mb-2">
          Update Vehicle Status
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Current status: <span className="text-white font-medium">{currentStatus}</span>
        </p>

        <div className="space-y-2 mb-4">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                selectedStatus === status.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20 bg-white/5'
              )}
            >
              <div className={cn("mt-0.5", selectedStatus === status.value ? 'text-blue-400' : 'text-gray-500')}>
                {status.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={cn("font-medium", selectedStatus === status.value ? 'text-blue-400' : 'text-white')}>
                    {status.label}
                  </p>
                  <XpressBadge variant={status.variant} size="sm">{status.label}</XpressBadge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{status.description}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedStatus && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-400 mb-1.5 block">
              Reason for change (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for status change..."
              className="w-full h-20 px-3 py-2 bg-[#0a0a0f] border border-white/10 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <XpressButton variant="ghost" onClick={onClose}>
            Cancel
          </XpressButton>
          <XpressButton 
            variant="primary" 
            disabled={!selectedStatus || selectedStatus === currentStatus}
            onClick={() => {
              if (selectedStatus) {
                onUpdate(selectedStatus, reason || undefined);
                onClose();
              }
            }}
          >
            Update Status
          </XpressButton>
        </div>
      </div>
    </div>
  );
}

// ==================== Action Menu Dropdown ====================
function ActionMenu({ 
  onStatusClick, 
  onAssignDriver, 
  onViewHistory,
  onDecommission
}: { 
  onStatusClick: () => void;
  onAssignDriver: () => void;
  onViewHistory: () => void;
  onDecommission: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <XpressButton 
        variant="secondary" 
        icon={<MoreVertical className="w-4 h-4" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Actions
      </XpressButton>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#12121a] border border-white/10 rounded-xl shadow-xl z-50 py-1">
            <button
              onClick={() => {
                onStatusClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
            >
              <Power className="w-4 h-4" />
              Update Status
            </button>
            <button
              onClick={() => {
                onAssignDriver();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Assign Driver
            </button>
            <button
              onClick={() => {
                onViewHistory();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
            >
              <History className="w-4 h-4" />
              View History
            </button>
            <div className="border-t border-white/10 my-1" />
            <button
              onClick={() => {
                onDecommission();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Decommission
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== KPI Card Component ====================
interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
}

function KpiCard({ label, value, subtext, icon, color }: KpiCardProps) {
  const colorStyles = {
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={cn(
      "relative rounded-xl border bg-gradient-to-br p-4 overflow-hidden group",
      colorStyles[color]
    )}>
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div className={cn(
          "p-2 rounded-lg bg-current/10",
          color === 'green' && 'text-green-400',
          color === 'blue' && 'text-blue-400',
          color === 'amber' && 'text-amber-400',
          color === 'red' && 'text-red-400',
          color === 'purple' && 'text-purple-400'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ==================== Activity Timeline Component ====================
interface ActivityItem {
  id: string;
  type: 'status' | 'maintenance' | 'assignment' | 'trip';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'trip',
    title: 'Trip Completed',
    description: 'Completed trip from Makati to BGC',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'status',
    title: 'Status Changed',
    description: 'Changed from Idle to Active',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: 'System'
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Service Completed',
    description: 'Regular oil change and tire rotation',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: 'Service Center'
  },
  {
    id: '4',
    type: 'assignment',
    title: 'Driver Assigned',
    description: 'Assigned to Juan Dela Cruz',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    user: 'Admin'
  },
];

function ActivityTimeline() {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'trip': return <Car className="w-4 h-4" />;
      case 'status': return <Activity className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'assignment': return <UserPlus className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'trip': return 'bg-blue-500/20 text-blue-400';
      case 'status': return 'bg-green-500/20 text-green-400';
      case 'maintenance': return 'bg-amber-500/20 text-amber-400';
      case 'assignment': return 'bg-purple-500/20 text-purple-400';
    }
  };

  return (
    <div className="space-y-4">
      {mockActivities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          {/* Icon */}
          <div className="flex flex-col items-center">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getActivityColor(activity.type))}>
              {getActivityIcon(activity.type)}
            </div>
            {index < mockActivities.length - 1 && (
              <div className="w-px flex-1 bg-white/10 my-2" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white">{activity.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
                {activity.user && (
                  <p className="text-xs text-gray-600 mt-1">by {activity.user}</p>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ==================== Main Fleet Detail Page ====================
export default function FleetDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'activity'>('overview');

  const { data: vehicle, isLoading } = useVehicle(vehicleId || '');
  const { mutate: updateStatus } = useUpdateVehicleStatus();

  const handleStatusUpdate = (status: VehicleStatus, reason?: string) => {
    if (!vehicleId) return;
    
    updateStatus(
      { vehicleId, status, reason },
      {
        onSuccess: () => {
          showSuccess(`Vehicle status updated to ${status}`);
        },
        onError: (error: Error) => {
          showError(`Failed to update status: ${error.message}`);
        },
      }
    );
  };

  const handleViewDriver = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
  };

  const handleViewMap = () => {
    showSuccess('Opening map view - Feature coming soon');
    // View on map clicked
  };

  const handleEdit = () => {
    showSuccess('Edit feature coming soon');
    // Edit clicked
  };

  const handleDecommission = () => {
    showError('Decommission feature coming soon');
    // Decommission clicked
  };

  const getStatusVariant = (status: VehicleStatus): 'active' | 'idle' | 'offline' | 'alert' | 'warning' => {
    switch (status) {
      case 'Active': return 'active';
      case 'Idle': return 'idle';
      case 'Maintenance': return 'alert';
      case 'Offline': return 'offline';
      case 'Decommissioned': return 'warning';
      default: return 'offline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link to="/fleet">
            <XpressButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </XpressButton>
          </Link>
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link to="/fleet">
            <XpressButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </XpressButton>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            Vehicle Not Found
          </h1>
        </div>
        <XpressCard className="p-8 text-center">
          <p className="text-gray-500">
            The vehicle you are looking for does not exist or has been removed.
          </p>
          <XpressButton 
            variant="primary" 
            className="mt-4"
            onClick={() => navigate('/fleet')}
          >
            Return to Fleet
          </XpressButton>
        </XpressCard>
      </div>
    );
  }

  const statusVariant = getStatusVariant(vehicle.status);

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/fleet">
          <XpressButton variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Fleet
          </XpressButton>
        </Link>
      </div>

      {/* Vehicle Header Card */}
      <XpressCard>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Vehicle Icon */}
            <div className="w-16 h-16 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Car className="w-8 h-8 text-blue-400" />
            </div>
            
            {/* Vehicle Info */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {vehicle.make || 'Unknown'} {vehicle.model || ''}
                </h1>
                <XpressBadge variant={statusVariant} size="md">
                  {vehicle.status || 'Unknown'}
                </XpressBadge>
              </div>
              <p className="text-lg font-mono text-gray-500 mt-1">
                {vehicle.plateNumber || 'Unknown'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-400">{vehicle.year || 'N/A'}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-400">{vehicle.type || 'Unknown'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <XpressButton 
              variant="secondary" 
              icon={<MapPin className="w-4 h-4" />}
              onClick={handleViewMap}
            >
              View on Map
            </XpressButton>
            <XpressButton 
              variant="secondary" 
              icon={<Edit2 className="w-4 h-4" />}
              onClick={handleEdit}
            >
              Edit
            </XpressButton>
            <ActionMenu
              onStatusClick={() => setShowStatusModal(true)}
              onAssignDriver={() => showSuccess('Assign driver feature coming soon')}
              onViewHistory={() => showSuccess('History feature coming soon')}
              onDecommission={handleDecommission}
            />
          </div>
        </div>
      </XpressCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Current Mileage"
          value={`${(vehicle.maintenance?.mileage || 0).toLocaleString()} km`}
          icon={<Gauge className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          label="Total Trips"
          value={(vehicle.utilization?.tripsCompleted || 0).toLocaleString()}
          subtext={`₱${(vehicle.utilization?.revenueGenerated || 0).toLocaleString()} revenue`}
          icon={<Car className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          label="Last Service"
          value={vehicle.maintenance?.lastService 
            ? format(new Date(vehicle.maintenance.lastService), 'MMM d, yyyy')
            : 'N/A'
          }
          icon={<Calendar className="w-5 h-5" />}
          color="amber"
        />
        <KpiCard
          label="Hours Active"
          value={(vehicle.utilization?.hoursActive || 0).toLocaleString()}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10">
        {(['overview', 'maintenance', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-3 text-sm font-medium capitalize transition-colors relative",
              activeTab === tab 
                ? 'text-blue-400' 
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="col-span-2">
          {activeTab === 'overview' && (
            <VehicleDetail
              vehicleId={vehicle.vehicleId}
              onEdit={handleEdit}
              onViewDriver={handleViewDriver}
              onViewMap={handleViewMap}
            />
          )}
          
          {activeTab === 'maintenance' && (
            <XpressCard title="Maintenance History">
              <div className="space-y-4">
                {(vehicle.maintenance?.serviceHistory || []).length > 0 ? (
                  (vehicle.maintenance?.serviceHistory || [])
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <div key={record.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">{record.type || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">
                              {record.date ? format(new Date(record.date), 'MMM d, yyyy') : 'N/A'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{record.description || 'No description'}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                            <span>{(record.mileage || 0).toLocaleString()} km</span>
                            <span>₱{(record.cost || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No maintenance records found
                  </div>
                )}
              </div>
            </XpressCard>
          )}
          
          {activeTab === 'activity' && (
            <XpressCard title="Recent Activity">
              <ActivityTimeline />
            </XpressCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Assigned Driver */}
          <XpressCard title="Assigned Driver">
            {vehicle.assignedDriver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400 font-medium">
                      {vehicle.assignedDriver.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{vehicle.assignedDriver.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{vehicle.assignedDriver.phone || 'No phone'}</p>
                  </div>
                </div>
                <XpressButton
                  variant="secondary"
                  fullWidth
                  trailingIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => vehicle.assignedDriver?.driverId && handleViewDriver(vehicle.assignedDriver.driverId)}
                >
                  View Profile
                </XpressButton>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No driver assigned</p>
                <XpressButton
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {/* Assign driver clicked */}}
                >
                  Assign Driver
                </XpressButton>
              </div>
            )}
          </XpressCard>

          {/* Quick Stats */}
          <XpressCard title="Quick Stats">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Distance Traveled</span>
                <span className="text-sm text-white">
                  {(vehicle.utilization?.distanceTraveled || 0).toLocaleString()} km
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Service History</span>
                <span className="text-sm text-white">
                  {(vehicle.maintenance?.serviceHistory || []).length} records
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Documents</span>
                <span className="text-sm text-white">
                  {(vehicle.documents || []).length} files
                </span>
              </div>
            </div>
          </XpressCard>

          {/* Next Service */}
          {vehicle.maintenance?.nextServiceDue && (
            <XpressCard 
              title="Next Service Due"
              badge="Upcoming"
              badgeVariant="warning"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {format(new Date(vehicle.maintenance.nextServiceDue), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil((new Date(vehicle.maintenance.nextServiceDue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                </div>
              </div>
            </XpressCard>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        currentStatus={vehicle.status || 'Unknown'}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
