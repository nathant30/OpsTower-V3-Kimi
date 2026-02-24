import { cn } from '@/lib/utils/cn';
import type { DashboardStats } from '@/types/domain.types';
import { 
  TrendingUp, 
  Activity, 
  Package, 
  Car,
  AlertTriangle
} from 'lucide-react';

interface KpiRibbonProps {
  stats?: DashboardStats;
}

interface KpiCardProps {
  title: string;
  shortTitle: string;
  value: string;
  subtext?: string;
  shortSubtext?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple';
}

// Fallback stats when API is loading or fails
const fallbackStats: Partial<DashboardStats> = {
  revenuePerHour: 2847,
  totalRevenue: 68256,
  fleetUtilization: 71,
  activeVehicles: 788,
  totalVehicles: 1108,
  activeOrders: 156,
  completedOrders: 1247,
  idleVehicles: 312,
  inMaintenance: 23,
};

function KpiCard({ title, shortTitle, value, subtext, shortSubtext, trend, icon, color }: KpiCardProps) {
  const colorStyles = {
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={cn(
      "relative h-20 sm:h-24 rounded-xl border bg-gradient-to-br p-3 sm:p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            <span className="sm:hidden">{shortTitle}</span>
            <span className="hidden sm:inline">{title}</span>
          </p>
          <p className="text-lg sm:text-2xl font-bold text-white mt-1 truncate">{value}</p>
          {subtext && (
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
              <span className="sm:hidden">{shortSubtext || subtext}</span>
              <span className="hidden sm:inline">{subtext}</span>
            </p>
          )}
          {trend !== undefined && (
            <p className={cn(
              "text-[10px] sm:text-xs mt-1 font-medium hidden sm:block",
              trend >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {trend >= 0 ? '+' : ''}{trend}% <span className="text-gray-500">vs yesterday</span>
            </p>
          )}
        </div>
        
        <div className={cn(
          "p-2 sm:p-2.5 rounded-lg bg-current/10 shrink-0",
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

export function KpiRibbon({ stats }: KpiRibbonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Use provided stats or fallback - always show data immediately
  const data = stats?.totalRevenue ? stats : fallbackStats as DashboardStats;

  const kpiData = [
    {
      title: 'Revenue/Hr',
      shortTitle: 'Rev/Hr',
      value: formatCurrency(data.revenuePerHour || 0),
      subtext: `${formatCurrency(data.totalRevenue || 0)} total today`,
      shortSubtext: `${formatCurrency(data.totalRevenue || 0)} today`,
      trend: 12.5,
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'green' as const,
    },
    {
      title: 'Fleet Utilization',
      shortTitle: 'Fleet %',
      value: `${data.fleetUtilization || 0}%`,
      subtext: `${data.activeVehicles || 0} / ${data.totalVehicles || 0} vehicles`,
      shortSubtext: `${data.activeVehicles || 0}/${data.totalVehicles || 0} vehicles`,
      trend: 8.2,
      icon: <Activity className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Active Orders',
      shortTitle: 'Active',
      value: (data.activeOrders || 0).toLocaleString(),
      subtext: `${(data.completedOrders || 0).toLocaleString()} completed`,
      shortSubtext: `${(data.completedOrders || 0).toLocaleString()} done`,
      trend: -3.1,
      icon: <Package className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'purple' as const,
    },
    {
      title: 'Idle Vehicles',
      shortTitle: 'Idle',
      value: (data.idleVehicles || 0).toString(),
      subtext: `${data.inMaintenance || 0} in maintenance`,
      shortSubtext: `${data.inMaintenance || 0} maint.`,
      icon: <Car className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Incident Rate',
      shortTitle: 'Incidents',
      value: '8.9%',
      subtext: '4 critical alerts',
      shortSubtext: '4 critical',
      trend: -2.4,
      icon: <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard key={index} {...kpi} />
      ))}
    </div>
  );
}

export default KpiRibbon;
