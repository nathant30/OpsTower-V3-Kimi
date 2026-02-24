/**
 * StatCard Component
 * Displays a single statistic with icon and trend indicator
 */

import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  isLoading?: boolean;
  className?: string;
}

const colorStyles = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    text: 'text-blue-400',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    iconBg: 'bg-green-500/20',
    iconColor: 'text-green-400',
    text: 'text-green-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    text: 'text-amber-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    text: 'text-red-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    text: 'text-purple-400',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
    text: 'text-cyan-400',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  isLoading = false,
  className,
}: StatCardProps) {
  const styles = colorStyles[color];

  if (isLoading) {
    return (
      <div className={cn(
        "relative rounded-xl border p-4 overflow-hidden",
        styles.bg,
        styles.border,
        className
      )}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-20 h-4 bg-white/10 rounded" />
            <div className={cn("w-10 h-10 rounded-lg", styles.iconBg)} />
          </div>
          <div className="w-16 h-8 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-xl border p-4 overflow-hidden transition-all duration-200 hover:border-opacity-50 group",
      styles.bg,
      styles.border,
      className
    )}>
      {/* Background Glow */}
      <div className={cn(
        "absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity",
        styles.iconBg.replace('/20', '')
      )} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : trend.value < 0 ? (
                <TrendingDown className="w-3 h-3 text-red-400" />
              ) : (
                <Minus className="w-3 h-3 text-gray-400" />
              )}
              <span className={cn(
                "text-xs font-medium",
                trend.value > 0 ? "text-green-400" : 
                trend.value < 0 ? "text-red-400" : "text-gray-400"
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-500">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={cn(
          "p-2.5 rounded-lg shrink-0 ml-3",
          styles.iconBg,
          styles.iconColor
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
