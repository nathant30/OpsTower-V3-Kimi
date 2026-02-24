import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { useDrivers } from '@/features/drivers/hooks/useDrivers';
import { useLiveMapDrivers } from '@/features/dashboard/hooks/useLiveMapOrders';
import type { Driver } from '@/types/domain.types';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  AlertTriangle,
  Navigation,
  Coffee,
  Car,
  Bike,
  Package
} from 'lucide-react';

interface StatusItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'red' | 'gray' | 'blue' | 'purple';
  trend?: number;
  subtext?: string;
}

function StatusItem({ label, value, icon, color, trend, subtext }: StatusItemProps) {
  const colorClasses = {
    green: 'text-xpress-status-active bg-xpress-status-active/10',
    amber: 'text-xpress-status-idle bg-xpress-status-idle/10',
    red: 'text-xpress-status-alert bg-xpress-status-alert/10',
    gray: 'text-xpress-text-muted bg-xpress-text-muted/10',
    blue: 'text-xpress-accent-blue bg-xpress-accent-blue/10',
    purple: 'text-xpress-accent-purple bg-xpress-accent-purple/10',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-xpress-bg-secondary/50 hover:bg-xpress-bg-secondary transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-md', colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-xpress-text-primary group-hover:text-xpress-accent-blue transition-colors">
            {value}
          </p>
          <p className="text-xs text-xpress-text-secondary">{label}</p>
          {subtext && (
            <p className="text-xs text-xpress-text-muted">{subtext}</p>
          )}
        </div>
      </div>
      {trend !== undefined && (
        <span className={cn(
          'text-xs font-medium',
          trend >= 0 ? 'text-xpress-status-active' : 'text-xpress-status-alert'
        )}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}

interface VehicleTypeItemProps {
  type: string;
  count: number;
  active: number;
  icon: React.ReactNode;
}

function VehicleTypeItem({ type, count, active, icon }: VehicleTypeItemProps) {
  const utilization = count > 0 ? Math.round((active / count) * 100) : 0;
  
  return (
    <div className="flex items-center justify-between p-2 rounded-md bg-xpress-bg-secondary/30">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-xpress-bg-elevated text-xpress-text-secondary">
          {icon}
        </div>
        <span className="text-sm text-xpress-text-secondary">{type}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-xpress-text-primary">
          {active}/{count}
        </span>
        <div className="w-12 h-1.5 bg-xpress-bg-elevated rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full',
              utilization >= 70 ? 'bg-xpress-status-active' :
              utilization >= 40 ? 'bg-xpress-status-idle' :
              'bg-xpress-status-alert'
            )}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Mock fleet data fallback
const mockFleetData = {
  activeDrivers: 156,
  idleDrivers: 42,
  offlineDrivers: 23,
  suspendedDrivers: 3,
  onTripDrivers: 89,
  onBreakDrivers: 12,
  vehicleTypeStats: {
    Taxi: { total: 89, active: 67 },
    Moto: { total: 102, active: 78 },
    Delivery: { total: 33, active: 11 },
  }
};

export function FleetStatusPanel() {
  const { data: driversResponse } = useDrivers({ pageSize: 100 });
  const drivers = driversResponse?.items ?? [];
  const { data: liveDriversData } = useLiveMapDrivers();

  // Calculate stats from drivers - fallback to mock data if empty
  const hasRealData = drivers.length > 0;
  
  const activeDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.status === 'Active').length 
    : mockFleetData.activeDrivers;
  const idleDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.status === 'Idle').length 
    : mockFleetData.idleDrivers;
  const offlineDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.status === 'Offline').length 
    : mockFleetData.offlineDrivers;
  const suspendedDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.status === 'Suspended').length 
    : mockFleetData.suspendedDrivers;
  const onTripDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.onlineStatus === 'OnTrip').length 
    : mockFleetData.onTripDrivers;
  const onBreakDrivers = hasRealData 
    ? drivers.filter((d: Driver) => d.shift?.isOnBreak).length 
    : mockFleetData.onBreakDrivers;

  // Calculate by vehicle type from live map data
  const liveDrivers = liveDriversData?.drivers || [];
  const vehicleTypeStats = hasRealData ? {
    Taxi: { total: 0, active: 0 },
    Moto: { total: 0, active: 0 },
    Delivery: { total: 0, active: 0 },
  } : mockFleetData.vehicleTypeStats;
  
  if (hasRealData) {
    liveDrivers.forEach(driver => {
      const type = driver.vehicleType as keyof typeof vehicleTypeStats;
      if (vehicleTypeStats[type]) {
        vehicleTypeStats[type].total++;
        if (driver.status === 'OnTrip' || driver.status === 'Online') {
          vehicleTypeStats[type].active++;
        }
      }
    });
  }

  const isLoading = false; // Always show data, never show skeleton

  if (isLoading) {
    return (
      <div className="xpress-card p-4 h-full">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-xpress-bg-elevated rounded w-1/2" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-xpress-bg-elevated rounded" />
          ))}
        </div>
      </div>
    );
  }

  const utilizationRate = drivers.length > 0 
    ? Math.round((activeDrivers / drivers.length) * 100) 
    : 0;

  return (
    <div className="xpress-card p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xpress-text-primary flex items-center gap-2">
          <Users className="w-4 h-4 text-xpress-accent-blue" />
          Fleet Status
        </h3>
        <Badge variant="active">Live</Badge>
      </div>

      {/* Status Grid */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        <StatusItem
          label="Active Drivers"
          value={activeDrivers}
          icon={<UserCheck className="w-4 h-4" />}
          color="green"
          trend={5.2}
          subtext={`${onTripDrivers} on trip`}
        />
        
        <StatusItem
          label="On Trip"
          value={onTripDrivers}
          icon={<Navigation className="w-4 h-4" />}
          color="blue"
          subtext="Currently serving orders"
        />
        
        <StatusItem
          label="Idle / Available"
          value={idleDrivers}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
          trend={-2.1}
          subtext="Ready for assignment"
        />
        
        <StatusItem
          label="On Break"
          value={onBreakDrivers}
          icon={<Coffee className="w-4 h-4" />}
          color="gray"
          subtext="Temporarily unavailable"
        />
        
        <StatusItem
          label="Offline"
          value={offlineDrivers}
          icon={<UserX className="w-4 h-4" />}
          color="gray"
          subtext="Not logged in"
        />
        
        <StatusItem
          label="Suspended"
          value={suspendedDrivers}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="red"
          subtext="Requires attention"
        />

        {/* Divider */}
        <div className="border-t border-xpress-border my-3" />

        {/* Vehicle Type Breakdown */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-xpress-text-muted uppercase tracking-wider mb-2">
            By Vehicle Type
          </p>
          <VehicleTypeItem
            type="Taxi"
            count={vehicleTypeStats.Taxi.total}
            active={vehicleTypeStats.Taxi.active}
            icon={<Car className="w-3.5 h-3.5" />}
          />
          <VehicleTypeItem
            type="Moto"
            count={vehicleTypeStats.Moto.total}
            active={vehicleTypeStats.Moto.active}
            icon={<Bike className="w-3.5 h-3.5" />}
          />
          <VehicleTypeItem
            type="Delivery"
            count={vehicleTypeStats.Delivery.total}
            active={vehicleTypeStats.Delivery.active}
            icon={<Package className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-xpress-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-xpress-text-secondary">Total Drivers</span>
          <span className="font-semibold text-xpress-text-primary">{drivers.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-xpress-text-secondary">Live Map Drivers</span>
          <span className="font-semibold text-xpress-text-primary">{liveDrivers.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-xpress-text-secondary">Utilization Rate</span>
          <span className={cn(
            'font-semibold',
            utilizationRate >= 70 ? 'text-xpress-status-active' :
            utilizationRate >= 40 ? 'text-xpress-status-idle' :
            'text-xpress-status-alert'
          )}>
            {utilizationRate}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-xpress-bg-elevated rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-500',
              utilizationRate >= 70 ? 'bg-xpress-status-active' :
              utilizationRate >= 40 ? 'bg-xpress-status-idle' :
              'bg-xpress-status-alert'
            )}
            style={{ width: `${utilizationRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default FleetStatusPanel;
