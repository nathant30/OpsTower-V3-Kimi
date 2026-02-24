import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  Lock,
  Shield,
  Smartphone,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Phone,
  Trash2,
} from 'lucide-react';
import type { SecuritySettings as SecuritySettingsType, TrustedDevice } from '@/services/profile/types';

interface SecuritySettingsProps {
  settings: SecuritySettingsType;
  onChangePassword?: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  onToggle2FA?: (enabled: boolean) => void;
  onRemoveTrustedDevice?: (id: string) => void;
}

export function SecuritySettings({
  settings,
  onChangePassword,
  onToggle2FA,
  onRemoveTrustedDevice,
}: SecuritySettingsProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFACode, setTwoFACode] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChangePassword?.(passwordData);
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onToggle2FA?.(!settings.twoFactorEnabled);
    setShow2FAModal(false);
    setTwoFACode('');
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'mobile':
        return <Phone className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const daysUntilPasswordChange = settings.lastPasswordChange
    ? Math.max(
        0,
        settings.passwordExpiryDays -
          Math.floor(
            (Date.now() - new Date(settings.lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24)
          )
      )
    : settings.passwordExpiryDays;

  return (
    <>
      <XpressCard
        title="Security Settings"
        subtitle="Manage your account security"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="space-y-6">
          {/* Password Section */}
          <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Password</h4>
                <p className="text-sm text-gray-500">
                  Last changed{' '}
                  {settings.lastPasswordChange
                    ? new Date(settings.lastPasswordChange).toLocaleDateString()
                    : 'Never'}
                  {daysUntilPasswordChange < 7 && (
                    <span className="text-amber-400 ml-2">
                      ({daysUntilPasswordChange} days remaining)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
          </div>

          {/* 2FA Section */}
          <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  settings.twoFactorEnabled ? 'bg-green-500/10' : 'bg-gray-700/30'
                }`}
              >
                <Smartphone
                  className={`w-5 h-5 ${
                    settings.twoFactorEnabled ? 'text-green-400' : 'text-gray-500'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                  {settings.twoFactorEnabled ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="default">Disabled</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {settings.twoFactorEnabled
                    ? `Using ${settings.twoFactorMethod?.toUpperCase() || 'authenticator app'}`
                    : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <Button
              variant={settings.twoFactorEnabled ? 'outline' : 'primary'}
              size="sm"
              onClick={() => setShow2FAModal(true)}
            >
              {settings.twoFactorEnabled ? 'Manage' : 'Enable'}
            </Button>
          </div>

          {/* Login Notifications */}
          <div className="flex items-center justify-between p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Login Notifications</h4>
                <p className="text-sm text-gray-500">Get notified of new sign-ins</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.loginNotifications} className="sr-only peer" readOnly />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Trusted Devices */}
          <div>
            <h4 className="font-medium text-white mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Trusted Devices
            </h4>
            <div className="space-y-2">
              {settings.trustedDevices.map((device) => (
                <TrustedDeviceItem
                  key={device.id}
                  device={device}
                  icon={getDeviceIcon(device.deviceType)}
                  onRemove={() => onRemoveTrustedDevice?.(device.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </XpressCard>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>Change Password</Button>
          </>
        }
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-3 top-8 text-gray-500 hover:text-white"
            >
              {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-8 text-gray-500 hover:text-white"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              error={
                passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? 'Passwords do not match'
                  : undefined
              }
              required
            />
            <button
              type="button"
              onClick={() =>
                setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
              }
              className="absolute right-3 top-8 text-gray-500 hover:text-white"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2FA Modal */}
      <Modal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        title={settings.twoFactorEnabled ? 'Manage 2FA' : 'Enable Two-Factor Authentication'}
        footer={
          <>
            <Button variant="outline" onClick={() => setShow2FAModal(false)}>
              Cancel
            </Button>
            <Button onClick={handle2FASubmit}>
              {settings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </>
        }
      >
        {settings.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">2FA is currently enabled</span>
              </div>
              <p className="text-sm text-gray-400">
                Your account is protected with two-factor authentication using{' '}
                {settings.twoFactorMethod?.toUpperCase()}.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Enter password to disable 2FA
              </label>
              <Input type="password" placeholder="Your current password" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400">
              Two-factor authentication adds an extra layer of security to your account by requiring
              a verification code in addition to your password.
            </p>
            <div className="p-4 bg-[#0f0f14] rounded-lg border border-gray-800">
              <h4 className="font-medium text-white mb-2">Setup Steps:</h4>
              <ol className="text-sm text-gray-400 space-y-2 list-decimal list-inside">
                <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Scan the QR code that will be displayed</li>
                <li>Enter the 6-digit verification code</li>
                <li>Save your backup codes in a safe place</li>
              </ol>
            </div>
            <Input
              label="Verification Code"
              placeholder="000000"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              maxLength={6}
            />
          </div>
        )}
      </Modal>
    </>
  );
}

interface TrustedDeviceItemProps {
  device: TrustedDevice;
  icon: React.ReactNode;
  onRemove: () => void;
}

function TrustedDeviceItem({ device, icon, onRemove }: TrustedDeviceItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
          {icon}
        </div>
        <div>
          <div className="font-medium text-white text-sm">{device.deviceName}</div>
          <div className="text-xs text-gray-500">
            {device.browser} • {device.os}
          </div>
          <div className="text-xs text-gray-500">
            Last used: {new Date(device.lastUsedAt).toLocaleString()}
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default SecuritySettings;
