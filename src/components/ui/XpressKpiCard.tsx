import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type KpiTrend = 'up' | 'down' | 'neutral';
export type KpiColor = 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';

export interface XpressKpiCardProps {
  /** KPI title/label */
  title: string;
  /** Main KPI value */
  value: string | number;
  /** Subtext below value (e.g., "vs last week") */
  subtext?: string;
  /** Trend direction */
  trend?: KpiTrend | { value: number; isPositive: boolean };
  /** Trend percentage or value */
  trendValue?: string;
  /** Icon component */
  icon?: ReactNode;
  /** Card color theme */
  color?: KpiColor;
  /** Additional CSS classes */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Value formatter (optional) */
  formatValue?: (value: string | number) => string;
  /** Optional badge text */
  badge?: string;
}

const colorGradients: Record<KpiColor, string> = {
  green: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
  blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
  amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  red: 'from-red-500/20 to-rose-500/10 border-red-500/30',
  purple: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
  cyan: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30',
};

const colorIconBg: Record<KpiColor, string> = {
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  purple: 'bg-purple-500/20 text-purple-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
};

// colorTrend mapping available for future use
// const colorTrend: Record<KpiColor, string> = {...};

const trendIcons = {
  up: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  down: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  ),
  neutral: (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  ),
};

const trendColors = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

/**
 * XpressKpiCard - KPI cards for OpsTower dashboard
 * 
 * Format: Title / Big Value / Subtext / Trend
 * 
 * Color themes:
 * - green: Success metrics (deliveries, uptime)
 * - blue: Information metrics (active users, requests)
 * - amber: Warning metrics (delays, pending)
 * - red: Critical metrics (failures, downtime)
 * - purple: Special metrics (revenue, growth)
 * - cyan: Technical metrics (API calls, data)
 * 
 * @example
 * <XpressKpiCard
 *   title="Active Deliveries"
 *   value="1,247"
 *   subtext="vs yesterday"
 *   trend="up"
 *   trendValue="12%"
 *   color="green"
 *   icon={<TruckIcon />}
 * />
 */
export function XpressKpiCard({
  title,
  value,
  subtext,
  trend,
  trendValue,
  icon,
  color = 'blue',
  className,
  onClick,
  loading = false,
  formatValue,
  badge,
}: XpressKpiCardProps) {
  const displayValue = formatValue ? formatValue(value) : value;
  
  // Normalize trend prop
  const trendDirection: KpiTrend | undefined = trend && typeof trend === 'object' 
    ? (trend.isPositive ? 'up' : 'down')
    : trend as KpiTrend | undefined;
  const computedTrendValue = trend && typeof trend === 'object' 
    ? `${trend.value}%` 
    : trendValue;

  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl',
          'bg-gradient-to-br border',
          colorGradients[color],
          'p-5 animate-pulse',
          className
        )}
      >
        <div className="h-4 bg-white/10 rounded w-24 mb-3" />
        <div className="h-10 bg-white/10 rounded w-32 mb-2" />
        <div className="h-3 bg-white/10 rounded w-20" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Base styles
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br border',
        colorGradients[color],
        'p-5',
        'transition-all duration-200',
        // Hover effect
        onClick && 'cursor-pointer hover:brightness-110',
        className
      )}
      onClick={onClick}
    >
      {/* Header with icon, title, and badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            {title}
          </span>
          {badge && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {badge}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg',
              colorIconBg[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main value */}
      <div className="mb-2">
        <span className="text-3xl font-bold text-white tracking-tight">
          {displayValue}
        </span>
      </div>

      {/* Subtext and trend */}
      <div className="flex items-center gap-2">
        {subtext && (
          <span className="text-gray-400 text-sm">
            {subtext}
          </span>
        )}
        {trendDirection && computedTrendValue && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-sm font-medium',
              trendColors[trendDirection]
            )}
          >
            {trendIcons[trendDirection]}
            {computedTrendValue}
          </span>
        )}
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
    </div>
  );
}

export default XpressKpiCard;
