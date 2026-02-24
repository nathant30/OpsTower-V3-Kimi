/**
 * Tier Requirements Form Component
 * Form for configuring tier requirements and benefits
 */

import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  TrendingUp, 
  Star, 
  CheckCircle, 
  Users, 
  Clock, 
  Wallet,
  Zap,
  Shield,
  Plus,
  Trash2,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { Tier, TierLevel, SaveTierRequest } from '@/features/tiers/types';
import { getTierColor, getTierIcon } from '../hooks/useTiers';

interface TierRequirementsFormProps {
  tier?: Tier | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveTierRequest) => void;
  isLoading?: boolean;
}

// Form field component
function FormField({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  icon: any;
  value: number;
  onChange: (value: number) => void;
  type?: 'number' | 'text';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1.5">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Toggle switch component
function ToggleField({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: any;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-[#0f0f14] border border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-white">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-5 w-9 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-500' : 'bg-gray-700'}
        `}
      >
        <span
          className={`
            inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-1'}
          `}
        />
      </button>
    </label>
  );
}

// Main Form Component
export function TierRequirementsForm({
  tier,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: TierRequirementsFormProps) {
  const isEditing = !!tier;
  
  // Form state
  const [formData, setFormData] = useState<SaveTierRequest>({
    level: 'Bronze',
    name: '',
    description: '',
    requirements: {
      minTrips: 0,
      minRating: 0,
      minCompletionRate: 0,
      minAcceptanceRate: 0,
      minAccountAgeDays: 0,
      maxCancellations: 0,
      minEarnings: 0,
    },
    benefits: {
      commissionRate: 20,
      priorityLevel: 1,
      perks: [],
      bonusMultiplier: 1,
      prioritySupport: false,
      instantPayout: false,
    },
    color: '#6B7280',
    order: 1,
  });

  const [newPerk, setNewPerk] = useState('');

  // Initialize form with tier data when editing
  useEffect(() => {
    if (tier) {
      setFormData({
        level: tier.level,
        name: tier.name,
        description: tier.description,
        requirements: { ...tier.requirements },
        benefits: { ...tier.benefits },
        color: tier.color,
        order: tier.order,
      });
    }
  }, [tier]);

  const handleSave = () => {
    onSave(formData);
  };

  const addPerk = () => {
    if (newPerk.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: {
          ...prev.benefits,
          perks: [...(prev.benefits.perks || []), newPerk.trim()],
        },
      }));
      setNewPerk('');
    }
  };

  const removePerk = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        perks: prev.benefits.perks?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const updateRequirement = (key: keyof typeof formData.requirements, value: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: { ...prev.requirements, [key]: value },
    }));
  };

  const updateBenefit = (key: keyof typeof formData.benefits, value: any) => {
    setFormData(prev => ({
      ...prev,
      benefits: { ...prev.benefits, [key]: value },
    }));
  };

  const tierLevels: TierLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${tier?.name}` : 'Create New Tier'}
      size="xl"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} icon={<X className="w-4 h-4" />}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={isLoading}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Save Changes' : 'Create Tier'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <XpressCard title="Basic Information">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Tier Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as TierLevel }))}
                disabled={isEditing}
                className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              >
                {tierLevels.map(level => (
                  <option key={level} value={level}>
                    {getTierIcon(level)} {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Tier Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Gold Driver"
                className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this tier..."
                rows={2}
                className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Tier Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-gray-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                  min={1}
                  max={5}
                  className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </XpressCard>

        {/* Requirements */}
        <XpressCard title="Requirements">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Minimum Trips"
              icon={TrendingUp}
              value={formData.requirements.minTrips || 0}
              onChange={(v) => updateRequirement('minTrips', v)}
              min={0}
            />
            <FormField
              label="Minimum Rating"
              icon={Star}
              value={formData.requirements.minRating || 0}
              onChange={(v) => updateRequirement('minRating', v)}
              min={0}
              max={5}
              step={0.1}
            />
            <FormField
              label="Min Completion Rate"
              icon={CheckCircle}
              value={formData.requirements.minCompletionRate || 0}
              onChange={(v) => updateRequirement('minCompletionRate', v)}
              min={0}
              max={100}
              suffix="%"
            />
            <FormField
              label="Min Acceptance Rate"
              icon={Users}
              value={formData.requirements.minAcceptanceRate || 0}
              onChange={(v) => updateRequirement('minAcceptanceRate', v)}
              min={0}
              max={100}
              suffix="%"
            />
            <FormField
              label="Min Account Age"
              icon={Clock}
              value={formData.requirements.minAccountAgeDays || 0}
              onChange={(v) => updateRequirement('minAccountAgeDays', v)}
              min={0}
              suffix="days"
            />
            <FormField
              label="Minimum Earnings"
              icon={Wallet}
              value={formData.requirements.minEarnings || 0}
              onChange={(v) => updateRequirement('minEarnings', v)}
              min={0}
            />
          </div>
        </XpressCard>

        {/* Benefits */}
        <XpressCard title="Benefits">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Commission Rate"
                icon={Wallet}
                value={formData.benefits.commissionRate || 0}
                onChange={(v) => updateBenefit('commissionRate', v)}
                min={0}
                max={50}
                suffix="%"
              />
              <FormField
                label="Priority Level"
                icon={Zap}
                value={formData.benefits.priorityLevel || 1}
                onChange={(v) => updateBenefit('priorityLevel', v)}
                min={1}
                max={5}
              />
              <FormField
                label="Bonus Multiplier"
                icon={TrendingUp}
                value={formData.benefits.bonusMultiplier || 1}
                onChange={(v) => updateBenefit('bonusMultiplier', v)}
                min={1}
                max={5}
                step={0.1}
                suffix="x"
              />
              <FormField
                label="Guaranteed Hourly"
                icon={Clock}
                value={formData.benefits.guaranteedHourlyRate || 0}
                onChange={(v) => updateBenefit('guaranteedHourlyRate', v)}
                min={0}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ToggleField
                label="Priority Support"
                icon={Shield}
                checked={formData.benefits.prioritySupport || false}
                onChange={(v) => updateBenefit('prioritySupport', v)}
              />
              <ToggleField
                label="Instant Payout"
                icon={Wallet}
                checked={formData.benefits.instantPayout || false}
                onChange={(v) => updateBenefit('instantPayout', v)}
              />
            </div>

            {/* Perks */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Perks
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPerk}
                  onChange={(e) => setNewPerk(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPerk()}
                  placeholder="Add a perk..."
                  className="flex-1 bg-[#0f0f14] border border-gray-800 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <Button variant="secondary" onClick={addPerk} icon={<Plus className="w-4 h-4" />}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.perks?.map((perk, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/30"
                  >
                    {perk}
                    <button
                      onClick={() => removePerk(index)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </XpressCard>
      </div>
    </Modal>
  );
}

export default TierRequirementsForm;
