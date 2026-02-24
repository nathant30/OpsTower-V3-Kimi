/**
 * ClockOutButton Component
 * Large button for clocking out of a shift
 */

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LogOut, Clock, AlertCircle, AlertTriangle } from 'lucide-react';
import { clockOut } from '@/services/shifts/shift.service';
import type { Shift } from '../types';

interface ClockOutButtonProps {
  shiftId: string;
  onSuccess?: (shift: Shift) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ClockOutButton({
  shiftId,
  onSuccess,
  onError,
  disabled = false,
  size = 'lg',
  className,
}: ClockOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClockOut = async () => {
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

      const updatedShift = await clockOut(shiftId, locationData);
      setShowConfirm(false);
      onSuccess?.(updatedShift);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clock out';
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
          'bg-gradient-to-br from-orange-500 to-red-600',
          'hover:from-orange-400 hover:to-red-500',
          'active:from-orange-600 active:to-red-700',
          'shadow-lg shadow-orange-500/25',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          sizeClasses[size],
          className
        )}
      >
        <LogOut className="w-6 h-6" />
        <span>Clock Out</span>
        <span className="text-xs font-normal text-orange-100 opacity-80">
          End your shift
        </span>
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setError(null);
        }}
        title="Clock Out Confirmation"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Ready to end your shift?</p>
              <p className="text-sm text-gray-400 mt-1">
                This will record your clock-out time and finalize your shift. You won't be able to make changes after this.
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
              onClick={handleClockOut}
              loading={isLoading}
              className="flex-1 bg-orange-600 hover:bg-orange-500"
            >
              Confirm Clock Out
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ClockOutButton;
