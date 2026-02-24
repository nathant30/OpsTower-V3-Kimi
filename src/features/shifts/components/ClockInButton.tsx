/**
 * ClockInButton Component
 * Large button for clocking in to a shift
 */

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import { clockIn } from '@/services/shifts/shift.service';
import type { Shift } from '../types';

interface ClockInButtonProps {
  shiftId: string;
  onSuccess?: (shift: Shift) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ClockInButton({
  shiftId,
  onSuccess,
  onError,
  disabled = false,
  size = 'lg',
  className,
}: ClockInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClockIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get location (optional)
      let locationData = {};
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
      } catch {
        // Location is optional, continue without it
      }

      const updatedShift = await clockIn(shiftId, locationData);
      setShowConfirm(false);
      onSuccess?.(updatedShift);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock in';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled || isLoading}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'rounded-2xl font-semibold text-white',
          'bg-gradient-to-br from-green-500 to-emerald-600',
          'hover:from-green-400 hover:to-emerald-500',
          'active:from-green-600 active:to-emerald-700',
          'shadow-lg shadow-green-500/25',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          sizeClasses[size],
          className
        )}
      >
        <Clock className="w-6 h-6" />
        <span>Clock In</span>
        <span className="text-xs font-normal text-green-100 opacity-80">
          Start your shift
        </span>
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setError(null);
        }}
        title="Clock In Confirmation"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
            <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Ready to start your shift?</p>
              <p className="text-sm text-gray-400 mt-1">
                This will record your clock-in time and location. Make sure you are at your designated starting point.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setShowConfirm(false);
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleClockIn}
              loading={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-500"
            >
              Confirm Clock In
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ClockInButton;
