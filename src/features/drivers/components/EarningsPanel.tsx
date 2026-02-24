import { cn } from '@/lib/utils/cn';
import type { DriverEarnings } from '@/types/domain.types';
import type { DriverWalletInfo, EarningsBreakdown } from '../hooks/useDriverWallet';
import { formatWalletBalance } from '../hooks/useDriverWallet';
import { Wallet, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ==================== TYPES ====================

interface EarningsPanelProps {
  earnings: DriverEarnings;
  wallet?: DriverWalletInfo | null;
  breakdown?: EarningsBreakdown | null;
  className?: string;
}

// ==================== COLORS ====================

const COLORS = {
  grid: '#2a2a45',
  text: '#6b7280',
  active: '#10b981',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  idle: '#f59e0b',
};

// ==================== MAIN PANEL ====================

export function EarningsPanel({ earnings, wallet, breakdown, className }: EarningsPanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <EarningsCard
          label="Total Earnings"
          value={earnings.totalEarnings}
          icon={<DollarSign className="w-4 h-4" />}
          color="blue"
        />
        <EarningsCard
          label="Current Balance"
          value={wallet?.balance.available ?? earnings.currentBalance}
          icon={<Wallet className="w-4 h-4" />}
          color="green"
          subtext={wallet ? `+${formatWalletBalance(wallet.balance.pending)} pending` : undefined}
        />
        <EarningsCard
          label="Avg per Trip"
          value={earnings.averagePerTrip}
          icon={<TrendingUp className="w-4 h-4" />}
          color="purple"
        />
        <EarningsCard
          label="Avg per Hour"
          value={earnings.averagePerHour}
          icon={<Clock className="w-4 h-4" />}
          color="cyan"
        />
      </div>

      {/* Detailed Breakdown */}
      {breakdown && (
        <div className="bg-xpress-bg-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-4">
            Earnings Breakdown
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <BreakdownItem
              label="Trip Earnings"
              value={breakdown.breakdown.tripEarnings}
              color="bg-xpress-accent-blue"
            />
            <BreakdownItem
              label="Surge Earnings"
              value={breakdown.breakdown.surgeEarnings}
              color="bg-xpress-accent-purple"
            />
            <BreakdownItem
              label="Incentives"
              value={breakdown.breakdown.incentives}
              color="bg-xpress-accent-green"
            />
            <BreakdownItem
              label="Adjustments"
              value={breakdown.breakdown.adjustments}
              color="bg-xpress-status-idle"
              negative={breakdown.breakdown.adjustments < 0}
            />
            <BreakdownItem
              label="Deductions"
              value={-breakdown.breakdown.deductions}
              color="bg-xpress-status-alert"
              negative
            />
            <div className="p-3 bg-xpress-bg-tertiary rounded border border-xpress-border">
              <p className="text-xs text-xpress-text-muted">Net Earnings</p>
              <p className="text-lg font-bold text-xpress-status-active">
                {formatWalletBalance(breakdown.breakdown.netEarnings)}
              </p>
            </div>
          </div>

          {/* Daily Earnings Chart */}
          {breakdown.byDay && breakdown.byDay.length > 0 && (
            <div className="mt-4 pt-4 border-t border-xpress-border">
              <h5 className="text-xs text-xpress-text-muted mb-3">Daily Earnings</h5>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown.byDay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: COLORS.text, fontSize: 10 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                      axisLine={{ stroke: COLORS.grid }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: COLORS.text, fontSize: 10 }}
                      tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                      axisLine={{ stroke: COLORS.grid }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-xpress-bg-tertiary border border-xpress-border rounded p-2 text-xs">
                              <p className="text-xpress-text-secondary">
                                {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-xpress-text-primary font-semibold">
                                {formatWalletBalance(data.earnings)}
                              </p>
                              <p className="text-xpress-text-muted">
                                {data.trips} trips • {data.onlineHours.toFixed(1)} hrs
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
                      {breakdown.byDay.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.blue} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wallet Stats */}
      {wallet?.stats && (
        <div className="bg-xpress-bg-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
            Wallet Summary
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <WalletStat label="Total Earned" value={wallet.stats.totalEarned} />
            <WalletStat label="Total Withdrawn" value={wallet.stats.totalWithdrawn} />
            <WalletStat label="This Week" value={wallet.stats.thisWeekEarnings} positive />
            <WalletStat label="This Month" value={wallet.stats.thisMonthEarnings} positive />
          </div>
        </div>
      )}

      {/* Additional Info */}
      {(earnings.pendingSettlement > 0 || earnings.lastPayoutDate) && (
        <div className="bg-xpress-bg-secondary rounded-lg p-4">
          <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">
            Settlement Info
          </h4>
          <div className="space-y-2">
            {earnings.pendingSettlement > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-xpress-text-muted">Pending Settlement</span>
                <span className="text-sm font-medium text-xpress-status-idle">
                  {formatWalletBalance(earnings.pendingSettlement)}
                </span>
              </div>
            )}
            {earnings.lastPayoutDate && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-xpress-text-muted">Last Payout</span>
                <span className="text-sm text-xpress-text-primary">
                  {new Date(earnings.lastPayoutDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

interface EarningsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'cyan';
  subtext?: string;
}

function EarningsCard({ label, value, icon, color, subtext }: EarningsCardProps) {
  const colorClasses = {
    blue: 'bg-xpress-accent-blue/10 text-xpress-accent-blue',
    green: 'bg-xpress-status-active/10 text-xpress-status-active',
    purple: 'bg-xpress-accent-purple/10 text-xpress-accent-purple',
    cyan: 'bg-xpress-accent-cyan/10 text-xpress-accent-cyan',
  };

  return (
    <div className="bg-xpress-bg-secondary rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-xpress-text-muted">{label}</span>
        <div className={cn('p-1.5 rounded', colorClasses[color])}>
          {icon}
        </div>
      </div>
      <p className="text-lg font-bold text-xpress-text-primary">
        {formatWalletBalance(value)}
      </p>
      {subtext && (
        <p className="text-xs text-xpress-text-muted mt-0.5">{subtext}</p>
      )}
    </div>
  );
}

interface BreakdownItemProps {
  label: string;
  value: number;
  color: string;
  negative?: boolean;
}

function BreakdownItem({ label, value, color, negative }: BreakdownItemProps) {
  return (
    <div className="p-3 bg-xpress-bg-tertiary rounded">
      <div className="flex items-center gap-2 mb-1">
        <div className={cn('w-2 h-2 rounded-full', color)} />
        <span className="text-xs text-xpress-text-muted">{label}</span>
      </div>
      <p className={cn('text-sm font-semibold', negative ? 'text-xpress-status-alert' : 'text-xpress-text-primary')}>
        {negative && value >= 0 ? '-' : ''}{formatWalletBalance(Math.abs(value))}
      </p>
    </div>
  );
}

interface WalletStatProps {
  label: string;
  value: number;
  positive?: boolean;
}

function WalletStat({ label, value, positive }: WalletStatProps) {
  return (
    <div className="p-2 bg-xpress-bg-tertiary rounded">
      <p className="text-xs text-xpress-text-muted mb-1">{label}</p>
      <p className={cn('text-sm font-semibold', positive && value > 0 ? 'text-xpress-status-active' : 'text-xpress-text-primary')}>
        {formatWalletBalance(value)}
      </p>
    </div>
  );
}

// ==================== COMPACT VERSION ====================

interface EarningsCompactProps {
  earnings: DriverEarnings;
  className?: string;
}

export function EarningsCompact({ earnings, className }: EarningsCompactProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <CompactStat label="Total" value={earnings.totalEarnings} />
      <CompactStat label="Balance" value={earnings.currentBalance} />
      <CompactStat label="Per Trip" value={earnings.averagePerTrip} />
      <CompactStat label="Per Hour" value={earnings.averagePerHour} />
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-2 bg-xpress-bg-secondary rounded">
      <p className="text-xs text-xpress-text-muted">{label}</p>
      <p className="text-sm font-semibold text-xpress-text-primary">
        ₱{value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
      </p>
    </div>
  );
}

export default EarningsPanel;
