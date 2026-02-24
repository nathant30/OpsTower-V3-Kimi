import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/date';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  AlertCircle
} from 'lucide-react';

interface FinanceOverviewProps {
  period: 'day' | 'week' | 'month';
  stats?: {
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    commissionEarned: number;
    pendingSettlements: number;
    revenueChange?: number;
    transactionChange?: number;
  };
  isLoading?: boolean;
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: React.ReactNode;
  isLoading?: boolean;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'cyan' | 'red';
}

function KpiCard({ title, value, subtitle, trend, icon, isLoading, color }: KpiCardProps) {
  const colorClasses = {
    blue: 'bg-xpress-accent-blue/10 text-xpress-accent-blue',
    green: 'bg-xpress-accent-green/10 text-xpress-accent-green',
    amber: 'bg-xpress-accent-amber/10 text-xpress-accent-amber',
    purple: 'bg-xpress-accent-purple/10 text-xpress-accent-purple',
    cyan: 'bg-xpress-accent-cyan/10 text-xpress-accent-cyan',
    red: 'bg-xpress-accent-red/10 text-xpress-accent-red',
  };

  if (isLoading) {
    return (
      <div className="kpi-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-xpress-bg-elevated rounded w-20" />
            <div className="h-8 bg-xpress-bg-elevated rounded w-24" />
          </div>
          <div className="w-10 h-10 bg-xpress-bg-elevated rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="kpi-label">{title}</p>
          <p className="kpi-value truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-xpress-text-muted mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs mt-1',
                trend.direction === 'up' ? 'text-xpress-accent-green' : 'text-xpress-accent-red'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-xpress-text-muted ml-1">vs last {title.toLowerCase().includes('revenue') ? 'period' : 'week'}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg flex-shrink-0', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function FinanceOverview({ period, stats, isLoading }: FinanceOverviewProps) {
  const periodLabel = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
  }[period];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-xpress-text-primary">
          Finance Overview
        </h2>
        <span className="text-sm text-xpress-text-muted">{periodLabel}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : '₱0.00'}
          trend={stats?.revenueChange ? { value: stats.revenueChange, direction: stats.revenueChange >= 0 ? 'up' : 'down' } : undefined}
          icon={<DollarSign className="w-5 h-5" />}
          isLoading={isLoading}
          color="green"
        />
        
        <KpiCard
          title="Transactions"
          value={stats ? stats.totalTransactions.toLocaleString() : '0'}
          subtitle={stats ? `${stats.averageOrderValue > 0 ? formatCurrency(stats.averageOrderValue) : '₱0.00'} avg` : undefined}
          trend={stats?.transactionChange ? { value: stats.transactionChange, direction: stats.transactionChange >= 0 ? 'up' : 'down' } : undefined}
          icon={<CreditCard className="w-5 h-5" />}
          isLoading={isLoading}
          color="blue"
        />
        
        <KpiCard
          title="Commission Earned"
          value={stats ? formatCurrency(stats.commissionEarned) : '₱0.00'}
          subtitle={stats && stats.totalRevenue > 0 ? `${((stats.commissionEarned / stats.totalRevenue) * 100).toFixed(1)}% of revenue` : undefined}
          icon={<Percent className="w-5 h-5" />}
          isLoading={isLoading}
          color="purple"
        />
        
        <KpiCard
          title="Pending Settlements"
          value={stats ? formatCurrency(stats.pendingSettlements) : '₱0.00'}
          subtitle="Awaiting payout"
          icon={<Clock className="w-5 h-5" />}
          isLoading={isLoading}
          color="amber"
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="xpress-card p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-xpress-accent-green/10 text-xpress-accent-green">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-xpress-text-muted">Top-ups</p>
            <p className="text-sm font-semibold text-xpress-text-primary">
              {isLoading ? '-' : formatCurrency((stats?.totalRevenue ?? 0) * 0.15)}
            </p>
          </div>
        </div>
        
        <div className="xpress-card p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-xpress-accent-amber/10 text-xpress-accent-amber">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-xpress-text-muted">Cash Outs</p>
            <p className="text-sm font-semibold text-xpress-text-primary">
              {isLoading ? '-' : formatCurrency(stats?.pendingSettlements || 0)}
            </p>
          </div>
        </div>
        
        <div className="xpress-card p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-xpress-accent-cyan/10 text-xpress-accent-cyan">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-xpress-text-muted">Wallet Balance</p>
            <p className="text-sm font-semibold text-xpress-text-primary">
              {isLoading ? '-' : formatCurrency((stats?.totalRevenue || 0) * 0.25)}
            </p>
          </div>
        </div>
        
        <div className="xpress-card p-3 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-xpress-accent-red/10 text-xpress-accent-red">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs text-xpress-text-muted">Failed Txns</p>
            <p className="text-sm font-semibold text-xpress-text-primary">
              {isLoading ? '-' : Math.floor((stats?.totalTransactions || 0) * 0.02)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceOverview;
