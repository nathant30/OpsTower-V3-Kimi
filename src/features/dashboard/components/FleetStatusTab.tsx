import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { 
  Users, 
  Zap,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Activity
} from 'lucide-react';

interface FleetStatusTabProps {
  serviceType?: string;
}

interface StatusRowProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; positive: boolean };
  color?: 'green' | 'blue' | 'amber' | 'red';
  onClick?: () => void;
}

// Mock data by service type
const fleetDataByService: Record<string, {
  totalVehicles: string;
  activeDrivers: string;
  idleDrivers: string;
  supplyGapZones: number;
  liveIncidents: number;
  fleetUtilization: string;
  avgDeliveryTime: string;
  criticalAlerts: number;
}> = {
  'All': {
    totalVehicles: '1,108',
    activeDrivers: '788',
    idleDrivers: '312',
    supplyGapZones: 4,
    liveIncidents: 5,
    fleetUtilization: '71.1%',
    avgDeliveryTime: '24 min',
    criticalAlerts: 4,
  },
  'TNVS': {
    totalVehicles: '408',
    activeDrivers: '312',
    idleDrivers: '88',
    supplyGapZones: 2,
    liveIncidents: 2,
    fleetUtilization: '76.5%',
    avgDeliveryTime: '22 min',
    criticalAlerts: 2,
  },
  'TWG': {
    totalVehicles: '323',
    activeDrivers: '245',
    idleDrivers: '72',
    supplyGapZones: 1,
    liveIncidents: 1,
    fleetUtilization: '75.8%',
    avgDeliveryTime: '23 min',
    criticalAlerts: 1,
  },
  '2W Salary': {
    totalVehicles: '215',
    activeDrivers: '142',
    idleDrivers: '68',
    supplyGapZones: 1,
    liveIncidents: 2,
    fleetUtilization: '66.0%',
    avgDeliveryTime: '28 min',
    criticalAlerts: 1,
  },
  '4W Salary': {
    totalVehicles: '98',
    activeDrivers: '67',
    idleDrivers: '28',
    supplyGapZones: 0,
    liveIncidents: 0,
    fleetUtilization: '68.4%',
    avgDeliveryTime: '26 min',
    criticalAlerts: 0,
  },
  '4W Taxi': {
    totalVehicles: '31',
    activeDrivers: '22',
    idleDrivers: '8',
    supplyGapZones: 0,
    liveIncidents: 0,
    fleetUtilization: '71.0%',
    avgDeliveryTime: '18 min',
    criticalAlerts: 0,
  },
};

function StatusRow({ label, value, subtext, trend, color = 'green', onClick }: StatusRowProps) {
  const colorStyles = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-3 border-b border-white/5 last:border-0",
        onClick && "cursor-pointer hover:bg-white/5 rounded px-2 -mx-2 transition-colors"
      )}
    >
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        {subtext && <p className="text-xs text-gray-600">{subtext}</p>}
      </div>
      <div className="text-right">
        <p className={cn("text-lg font-semibold", colorStyles[color])}>{value}</p>
        {trend && (
          <p className={cn("text-xs", trend.positive ? "text-green-400" : "text-red-400")}>
            {trend.positive ? '+' : ''}{trend.value}%
          </p>
        )}
      </div>
    </div>
  );
}

export function FleetStatusTab({ serviceType = 'All' }: FleetStatusTabProps) {
  const navigate = useNavigate();
  const data = fleetDataByService[serviceType] || fleetDataByService['All'];

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <div 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-between mb-4 cursor-pointer group"
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            <Users className="w-4 h-4 text-blue-400" />
            Fleet Status {serviceType !== 'All' && `• ${serviceType}`}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">LIVE</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
          </div>
        </div>

        <div className="space-y-1">
          <StatusRow 
            label="Total Vehicles" 
            value={data.totalVehicles} 
            subtext="+12% vs last week"
            trend={{ value: 12, positive: true }}
            color="blue"
            onClick={() => navigate('/fleet')}
          />
          <StatusRow 
            label="Active Drivers" 
            value={data.activeDrivers} 
            trend={{ value: 5.2, positive: true }}
            color="green"
            onClick={() => navigate('/drivers')}
          />
          <StatusRow 
            label="Idle Drivers" 
            value={data.idleDrivers} 
            trend={{ value: -2.1, positive: false }}
            color="amber"
            onClick={() => navigate('/drivers')}
          />
          <StatusRow 
            label="Supply Gap Zones" 
            value={data.supplyGapZones} 
            color="red"
            onClick={() => navigate('/fleet')}
          />
          <StatusRow 
            label="Live Incidents" 
            value={data.liveIncidents} 
            color="red"
            onClick={() => navigate('/incidents')}
          />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Fleet Utilization</p>
              <p className="text-xl font-bold text-white">{data.fleetUtilization}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Avg Delivery Time</p>
              <p className="text-xl font-bold text-white">{data.avgDeliveryTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Deploy Fleet
        </button>
        <button 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Zone View
        </button>
      </div>

      {/* Alert Banner - only show if there are alerts */}
      {data.criticalAlerts > 0 && (
        <div 
          onClick={() => navigate('/incidents')}
          className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-400 font-medium">{data.criticalAlerts} Critical Alerts</p>
            <p className="text-[10px] text-red-400/70 truncate">Requires immediate attention</p>
          </div>
          <TrendingUp className="w-4 h-4 text-red-400" />
        </div>
      )}
    </div>
  );
}
