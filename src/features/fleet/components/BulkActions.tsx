import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FleetBatchActions } from '@/components/batch';
import type { VehicleStatus } from '@/types/domain.types';
import { 
  Power, 
  Wrench, 
  PowerOff,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  UserMinus
} from 'lucide-react';

export interface BulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
  totalCount: number;
  onStatusUpdate: (vehicleIds: string[], status: VehicleStatus, reason?: string) => void;
  onAssignDriver?: (vehicleIds: string[], driverId: string) => void;
  onUnassignDriver?: (vehicleIds: string[]) => void;
  isLoading?: boolean;
}

type BulkActionType = 'status' | 'assign' | 'unassign' | 'delete' | null;



export function BulkActions({
  selectedIds,
  onClearSelection,
  onSelectAll,
  isAllSelected,
  totalCount,
  onStatusUpdate,
  onAssignDriver,
  onUnassignDriver,
  isLoading = false,
}: BulkActionsProps) {
  const [activeAction, setActiveAction] = useState<BulkActionType>(null);
  const [selectedStatus, setSelectedStatus] = useState<VehicleStatus | null>(null);
  const [reason, setReason] = useState('');
  const [driverId, setDriverId] = useState('');

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      onStatusUpdate(selectedIds, selectedStatus, reason || undefined);
      setActiveAction(null);
      setSelectedStatus(null);
      setReason('');
    }
  };

  const handleAssignDriver = () => {
    if (driverId && onAssignDriver) {
      onAssignDriver(selectedIds, driverId);
      setActiveAction(null);
      setDriverId('');
    }
  };

  const handleUnassignDriver = () => {
    if (onUnassignDriver) {
      onUnassignDriver(selectedIds);
      setActiveAction(null);
    }
  };



  return (
    <>
      <FleetBatchActions
        selectedCount={selectedIds.length}
        totalCount={totalCount}
        isAllSelected={isAllSelected}
        onClear={onClearSelection}
        onSelectAll={onSelectAll}
        onBulkStatusUpdate={(status) => {
          setSelectedStatus(status);
          setActiveAction('status');
        }}
        isLoading={isLoading}
      />

      {/* Status Update Modal */}
      {activeAction === 'status' && selectedStatus && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveAction(null);
            setSelectedStatus(null);
            setReason('');
          }}
          title={`Update Status to ${selectedStatus}`}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-xpress-text-secondary">
              You are about to update the status of{' '}
              <span className="font-medium text-xpress-text-primary">
                {selectedIds.length} vehicle(s)
              </span>{' '}
              to{' '}
              <span className="font-medium text-xpress-text-primary">
                {selectedStatus}
              </span>.
            </p>
            
            <div>
              <label className="text-sm font-medium text-xpress-text-secondary mb-1.5 block">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                className="w-full h-24 px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-xpress-text-primary placeholder:text-xpress-text-muted focus:outline-none focus:ring-2 focus:ring-xpress-accent-blue/50 resize-none text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setActiveAction(null);
                  setSelectedStatus(null);
                  setReason('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleStatusUpdate}
                loading={isLoading}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Confirm Update
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Driver Modal */}
      {activeAction === 'assign' && (
        <Modal
          isOpen={true}
          onClose={() => {
            setActiveAction(null);
            setDriverId('');
          }}
          title="Assign Driver"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-xpress-text-secondary">
              Assign a driver to{' '}
              <span className="font-medium text-xpress-text-primary">
                {selectedIds.length} vehicle(s)
              </span>
            </p>
            
            <Input
              label="Driver ID"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              placeholder="Enter driver ID..."
              fullWidth
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setActiveAction(null);
                  setDriverId('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={handleAssignDriver}
                loading={isLoading}
                disabled={!driverId}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Assign Driver
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Unassign Driver Modal */}
      {activeAction === 'unassign' && (
        <Modal
          isOpen={true}
          onClose={() => setActiveAction(null)}
          title="Unassign Driver"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-xpress-status-alert/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-xpress-status-alert flex-shrink-0 mt-0.5" />
              <p className="text-sm text-xpress-text-secondary">
                You are about to remove the assigned driver from{' '}
                <span className="font-medium text-xpress-text-primary">
                  {selectedIds.length} vehicle(s)
                </span>.
                These vehicles will become unassigned.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="ghost" 
                onClick={() => setActiveAction(null)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger"
                onClick={handleUnassignDriver}
                loading={isLoading}
              >
                <UserMinus className="w-4 h-4 mr-1.5" />
                Unassign Driver
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// Extended batch actions with additional options
export interface ExtendedFleetBatchActionsProps {
  selectedCount: number;
  totalCount?: number;
  isAllSelected?: boolean;
  onClear: () => void;
  onSelectAll?: () => void;
  onBulkStatusUpdate: (status: VehicleStatus) => void;
  onBulkAssignDriver?: () => void;
  onBulkUnassignDriver?: () => void;
  hasAssignedDrivers?: boolean;
  isLoading?: boolean;
}

export function ExtendedFleetBatchActions({
  selectedCount,
  totalCount,
  isAllSelected,
  onClear,
  onSelectAll,
  onBulkStatusUpdate,
  onBulkAssignDriver,
  onBulkUnassignDriver,
  hasAssignedDrivers,
  isLoading,
}: ExtendedFleetBatchActionsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-4 px-4 py-3 bg-xpress-bg-tertiary border border-xpress-border rounded-lg shadow-xl">
        {/* Selection info */}
        <div className="flex items-center gap-3 pr-4 border-r border-xpress-border">
          {onSelectAll ? (
            <button
              onClick={isAllSelected ? onClear : onSelectAll}
              className="flex items-center gap-2 text-sm text-xpress-text-secondary hover:text-xpress-text-primary transition-colors"
            >
              <span className="font-medium whitespace-nowrap">
                {selectedCount} of {totalCount} selected
              </span>
            </button>
          ) : (
            <span className="text-sm font-medium text-xpress-text-primary whitespace-nowrap">
              {selectedCount} selected
            </span>
          )}

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-xpress-bg-elevated text-xpress-text-muted hover:text-xpress-text-primary transition-colors"
            title="Clear selection"
          >
            <span className="sr-only">Clear selection</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Status updates */}
          <div className="flex items-center gap-1 pr-2 border-r border-xpress-border">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onBulkStatusUpdate('Active')}
              loading={isLoading}
              icon={<Power className="w-3.5 h-3.5" />}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onBulkStatusUpdate('Maintenance')}
              loading={isLoading}
              icon={<Wrench className="w-3.5 h-3.5" />}
            >
              Maintenance
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkStatusUpdate('Offline')}
              loading={isLoading}
              icon={<PowerOff className="w-3.5 h-3.5" />}
            >
              Offline
            </Button>
          </div>

          {/* Driver actions */}
          {(onBulkAssignDriver || onBulkUnassignDriver) && (
            <div className="flex items-center gap-1">
              {onBulkAssignDriver && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onBulkAssignDriver}
                  loading={isLoading}
                  icon={<UserPlus className="w-3.5 h-3.5" />}
                >
                  Assign Driver
                </Button>
              )}
              {onBulkUnassignDriver && hasAssignedDrivers && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onBulkUnassignDriver}
                  loading={isLoading}
                  icon={<UserMinus className="w-3.5 h-3.5" />}
                >
                  Unassign
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkActions;
