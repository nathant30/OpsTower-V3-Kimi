/**
 * CreateShiftModal Component
 * Form modal for creating a new shift
 */

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { format, addHours } from 'date-fns';
import { Calendar, Clock, User, Car, MapPin, AlertCircle, ChevronDown } from 'lucide-react';
import type { ShiftType, CreateShiftData } from '../types';

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateShiftData) => void;
  isCreating?: boolean;
}

const SHIFT_TYPES: { value: ShiftType; label: string; time: string; color: string }[] = [
  { value: 'AM', label: 'AM Shift', time: '6:00 AM - 2:00 PM', color: 'bg-amber-500' },
  { value: 'PM', label: 'PM Shift', time: '2:00 PM - 10:00 PM', color: 'bg-blue-500' },
  { value: 'NIGHT', label: 'Night Shift', time: '10:00 PM - 6:00 AM', color: 'bg-purple-500' },
];

export function CreateShiftModal({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreateShiftModalProps) {
  const [driverId, setDriverId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [shiftType, setShiftType] = useState<ShiftType>('AM');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('14:00');
  const [geofenceId, setGeofenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update times when shift type changes
  useEffect(() => {
    switch (shiftType) {
      case 'AM':
        setStartTime('06:00');
        setEndTime('14:00');
        break;
      case 'PM':
        setStartTime('14:00');
        setEndTime('22:00');
        break;
      case 'NIGHT':
        setStartTime('22:00');
        setEndTime('06:00');
        break;
    }
  }, [shiftType]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!driverId.trim()) {
      newErrors.driverId = 'Driver ID is required';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Construct scheduled start and end dates
    const scheduledStart = new Date(`${date}T${startTime}`);
    let scheduledEnd: Date | undefined;

    if (endTime) {
      scheduledEnd = new Date(`${date}T${endTime}`);
      // Handle overnight shifts
      if (scheduledEnd <= scheduledStart) {
        scheduledEnd = addHours(scheduledEnd, 24);
      }
    }

    onCreate({
      driverId: driverId.trim(),
      assetId: assetId.trim() || undefined,
      shiftType,
      scheduledStart,
      scheduledEnd,
      geofenceId: geofenceId.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    if (!isCreating) {
      setDriverId('');
      setAssetId('');
      setShiftType('AM');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setStartTime('06:00');
      setEndTime('14:00');
      setGeofenceId('');
      setNotes('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Shift" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Shift Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shift Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {SHIFT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setShiftType(type.value)}
                className={cn(
                  'relative flex flex-col items-center p-3 rounded-xl border transition-all',
                  shiftType === type.value
                    ? `border-${type.color.replace('bg-', '')} bg-${type.color.replace('bg-', '')}/10`
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                )}
              >
                <div className={cn('w-3 h-3 rounded-full mb-2', type.color)} />
                <span className="text-sm font-medium text-white">{type.label}</span>
                <span className="text-xs text-gray-400 mt-1">{type.time}</span>
                {shiftType === type.value && (
                  <div className={cn('absolute top-2 right-2 w-2 h-2 rounded-full', type.color)} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Driver & Vehicle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Driver ID <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={driverId}
              onChange={(e) => {
                setDriverId(e.target.value);
                if (errors.driverId) setErrors({ ...errors, driverId: '' });
              }}
              placeholder="e.g., D001"
              disabled={isCreating}
              error={errors.driverId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <Car className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Vehicle ID <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <Input
              type="text"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              placeholder="e.g., V001"
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Date <span className="text-red-400">*</span>
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors({ ...errors, date: '' });
              }}
              disabled={isCreating}
              error={errors.date}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
              Start Time <span className="text-red-400">*</span>
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (errors.startTime) setErrors({ ...errors, startTime: '' });
              }}
              disabled={isCreating}
              error={errors.startTime}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
              End Time <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        {/* Geofence */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
            Geofence ID <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <Input
            type="text"
            value={geofenceId}
            onChange={(e) => setGeofenceId(e.target.value)}
            placeholder="e.g., ZONE_NORTH"
            disabled={isCreating}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Notes <span className="text-gray-500 text-xs">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            disabled={isCreating}
            className={cn(
              'w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg',
              'text-white text-sm placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-none'
            )}
          />
        </div>

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-400">
              Please fix the errors above to continue.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" onClick={handleClose} type="button" disabled={isCreating}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isCreating}>
            Create Shift
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateShiftModal;
