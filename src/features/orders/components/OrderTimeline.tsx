import { formatDateTime, formatDuration } from '@/lib/utils/date';
import type { OrderTimeline as OrderTimelineType, OrderStatus } from '@/types/domain.types';
import {
  CheckCircle2,
  Clock,
  User,
  Navigation,
  MapPin,
  Car,
  XCircle,
  Calendar,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface OrderTimelineProps {
  timeline: OrderTimelineType;
  status: OrderStatus;
}

interface TimelineEvent {
  key: string;
  label: string;
  icon: React.ReactNode;
  timestamp?: string;
  isCompleted: boolean;
  isActive: boolean;
  details?: string;
  color: 'green' | 'blue' | 'amber' | 'red' | 'gray';
}

export function OrderTimeline({ timeline, status }: OrderTimelineProps) {
  // Handle missing timeline gracefully
  if (!timeline) {
    return (
      <div className="text-center py-4 text-xpress-text-muted">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No timeline data available</p>
      </div>
    );
  }

  // Build timeline events
  const events: TimelineEvent[] = [
    {
      key: 'booked',
      label: 'Order Booked',
      icon: <Flag className="w-4 h-4" />,
      timestamp: timeline.bookedAt,
      isCompleted: true,
      isActive: false,
      color: 'green',
    },
    {
      key: 'scheduled',
      label: 'Scheduled',
      icon: <Calendar className="w-4 h-4" />,
      timestamp: timeline.scheduledAt,
      isCompleted: !!timeline.scheduledAt,
      isActive: status === 'Scheduled',
      color: 'amber',
    },
    {
      key: 'assigned',
      label: 'Driver Assigned',
      icon: <User className="w-4 h-4" />,
      timestamp: timeline.assignedAt,
      isCompleted: !!timeline.assignedAt,
      isActive: status === 'Assigned',
      color: 'blue',
    },
    {
      key: 'accepted',
      label: 'Driver Accepted',
      icon: <CheckCircle2 className="w-4 h-4" />,
      timestamp: timeline.acceptedAt,
      isCompleted: !!timeline.acceptedAt,
      isActive: status === 'Accepted',
      color: 'blue',
    },
    {
      key: 'enroute',
      label: 'En Route to Pickup',
      icon: <Navigation className="w-4 h-4" />,
      timestamp: undefined, // Calculated from acceptedAt + travel time
      isCompleted: ['EnRoute', 'Arrived', 'OnTrip', 'Completed'].includes(status),
      isActive: status === 'EnRoute',
      color: 'blue',
    },
    {
      key: 'arrived',
      label: 'Arrived at Pickup',
      icon: <MapPin className="w-4 h-4" />,
      timestamp: timeline.arrivedAt,
      isCompleted: !!timeline.arrivedAt,
      isActive: status === 'Arrived',
      color: 'blue',
    },
    {
      key: 'ontrip',
      label: 'On Trip',
      icon: <Car className="w-4 h-4" />,
      timestamp: timeline.pickedUpAt,
      isCompleted: ['OnTrip', 'Completed'].includes(status),
      isActive: status === 'OnTrip',
      color: 'blue',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4" />,
      timestamp: timeline.completedAt,
      isCompleted: status === 'Completed',
      isActive: status === 'Completed',
      color: 'green',
    },
    {
      key: 'cancelled',
      label: 'Cancelled',
      icon: <XCircle className="w-4 h-4" />,
      timestamp: timeline.cancelledAt,
      isCompleted: status === 'Cancelled',
      isActive: status === 'Cancelled',
      details: timeline.cancelledBy
        ? `Cancelled by ${timeline.cancelledBy}${timeline.cancellationReason ? `: ${timeline.cancellationReason}` : ''}`
        : undefined,
      color: 'red',
    },
  ];

  // Filter out cancelled if not cancelled, or filter out others if cancelled
  const visibleEvents = status === 'Cancelled'
    ? events.filter((e) => e.key !== 'completed')
    : events.filter((e) => e.key !== 'cancelled');

  // Calculate durations between events
  const getDuration = (current: TimelineEvent, next: TimelineEvent | undefined) => {
    if (!current.timestamp || !next?.timestamp) return null;
    const currentTime = new Date(current.timestamp).getTime();
    const nextTime = new Date(next.timestamp).getTime();
    const diff = nextTime - currentTime;
    if (diff <= 0) return null;
    return formatDuration(Math.floor(diff / 1000));
  };

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-xpress-border" />

      <div className="space-y-0">
        {visibleEvents.map((event, index) => {
          const nextEvent = visibleEvents[index + 1];
          const duration = getDuration(event, nextEvent);

          return (
            <div key={event.key} className="relative">
              {/* Event Row */}
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    event.isActive
                      ? 'bg-xpress-accent-blue text-white ring-4 ring-xpress-accent-blue/20 animate-pulse'
                      : event.isCompleted
                      ? event.color === 'green'
                        ? 'bg-xpress-accent-green text-white'
                        : event.color === 'red'
                        ? 'bg-xpress-accent-red text-white'
                        : 'bg-xpress-accent-blue text-white'
                      : 'bg-xpress-bg-elevated text-xpress-text-muted'
                  )}
                >
                  {event.icon}
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-6', !event.timestamp && !event.isActive && 'opacity-50')}>
                  <div className="flex items-center justify-between">
                    <h4
                      className={cn(
                        'font-medium',
                        event.isActive
                          ? 'text-xpress-accent-blue'
                          : event.isCompleted
                          ? 'text-xpress-text-primary'
                          : 'text-xpress-text-muted'
                      )}
                    >
                      {event.label}
                    </h4>
                    {event.timestamp && (
                      <span className="text-xs text-xpress-text-muted">
                        {formatDateTime(event.timestamp)}
                      </span>
                    )}
                  </div>

                  {event.details && (
                    <p
                      className={cn(
                        'text-sm mt-1',
                        event.color === 'red' ? 'text-xpress-accent-red' : 'text-xpress-text-secondary'
                      )}
                    >
                      {event.details}
                    </p>
                  )}

                  {/* Duration indicator */}
                  {duration && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-xpress-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>Took {duration}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;
