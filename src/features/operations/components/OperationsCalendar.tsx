import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import type { OperationsCalendarEvent } from '@/services/operations/operations.service';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Briefcase,
  Wrench,
  GraduationCap,
  FileText,
  MoreHorizontal,
} from 'lucide-react';

interface OperationsCalendarProps {
  events?: OperationsCalendarEvent[];
  isLoading?: boolean;
}

const eventTypeConfig: Record<OperationsCalendarEvent['type'], { icon: React.ReactNode; color: string; label: string }> = {
  shift: { icon: <Briefcase className="w-4 h-4" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Shift' },
  meeting: { icon: <Users className="w-4 h-4" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Meeting' },
  maintenance: { icon: <Wrench className="w-4 h-4" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Maintenance' },
  training: { icon: <GraduationCap className="w-4 h-4" />, color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Training' },
  audit: { icon: <FileText className="w-4 h-4" />, color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Audit' },
  other: { icon: <CalendarIcon className="w-4 h-4" />, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Other' },
};

const statusConfig: Record<OperationsCalendarEvent['status'], { variant: 'success' | 'warning' | 'alert' | 'default'; label: string }> = {
  scheduled: { variant: 'default', label: 'Scheduled' },
  'in-progress': { variant: 'warning', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'alert', label: 'Cancelled' },
};

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function OperationsCalendar({ events = [], isLoading }: OperationsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get events for the selected date or current week
  const getRelevantEvents = (): OperationsCalendarEvent[] => {
    if (viewMode === 'day' && selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      return events.filter(e => {
        const eventStart = new Date(e.startTime);
        return eventStart >= startOfDay && eventStart <= endOfDay;
      });
    }
    
    // Week view - show current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return events.filter(e => {
      const eventStart = new Date(e.startTime);
      return eventStart >= startOfWeek && eventStart < endOfWeek;
    });
  };

  const relevantEvents = getRelevantEvents().sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  // Calendar grid for month view
  const renderMonthGrid = () => {
    const days = [];
    const today = new Date();
    
    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-900/30" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.startTime);
        return eventDate.toDateString() === date.toDateString();
      });

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(date);
            setViewMode('day');
          }}
          className={cn(
            "h-24 p-2 border border-gray-800 cursor-pointer transition-colors",
            isToday && "bg-blue-500/10 border-blue-500/30",
            isSelected && "bg-orange-500/10 border-orange-500/30",
            !isToday && !isSelected && "bg-[#12121a] hover:bg-gray-800"
          )}
        >
          <div className={cn(
            "text-sm font-medium",
            isToday ? "text-blue-400" : "text-gray-400"
          )}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayEvents.slice(0, 3).map((event, idx) => {
              const config = eventTypeConfig[event.type];
              return (
                <div
                  key={idx}
                  className={cn(
                    "text-[10px] truncate px-1.5 py-0.5 rounded border",
                    config.color
                  )}
                >
                  {event.title}
                </div>
              );
            })}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-500 px-1.5">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Week view
  const renderWeekView = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-800">
        {days.map((day, index) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + index);
          const isToday = date.toDateString() === new Date().toDateString();
          
          const dayEvents = events.filter(e => {
            const eventDate = new Date(e.startTime);
            return eventDate.toDateString() === date.toDateString();
          });

          return (
            <div key={day} className="bg-[#0f0f14]">
              <div className={cn(
                "p-3 text-center border-b border-gray-800",
                isToday && "bg-blue-500/10"
              )}>
                <div className="text-xs text-gray-500">{day}</div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday ? "text-blue-400" : "text-white"
                )}>
                  {date.getDate()}
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {dayEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-opacity",
                        config.color
                      )}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="opacity-70 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(event.startTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <XpressCard
      title="Operations Calendar"
      subtitle="Shifts, events, and schedules"
      badge={relevantEvents.length > 0 ? `${relevantEvents.length} events` : undefined}
      badgeVariant="info"
      className="h-full"
      headerAction={
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-900 rounded-lg p-0.5">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors",
                  viewMode === mode
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrevious}
              className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg bg-gray-900 text-xs text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="h-96 animate-pulse bg-gray-900 rounded-lg" />
      ) : (
        <>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode === 'week' && `Week of ${formatDate(new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000))}`}
              {viewMode === 'day' && (selectedDate ? formatDate(selectedDate) : formatDate(currentDate))}
            </h3>
          </div>

          {/* Calendar Content */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-gray-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-[#0f0f14] p-2 text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              {renderMonthGrid()}
            </div>
          )}

          {viewMode === 'week' && renderWeekView()}

          {viewMode === 'day' && (
            <div className="space-y-3">
              {relevantEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No events scheduled for this day</p>
                </div>
              ) : (
                relevantEvents.map((event) => {
                  const config = eventTypeConfig[event.type];
                  const status = statusConfig[event.status];
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-4 p-4 bg-[#0f0f14] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors"
                    >
                      {/* Time Column */}
                      <div className="text-center min-w-[60px]">
                        <div className="text-sm font-medium text-white">
                          {formatTime(event.startTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(event.endTime)}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="w-px self-stretch bg-gray-800" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg border", config.color)}>
                              {config.icon}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white">{event.title}</h4>
                              <p className="text-xs text-gray-500">{config.label}</p>
                            </div>
                          </div>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-400 mt-2">{event.description}</p>
                        )}

                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.length} attendees
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <button className="p-1.5 text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </XpressCard>
  );
}

export default OperationsCalendar;
