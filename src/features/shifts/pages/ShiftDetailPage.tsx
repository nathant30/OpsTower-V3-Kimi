// src/features/shifts/pages/ShiftDetailPage.tsx
// Individual Shift Detail View

import { useParams, useNavigate } from 'react-router-dom';
import { useShift, useCancelShift } from '@/features/shifts/hooks/useShifts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Route
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-gray-500',
  CLOCKED_IN: 'bg-blue-500',
  ACTIVE: 'bg-green-500',
  ON_BREAK: 'bg-yellow-500',
  COMPLETED: 'bg-green-600',
  CANCELLED: 'bg-red-500',
  NO_SHOW: 'bg-red-600',
};

export default function ShiftDetailPage() {
  const { shiftId } = useParams<{ shiftId: string }>();
  const navigate = useNavigate();
  const { data: shift, isLoading } = useShift(shiftId || '');
  const cancelShift = useCancelShift();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Shift not found</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/shifts')}>
          Back to Shifts
        </Button>
      </div>
    );
  }

  const canCancel = ['SCHEDULED', 'CLOCKED_IN'].includes(shift.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/shifts')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Shift Details</h1>
              <Badge 
                variant="default" 
                className={cn(STATUS_COLORS[shift.status], "text-white")}
              >
                {shift.status}
              </Badge>
            </div>
            <p className="text-gray-400 text-sm">
              {format(new Date(shift.scheduledStart), 'MMMM d, yyyy')} • {shift.shiftType} Shift
            </p>
          </div>
        </div>

        {canCancel && (
          <Button 
            variant="danger" 
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => cancelShift.mutate(shift.id)}
            disabled={cancelShift.isPending}
          >
            Cancel Shift
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Driver Info */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Driver</h3>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              {shift.driver?.firstName?.[0]}{shift.driver?.lastName?.[0]}
            </div>
            <div>
              <p className="text-lg font-medium text-white">
                {shift.driver?.firstName} {shift.driver?.lastName}
              </p>
              <p className="text-sm text-gray-400">{shift.driver?.phone}</p>
              
            </div>
          </div>
        </Card>

        {/* Vehicle Info */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Vehicle</h3>
          </div>
          
          {shift.asset ? (
            <div>
              <p className="text-lg font-medium text-white">{shift.asset.type}</p>
              <p className="text-sm text-gray-400">Plate: {shift.asset.plateNumber}</p>
              <p className="text-sm text-gray-400">Type: {shift.asset.type}</p>
            </div>
          ) : (
            <p className="text-gray-500">No vehicle assigned</p>
          )}
        </Card>

        {/* Revenue */}
        <Card className="p-6 bg-[#12121a] border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Performance</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Revenue</span>
              <span className="text-xl font-bold text-green-400">
                ₱{Number(shift.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trips Completed</span>
              <span className="text-white">{shift.tripCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Utilized Minutes</span>
              <span className="text-white">{shift.utilizedMinutes || 0} min</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="p-6 bg-[#12121a] border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Shift Timeline</h3>
        </div>

        <div className="space-y-4">
          {/* Scheduled */}
          <TimelineItem
            icon={Clock}
            title="Scheduled Start"
            time={shift.scheduledStart}
            details={`Expected end: ${shift.scheduledEnd ? format(new Date(shift.scheduledEnd), 'h:mm a') : 'Not scheduled'}`}
            completed={true}
          />

          {/* Clock In */}
          <TimelineItem
            icon={MapPin}
            title="Clock In"
            time={shift.actualStart || null}
            details={shift.actualStart ? `Location: ${shift.clockInLat}, ${shift.clockInLng}` : 'Not yet clocked in'}
            completed={!!shift.actualStart}
            warning={shift.isLate}
            warningText={shift.isLate ? `Late by ${shift.minutesLate} minutes` : undefined}
          />

          {/* Breaks */}
          {(shift.breakCount || 0) > 0 && (
            <TimelineItem
              icon={Clock}
              title={`Break ${shift.breakCount}`}
              time={shift.breakStart || null}
              details={`Duration: ${shift.breakMinutes} minutes`}
              completed={true}
            />
          )}

          {/* Clock Out */}
          <TimelineItem
            icon={CheckCircle}
            title="Clock Out"
            time={shift.actualEnd || null}
            details={shift.actualEnd ? 'Shift completed' : 'Pending'}
            completed={!!shift.actualEnd}
            warning={shift.isUnderworking}
            warningText={shift.isUnderworking ? `Underworking: ${shift.underworkingMinutes} minutes` : undefined}
          />
        </div>
      </Card>

      {/* Alerts & Flags */}
      {(shift.hasIncident || shift.isLate || shift.isUnderworking) && (
        <Card className="p-6 bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Alerts & Flags</h3>
          </div>

          <div className="space-y-2">
            {shift.hasIncident && (
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Incident reported during this shift</span>
              </div>
            )}
            {shift.isLate && (
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Late arrival: {shift.minutesLate} minutes</span>
              </div>
            )}
            {shift.isUnderworking && (
              <div className="flex items-center gap-2 text-orange-400">
                <Route className="w-4 h-4" />
                <span>Underworking: {shift.underworkingMinutes} minutes short</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// Components
function TimelineItem({ 
  icon: Icon, 
  title, 
  time, 
  details, 
  completed, 
  warning,
  warningText 
}: { 
  icon: any; 
  title: string; 
  time: string | Date | null; 
  details: string;
  completed: boolean;
  warning?: boolean;
  warningText?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
        completed 
          ? warning 
            ? "bg-amber-500/20 text-amber-400" 
            : "bg-green-500/20 text-green-400"
          : "bg-white/5 text-gray-500"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-white">{title}</h4>
          {warning && warningText && (
            <Badge variant="warning" className="text-[10px]">{warningText}</Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">
          {time ? format(new Date(time), 'h:mm a') : '-'}
        </p>
        <p className="text-xs text-gray-500 mt-1">{details}</p>
      </div>
    </div>
  );
}
