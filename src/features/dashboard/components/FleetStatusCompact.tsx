import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { 
  Users, 
  Car,
  Zap,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface StatusRowProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { value: number; positive: boolean };
  color?: 'green' | 'blue' | 'amber' | 'red';
  onClick?: () => void;
}

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
        "flex items-center justify-between py-2 border-b border-white/5 last:border-0",
        onClick && "cursor-pointer hover:bg-white/5 rounded px-2 -mx-2 transition-colors"
      )}
    >
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        {subtext && <p className="text-[10px] text-gray-600">{subtext}</p>}
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold", colorStyles[color])}>{value}</p>
        {trend && (
          <p className={cn("text-[10px]", trend.positive ? "text-green-400" : "text-red-400")}>
            {trend.positive ? '+' : ''}{trend.value}%
          </p>
        )}
      </div>
    </div>
  );
}

export function FleetStatusCompact() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Main Stats Card */}
      <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
        <div 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-between mb-4 cursor-pointer group"
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            <Users className="w-4 h-4 text-blue-400" />
            Fleet Status
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
            value="1,108" 
            subtext="+12% vs last week"
            trend={{ value: 12, positive: true }}
            color="blue"
            onClick={() => navigate('/fleet')}
          />
          <StatusRow 
            label="Active Drivers" 
            value="788" 
            trend={{ value: 5.2, positive: true }}
            color="green"
            onClick={() => navigate('/drivers')}
          />
          <StatusRow 
            label="Idle Drivers" 
            value="312" 
            trend={{ value: -2.1, positive: false }}
            color="amber"
            onClick={() => navigate('/drivers')}
          />
          <StatusRow 
            label="Supply Gap Zones" 
            value="4" 
            color="red"
            onClick={() => navigate('/fleet')}
          />
          <StatusRow 
            label="Live Incidents" 
            value="5" 
            color="red"
            onClick={() => navigate('/incidents')}
          />
        </div>
      </div>

      {/* Vehicle Distribution */}
      <div 
        onClick={() => navigate('/fleet')}
        className="bg-[#12121a] border border-white/10 rounded-xl p-4 flex-1 cursor-pointer hover:border-white/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-purple-400" />
            Vehicle Distribution
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </div>

        <div className="space-y-3">
          {[
            { type: 'Toyota RAV4 Hybrid', count: 234, color: 'bg-blue-500', percent: 45 },
            { type: 'Honda City', count: 189, color: 'bg-green-500', percent: 35 },
            { type: 'Moto Courier', count: 156, color: 'bg-amber-500', percent: 25 },
            { type: 'Delivery Van', count: 89, color: 'bg-purple-500', percent: 15 },
          ].map((vehicle) => (
            <div key={vehicle.type} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  {vehicle.type}
                </span>
                <span className="text-white font-medium">{vehicle.count}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", vehicle.color)}
                  style={{ width: `${vehicle.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Deploy Fleet
        </button>
        <button 
          onClick={() => navigate('/fleet')}
          className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          Zone View
        </button>
      </div>

      {/* Alert Banner */}
      <div 
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
      >
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-red-400 font-medium">4 Critical Alerts</p>
          <p className="text-[10px] text-red-400/70 truncate">Requires immediate attention</p>
        </div>
        <TrendingUp className="w-4 h-4 text-red-400" />
      </div>
    </div>
  );
}
