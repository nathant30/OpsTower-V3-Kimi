import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Bell, Mail, Smartphone, Monitor, Save, RotateCcw } from 'lucide-react';
import type { NotificationPreferences as NotificationPreferencesType } from '@/services/profile/types';

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType;
  onSave?: (preferences: NotificationPreferencesType) => void;
}

export function NotificationPreferences({ preferences, onSave }: NotificationPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferencesType>(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (category: keyof NotificationPreferencesType, key: string) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]],
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(localPreferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
    setHasChanges(false);
  };

  const categories = [
    {
      key: 'email' as const,
      title: 'Email Notifications',
      description: 'Receive updates via email',
      icon: <Mail className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      options: [
        { key: 'marketing', label: 'Marketing & Promotions', description: 'Product updates and offers' },
        { key: 'updates', label: 'System Updates', description: 'New features and improvements' },
        { key: 'security', label: 'Security Alerts', description: 'Login notifications and security updates' },
        { key: 'reports', label: 'Reports & Analytics', description: 'Weekly summary and reports' },
      ],
    },
    {
      key: 'push' as const,
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      options: [
        { key: 'alerts', label: 'Critical Alerts', description: 'Urgent system notifications' },
        { key: 'messages', label: 'Messages', description: 'Direct messages and mentions' },
        { key: 'mentions', label: 'Mentions', description: 'When you are tagged in comments' },
        { key: 'system', label: 'System Notifications', description: 'Maintenance and status updates' },
      ],
    },
    {
      key: 'sms' as const,
      title: 'SMS Notifications',
      description: 'Receive text messages',
      icon: <Bell className="w-5 h-5" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      options: [
        { key: 'security', label: 'Security Codes', description: '2FA and verification codes' },
        { key: 'critical', label: 'Critical Alerts', description: 'Only for urgent matters' },
      ],
    },
    {
      key: 'inApp' as const,
      title: 'In-App Notifications',
      description: 'Notifications within the application',
      icon: <Monitor className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      options: [
        { key: 'all', label: 'All Notifications', description: 'Enable all in-app notifications' },
        { key: 'mentions', label: 'Mentions & Tags', description: 'When someone mentions you' },
        { key: 'tasks', label: 'Task Updates', description: 'Task assignments and updates' },
        { key: 'system', label: 'System Messages', description: 'General system notifications' },
      ],
    },
  ];

  return (
    <XpressCard
      title="Notification Preferences"
      subtitle="Manage how you receive notifications"
      icon={<Bell className="w-5 h-5" />}
      headerAction={
        hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div
            key={category.key}
            className="bg-[#0f0f14] rounded-lg border border-gray-800 p-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center ${category.color}`}>
                {category.icon}
              </div>
              <div>
                <h4 className="font-medium text-white">{category.title}</h4>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              {category.options.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-medium text-white text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(
                        localPreferences[category.key][
                          option.key as keyof typeof localPreferences[typeof category.key]
                        ]
                      )}
                      onChange={() => handleToggle(category.key, option.key)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </XpressCard>
  );
}

export default NotificationPreferences;
