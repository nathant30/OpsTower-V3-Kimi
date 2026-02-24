/**
 * Tier Management Page
 * Comprehensive tier system management interface
 */

import { useState } from 'react';
import { 
  Crown, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  RotateCcw,
  Plus,
  PieChart,
  History,
  Award,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import type { Tier, SaveTierRequest, TierCalculationRule } from '@/features/tiers/types';
import {
  useTiers,
  useTierStats,
  useTierDistribution,
  useTierHistory,
  useCreateTier,
  useUpdateTier,
  useDeleteTier,
  useRunTierRecalculation,
  useCalculationRules,
  getTierBadgeClasses,
  getTierIcon,
  formatChangeType,
  getChangeTypeColor,
} from '../hooks/useTiers';
import { TierCard, TierCardCompact } from '../components/TierCard';
import { TierRequirementsForm } from '../components/TierRequirementsForm';
import { DriverTierAssignment } from '../components/DriverTierAssignment';

// Distribution Chart Component
function TierDistributionChart({ data }: { data: { tier: string; count: number; percentage: number; color: string }[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.tier} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white">{item.tier}</span>
            </div>
            <div className="text-gray-400">
              {item.count} ({item.percentage.toFixed(1)}%)
            </div>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Tier History Component
function TierHistoryPanel() {
  const { data: historyData, isLoading } = useTierHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const history = historyData?.items || [];

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-4 p-3 bg-[#0f0f14] border border-gray-800 rounded-lg"
        >
          <div className={`text-lg ${getChangeTypeColor(entry.changeType)}`}>
            {formatChangeType(entry.changeType)}
          </div>
          <div className="flex-1">
            <div className="text-white font-medium">
              {entry.driverName}
            </div>
            <div className="text-sm text-gray-500">
              {entry.fromTier} → {entry.toTier}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">
              {new Date(entry.changedAt).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-600">
              by {entry.changedBy}
            </div>
          </div>
        </div>
      ))}
      {history.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tier history available
        </div>
      )}
    </div>
  );
}

// Calculation Rules Component
function CalculationRulesPanel() {
  const { data: rules, isLoading } = useCalculationRules();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules?.map((rule: TierCalculationRule) => (
        <div
          key={rule.id}
          className="flex items-center justify-between p-3 bg-[#0f0f14] border border-gray-800 rounded-lg"
        >
          <div>
            <div className="text-white font-medium">{rule.name}</div>
            <div className="text-sm text-gray-500">{rule.description}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                {rule.checkFrequency}
              </Badge>
              {rule.autoUpgrade && (
                <Badge variant="success" className="text-xs">
                  Auto Upgrade
                </Badge>
              )}
              {rule.autoDowngrade && (
                <Badge variant="alert" className="text-xs">
                  Auto Downgrade
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${rule.isEnabled ? 'text-green-400' : 'text-gray-500'}`}>
              {rule.isEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <div
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
                rule.isEnabled ? 'bg-blue-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  rule.isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Page Component
export default function TierManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [showRecalculateConfirm, setShowRecalculateConfirm] = useState(false);

  const { data: tiersData, isLoading: tiersLoading } = useTiers();
  const { data: stats, isLoading: statsLoading } = useTierStats();
  const { data: distribution, isLoading: distributionLoading } = useTierDistribution();
  
  const createMutation = useCreateTier();
  const updateMutation = useUpdateTier();
  const deleteMutation = useDeleteTier();
  const recalculateMutation = useRunTierRecalculation();

  const tiers = tiersData?.items || [];

  const handleCreate = () => {
    setEditingTier(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tier: Tier) => {
    setEditingTier(tier);
    setIsFormOpen(true);
  };

  const handleDelete = async (tier: Tier) => {
    if (!confirm(`Are you sure you want to delete ${tier.name}?`)) return;
    
    try {
      await deleteMutation.mutateAsync(tier.id);
    } catch (err) {
      console.error('Failed to delete tier:', err);
    }
  };

  const handleSave = async (data: SaveTierRequest) => {
    try {
      if (editingTier) {
        await updateMutation.mutateAsync({ id: editingTier.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setIsFormOpen(false);
      setEditingTier(null);
    } catch (err) {
      console.error('Failed to save tier:', err);
    }
  };

  const handleRecalculateAll = async () => {
    try {
      await recalculateMutation.mutateAsync();
      setShowRecalculateConfirm(false);
    } catch (err) {
      console.error('Failed to recalculate tiers:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-[#0f0f14] min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="w-7 h-7 text-yellow-400" />
            Tier Management
          </h1>
          <p className="text-gray-500 mt-1">
            Configure driver tiers, requirements, and automatic tier calculations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setShowRecalculateConfirm(true)}
            loading={recalculateMutation.isPending}
          >
            Recalculate All
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
          >
            Create Tier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <XpressCard>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Drivers</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {statsLoading ? '-' : stats?.totalDrivers}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-500 text-sm">Upgrades This Month</div>
                <div className="text-2xl font-bold text-green-400 mt-1">
                  {statsLoading ? '-' : stats?.upgradesThisMonth}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-500 text-sm">Downgrades This Month</div>
                <div className="text-2xl font-bold text-red-400 mt-1">
                  {statsLoading ? '-' : stats?.downgradesThisMonth}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </XpressCard>

        <XpressCard>
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-500 text-sm">Pending Reviews</div>
                <div className="text-2xl font-bold text-yellow-400 mt-1">
                  {statsLoading ? '-' : stats?.pendingReviews}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
        </XpressCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#12121a] border border-gray-800 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tiers" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Tier Config
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Driver Tiers
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <XpressCard title="Tier Distribution" subtitle="Drivers by tier level">
              {distributionLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <TierDistributionChart data={distribution || []} />
              )}
            </XpressCard>

            <XpressCard title="Recent Tier Changes" subtitle="Last 30 days">
              <TierHistoryPanel />
            </XpressCard>
          </div>
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="mt-6">
          {tiersLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const driverCount = stats?.distribution.find(d => d.tier === tier.level)?.count;
                return (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    driverCount={driverCount}
                    showActions
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-6">
          <DriverTierAssignment tiers={tiers} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <XpressCard title="Tier Change History">
            <TierHistoryPanel />
          </XpressCard>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <XpressCard title="Calculation Rules">
            <CalculationRulesPanel />
          </XpressCard>
        </TabsContent>
      </Tabs>

      {/* Tier Form Modal */}
      <TierRequirementsForm
        tier={editingTier}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTier(null);
        }}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Recalculate Confirmation Modal */}
      <Modal
        isOpen={showRecalculateConfirm}
        onClose={() => setShowRecalculateConfirm(false)}
        title="Recalculate All Tiers"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRecalculateConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRecalculateAll}
              loading={recalculateMutation.isPending}
            >
              Recalculate
            </Button>
          </div>
        }
      >
        <p className="text-gray-400">
          This will run the tier calculation algorithm on all drivers. 
          Drivers may be upgraded or downgraded based on their current metrics.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
