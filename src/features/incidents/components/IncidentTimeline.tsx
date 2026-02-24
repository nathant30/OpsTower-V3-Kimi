import type { IncidentTimeline as IncidentTimelineType, IncidentStatus } from '@/types/domain.types';
import { format } from 'date-fns';
import { 
  FileText, Search, UserCheck, Gavel, CheckCircle, 
  XCircle, RotateCcw, AlertCircle 
} from 'lucide-react';

interface IncidentTimelineProps {
  timeline: IncidentTimelineType;
  currentStatus: IncidentStatus;
}

interface TimelineEvent {
  key: string;
  label: string;
  date?: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'pending';
}

export function IncidentTimeline({ timeline, currentStatus }: IncidentTimelineProps) {
  const events: TimelineEvent[] = [
    {
      key: 'reported',
      label: 'Reported',
      date: timeline.reportedAt,
      icon: <FileText className="w-4 h-4" />,
      status: 'completed',
    },
    {
      key: 'reviewing',
      label: 'Under Review',
      date: timeline.reportedAt, // Same as reported
      icon: <Search className="w-4 h-4" />,
      status: ['Investigating', 'PendingAction', 'Hearing', 'Resolved', 'Closed'].includes(currentStatus) 
        ? 'completed' 
        : currentStatus === 'Reviewing' 
          ? 'current' 
          : 'pending',
    },
    {
      key: 'investigating',
      label: 'Investigation',
      date: timeline.investigationStarted,
      icon: <UserCheck className="w-4 h-4" />,
      status: ['PendingAction', 'Hearing', 'Resolved', 'Closed'].includes(currentStatus)
        ? 'completed'
        : currentStatus === 'Investigating'
          ? 'current'
          : 'pending',
    },
    {
      key: 'pendingAction',
      label: 'Pending Action',
      date: timeline.investigationCompleted,
      icon: <AlertCircle className="w-4 h-4" />,
      status: ['Hearing', 'Resolved', 'Closed'].includes(currentStatus)
        ? 'completed'
        : currentStatus === 'PendingAction'
          ? 'current'
          : 'pending',
    },
    {
      key: 'hearing',
      label: 'Hearing',
      date: undefined,
      icon: <Gavel className="w-4 h-4" />,
      status: ['Resolved', 'Closed'].includes(currentStatus)
        ? 'completed'
        : currentStatus === 'Hearing'
          ? 'current'
          : 'pending',
    },
    {
      key: 'resolved',
      label: 'Resolved',
      date: timeline.resolved,
      icon: <CheckCircle className="w-4 h-4" />,
      status: timeline.resolved 
        ? 'completed' 
        : currentStatus === 'Resolved'
          ? 'current'
          : 'pending',
    },
  ];

  // If closed, add closed event
  if (currentStatus === 'Closed' || timeline.reopened) {
    events.push({
      key: 'closed',
      label: 'Closed',
      date: undefined,
      icon: <XCircle className="w-4 h-4" />,
      status: currentStatus === 'Closed' ? 'completed' : 'pending',
    });
  }

  // If reopened, add reopened event
  if (timeline.reopened) {
    events.push({
      key: 'reopened',
      label: 'Reopened',
      date: timeline.reopened,
      icon: <RotateCcw className="w-4 h-4" />,
      status: 'completed',
    });
  }

  return (
    <div className="xpress-card p-6">
      <h3 className="text-lg font-semibold text-xpress-text-primary mb-6">
        Status Timeline
      </h3>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-xpress-bg-elevated" />
        
        <div className="space-y-0">
          {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
          {events.map((event, _index) => (
            <div key={event.key} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Icon circle */}
              <div className={`
                relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0
                ${event.status === 'completed' 
                  ? 'bg-xpress-accent-green/20 text-xpress-accent-green' 
                  : event.status === 'current'
                    ? 'bg-xpress-accent-blue/20 text-xpress-accent-blue ring-2 ring-xpress-accent-blue animate-pulse'
                    : 'bg-xpress-bg-elevated text-xpress-text-muted'
                }
              `}>
                {event.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className={`
                    font-medium
                    ${event.status === 'completed' 
                      ? 'text-xpress-text-primary' 
                      : event.status === 'current'
                        ? 'text-xpress-accent-blue'
                        : 'text-xpress-text-muted'
                    }
                  `}>
                    {event.label}
                  </h4>
                  {event.date && (
                    <span className="text-xs text-xpress-text-muted">
                      {format(new Date(event.date), 'MMM d, yyyy h:mm a')}
                    </span>
                  )}
                </div>
                {event.status === 'current' && (
                  <p className="text-sm text-xpress-text-secondary mt-1">
                    Currently in this stage
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IncidentTimeline;
