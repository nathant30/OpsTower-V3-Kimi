import { cn } from '@/lib/utils/cn';

export type StatusPillType = 
  | 'system-live'
  | 'system-down'
  | 'location'
  | 'time'
  | 'custom';

export interface XpressStatusPillProps {
  /** Pill type preset */
  type?: StatusPillType;
  /** Custom text (for type='custom') */
  children?: string;
  /** Whether pill shows pulse animation */
  pulse?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Icon to display (optional) */
  icon?: React.ReactNode;
  /** Custom background color class */
  bgColor?: string;
  /** Custom text color class */
  textColor?: string;
  /** For location type - location name */
  location?: string;
  /** For time type - time string */
  time?: string;
}

/**
 * XpressStatusPill - Status pills for OpsTower dashboard
 * 
 * Types:
 * - system-live: Green pill with pulsing dot for "SYSTEM LIVE"
 * - system-down: Red pill for system issues
 * - location: Location indicator (e.g., "Metro Manila")
 * - time: Time display pill
 * - custom: Fully customizable pill
 * 
 * @example
 * <XpressStatusPill type="system-live" />
 * <XpressStatusPill type="location" location="Metro Manila" />
 * <XpressStatusPill type="time" time="14:32:05 UTC" />
 */
export function XpressStatusPill({
  type = 'system-live',
  children,
  pulse = true,
  className,
  icon,
  bgColor,
  textColor,
  location,
  time,
}: XpressStatusPillProps) {
  // Preset configurations
  const presets: Record<StatusPillType, { 
    bg: string; 
    text: string; 
    dotColor: string;
    defaultText: string;
    showPulse: boolean;
  }> = {
    'system-live': {
      bg: 'bg-green-500/15',
      text: 'text-green-400',
      dotColor: 'bg-green-400',
      defaultText: 'SYSTEM LIVE',
      showPulse: true,
    },
    'system-down': {
      bg: 'bg-red-500/15',
      text: 'text-red-400',
      dotColor: 'bg-red-400',
      defaultText: 'SYSTEM DOWN',
      showPulse: true,
    },
    'location': {
      bg: 'bg-white/5',
      text: 'text-gray-300',
      dotColor: 'bg-blue-400',
      defaultText: location || 'LOCATION',
      showPulse: false,
    },
    'time': {
      bg: 'bg-white/5',
      text: 'text-gray-300',
      dotColor: 'bg-amber-400',
      defaultText: time || '00:00:00',
      showPulse: false,
    },
    'custom': {
      bg: bgColor || 'bg-white/5',
      text: textColor || 'text-gray-300',
      dotColor: 'bg-blue-400',
      defaultText: children || 'STATUS',
      showPulse: pulse,
    },
  };

  const preset = presets[type];
  const displayText = type === 'location' ? location : type === 'time' ? time : children || preset.defaultText;
  const shouldPulse = pulse && preset.showPulse;

  return (
    <div
      className={cn(
        // Base styles - pill shape
        'inline-flex items-center gap-2',
        'px-3 py-1.5 rounded-full',
        'border border-white/10',
        // Color scheme
        preset.bg,
        preset.text,
        className
      )}
    >
      {/* Icon or Pulse Dot */}
      {icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : (
        <span className="relative flex h-2 w-2">
          {shouldPulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                preset.dotColor
              )}
            />
          )}
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              preset.dotColor
            )}
          />
        </span>
      )}

      {/* Text */}
      <span className="text-sm font-medium tracking-wide uppercase">
        {displayText}
      </span>
    </div>
  );
}

export default XpressStatusPill;
