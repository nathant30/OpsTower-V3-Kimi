/**
 * Shifts Module Type Definitions
 */

export type ShiftStatus = 
  | 'SCHEDULED' 
  | 'CLOCKED_IN' 
  | 'ACTIVE' 
  | 'ON_BREAK' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export type ShiftType = 'AM' | 'PM' | 'NIGHT';

export interface ShiftDriver {
  driverId: string;
  firstName: string;
  lastName: string;
  phone: string;
  photoUrl?: string;
}

export interface ShiftAsset {
  vehicleId: string;
  plateNumber: string;
  type: string;
}

export interface ShiftBreak {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  reason?: string;
}

export interface Shift {
  id: string;
  shiftId: string;
  driverId: string;
  driverName: string;
  driver?: ShiftDriver;
  asset?: ShiftAsset;
  shiftType: ShiftType;
  status: ShiftStatus;
  scheduledStart: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  clockInLat?: number;
  clockInLng?: number;
  clockOutLat?: number;
  clockOutLng?: number;
  duration?: number;
  revenue?: number;
  totalRevenue?: number;
  trips?: number;
  tripCount?: number;
  utilizedMinutes?: number;
  breakCount?: number;
  breakMinutes?: number;
  breakStart?: string;
  breaks?: ShiftBreak[];
  isLate?: boolean;
  minutesLate?: number;
  isUnderworking?: boolean;
  underworkingMinutes?: number;
  hasIncident?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShiftFilters {
  status?: ShiftStatus | ShiftStatus[];
  shiftType?: ShiftType;
  date?: Date;
  driverId?: string;
  hasIncident?: boolean;
  underWorking?: boolean;
  lateArrival?: boolean;
}

export interface CreateShiftData {
  driverId: string;
  assetId?: string;
  shiftType: ShiftType;
  scheduledStart: Date | string;
  scheduledEnd?: Date | string;
  geofenceId?: string;
  notes?: string;
}

export interface ClockInData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface ClockOutData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  odometerReading?: number;
}

export interface StartBreakData {
  reason?: string;
}

export interface ShiftTimelineEvent {
  id: string;
  type: 'scheduled' | 'clock_in' | 'clock_out' | 'break_start' | 'break_end' | 'incident';
  title: string;
  timestamp: string;
  details?: string;
  location?: {
    lat: number;
    lng: number;
  };
  warning?: boolean;
  warningText?: string;
}

export interface ShiftStats {
  total: number;
  active: number;
  completed: number;
  incidents: number;
  late: number;
  underworking: number;
}

export const SHIFT_TYPE_CONFIG: Record<ShiftType, { label: string; time: string; color: string; bgColor: string }> = {
  AM: { 
    label: 'AM Shift', 
    time: '6:00 AM - 2:00 PM', 
    color: 'text-amber-400', 
    bgColor: 'bg-amber-500' 
  },
  PM: { 
    label: 'PM Shift', 
    time: '2:00 PM - 10:00 PM', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-500' 
  },
  NIGHT: { 
    label: 'Night Shift', 
    time: '10:00 PM - 6:00 AM', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500' 
  },
};

export const SHIFT_STATUS_CONFIG: Record<ShiftStatus, { label: string; color: string; bgColor: string; textColor: string }> = {
  SCHEDULED: { 
    label: 'Scheduled', 
    color: 'gray', 
    bgColor: 'bg-gray-500',
    textColor: 'text-gray-400'
  },
  CLOCKED_IN: { 
    label: 'Clocked In', 
    color: 'blue', 
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-400'
  },
  ACTIVE: { 
    label: 'Active', 
    color: 'green', 
    bgColor: 'bg-green-500',
    textColor: 'text-green-400'
  },
  ON_BREAK: { 
    label: 'On Break', 
    color: 'yellow', 
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-400'
  },
  COMPLETED: { 
    label: 'Completed', 
    color: 'emerald', 
    bgColor: 'bg-emerald-500',
    textColor: 'text-emerald-400'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    color: 'red', 
    bgColor: 'bg-red-500',
    textColor: 'text-red-400'
  },
  NO_SHOW: { 
    label: 'No Show', 
    color: 'rose', 
    bgColor: 'bg-rose-600',
    textColor: 'text-rose-400'
  },
};
