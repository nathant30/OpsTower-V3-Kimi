import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import type { TrustScore } from '@/types/domain.types';
import { Shield, Clock, Heart, FileCheck, ChevronDown, ChevronUp, Info } from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

interface TrustScoreCardProps {
  trustScore: TrustScore;
  size?: 'sm' | 'md' | 'lg';
  showHistory?: boolean;
  showBreakdown?: boolean;
  className?: string;
}

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

// ==================== COLOR HELPERS ====================

export function getTrustScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-amber-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getTrustScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getTrustScoreStrokeColor(score: number): string {
  if (score >= 80) return 'stroke-green-500';
  if (score >= 60) return 'stroke-amber-500';
  if (score >= 40) return 'stroke-orange-500';
  return 'stroke-red-500';
}

export function getTrustScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

export function getTrustScoreDescription(score: number): string {
  if (score >= 80) return 'This driver consistently meets all performance standards';
  if (score >= 60) return 'This driver meets most performance standards';
  if (score >= 40) return 'This driver needs improvement in some areas';
  return 'This driver requires immediate attention and training';
}

// ==================== CIRCULAR PROGRESS COMPONENT ====================

export function CircularProgress({
  value,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(value, 0), 100);
  const dashoffset = circumference - (progress / 100) * circumference;

  const colorClass = getTrustScoreStrokeColor(value);
  const textColorClass = getTrustScoreColor(value);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-700 ease-out', colorClass)}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', textColorClass)}>
            {Math.round(value)}
          </span>
        </div>
      )}
    </div>
  );
}

// ==================== SEGMENTED BAR COMPONENT ====================

interface SegmentedBarProps {
  value: number;
  segments?: number;
  className?: string;
}

export function SegmentedBar({ value, segments = 10, className }: SegmentedBarProps) {
  const activeSegments = Math.round((value / 100) * segments);
  
  return (
    <div className={cn('flex gap-0.5', className)}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-2 rounded-sm transition-all duration-300',
            i < activeSegments ? getTrustScoreBgColor(value) : 'bg-white/10'
          )}
        />
      ))}
    </div>
  );
}

// ==================== MAIN TRUST SCORE CARD ====================

export function TrustScoreCard({
  trustScore,
  size = 'md',
  showHistory = false,
  showBreakdown = true,
  className,
}: TrustScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { overall, components, history } = trustScore;

  const sizeConfig = {
    sm: { circle: 60, stroke: 6, font: 'text-sm', padding: 'p-3' },
    md: { circle: 100, stroke: 10, font: 'text-lg', padding: 'p-4' },
    lg: { circle: 140, stroke: 14, font: 'text-3xl', padding: 'p-5' },
  };

  const config = sizeConfig[size];

  const componentData = [
    { 
      key: 'reliability', 
      label: 'Reliability', 
      value: components.reliability, 
      icon: Clock,
      description: 'On-time performance & availability'
    },
    { 
      key: 'safety', 
      label: 'Safety', 
      value: components.safety, 
      icon: Shield,
      description: 'Driving behavior & incident history'
    },
    { 
      key: 'customerService', 
      label: 'Service', 
      value: components.customerService, 
      icon: Heart,
      description: 'Customer ratings & feedback'
    },
    { 
      key: 'compliance', 
      label: 'Compliance', 
      value: components.compliance, 
      icon: FileCheck,
      description: 'Documents & policy adherence'
    },
  ];

  const trustLabel = getTrustScoreLabel(overall);
  const trustColor = getTrustScoreColor(overall);
  const trustDescription = getTrustScoreDescription(overall);

  return (
    <div className={cn('bg-[#12121a] border border-white/10 rounded-xl', config.padding, className)}>
      {/* Overall Score Header */}
      <div className="flex items-center gap-4">
        <CircularProgress
          value={overall}
          size={config.circle}
          strokeWidth={config.stroke}
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-gray-400 text-sm">Trust Score</h4>
          <p className={cn('font-bold', trustColor, config.font)}>
            {trustLabel}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {overall}/100 overall
          </p>
        </div>
        
        {/* Expand/Collapse Button */}
        {showBreakdown && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mt-3 flex items-start gap-1.5">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
        {trustDescription}
      </p>

      {/* Component Breakdown */}
      {showBreakdown && (
        <div className={cn('mt-4 pt-4 border-t border-white/10', !isExpanded && size === 'sm' && 'hidden')}>
          <div className="grid grid-cols-2 gap-3">
            {componentData.map((component) => {
              const Icon = component.icon;
              const componentColor = getTrustScoreColor(component.value);
              return (
                <div
                  key={component.key}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg transition-colors",
                    isExpanded ? "bg-white/5 hover:bg-white/10" : "bg-white/5"
                  )}
                  title={isExpanded ? undefined : component.description}
                >
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    <Icon className={cn('w-3.5 h-3.5', componentColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
                      {component.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-semibold', componentColor)}>
                        {component.value}
                      </p>
                      {isExpanded && (
                        <SegmentedBar value={component.value} segments={5} className="flex-1" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Chart */}
      {showHistory && history && history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs text-gray-500">30-Day Trend</h5>
            <span className="text-[10px] text-gray-600">
              {history[0].date} - {history[history.length - 1].date}
            </span>
          </div>
          <div className="h-16 flex items-end gap-1">
            {history.slice(-30).map((snapshot, index) => {
              const height = `${Math.max(10, snapshot.score)}%`;
              const barColor = getTrustScoreBgColor(snapshot.score);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex-1 rounded-t transition-all duration-200 hover:opacity-80 relative group cursor-pointer",
                    barColor
                  )}
                  style={{ height }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1a1a2e] border border-white/10 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    <span className="text-gray-400">{snapshot.date}:</span>
                    <span className={cn('ml-1 font-medium', getTrustScoreColor(snapshot.score))}>
                      {snapshot.score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis labels */}
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>30d ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== COMPACT TRUST SCORE BADGE ====================

interface TrustScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function TrustScoreBadge({ score, showLabel = false, size = 'sm', className }: TrustScoreBadgeProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          score >= 80 && 'bg-green-500',
          score >= 60 && score < 80 && 'bg-amber-500',
          score >= 40 && score < 60 && 'bg-orange-500',
          score < 40 && 'bg-red-500'
        )}
      />
      <span className={cn('font-semibold', textSizeClasses[size], getTrustScoreColor(score))}>
        {score}
      </span>
      {showLabel && (
        <span className="text-xs text-gray-500">
          {getTrustScoreLabel(score)}
        </span>
      )}
    </div>
  );
}

// ==================== TRUST SCORE MINI CARD ====================

interface TrustScoreMiniProps {
  score: number;
  label?: string;
  className?: string;
}

export function TrustScoreMini({ score, label = 'Trust Score', className }: TrustScoreMiniProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('w-1.5 h-8 rounded-full', getTrustScoreBgColor(score))} />
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={cn('text-lg font-bold', getTrustScoreColor(score))}>{score}</p>
      </div>
    </div>
  );
}

// ==================== COMPONENT BREAKDOWN ROW ====================

interface ComponentBreakdownRowProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}

export function ComponentBreakdownRow({ label, value, icon, className }: ComponentBreakdownRowProps) {
  const colorClass = getTrustScoreColor(value);
  
  return (
    <div className={cn('flex items-center justify-between p-2 bg-white/5 rounded-lg', className)}>
      <div className="flex items-center gap-2">
        <span className={cn('text-gray-400', colorClass)}>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <SegmentedBar value={value} segments={5} className="w-16" />
        <span className={cn('text-sm font-semibold w-8 text-right', colorClass)}>{value}</span>
      </div>
    </div>
  );
}

export default TrustScoreCard;
