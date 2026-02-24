import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Play, 
  Pause, 
  Clock,
  History,
  ChevronUp,
  ChevronDown,
  Settings,
  Calendar,
  FastForward,
  Rewind,
  Target
} from 'lucide-react';

// ==================== Types ====================

interface PlaybackState {
  isPlaying: boolean;
  currentTime: Date;
  speed: number;
  isExpanded: boolean;
}

interface PlaybackEvent {
  time: Date;
  type: 'order' | 'driver' | 'alert' | 'shift';
  description: string;
  data?: Record<string, unknown>;
}

// ==================== Constants ====================

const SPEEDS = [0.5, 1, 2, 5, 10, 20];

const SPEED_LABELS: Record<number, string> = {
  0.5: '0.5x',
  1: '1x',
  2: '2x',
  5: '5x',
  10: '10x',
  20: 'MAX',
};

// ==================== Mock Playback Data ====================

const MOCK_EVENTS: PlaybackEvent[] = [
  { time: new Date(2024, 0, 15, 6, 0), type: 'shift', description: 'AM Shift Started' },
  { time: new Date(2024, 0, 15, 7, 30), type: 'order', description: 'Morning Rush Begins' },
  { time: new Date(2024, 0, 15, 8, 45), type: 'alert', description: 'High Demand in Makati' },
  { time: new Date(2024, 0, 15, 12, 0), type: 'order', description: 'Lunch Peak' },
  { time: new Date(2024, 0, 15, 14, 0), type: 'shift', description: 'PM Shift Started' },
  { time: new Date(2024, 0, 15, 17, 30), type: 'order', description: 'Evening Rush' },
  { time: new Date(2024, 0, 15, 18, 15), type: 'alert', description: 'Driver Shortage in BGC' },
  { time: new Date(2024, 0, 15, 22, 0), type: 'shift', description: 'Night Shift Started' },
];

// ==================== Helper Functions ====================

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}



function getEventIcon(type: PlaybackEvent['type']) {
  switch (type) {
    case 'order':
      return <Target className="w-3 h-3 text-xpress-accent-blue" />;
    case 'driver':
      return <FastForward className="w-3 h-3 text-xpress-status-active" />;
    case 'alert':
      return <Clock className="w-3 h-3 text-xpress-status-alert" />;
    case 'shift':
      return <Calendar className="w-3 h-3 text-xpress-accent-purple" />;
    default:
      return null;
  }
}

// ==================== Components ====================

interface TimelineEventProps {
  event: PlaybackEvent;
  isPast: boolean;
  isCurrent: boolean;
}

function TimelineEvent({ event, isPast, isCurrent }: TimelineEventProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors',
      isCurrent ? 'bg-xpress-accent-blue/20' : isPast ? 'opacity-50' : 'opacity-30'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        isCurrent ? 'bg-xpress-accent-blue animate-pulse' : 
        isPast ? 'bg-xpress-text-muted' : 'bg-xpress-bg-elevated'
      )} />
      {getEventIcon(event.type)}
      <span className="font-mono text-xpress-text-muted">
        {formatTime(event.time)}
      </span>
      <span className={cn(
        'truncate',
        isCurrent ? 'text-xpress-accent-blue font-medium' : 'text-xpress-text-secondary'
      )}>
        {event.description}
      </span>
    </div>
  );
}

// ==================== Main Component ====================

export function PlaybackControls() {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: new Date(),
    speed: 1,
    isExpanded: false,
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (state.isPlaying) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          currentTime: new Date(prev.currentTime.getTime() + 60000 * prev.speed), // Add 1 minute * speed
        }));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [state.isPlaying, state.speed]);

  const togglePlay = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const resetTime = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTime: new Date(),
      isPlaying: false,
    }));
  }, []);

  const skipTime = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      currentTime: new Date(prev.currentTime.getTime() + minutes * 60000),
      isPlaying: false,
    }));
  }, []);

  const changeSpeed = useCallback(() => {
    const currentIndex = SPEEDS.indexOf(state.speed);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    setState(prev => ({ ...prev, speed: SPEEDS[nextIndex] }));
  }, [state.speed]);

  const jumpToTime = useCallback((hours: number, minutes: number = 0) => {
    const newDate = new Date(state.currentTime);
    newDate.setHours(hours, minutes, 0, 0);
    setState(prev => ({ 
      ...prev, 
      currentTime: newDate, 
      isPlaying: false 
    }));
  }, [state.currentTime]);

  const toggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  // Calculate day progress
  const dayProgress = ((state.currentTime.getHours() * 60 + state.currentTime.getMinutes()) / 1440) * 100;

  // Find current and upcoming events
  const currentEvent = MOCK_EVENTS.find(e => 
    Math.abs(e.time.getTime() - state.currentTime.getTime()) < 60000
  );
  const upcomingEvents = MOCK_EVENTS.filter(e => e.time > state.currentTime).slice(0, 3);

  // Check if we're viewing historical data - using ref to avoid impure function during render
  const timeRef = useRef(Date.now());
  useEffect(() => {
    timeRef.current = Date.now();
  }, []);
  const now = timeRef.current;
  const isHistorical = state.currentTime.getTime() < now - 60000;
  const isFuture = state.currentTime.getTime() > now + 60000;

  return (
    <div className={cn(
      'xpress-card transition-all duration-300 overflow-hidden',
      state.isExpanded ? 'h-auto' : 'h-16'
    )}>
      {/* Main Controls Bar */}
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            variant={state.isPlaying ? 'primary' : 'secondary'}
            size="icon"
            icon={state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            onClick={togglePlay}
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
          />

          {/* Time Display */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-xpress-text-muted" />
            <div>
              <p className="text-lg font-mono font-semibold text-xpress-text-primary">
                {formatTime(state.currentTime)}
              </p>
              <p className="text-xs text-xpress-text-muted">{formatDate(state.currentTime)}</p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {!state.isPlaying && !isHistorical && !isFuture && (
              <Badge variant="active" className="animate-pulse">LIVE</Badge>
            )}
            {isHistorical && (
              <Badge variant="idle">HISTORICAL</Badge>
            )}
            {isFuture && (
              <Badge variant="warning">FUTURE</Badge>
            )}
            {state.isPlaying && (
              <Badge variant="default" className="flex items-center gap-1">
                <FastForward className="w-3 h-3" />
                {SPEED_LABELS[state.speed]}
              </Badge>
            )}
          </div>

          {/* Current Event */}
          {currentEvent && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-xpress-accent-blue/10 rounded-full text-xs text-xpress-accent-blue">
              {getEventIcon(currentEvent.type)}
              <span className="truncate max-w-[150px]">{currentEvent.description}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Skip Backward */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Rewind className="w-4 h-4" />}
            onClick={() => skipTime(-30)}
            title="-30 minutes"
          >
            <span className="hidden sm:inline">-30m</span>
          </Button>

          {/* Skip Forward */}
          <Button
            variant="ghost"
            size="sm"
            icon={<FastForward className="w-4 h-4" />}
            onClick={() => skipTime(30)}
            title="+30 minutes"
          >
            <span className="hidden sm:inline">+30m</span>
          </Button>

          {/* Reset Button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<History className="w-4 h-4" />}
            onClick={resetTime}
            title="Reset to current time"
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>

          {/* Speed Control */}
          <Button
            variant="secondary"
            size="sm"
            onClick={changeSpeed}
            className="min-w-[60px]"
            title="Change playback speed"
          >
            {SPEED_LABELS[state.speed]}
          </Button>

          {/* Settings & Expand */}
          <div className="h-6 w-px bg-xpress-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            icon={<Settings className="w-4 h-4" />}
            title="Playback settings"
          />

          <Button
            variant="ghost"
            size="icon"
            icon={state.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            onClick={toggleExpanded}
            title={state.isExpanded ? 'Collapse' : 'Expand'}
          />
        </div>
      </div>

      {/* Expanded Timeline View */}
      {state.isExpanded && (
        <div className="px-4 pb-4 border-t border-xpress-border pt-4">
          <div className="space-y-4">
            {/* Time Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-xpress-text-muted">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </div>
              <div className="h-2 bg-xpress-bg-elevated rounded-full overflow-hidden relative">
                {/* Day markers */}
                <div className="absolute inset-0 flex">
                  {[0, 6, 12, 18].map(hour => (
                    <div 
                      key={hour}
                      className="absolute top-0 bottom-0 w-px bg-xpress-border/50"
                      style={{ left: `${(hour / 24) * 100}%` }}
                    />
                  ))}
                </div>
                {/* Progress bar */}
                <div 
                  className="h-full bg-xpress-accent-blue rounded-full transition-all duration-1000 relative"
                  style={{ width: `${dayProgress}%` }}
                >
                  {/* Current time indicator */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>
              </div>
            </div>

            {/* Quick Time Jumps */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-xpress-text-muted">Jump to:</span>
              {['06:00', '12:00', '18:00', '22:00'].map((time) => (
                <button
                  key={time}
                  onClick={() => {
                    const [hours, minutes] = time.split(':').map(Number);
                    jumpToTime(hours, minutes);
                  }}
                  className="px-2 py-1 text-xs bg-xpress-bg-elevated hover:bg-xpress-border rounded text-xpress-text-secondary hover:text-xpress-text-primary transition-colors"
                >
                  {time}
                </button>
              ))}
              <div className="h-4 w-px bg-xpress-border mx-1" />
              {['Yesterday', 'Today', 'Tomorrow'].map((day) => (
                <button
                  key={day}
                  onClick={() => {
                    const newDate = new Date();
                    if (day === 'Yesterday') newDate.setDate(newDate.getDate() - 1);
                    if (day === 'Tomorrow') newDate.setDate(newDate.getDate() + 1);
                    setState(prev => ({ ...prev, currentTime: newDate, isPlaying: false }));
                  }}
                  className="px-2 py-1 text-xs bg-xpress-bg-elevated hover:bg-xpress-border rounded text-xpress-text-secondary hover:text-xpress-text-primary transition-colors"
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Two Column Layout: Stats & Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Playback Events Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-xpress-status-active">1,245</p>
                  <p className="text-xs text-xpress-text-muted">Orders Completed</p>
                </div>
                <div className="p-3 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-xpress-accent-blue">89%</p>
                  <p className="text-xs text-xpress-text-muted">Completion Rate</p>
                </div>
                <div className="p-3 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-xpress-status-idle">4.2m</p>
                  <p className="text-xs text-xpress-text-muted">Avg Wait Time</p>
                </div>
                <div className="p-3 bg-xpress-bg-secondary rounded-lg">
                  <p className="text-2xl font-bold text-xpress-accent-purple">₱45K</p>
                  <p className="text-xs text-xpress-text-muted">Revenue</p>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-xpress-bg-secondary rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-xpress-text-muted uppercase tracking-wider">
                    Upcoming Events
                  </span>
                  <span className="text-xs text-xpress-text-muted">
                    {upcomingEvents.length} remaining
                  </span>
                </div>
                <div className="space-y-1">
                  {upcomingEvents.map((event, index) => (
                    <TimelineEvent
                      key={index}
                      event={event}
                      isPast={false}
                      isCurrent={false}
                    />
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-xs text-xpress-text-muted text-center py-2">
                      No more events today
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex items-center gap-4 text-xs text-xpress-text-muted pt-2 border-t border-xpress-border">
              <span className="font-medium">Shortcuts:</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-secondary">Space</kbd>
                Play/Pause
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-secondary">←/→</kbd>
                Skip
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-secondary">R</kbd>
                Reset
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-secondary">↑/↓</kbd>
                Expand
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlaybackControls;
