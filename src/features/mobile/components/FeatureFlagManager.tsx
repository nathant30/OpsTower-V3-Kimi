import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Smartphone,
  Users,
  ChevronRight,
  Flag,
} from 'lucide-react';
import type { FeatureFlag } from '@/services/mobile/types';

interface FeatureFlagManagerProps {
  flags: FeatureFlag[];
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function FeatureFlagManager({
  flags,
  onToggle,
  onDelete,
  onCreate,
}: FeatureFlagManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [newFlag, setNewFlag] = useState({
    name: '',
    key: '',
    description: '',
    enabled: false,
    platform: 'all' as 'all' | 'ios' | 'android',
    rolloutPercentage: 0,
  });

  const handleCreate = () => {
    if (onCreate && newFlag.name && newFlag.key) {
      onCreate({
        ...newFlag,
        modifiedBy: 'current-user',
      });
      setNewFlag({
        name: '',
        key: '',
        description: '',
        enabled: false,
        platform: 'all',
        rolloutPercentage: 0,
      });
      setShowCreateModal(false);
    }
  };

  const platformIcons = {
    all: <Globe className="w-4 h-4" />,
    ios: <span className="text-xs font-bold">iOS</span>,
    android: <Smartphone className="w-4 h-4" />,
  };

  return (
    <>
      <XpressCard
        title="Feature Flags"
        subtitle={`${flags.filter((f) => f.enabled).length} of ${flags.length} enabled`}
        icon={<Flag className="w-5 h-5" />}
        headerAction={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Flag
          </Button>
        }
      >
        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggle?.(flag.id)}
                  className="flex-shrink-0"
                >
                  {flag.enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-600" />
                  )}
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{flag.name}</span>
                    <Badge variant={flag.enabled ? 'success' : 'default'}>
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      {platformIcons[flag.platform]}
                      {flag.platform}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{flag.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded">{flag.key}</code>
                    {flag.rolloutPercentage > 0 && flag.rolloutPercentage < 100 && (
                      <span className="text-blue-400">{flag.rolloutPercentage}% rollout</span>
                    )}
                    {flag.targetVersion && (
                      <span className="text-amber-400">v{flag.targetVersion}+</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingFlag(flag)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete?.(flag.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {flags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No feature flags configured</p>
            </div>
          )}
        </div>
      </XpressCard>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Feature Flag"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Flag</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g., Dark Mode"
            value={newFlag.name}
            onChange={(e) => setNewFlag({ ...newFlag, name: e.target.value })}
          />
          <Input
            label="Key"
            placeholder="e.g., dark_mode"
            value={newFlag.key}
            onChange={(e) =>
              setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s+/g, '_') })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue"
              rows={3}
              placeholder="What does this feature flag control?"
              value={newFlag.description}
              onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Platform</label>
              <select
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
                value={newFlag.platform}
                onChange={(e) =>
                  setNewFlag({ ...newFlag, platform: e.target.value as 'all' | 'ios' | 'android' })
                }
              >
                <option value="all">All Platforms</option>
                <option value="ios">iOS Only</option>
                <option value="android">Android Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Rollout %
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={newFlag.rolloutPercentage}
                onChange={(e) =>
                  setNewFlag({ ...newFlag, rolloutPercentage: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default FeatureFlagManager;
