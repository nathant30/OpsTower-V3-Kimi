/**
 * Profile Page
 * User profile management with personal information, security settings, and activity log
 */

import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressKpiCard } from '@/components/ui/XpressKpiCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  ProfileForm,
  SecuritySettings,
  NotificationPreferences,
} from '../components';
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useActivityLog,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useDeleteApiKey,
  useSessions,
  useTerminateSession,
  useTerminateAllSessions,
  useSecuritySettings,
  useChangePassword,
  useRemoveTrustedDevice,
  useProfileStats,
} from '../hooks/useProfile';
import {
  User,
  Key,
  Activity,
  Monitor,
  RefreshCw,
  Plus,
  Copy,
  Check,
  X,
  LogOut,
  Smartphone,
  Tablet,
  Monitor as MonitorIcon,
  Shield,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { UserSession, ApiKey } from '@/services/profile/types';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'notifications'>('overview');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ apiKey: ApiKey; fullKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ name: '', scopes: [] as string[], expiresInDays: 30 });

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: stats, isLoading: isLoadingStats } = useProfileStats();
  const { data: preferences, isLoading: isLoadingPreferences } = useNotificationPreferences();
  const { data: activityLog, isLoading: isLoadingActivity } = useActivityLog({ limit: 10 });
  const { data: apiKeys, isLoading: isLoadingApiKeys } = useApiKeys();
  const { data: sessions, isLoading: isLoadingSessions } = useSessions();
  const { data: securitySettings, isLoading: isLoadingSecurity } = useSecuritySettings();

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const updatePreferences = useUpdateNotificationPreferences();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const deleteApiKey = useDeleteApiKey();
  const terminateSession = useTerminateSession();
  const terminateAllSessions = useTerminateAllSessions();
  const changePassword = useChangePassword();
  const removeTrustedDevice = useRemoveTrustedDevice();

  const isLoading =
    isLoadingProfile ||
    isLoadingStats ||
    isLoadingPreferences ||
    isLoadingActivity ||
    isLoadingApiKeys ||
    isLoadingSessions ||
    isLoadingSecurity;

  const handleCreateKey = async () => {
    if (newKeyForm.name && newKeyForm.scopes.length > 0) {
      const result = await createApiKey.mutateAsync({
        name: newKeyForm.name,
        scopes: newKeyForm.scopes,
        expiresInDays: newKeyForm.expiresInDays,
      });
      setNewKeyData(result);
      setShowCreateKeyModal(false);
      setShowKeyModal(true);
      setNewKeyForm({ name: '', scopes: [], expiresInDays: 30 });
    }
  };

  const handleCopyKey = () => {
    if (newKeyData?.fullKey) {
      navigator.clipboard.writeText(newKeyData.fullKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <MonitorIcon className="w-5 h-5" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <Shield className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'profile':
        return <User className="w-4 h-4" />;
      case 'data':
        return <Activity className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const availableScopes = [
    { key: 'read:orders', label: 'Read Orders' },
    { key: 'write:orders', label: 'Write Orders' },
    { key: 'read:drivers', label: 'Read Drivers' },
    { key: 'write:drivers', label: 'Write Drivers' },
    { key: 'read:analytics', label: 'Read Analytics' },
    { key: 'read:reports', label: 'Read Reports' },
    { key: 'admin', label: 'Admin Access' },
  ];

  if (isLoading) {
    return (
      <div className="h-full p-6 bg-[#0f0f14]">
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full p-6 bg-[#0f0f14]">
        <div className="text-center text-gray-500">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-[#0f0f14]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={activeTab === 'overview' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              <User className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('security')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('notifications')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Notifications
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <XpressKpiCard
                title="Total Logins"
                value={stats?.totalLogins || 0}
                subtext="Since account creation"
                icon={<Activity className="w-5 h-5" />}
                color="blue"
              />
              <XpressKpiCard
                title="Active API Keys"
                value={stats?.apiKeysCount || 0}
                subtext="For integrations"
                icon={<Key className="w-5 h-5" />}
                color="purple"
              />
              <XpressKpiCard
                title="Active Sessions"
                value={stats?.activeSessions || 0}
                subtext="Across devices"
                icon={<Monitor className="w-5 h-5" />}
                color="green"
              />
              <XpressKpiCard
                title="Last Activity"
                value={stats?.lastActivityAt ? new Date(stats.lastActivityAt).toLocaleDateString() : 'N/A'}
                subtext="Most recent action"
                icon={<Clock className="w-5 h-5" />}
                color="amber"
              />
            </div>

            {/* Profile Form */}
            <ProfileForm
              profile={profile}
              onSave={(data) => updateProfile.mutate(data)}
              onUploadAvatar={(file) => uploadAvatar.mutate(file)}
            />

            {/* API Keys */}
            <XpressCard
              title="API Keys"
              subtitle="Manage your API keys for integrations"
              icon={<Key className="w-5 h-5" />}
              headerAction={
                <Button size="sm" onClick={() => setShowCreateKeyModal(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Create Key
                </Button>
              }
            >
              <div className="space-y-2">
                {apiKeys?.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <Key className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{key.name}</span>
                          <Badge variant={key.status === 'active' ? 'success' : 'default'}>
                            {key.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {key.keyPrefix} • {key.usageCount.toLocaleString()} uses
                        </div>
                        <div className="text-xs text-gray-500">
                          Created {new Date(key.createdAt).toLocaleDateString()}
                          {key.expiresAt && (
                            <span>
                              {' '}
                              • Expires {new Date(key.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                          onClick={() => revokeApiKey.mutate(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={() => deleteApiKey.mutate(key.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {(!apiKeys || apiKeys.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No API keys created</p>
                  </div>
                )}
              </div>
            </XpressCard>

            {/* Active Sessions */}
            <XpressCard
              title="Active Sessions"
              subtitle="Manage your active device sessions"
              icon={<Monitor className="w-5 h-5" />}
              headerAction={
                sessions && sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                    onClick={() => terminateAllSessions.mutate()}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    End All Others
                  </Button>
                )
              }
            >
              <div className="space-y-2">
                {sessions?.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    icon={getDeviceIcon(session.deviceType)}
                    onTerminate={() => terminateSession.mutate(session.id)}
                  />
                ))}

                {(!sessions || sessions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No active sessions</p>
                  </div>
                )}
              </div>
            </XpressCard>

            {/* Activity Log */}
            <XpressCard
              title="Recent Activity"
              subtitle="Your recent actions and events"
              icon={<Activity className="w-5 h-5" />}
            >
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {activityLog?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-[#0f0f14] rounded-lg border border-gray-800"
                  >
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                      {getCategoryIcon(activity.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{activity.action}</span>
                        <Badge variant="default" className="text-xs">
                          {activity.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{activity.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!activityLog || activityLog.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </XpressCard>
          </>
        )}

        {activeTab === 'security' && securitySettings && (
          <SecuritySettings
            settings={securitySettings}
            onChangePassword={(data) => changePassword.mutate(data)}
            onRemoveTrustedDevice={(id) => removeTrustedDevice.mutate(id)}
          />
        )}

        {activeTab === 'notifications' && preferences && (
          <NotificationPreferences
            preferences={preferences}
            onSave={(data) => updatePreferences.mutate(data)}
          />
        )}
      </div>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showCreateKeyModal}
        onClose={() => setShowCreateKeyModal(false)}
        title="Create API Key"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateKeyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateKey} disabled={!newKeyForm.name || newKeyForm.scopes.length === 0}>
              Create Key
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Key Name"
            placeholder="e.g., Production Integration"
            value={newKeyForm.name}
            onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Permissions (Scopes)</label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 bg-[#0f0f14] rounded-lg border border-gray-800">
              {availableScopes.map((scope) => (
                <label key={scope.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newKeyForm.scopes.includes(scope.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyForm({ ...newKeyForm, scopes: [...newKeyForm.scopes, scope.key] });
                      } else {
                        setNewKeyForm({
                          ...newKeyForm,
                          scopes: newKeyForm.scopes.filter((s) => s !== scope.key),
                        });
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-white">{scope.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Expires In (Days)</label>
            <select
              className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
              value={newKeyForm.expiresInDays}
              onChange={(e) => setNewKeyForm({ ...newKeyForm, expiresInDays: parseInt(e.target.value) })}
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* New Key Display Modal */}
      <Modal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        title="API Key Created"
        footer={
          <Button onClick={() => setShowKeyModal(false)}>I&apos;ve Saved My Key</Button>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Important</span>
            </div>
            <p className="text-sm text-gray-400">
              This is the only time you will see this API key. Please copy it now and store it
              securely. If you lose it, you&apos;ll need to create a new one.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">API Key</label>
            <div className="flex gap-2">
              <code className="flex-1 p-3 bg-gray-950 rounded-lg text-sm text-white break-all">
                {newKeyData?.fullKey}
              </code>
              <Button variant="outline" onClick={handleCopyKey} className="flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {newKeyData && (
            <div className="p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
              <div className="text-sm text-gray-500">Key Name</div>
              <div className="text-white">{newKeyData.apiKey.name}</div>
              <div className="text-sm text-gray-500 mt-2">Scopes</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {newKeyData.apiKey.scopes.map((scope) => (
                  <Badge key={scope} variant="default" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

interface SessionItemProps {
  session: UserSession;
  icon: React.ReactNode;
  onTerminate: () => void;
}

function SessionItem({ session, icon, onTerminate }: SessionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-white">{session.deviceName}</span>
            {session.isCurrent && <Badge variant="success">Current</Badge>}
          </div>
          <div className="text-sm text-gray-500">
            {session.browser} • {session.os}
          </div>
          <div className="text-xs text-gray-500">
            {session.location} • Last active: {new Date(session.lastActiveAt).toLocaleString()}
          </div>
        </div>
      </div>
      {!session.isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400/30 hover:bg-red-400/10"
          onClick={onTerminate}
        >
          <LogOut className="w-4 h-4 mr-1" />
          End
        </Button>
      )}
    </div>
  );
}

export default ProfilePage;
