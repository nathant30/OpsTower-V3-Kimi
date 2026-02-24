import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/date';
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface FinanceKpiRibbonProps {
  totalRevenue: number;
  todayEarnings: number;
  pendingPayouts: number;
  walletBalance: number;
  revenueChange?: number;
  earningsChange?: number;
  isLoading?: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtext?: string;
  trend?: number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'purple';
  isLoading?: boolean;
}

function KpiCard({ title, value, subtext, trend, icon, color, isLoading }: KpiCardProps) {
  const colorStyles = {
    green: 'from-green-500/20 to-emerald-500/5 border-green-500/20 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/5 border-blue-500/20 text-blue-400',
    amber: 'from-amber-500/20 to-yellow-500/5 border-amber-500/20 text-amber-400',
    purple: 'from-purple-500/20 to-pink-500/5 border-purple-500/20 text-purple-400',
  };

  if (isLoading) {
    return (
      <div className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <div className={cn(
      "relative h-24 rounded-xl border bg-gradient-to-br p-4 overflow-hidden group",
      colorStyles[color]
    )}>
      {/* Background Glow */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-current opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity" />
      
      <div className="relative flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && (
            <p className="text-[10px] text-gray-500 mt-0.5">{subtext}</p>
          )}
          {trend !== undefined && (
            <p className={cn(
              "text-[10px] mt-0.5 font-medium flex items-center gap-0.5",
              trend >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}% <span className="text-gray-500">vs yesterday</span>
            </p>
          )}
        </div>
        
        <div className={cn(
          "p-2.5 rounded-lg bg-current/10",
          color === 'green' && 'text-green-400',
          color === 'blue' && 'text-blue-400',
          color === 'amber' && 'text-amber-400',
          color === 'purple' && 'text-purple-400'
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function FinanceKpiRibbon({
  totalRevenue,
  todayEarnings,
  pendingPayouts,
  walletBalance,
  revenueChange = 12.5,
  earningsChange = 8.3,
  isLoading
}: FinanceKpiRibbonProps) {
  const kpiData = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtext: 'All time earnings',
      trend: revenueChange,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'green' as const,
    },
    {
      title: "Today's Earnings",
      value: formatCurrency(todayEarnings),
      subtext: 'Last 24 hours',
      trend: earningsChange,
      icon: <Wallet className="w-5 h-5" />,
      color: 'blue' as const,
    },
    {
      title: 'Pending Payouts',
      value: formatCurrency(pendingPayouts),
      subtext: 'awaiting processing',
      icon: <Clock className="w-5 h-5" />,
      color: 'amber' as const,
    },
    {
      title: 'Wallet Balance',
      value: formatCurrency(walletBalance),
      subtext: 'across all drivers',
      icon: <PiggyBank className="w-5 h-5" />,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <KpiCard key={index} {...kpi} isLoading={isLoading} />
      ))}
    </div>
  );
}

export default FinanceKpiRibbon;
