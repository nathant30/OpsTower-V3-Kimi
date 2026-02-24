/**
 * BreakButton Component
 * Button for managing breaks during a shift
 */

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Coffee, PauseCircle, PlayCircle, AlertCircle, Clock } from 'lucide-react';
import { startBreak, endBreak } from '@/services/shifts/shift.service';
import type { Shift } from '../types';

interface BreakButtonProps {
  shiftId: string;
  isOnBreak: boolean;
  onSuccess?: (shift: Shift) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BreakButton({
  shiftId,
  isOnBreak,
  onSuccess,
  onError,
  disabled = false,
  size = 'lg',
  className,
}: BreakButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartBreak = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedShift = await startBreak(shiftId, { reason: breakReason || undefined });
      setShowConfirm(false);
      setBreakReason('');
      onSuccess?.(updatedShift);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start break';
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedShift = await endBreak(shiftId);
      setShowConfirm(false);
      onSuccess?.(updatedShift);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end break';
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

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  if (isOnBreak) {
    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={disabled || isLoading}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2',
            'rounded-2xl font-semibold text-white',
            'bg-gradient-to-br from-emerald-500 to-teal-600',
            'hover:from-emerald-400 hover:to-teal-500',
            'active:from-emerald-600 active:to-teal-700',
            'shadow-lg shadow-emerald-500/25',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
            sizeClasses[size],
            className
          )}
        >
          <PlayCircle className={iconSizes[size]} />
          <span>End Break</span>
          <span className="text-xs font-normal text-emerald-100 opacity-80">
            Resume working
          </span>
        </button>

        <Modal
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setError(null);
          }}
          title="End Break"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">Ready to resume?</p>
                <p className="text-sm text-gray-400 mt-1">
                  This will end your break and mark you as active again.
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
                onClick={handleEndBreak}
                loading={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500"
              >
                End Break
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={disabled || isLoading}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2',
          'rounded-2xl font-semibold text-white',
          'bg-gradient-to-br from-yellow-500 to-amber-600',
          'hover:from-yellow-400 hover:to-amber-500',
          'active:from-yellow-600 active:to-amber-700',
          'shadow-lg shadow-yellow-500/25',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          sizeClasses[size],
          className
        )}
      >
        <Coffee className={iconSizes[size]} />
        <span>Start Break</span>
        <span className="text-xs font-normal text-yellow-100 opacity-80">
          Take a pause
        </span>
      </button>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setBreakReason('');
          setError(null);
        }}
        title="Start Break"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg">
            <PauseCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white font-medium">Taking a break?</p>
              <p className="text-sm text-gray-400 mt-1">
                Your break time will be tracked. Please keep breaks within company policy limits.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Reason (optional)
            </label>
            <select
              value={breakReason}
              onChange={(e) => setBreakReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <option value="">Select a reason...</option>
              <option value="meal">Meal Break</option>
              <option value="rest">Rest Break</option>
              <option value="personal">Personal</option>
              <option value="vehicle">Vehicle Issue</option>
              <option value="other">Other</option>
            </select>
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
                setBreakReason('');
                setError(null);
              }}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartBreak}
              loading={isLoading}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500"
            >
              Start Break
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default BreakButton;
