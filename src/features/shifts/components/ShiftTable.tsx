/**
 * ShiftTable Component
 * Table view for listing shifts
 */

import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import { ShiftStatusBadge } from './ShiftStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { format, differenceInMinutes } from 'date-fns';
import { ChevronRight, AlertTriangle, Clock, Route } from 'lucide-react';
import type { Shift, ShiftType } from '../types';

interface ShiftTableProps {
  shifts: Shift[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (shift: Shift) => void;
  className?: string;
}

const SHIFT_TYPE_STYLES: Record<ShiftType, string> = {
  AM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  PM: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  NIGHT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function ShiftTable({
  shifts,
  isLoading = false,
  emptyMessage = 'No shifts found',
  onRowClick,
  className,
}: ShiftTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (shift: Shift) => {
    if (onRowClick) {
      onRowClick(shift);
    } else {
      navigate(`/shifts/${shift.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-[#12121a] border border-white/10 rounded-lg overflow-hidden', className)}>
        <div className="px-4 py-8 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            Loading shifts...
          </div>
        </div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className={cn('bg-[#12121a] border border-white/10 rounded-lg overflow-hidden', className)}>
        <div className="px-4 py-12 text-center">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-[#12121a] border border-white/10 rounded-lg overflow-hidden', className)}>
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Driver
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Scheduled
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Revenue
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Flags
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {shifts.map((shift) => (
            <tr
              key={shift.id}
              onClick={() => handleRowClick(shift)}
              className="hover:bg-white/5 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
                    {shift.driver?.firstName?.[0]}{shift.driver?.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {shift.driver?.firstName} {shift.driver?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shift.driver?.phone}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
                    SHIFT_TYPE_STYLES[shift.shiftType]
                  )}
                >
                  {shift.shiftType}
                </span>
              </td>
              <td className="px-4 py-3">
                <ShiftStatusBadge status={shift.status} size="sm" />
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-300">
                  {format(new Date(shift.scheduledStart), 'h:mm a')}
                </div>
                {shift.scheduledEnd && (
                  <div className="text-xs text-gray-500">
                    {format(new Date(shift.scheduledEnd), 'h:mm a')}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {shift.actualStart && shift.actualEnd ? (
                  <span className="text-sm text-gray-300">
                    {formatDuration(differenceInMinutes(new Date(shift.actualEnd), new Date(shift.actualStart)))}
                  </span>
                ) : shift.duration ? (
                  <span className="text-sm text-gray-300">
                    {formatDuration(shift.duration)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-green-400 font-medium">
                  ₱{Number(shift.totalRevenue || shift.revenue || 0).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap">
                  {shift.isLate && (
                    <Badge variant="warning" className="text-[10px]">
                      <Clock className="w-3 h-3 mr-1" />
                      Late
                    </Badge>
                  )}
                  {shift.hasIncident && (
                    <Badge variant="alert" className="text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Incident
                    </Badge>
                  )}
                  {shift.isUnderworking && (
                    <Badge variant="default" className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <Route className="w-3 h-3 mr-1" />
                      Under
                    </Badge>
                  )}
                  {shift.breakCount ? (
                    <Badge variant="default" className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Clock className="w-3 h-3 mr-1" />
                      {shift.breakCount} break{shift.breakCount > 1 ? 's' : ''}
                    </Badge>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <ChevronRight className="w-4 h-4 text-gray-500 inline" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default ShiftTable;
