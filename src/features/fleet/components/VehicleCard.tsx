import type { Vehicle, VehicleStatus } from '@/types/domain.types';
import { XpressCard, XpressBadge, XpressButton } from '@/components/ui';
import { Car, Bike, Package, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onViewMap?: () => void;
}

const vehicleTypeIcons: Record<string, React.ReactNode> = {
  'Taxi': <Car className="w-5 h-5" />,
  'Moto': <Bike className="w-5 h-5" />,
  'Delivery': <Package className="w-5 h-5" />,
};

const vehicleTypeColors: Record<string, string> = {
  'Taxi': 'bg-blue-500/20 text-blue-400',
  'Moto': 'bg-green-500/20 text-green-400',
  'Delivery': 'bg-purple-500/20 text-purple-400',
  'Idle': 'bg-amber-500/20 text-amber-400',
};

function getStatusVariant(status: VehicleStatus): 'active' | 'idle' | 'offline' | 'alert' | 'warning' {
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
      return 'offline';
  }
}

export function VehicleCard({ vehicle, onClick, onViewMap }: VehicleCardProps) {
  const statusVariant = getStatusVariant(vehicle.status);
  const typeColor = vehicleTypeColors[vehicle.type] || 'bg-gray-500/20 text-gray-400';
  const typeIcon = vehicleTypeIcons[vehicle.type] || <Car className="w-5 h-5" />;

  // Generate initials from make and model (for future avatar display)
  // const initials = `${vehicle.make.charAt(0)}${vehicle.model.charAt(0)}`.toUpperCase();

  return (
    <XpressCard 
      hoverable 
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="space-y-4">
        {/* Header: Avatar, Name, Status */}
        <div className="flex items-start gap-3">
          {/* Vehicle Avatar */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            typeColor
          )}>
            {typeIcon}
          </div>

          {/* Name and Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {vehicle.make} {vehicle.model}
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {vehicle.plateNumber}
            </p>
          </div>

          {/* Status Badge */}
          <XpressBadge variant={statusVariant} size="sm">
            {vehicle.status}
          </XpressBadge>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Type</p>
            <p className="text-xs text-gray-300 mt-0.5">{vehicle.type}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Year</p>
            <p className="text-xs text-gray-300 mt-0.5">{vehicle.year}</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Mileage</p>
            <p className="text-xs text-gray-300 mt-0.5">
              {(vehicle.maintenance.mileage / 1000).toFixed(0)}k km
            </p>
          </div>
        </div>

        {/* Footer: Last Active + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Updated {format(new Date(vehicle.updatedAt), 'MMM d')}</span>
          </div>

          <div className="flex items-center gap-2">
            {vehicle.currentLocation && (
              <XpressButton
                variant="ghost"
                size="xs"
                icon={<MapPin className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewMap?.();
                }}
              >
                Map
              </XpressButton>
            )}
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
          </div>
        </div>
      </div>
    </XpressCard>
  );
}

export default VehicleCard;
