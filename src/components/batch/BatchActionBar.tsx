import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { X, CheckSquare, Square } from 'lucide-react';

export interface BatchActionBarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total number of items */
  totalCount?: number;
  /** Action buttons */
  children: ReactNode;
  /** Clear selection callback */
  onClear: () => void;
  /** Select all callback */
  onSelectAll?: () => void;
  /** Whether all items are selected */
  isAllSelected?: boolean;
  /** Additional class name */
  className?: string;
  /** Message to show instead of default */
  message?: string;
}

/**
 * Sticky action bar for batch operations
 * 
 * Shows the count of selected items and action buttons.
 * Stays at the bottom of the viewport for easy access.
 * 
 * @example
 * <BatchActionBar
 *   selectedCount={selection.selectedCount}
 *   totalCount={orders.length}
 *   isAllSelected={selection.isAllSelected}
 *   onClear={selection.deselectAll}
 *   onSelectAll={selection.selectAll}
 * >
 *   <BatchActionButton variant="danger" onClick={handleBulkCancel}>
 *     Cancel Orders
 *   </BatchActionButton>
 *   <BatchActionButton onClick={handleBulkAssign}>
 *     Assign Driver
 *   </BatchActionButton>
 * </BatchActionBar>
 */
export const BatchActionBar = forwardRef<HTMLDivElement, BatchActionBarProps>(
  (
    {
      selectedCount,
      totalCount,
      children,
      onClear,
      onSelectAll,
      isAllSelected,
      className,
      message,
    },
    ref
  ) => {
    const defaultMessage = totalCount
      ? `${selectedCount} of ${totalCount} selected`
      : `${selectedCount} selected`;

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
          'flex items-center gap-4',
          'px-4 py-3',
          'bg-xpress-bg-tertiary border border-xpress-border',
          'rounded-lg shadow-xl',
          'animate-in slide-in-from-bottom-4 fade-in duration-200',
          className
        )}
      >
        {/* Selection info */}
        <div className="flex items-center gap-3 pr-4 border-r border-xpress-border">
          {onSelectAll ? (
            <button
              onClick={isAllSelected ? onClear : onSelectAll}
              className="flex items-center gap-2 text-sm text-xpress-text-secondary hover:text-xpress-text-primary transition-colors"
              title={isAllSelected ? 'Deselect all' : 'Select all'}
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-xpress-accent-blue" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="font-medium whitespace-nowrap">
                {message || defaultMessage}
              </span>
            </button>
          ) : (
            <span className="text-sm font-medium text-xpress-text-primary whitespace-nowrap">
              {message || defaultMessage}
            </span>
          )}

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-xpress-bg-elevated text-xpress-text-muted hover:text-xpress-text-primary transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {children}
        </div>
      </div>
    );
  }
);

BatchActionBar.displayName = 'BatchActionBar';

// ==================== Action Button Components ====================

export interface BatchActionButtonProps extends Omit<ButtonProps, 'size'> {
  /** Confirm before executing action */
  confirmMessage?: string;
}

/**
 * Button for batch actions
 * Pre-configured with small size and appropriate styling
 */
export const BatchActionButton = forwardRef<HTMLButtonElement, BatchActionButtonProps>(
  ({ confirmMessage, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmMessage) {
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        size="sm"
        onClick={handleClick}
        {...props}
      />
    );
  }
);

BatchActionButton.displayName = 'BatchActionButton';

// ==================== Preset Action Buttons ====================

export interface BatchDeleteButtonProps extends Omit<BatchActionButtonProps, 'variant'> {
  itemName?: string;
}

/**
 * Delete button with confirmation
 */
export const BatchDeleteButton = forwardRef<HTMLButtonElement, BatchDeleteButtonProps>(
  ({ itemName = 'items', confirmMessage, ...props }, ref) => {
    const defaultConfirmMessage = `Are you sure you want to delete the selected ${itemName}?`;

    return (
      <BatchActionButton
        ref={ref}
        variant="danger"
        confirmMessage={confirmMessage || defaultConfirmMessage}
        {...props}
      />
    );
  }
);

BatchDeleteButton.displayName = 'BatchDeleteButton';

// ==================== Page-Specific Batch Action Bars ====================

export interface OrdersBatchActionsProps {
  selectedCount: number;
  totalCount?: number;
  isAllSelected?: boolean;
  onClear: () => void;
  onSelectAll?: () => void;
  onBulkCancel: () => void;
  onBulkAssign: () => void;
  isLoading?: boolean;
}

/**
 * Batch action bar for Orders page
 */
export function OrdersBatchActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onClear,
  onSelectAll,
  onBulkCancel,
  onBulkAssign,
  isLoading,
}: OrdersBatchActionsProps) {
  return (
    <BatchActionBar
      selectedCount={selectedCount}
      totalCount={totalCount}
      isAllSelected={isAllSelected}
      onClear={onClear}
      onSelectAll={onSelectAll}
    >
      <BatchActionButton
        variant="danger"
        onClick={onBulkCancel}
        loading={isLoading}
        confirmMessage={`Cancel ${selectedCount} order(s)?`}
      >
        Cancel Orders
      </BatchActionButton>
      <BatchActionButton
        onClick={onBulkAssign}
        loading={isLoading}
      >
        Assign Driver
      </BatchActionButton>
    </BatchActionBar>
  );
}

export interface DriversBatchActionsProps {
  selectedCount: number;
  totalCount?: number;
  isAllSelected?: boolean;
  onClear: () => void;
  onSelectAll?: () => void;
  onBulkSuspend: () => void;
  onBulkMessage: () => void;
  isLoading?: boolean;
}

/**
 * Batch action bar for Drivers page
 */
export function DriversBatchActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onClear,
  onSelectAll,
  onBulkSuspend,
  onBulkMessage,
  isLoading,
}: DriversBatchActionsProps) {
  return (
    <BatchActionBar
      selectedCount={selectedCount}
      totalCount={totalCount}
      isAllSelected={isAllSelected}
      onClear={onClear}
      onSelectAll={onSelectAll}
    >
      <BatchActionButton
        variant="danger"
        onClick={onBulkSuspend}
        loading={isLoading}
        confirmMessage={`Suspend ${selectedCount} driver(s)?`}
      >
        Suspend Drivers
      </BatchActionButton>
      <BatchActionButton
        onClick={onBulkMessage}
        loading={isLoading}
      >
        Send Message
      </BatchActionButton>
    </BatchActionBar>
  );
}

export interface FleetBatchActionsProps {
  selectedCount: number;
  totalCount?: number;
  isAllSelected?: boolean;
  onClear: () => void;
  onSelectAll?: () => void;
  onBulkStatusUpdate: (status: 'Active' | 'Maintenance' | 'Offline') => void;
  isLoading?: boolean;
}

/**
 * Batch action bar for Fleet page
 */
export function FleetBatchActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onClear,
  onSelectAll,
  onBulkStatusUpdate,
  isLoading,
}: FleetBatchActionsProps) {
  return (
    <BatchActionBar
      selectedCount={selectedCount}
      totalCount={totalCount}
      isAllSelected={isAllSelected}
      onClear={onClear}
      onSelectAll={onSelectAll}
    >
      <BatchActionButton
        variant="primary"
        onClick={() => onBulkStatusUpdate('Active')}
        loading={isLoading}
      >
        Set Active
      </BatchActionButton>
      <BatchActionButton
        onClick={() => onBulkStatusUpdate('Maintenance')}
        loading={isLoading}
      >
        Set Maintenance
      </BatchActionButton>
      <BatchActionButton
        variant="secondary"
        onClick={() => onBulkStatusUpdate('Offline')}
        loading={isLoading}
      >
        Set Offline
      </BatchActionButton>
    </BatchActionBar>
  );
}

export default BatchActionBar;
