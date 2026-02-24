/**
 * Driver Tier Assignment Component
 * Interface for assigning and managing driver tiers
 */

import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Tier, TierLevel, DriverTier, AssignTierRequest } from '@/features/tiers/types';
import { 
  useDriverTiers, 
  useAssignTier, 
  useBulkAssignTier,
  useRecalculateDriverTier,
  getTierBadgeClasses,
  getTierIcon,
  getTierLabel,
} from '../hooks/useTiers';
import { TierProgressBar } from './TierCard';

interface DriverTierAssignmentProps {
  tiers: Tier[];
  className?: string;
}

// Driver row component
function DriverRow({
  driver,
  tiers,
  isSelected,
  onSelect,
  onAssign,
  onRecalculate,
  isRecalculating,
}: {
  driver: DriverTier;
  tiers: Tier[];
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onAssign: () => void;
  onRecalculate: () => void;
  isRecalculating: boolean;
}) {
  const currentTier = tiers.find(t => t.level === driver.currentTier);
  const badgeClasses = getTierBadgeClasses(driver.currentTier);

  return (
    <tr className="border-b border-gray-800 hover:bg-white/5 transition-colors">
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-gray-700 bg-[#0f0f14] text-blue-500 focus:ring-blue-500/50"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {driver.avatar ? (
            <img src={driver.avatar} alt={driver.driverName} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
          )}
          <div>
            <div className="font-medium text-white">{driver.driverName}</div>
            <div className="text-xs text-gray-500">{driver.email}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <Badge className={`${badgeClasses} border`}>
          {getTierIcon(driver.currentTier)} {getTierLabel(driver.currentTier)}
        </Badge>
        {driver.previousTier && driver.previousTier !== driver.currentTier && (
          <div className="text-xs text-gray-500 mt-1">
            from {getTierLabel(driver.previousTier)}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-300">
          <div>{driver.metrics.totalTrips} trips</div>
          <div className="text-xs text-gray-500">
            {driver.metrics.rating}★ • {driver.metrics.completionRate}% completion
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        {driver.progressToNextTier ? (
          <div className="w-32">
            <TierProgressBar
              currentTier={driver.currentTier}
              nextTier={driver.progressToNextTier.nextTier}
              progress={driver.progressToNextTier.percentComplete}
            />
          </div>
        ) : (
          <span className="text-sm text-gray-500">Max tier reached</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onAssign}>
            Change
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRecalculate}
            loading={isRecalculating}
            title="Recalculate tier"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Main Component
export function DriverTierAssignment({ tiers, className }: DriverTierAssignmentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<TierLevel | ''>('');
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<DriverTier | null>(null);
  const [bulkAssignTier, setBulkAssignTier] = useState<TierLevel>('Bronze');
  const [assignReason, setAssignReason] = useState('');

  const { data: driversData, isLoading } = useDriverTiers({
    tier: selectedTier || undefined,
    searchQuery: searchQuery || undefined,
  });

  const assignMutation = useAssignTier();
  const bulkAssignMutation = useBulkAssignTier();
  const recalculateMutation = useRecalculateDriverTier();

  const drivers = driversData?.items || [];

  const tierStats = useMemo(() => {
    const stats: Record<string, number> = {};
    tiers.forEach(tier => {
      stats[tier.level] = drivers.filter(d => d.currentTier === tier.level).length;
    });
    return stats;
  }, [drivers, tiers]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDrivers(new Set(drivers.map(d => d.driverId)));
    } else {
      setSelectedDrivers(new Set());
    }
  };

  const handleSelectDriver = (driverId: string, checked: boolean) => {
    const newSelected = new Set(selectedDrivers);
    if (checked) {
      newSelected.add(driverId);
    } else {
      newSelected.delete(driverId);
    }
    setSelectedDrivers(newSelected);
  };

  const handleAssign = async () => {
    if (!selectedDriver) return;

    try {
      await assignMutation.mutateAsync({
        driverId: selectedDriver.driverId,
        tier: bulkAssignTier,
        reason: assignReason,
      });
      setAssignModalOpen(false);
      setSelectedDriver(null);
      setAssignReason('');
    } catch (err) {
      console.error('Failed to assign tier:', err);
    }
  };

  const handleBulkAssign = async () => {
    if (selectedDrivers.size === 0) return;

    try {
      await bulkAssignMutation.mutateAsync({
        driverIds: Array.from(selectedDrivers),
        tier: bulkAssignTier,
        reason: assignReason || 'Bulk tier assignment',
      });
      setSelectedDrivers(new Set());
      setAssignReason('');
    } catch (err) {
      console.error('Failed to bulk assign tier:', err);
    }
  };

  const handleRecalculate = async (driverId: string) => {
    try {
      await recalculateMutation.mutateAsync(driverId);
    } catch (err) {
      console.error('Failed to recalculate tier:', err);
    }
  };

  const openAssignModal = (driver: DriverTier) => {
    setSelectedDriver(driver);
    setBulkAssignTier(driver.currentTier);
    setAssignReason('');
    setAssignModalOpen(true);
  };

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as TierLevel | '')}
            className="bg-[#0f0f14] border border-gray-800 rounded-lg pl-9 pr-8 py-2 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">All Tiers</option>
            {tiers.map(tier => (
              <option key={tier.level} value={tier.level}>
                {getTierIcon(tier.level)} {tier.name} ({tierStats[tier.level] || 0})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        {selectedDrivers.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <span className="text-sm text-blue-400">{selectedDrivers.size} selected</span>
            <button
              onClick={() => setSelectedDrivers(new Set())}
              className="text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedDrivers.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#12121a] border border-gray-800 rounded-lg">
          <span className="text-sm text-gray-400">Bulk assign to:</span>
          <select
            value={bulkAssignTier}
            onChange={(e) => setBulkAssignTier(e.target.value as TierLevel)}
            className="bg-[#0f0f14] border border-gray-800 rounded px-2 py-1 text-sm text-white"
          >
            {tiers.map(tier => (
              <option key={tier.level} value={tier.level}>
                {tier.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Reason for change..."
            value={assignReason}
            onChange={(e) => setAssignReason(e.target.value)}
            className="flex-1 min-w-[150px] bg-[#0f0f14] border border-gray-800 rounded px-2 py-1 text-sm text-white placeholder-gray-600"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleBulkAssign}
            loading={bulkAssignMutation.isPending}
          >
            Assign
          </Button>
        </div>
      )}

      {/* Drivers Table */}
      <XpressCard>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDrivers.size === drivers.length && drivers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-[#0f0f14] text-blue-500"
                  />
                </th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Driver</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Current Tier</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Metrics</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Progress</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <DriverRow
                    key={driver.driverId}
                    driver={driver}
                    tiers={tiers}
                    isSelected={selectedDrivers.has(driver.driverId)}
                    onSelect={(checked) => handleSelectDriver(driver.driverId, checked)}
                    onAssign={() => openAssignModal(driver)}
                    onRecalculate={() => handleRecalculate(driver.driverId)}
                    isRecalculating={recalculateMutation.isPending && recalculateMutation.variables === driver.driverId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </XpressCard>

      {/* Assign Tier Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Tier - ${selectedDriver?.driverName}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              loading={assignMutation.isPending}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Assign Tier
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Tier
            </label>
            <div className="grid grid-cols-1 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.level}
                  onClick={() => setBulkAssignTier(tier.level)}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                    ${bulkAssignTier === tier.level
                      ? 'bg-blue-500/10 border-blue-500/50'
                      : 'bg-[#0f0f14] border-gray-800 hover:border-gray-700'
                    }
                  `}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${tier.color}20`,
                      border: `1px solid ${tier.color}40`,
                    }}
                  >
                    {getTierIcon(tier.level)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{tier.name}</div>
                    <div className="text-xs text-gray-500">
                      {tier.benefits.commissionRate}% commission • Priority {tier.benefits.priorityLevel}
                    </div>
                  </div>
                  {bulkAssignTier === tier.level && (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Reason for Change
            </label>
            <textarea
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              placeholder="Enter reason for tier change..."
              rows={3}
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default DriverTierAssignment;
