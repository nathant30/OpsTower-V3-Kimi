/**
 * ShiftStatusBadge Component
 * Displays a visual badge for shift status
 */

import { cn } from '@/lib/utils/cn';
import { SHIFT_STATUS_CONFIG, type ShiftStatus } from '../types';

interface ShiftStatusBadgeProps {
  status: ShiftStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5',
};

const dotSizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function ShiftStatusBadge({ 
  status, 
  showDot = true, 
  size = 'md',
  className 
}: ShiftStatusBadgeProps) {
  const config = SHIFT_STATUS_CONFIG[status] || SHIFT_STATUS_CONFIG.SCHEDULED;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        'bg-opacity-20',
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('rounded-full', config.bgColor, dotSizeClasses[size])} />
      )}
      {config.label}
    </span>
  );
}

export default ShiftStatusBadge;
