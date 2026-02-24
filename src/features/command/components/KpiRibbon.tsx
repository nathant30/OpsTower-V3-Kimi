import { cn } from '@/lib/utils/cn';
import type { CommandKPIs } from '@/services/command/command.service';
import {
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
} from 'lucide-react';

interface KpiRibbonProps {
  kpis?: CommandKPIs;
  isLoading?: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtext?: string;
  change?: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';
  isLoading?: boolean;
}

const colorStyles = {
  green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
  blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
  amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
  red: 'from-red-500/20 to-orange-500/5 border-red-500/20 text-red-400',
  purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  cyan: 'from-cyan-500/20 to-teal-500/5 border-cyan-500/20 text-cyan-400',
};

const iconBgStyles = {
  green: 'bg-green-500/10 text-green-400',
  blue: 'bg-blue-500/10 text-blue-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
  purple: 'bg-purple-500/10 text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-400',
};

function KpiCard({ title, value, subtext, change, icon, color, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className={cn(
        "relative h-28 rounded-xl border bg-gradient-to-br p-4 overflow-hidden",
        colorStyles[color]
      )}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative h-28 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group transition-all hover:border-opacity-50",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
          {change !== undefined && (
            <p className={cn(
              "text-xs mt-1 font-medium flex items-center gap-1",
              change >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change >= 0 ? '+' : ''}{change}% <span className="text-gray-500">vs yesterday</span>
            </p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg shrink-0",
          iconBgStyles[color]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KpiRibbon({ kpis, isLoading }: KpiRibbonProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpiData = [
    {
      title: 'Active Orders',
      value: kpis?.activeOrders.toLocaleString() ?? '0',
      subtext: `${((kpis?.activeOrders ?? 0) * 0.7).toFixed(0)} in progress`,
      change: kpis?.activeOrdersChange,
      icon: <Package className="w-5 h-5" />,
      color: 'purple' as const,
    },
    {
      title: 'Online Drivers',
      value: kpis?.onlineDrivers.toLocaleString() ?? '0',
      subtext: `${kpis?.fleetUtilization ?? 0}% fleet utilization`,
      change: kpis?.onlineDriversChange,
      icon: <Users className="w-5 h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Pending Issues',
      value: kpis?.pendingIssues.toLocaleString() ?? '0',
      subtext: 'Require attention',
      change: kpis?.pendingIssuesChange,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(kpis?.revenueToday ?? 0),
      subtext: 'On track for daily target',
      change: kpis?.revenueTodayChange,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green' as const,
    },
    {
      title: 'System Health',
      value: `${kpis?.systemHealth ?? 0}%`,
      subtext: 'All services operational',
      icon: <Server className="w-5 h-5" />,
      color: 'cyan' as const,
    },
    {
      title: 'Avg Response',
      value: `${kpis?.avgResponseTime ?? 0}m`,
      subtext: 'Driver assignment time',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue' as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard key={index} {...kpi} isLoading={isLoading} />
      ))}
    </div>
  );
}

export default KpiRibbon;
