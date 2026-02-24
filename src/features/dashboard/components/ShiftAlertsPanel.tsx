import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDashboardAlerts } from '@/features/dashboard/hooks/useDashboardStats';
import { formatDistanceToNow } from '@/lib/utils/date';
import { 
  Bell, 
  AlertTriangle, 
  Clock,
  CheckCircle2,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
  MapPin,
  Users,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react';

// ==================== Types ====================

interface ShiftInfo {
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
  icon: React.ReactNode;
  driverCount: number;
}

// ==================== Mock Shift Data ====================

const SHIFTS: ShiftInfo[] = [
  { 
    name: 'AM Shift', 
    startTime: '06:00', 
    endTime: '14:00', 
    active: false, 
    icon: <Sun className="w-4 h-4" />,
    driverCount: 45 
  },
  { 
    name: 'PM Shift', 
    startTime: '14:00', 
    endTime: '22:00', 
    active: true, 
    icon: <Sunset className="w-4 h-4" />,
    driverCount: 68 
  },
  { 
    name: 'Night Shift', 
    startTime: '22:00', 
    endTime: '06:00', 
    active: false, 
    icon: <Moon className="w-4 h-4" />,
    driverCount: 23 
  },
];

// ==================== Components ====================

interface AlertItemProps {
  alert: {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
    acknowledged: boolean;
    metadata?: Record<string, string | number | boolean>;
  };
  onAcknowledge: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  const typeClasses = {
    critical: 'border-l-xpress-status-alert bg-xpress-status-alert/5',
    warning: 'border-l-xpress-status-warning bg-xpress-status-warning/5',
    info: 'border-l-xpress-accent-blue bg-xpress-accent-blue/5',
  };

  const typeIcons = {
    critical: <AlertCircle className="w-4 h-4 text-xpress-status-alert" />,
    warning: <AlertTriangle className="w-4 h-4 text-xpress-status-warning" />,
    info: <Info className="w-4 h-4 text-xpress-accent-blue" />,
  };

  const typeLabels = {
    critical: 'Critical',
    warning: 'Warning',
    info: 'Info',
  };

  return (
    <div className={cn(
      'p-3 rounded-r-md border-l-2 transition-all',
      typeClasses[alert.type],
      alert.acknowledged && 'opacity-50'
    )}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{typeIcons[alert.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant={
                alert.type === 'critical' ? 'alert' : 
                alert.type === 'warning' ? 'warning' : 'default'
              }
              className="text-[10px] px-1.5 py-0"
            >
              {typeLabels[alert.type]}
            </Badge>
            <span className="text-xs text-xpress-text-muted">
              {formatDistanceToNow(alert.timestamp)}
            </span>
          </div>
          <p className={cn(
            'text-sm leading-snug',
            alert.acknowledged ? 'text-xpress-text-muted line-through' : 'text-xpress-text-primary'
          )}>
            {alert.message}
          </p>
          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {alert.metadata.zone && (
                <span className="text-[10px] px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-muted flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {String(alert.metadata.zone)}
                </span>
              )}
              {alert.metadata.rate !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-muted">
                  {String(alert.metadata.rate)}%
                </span>
              )}
              {alert.metadata.needed !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 bg-xpress-bg-elevated rounded text-xpress-text-muted flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Need {String(alert.metadata.needed)}
                </span>
              )}
            </div>
          )}
        </div>
        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="text-xpress-text-muted hover:text-xpress-status-active transition-colors p-1 rounded hover:bg-xpress-bg-elevated"
            title="Acknowledge"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface ShiftCardProps {
  shift: ShiftInfo;
  isCurrent: boolean;
  timeRemaining?: string;
}



function ShiftCard({ shift, isCurrent, timeRemaining }: ShiftCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg transition-all',
        isCurrent
          ? 'bg-xpress-accent-blue/10 border border-xpress-accent-blue/30'
          : 'bg-xpress-bg-secondary/50 hover:bg-xpress-bg-secondary'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-md',
          isCurrent ? 'bg-xpress-accent-blue/20 text-xpress-accent-blue' : 'bg-xpress-bg-elevated text-xpress-text-muted'
        )}>
          {shift.icon}
        </div>
        <div>
          <p className={cn(
            'font-medium',
            isCurrent ? 'text-xpress-accent-blue' : 'text-xpress-text-primary'
          )}>
            {shift.name}
          </p>
          <p className="text-xs text-xpress-text-secondary">
            {shift.startTime} - {shift.endTime}
          </p>
          {isCurrent && timeRemaining && (
            <p className="text-xs text-xpress-accent-blue mt-0.5">
              {timeRemaining} remaining
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-xpress-text-muted flex items-center gap-1">
          <Users className="w-3 h-3" />
          {shift.driverCount}
        </span>
        {isCurrent ? (
          <Badge variant="active">Active</Badge>
        ) : (
          <ChevronRight className="w-4 h-4 text-xpress-text-muted" />
        )}
      </div>
    </div>
  );
}

// ==================== Main Component ====================

export function ShiftAlertsPanel() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'shifts'>('alerts');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Fetch real alerts
  const { data: alerts = [] } = useDashboardAlerts();
  
  // Local state for acknowledged alerts (in-memory only for now)
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  
  const unacknowledgedCount = alerts.filter(a => !acknowledgedIds.includes(a.id)).length;
  const isAcknowledging = false;
  
  const acknowledgeAlert = (id: string) => {
    setAcknowledgedIds(prev => [...prev, id]);
  };
  
  const acknowledgeAllAlerts = () => {
    setAcknowledgedIds(alerts.map(a => a.id));
  };
  
  // Filter out acknowledged alerts
  const visibleAlerts = alerts.filter(a => !acknowledgedIds.includes(a.id));

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine current shift
  const currentHour = currentTime.getHours();
  const currentShift = SHIFTS.find(s => s.active) || SHIFTS[1];
  
  // Calculate time remaining for current shift
  const [shiftEndHour] = currentShift.endTime.split(':').map(Number);
  const hoursRemaining = shiftEndHour - currentHour;
  const timeRemaining = hoursRemaining > 0 
    ? `${hoursRemaining}h ${60 - currentTime.getMinutes()}m` 
    : 'Ending soon';

  return (
    <div className="xpress-card h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-xpress-border">
        <button
          onClick={() => setActiveTab('alerts')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
            activeTab === 'alerts'
              ? 'text-xpress-accent-blue border-b-2 border-xpress-accent-blue'
              : 'text-xpress-text-secondary hover:text-xpress-text-primary'
          )}
        >
          <Bell className="w-4 h-4" />
          Alerts
          {unacknowledgedCount > 0 && (
            <Badge variant="alert" className="ml-1">{unacknowledgedCount}</Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
            activeTab === 'shifts'
              ? 'text-xpress-accent-blue border-b-2 border-xpress-accent-blue'
              : 'text-xpress-text-secondary hover:text-xpress-text-primary'
          )}
        >
          <Clock className="w-4 h-4" />
          Shifts
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'alerts' ? (
          <div className="space-y-2">
            {visibleAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-xpress-status-active mx-auto mb-3" />
                <p className="text-sm font-medium text-xpress-text-primary">All caught up!</p>
                <p className="text-xs text-xpress-text-muted mt-1">No active alerts at the moment</p>
              </div>
            ) : (
              <>
                {visibleAlerts.map((alert: typeof alerts[0]) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={acknowledgeAlert}
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Shift Card */}
            {currentShift && (
              <div className="p-4 bg-xpress-accent-blue/10 rounded-lg border border-xpress-accent-blue/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {currentShift.icon}
                    <span className="font-semibold text-xpress-accent-blue">Current Shift</span>
                  </div>
                  <Badge variant="active">Active Now</Badge>
                </div>
                <p className="text-2xl font-bold text-xpress-text-primary">
                  {currentShift.startTime} - {currentShift.endTime}
                </p>
                <p className="text-sm text-xpress-text-secondary mt-1">
                  {timeRemaining} remaining
                </p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-xpress-accent-blue/20">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-xpress-accent-blue" />
                    <span className="text-sm text-xpress-text-primary">
                      {currentShift.driverCount} drivers on duty
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-xpress-status-active" />
                    <span className="text-sm text-xpress-text-primary">
                      Peak performance
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* All Shifts */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-xpress-text-muted uppercase tracking-wider">
                Today&apos;s Schedule
              </p>
              {SHIFTS.map((shift) => (
                <ShiftCard
                  key={shift.name}
                  shift={shift}
                  isCurrent={shift.active}
                  timeRemaining={shift.active ? timeRemaining : undefined}
                />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-xpress-bg-secondary/50 rounded-lg text-center">
                <p className="text-xl font-bold text-xpress-text-primary">
                  {SHIFTS.reduce((sum, s) => sum + s.driverCount, 0)}
                </p>
                <p className="text-xs text-xpress-text-muted">Total Drivers</p>
              </div>
              <div className="p-3 bg-xpress-bg-secondary/50 rounded-lg text-center">
                <p className="text-xl font-bold text-xpress-status-active">
                  {Math.round((currentShift.driverCount / SHIFTS.reduce((sum, s) => sum + s.driverCount, 0)) * 100)}%
                </p>
                <p className="text-xs text-xpress-text-muted">Coverage</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {activeTab === 'alerts' && unacknowledgedCount > 0 && (
        <div className="p-4 border-t border-xpress-border">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => acknowledgeAllAlerts()}
            disabled={isAcknowledging}
          >
            {isAcknowledging ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Acknowledging...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acknowledge All ({unacknowledgedCount})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ShiftAlertsPanel;
