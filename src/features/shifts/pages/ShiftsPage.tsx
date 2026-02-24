// src/features/shifts/pages/ShiftsPage.tsx
// Shift Management & Monitoring (NOT roll call - that's mobile only)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useShifts, 
  useLeaderboard, 
  useRollCall, 
  useCreateShift, 
  type ShiftFilters, 
  type CreateShiftInput,
  type ShiftType 
} from '@/features/shifts/hooks/useShifts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  MapPin,
  ChevronRight,
  Plus,
  Filter
} from 'lucide-react';

// Import new components
import { ShiftTable } from '../components/ShiftTable';
import { CreateShiftModal } from '../components/CreateShiftModal';
import type { CreateShiftData, Shift } from '../types';

const SHIFT_TYPES = [
  { value: 'AM', label: 'AM Shift', time: '6:00 AM - 2:00 PM', color: 'bg-amber-500' },
  { value: 'PM', label: 'PM Shift', time: '2:00 PM - 10:00 PM', color: 'bg-blue-500' },
  { value: 'NIGHT', label: 'Night Shift', time: '10:00 PM - 6:00 AM', color: 'bg-purple-500' },
];

export default function ShiftsPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState<'AM' | 'PM' | 'NIGHT'>('AM');
  const [filters, setFilters] = useState<ShiftFilters>({ shiftType: 'AM' });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: shifts, isLoading } = useShifts(filters, 1, 50);
  const { data: leaderboard } = useLeaderboard(selectedDate, selectedType, 10);
  const { data: rollCall } = useRollCall(selectedType, selectedDate);
  const createShiftMutation = useCreateShift();

  const todayShifts: Shift[] = (shifts?.data || []) as Shift[];

  // Calculate stats
  const stats = {
    total: todayShifts.length,
    active: todayShifts.filter((s) => ['CLOCKED_IN', 'ACTIVE', 'ON_BREAK'].includes(s.status)).length,
    completed: todayShifts.filter((s) => s.status === 'COMPLETED').length,
    incidents: todayShifts.filter((s) => s.hasIncident).length,
    late: todayShifts.filter((s) => s.isLate).length,
    underworking: todayShifts.filter((s) => s.isUnderworking).length,
  };

  const handleCreateShift = (data: CreateShiftData) => {
    const input: CreateShiftInput = {
      driverId: data.driverId,
      assetId: data.assetId,
      shiftType: data.shiftType,
      scheduledStart: data.scheduledStart instanceof Date ? data.scheduledStart : new Date(data.scheduledStart),
      scheduledEnd: data.scheduledEnd instanceof Date ? data.scheduledEnd : data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
      geofenceId: data.geofenceId,
    };
    
    createShiftMutation.mutate(input, {
      onSuccess: () => setShowCreateModal(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Shift Management</h1>
          <p className="text-gray-400">Monitor and manage driver shifts</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            Create Shift
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <StatCard label="Total Shifts" value={stats.total} icon={Calendar} color="blue" />
        <StatCard label="Active" value={stats.active} icon={Clock} color="green" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="emerald" />
        <StatCard label="With Incidents" value={stats.incidents} icon={AlertTriangle} color="red" />
        <StatCard label="Late Arrivals" value={stats.late} icon={Clock} color="amber" />
        <StatCard label="Underworking" value={stats.underworking} icon={TrendingUp} color="orange" />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="shifts" className="space-y-4">
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="shifts">All Shifts</TabsTrigger>
          <TabsTrigger value="rollcall">Roll Call Status</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* All Shifts Tab */}
        <TabsContent value="shifts" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-4 p-4 bg-[#12121a] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter by:</span>
            </div>
            
            {/* Shift Type Filter */}
            <div className="flex gap-2">
              {SHIFT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value as any);
                    setFilters({ ...filters, shiftType: type.value as any });
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filters.shiftType === type.value
                      ? `${type.color} text-white`
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={filters.status as string || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CLOCKED_IN">Clocked In</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_BREAK">On Break</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasIncident || false}
                onChange={(e) => setFilters({ ...filters, hasIncident: e.target.checked })}
                className="rounded border-white/20 bg-white/5"
              />
              Has Incidents
            </label>
          </div>

          {/* Shifts Table */}
          <ShiftTable 
            shifts={todayShifts}
            isLoading={isLoading}
            emptyMessage="No shifts found for this date"
            onRowClick={(shift) => navigate(`/shifts/${shift.id}`)}
          />
        </TabsContent>

        {/* Roll Call Tab - View Only */}
        <TabsContent value="rollcall" className="space-y-4">
          <Card className="p-4 bg-amber-500/10 border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Mobile-Only Feature</p>
                <p className="text-sm text-gray-400 mt-1">
                  Actual roll call with clock in/out is performed by drivers via mobile device.
                  This view shows real-time status only.
                </p>
              </div>
            </div>
          </Card>

          {rollCall && (
            <div className="grid grid-cols-4 gap-4">
              <RollCallStat label="Total Scheduled" value={rollCall.stats.total} icon={Users} />
              <RollCallStat label="Arrived" value={rollCall.stats.arrived} icon={CheckCircle} color="green" />
              <RollCallStat label="Can Start" value={rollCall.stats.canStart} icon={MapPin} color="blue" />
              <RollCallStat label="Blocked" value={rollCall.stats.blocked} icon={AlertTriangle} color="red" />
            </div>
          )}

          {rollCall?.entries && (
            <div className="bg-[#12121a] border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Arrived</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Block Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rollCall.entries.map((entry) => (
                    <tr key={entry.shiftId} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <span className="text-sm text-white">{entry.driverName}</span>
                      </td>
                      <td className="px-4 py-3">
                        {entry.arrivedAt ? (
                          <span className={cn(
                            "text-sm",
                            entry.isLate ? "text-red-400" : "text-green-400"
                          )}>
                            {format(new Date(entry.arrivedAt), 'h:mm a')}
                            {entry.isLate && ' (Late)'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Not arrived</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {entry.canStart ? (
                          <Badge variant="active" className="text-xs">Ready</Badge>
                        ) : (
                          <Badge variant="idle" className="text-xs">Blocked</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-red-400">{entry.blockReason || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Performers - {selectedType} Shift
            </h3>
            
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.driverId}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg",
                      index < 3 ? "bg-white/5" : "hover:bg-white/5"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      index === 0 && "bg-yellow-500/20 text-yellow-400",
                      index === 1 && "bg-gray-400/20 text-gray-300",
                      index === 2 && "bg-amber-600/20 text-amber-600",
                      index > 2 && "bg-white/10 text-gray-400"
                    )}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{entry.driverName}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">₱{entry.revenuePerHour.toFixed(2)}/hr</p>
                      <p className="text-xs text-gray-500">{entry.tripCount} trips</p>
                    </div>
                    
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-white">₱{entry.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{entry.utilizationPercent.toFixed(1)}% util</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No data available for this period</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Shift Modal */}
      <CreateShiftModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onCreate={handleCreateShift}
        isCreating={createShiftMutation.isPending}
      />
    </div>
  );
}

// Components
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400',
    amber: 'bg-amber-500/10 text-amber-400',
    orange: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

function RollCallStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color?: string }) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-500/10 text-green-400',
    blue: 'bg-blue-500/10 text-blue-400',
    red: 'bg-red-500/10 text-red-400',
    default: 'bg-white/5 text-gray-400',
  };

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color || 'default'])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}
