/**
 * TierDistributionChart Component
 * Displays driver tier distribution as a bar chart
 */

import { cn } from '@/lib/utils/cn';
import type { TierDistribution } from '@/features/tiers/types';
import { Users, Trophy } from 'lucide-react';

interface TierDistributionChartProps {
  distribution: TierDistribution[];
  totalDrivers: number;
  isLoading?: boolean;
  className?: string;
}

const tierLabels: Record<string, string> = {
  'Bronze': 'Bronze',
  'Silver': 'Silver',
  'Gold': 'Gold',
  'Platinum': 'Platinum',
  'Diamond': 'Diamond',
};

export function TierDistributionChart({
  distribution,
  totalDrivers,
  isLoading = false,
  className,
}: TierDistributionChartProps) {
  // Sort by tier order
  const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const sortedDistribution = [...distribution].sort(
    (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
  );

  if (isLoading) {
    return (
      <div className={cn(
        "bg-[#12121a] border border-white/10 rounded-xl p-4",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
              <div className="flex-1 h-6 bg-white/5 rounded animate-pulse" />
              <div className="w-12 h-4 bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (sortedDistribution.length === 0) {
    return (
      <div className={cn(
        "bg-[#12121a] border border-white/10 rounded-xl p-4",
        className
      )}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Tier Distribution</h3>
            <p className="text-xs text-gray-500">Drivers by tier level</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="w-10 h-10 text-gray-600 mb-2" />
          <p className="text-sm text-gray-400">No driver data available</p>
          <p className="text-xs text-gray-600 mt-1">Tier distribution will appear here</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...sortedDistribution.map(d => d.count));

  return (
    <div className={cn(
      "bg-[#12121a] border border-white/10 rounded-xl p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Tier Distribution</h3>
            <p className="text-xs text-gray-500">{totalDrivers.toLocaleString()} total drivers</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-2">
        {sortedDistribution.map((tier) => {
          const barWidth = maxCount > 0 ? (tier.count / maxCount) * 100 : 0;
          
          return (
            <div key={tier.tier} className="group">
              <div className="flex items-center gap-3">
                {/* Tier Label */}
                <span className="w-16 text-xs font-medium text-gray-400 shrink-0">
                  {tierLabels[tier.tier] || tier.tier}
                </span>

                {/* Bar Container */}
                <div className="flex-1 h-7 bg-black/30 rounded-lg overflow-hidden relative">
                  {/* Bar */}
                  <div
                    className="h-full rounded-lg transition-all duration-500 ease-out flex items-center"
                    style={{
                      width: `${Math.max(barWidth, 5)}%`,
                      backgroundColor: tier.color,
                      opacity: 0.8,
                    }}
                  >
                    {/* Count Label inside bar if wide enough */}
                    {barWidth > 25 && (
                      <span className="text-xs font-semibold text-black/80 px-2">
                        {tier.count}
                      </span>
                    )}
                  </div>

                  {/* Count Label outside bar if narrow */}
                  {barWidth <= 25 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      {tier.count}
                    </span>
                  )}
                </div>

                {/* Percentage */}
                <span className="w-10 text-xs text-gray-500 text-right shrink-0">
                  {tier.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Top tier</span>
          <span className="text-cyan-400 font-medium">
            {[...sortedDistribution].reverse().find((d: TierDistribution) => d.count > 0)?.tier || 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TierDistributionChart;
