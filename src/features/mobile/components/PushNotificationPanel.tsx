import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Send,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Users,
  Smartphone,
  Globe,
  BarChart3,
  Bell,
} from 'lucide-react';
import type { PushNotification } from '@/services/mobile/types';

interface PushNotificationPanelProps {
  notifications: PushNotification[];
  onSend?: (id: string) => void;
  onCancel?: (id: string) => void;
  onCreate?: (notification: Omit<PushNotification, 'id' | 'createdAt' | 'sentCount' | 'deliveredCount' | 'openedCount' | 'clickThroughRate'>) => void;
}

const statusConfig = {
  draft: { variant: 'default' as const, icon: Clock, label: 'Draft' },
  scheduled: { variant: 'warning' as const, icon: Clock, label: 'Scheduled' },
  sending: { variant: 'active' as const, icon: Send, label: 'Sending' },
  sent: { variant: 'success' as const, icon: CheckCircle, label: 'Sent' },
  failed: { variant: 'alert' as const, icon: XCircle, label: 'Failed' },
};

export function PushNotificationPanel({
  notifications,
  onSend,
  onCancel,
  onCreate,
}: PushNotificationPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [newNotification, setNewNotification] = useState<{
    title: string;
    body: string;
    targetAudience: 'all' | 'ios' | 'android' | 'specific_users';
    scheduledAt: string;
  }>({
    title: '',
    body: '',
    targetAudience: 'all',
    scheduledAt: '',
  });

  const handleCreate = () => {
    if (onCreate && newNotification.title && newNotification.body) {
      onCreate({
        ...newNotification,
        status: newNotification.scheduledAt ? 'scheduled' : 'draft',
        createdBy: 'current-user',
      });
      setNewNotification({ title: '', body: '', targetAudience: 'all', scheduledAt: '' });
      setShowCreateModal(false);
    }
  };

  const targetIcons = {
    all: <Globe className="w-4 h-4" />,
    ios: <span className="text-xs font-bold">iOS</span>,
    android: <Smartphone className="w-4 h-4" />,
    specific_users: <Users className="w-4 h-4" />,
  };

  const sentNotifications = notifications.filter((n) => n.status === 'sent');
  const totalSent = sentNotifications.reduce((sum, n) => sum + n.sentCount, 0);
  const totalDelivered = sentNotifications.reduce((sum, n) => sum + n.deliveredCount, 0);
  const avgCTR = sentNotifications.length
    ? sentNotifications.reduce((sum, n) => sum + n.clickThroughRate, 0) / sentNotifications.length
    : 0;

  return (
    <>
      <XpressCard
        title="Push Notifications"
        subtitle={`${notifications.filter((n) => n.status === 'scheduled').length} scheduled • ${notifications.filter((n) => n.status === 'sent').length} sent`}
        icon={<Bell className="w-5 h-5" />}
        headerAction={
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        }
      >
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-[#0f0f14] rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-white">{totalSent.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Sent</div>
          </div>
          <div className="bg-[#0f0f14] rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-green-400">
              {totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-xs text-gray-500">Delivery Rate</div>
          </div>
          <div className="bg-[#0f0f14] rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-blue-400">{avgCTR.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Avg. CTR</div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {notifications.map((notification) => {
            const status = statusConfig[notification.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={notification.id}
                className="p-3 bg-[#0f0f14] rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {notification.title}
                      </span>
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{notification.body}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        {targetIcons[notification.targetAudience]}
                        {notification.targetAudience}
                      </span>
                      <span>•</span>
                      <span>
                        {notification.scheduledAt
                          ? new Date(notification.scheduledAt).toLocaleString()
                          : notification.sentAt
                          ? new Date(notification.sentAt).toLocaleString()
                          : new Date(notification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notification.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSend?.(notification.id);
                        }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    {notification.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancel?.(notification.id);
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {notification.status === 'sent' && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                    <div className="flex items-center gap-1 text-xs">
                      <Send className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-400">{notification.sentCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-gray-400">
                        {notification.deliveredCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <BarChart3 className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-400">{notification.clickThroughRate.toFixed(1)}% CTR</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      </XpressCard>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Push Notification"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Send className="w-4 h-4 mr-1" />
              {newNotification.scheduledAt ? 'Schedule' : 'Send Now'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Notification title"
            value={newNotification.title}
            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
            maxLength={50}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Message</label>
            <textarea
              className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-xpress-accent-blue"
              rows={3}
              placeholder="Notification message body"
              value={newNotification.body}
              onChange={(e) => setNewNotification({ ...newNotification, body: e.target.value })}
              maxLength={150}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {newNotification.body.length}/150
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Target</label>
              <select
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
                value={newNotification.targetAudience}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    targetAudience: e.target.value as 'all' | 'ios' | 'android' | 'specific_users',
                  })
                }
              >
                <option value="all">All Users</option>
                <option value="ios">iOS Only</option>
                <option value="android">Android Only</option>
                <option value="specific_users">Specific Users</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 bg-xpress-bg-secondary border border-xpress-border rounded-md text-sm text-white focus:outline-none focus:border-xpress-accent-blue"
                value={newNotification.scheduledAt}
                onChange={(e) =>
                  setNewNotification({ ...newNotification, scheduledAt: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title="Notification Details"
        footer={
          <Button variant="outline" onClick={() => setSelectedNotification(null)}>
            Close
          </Button>
        }
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Title</label>
              <p className="text-white font-medium">{selectedNotification.title}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Message</label>
              <p className="text-white">{selectedNotification.body}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={statusConfig[selectedNotification.status].variant}>
                    {statusConfig[selectedNotification.status].label}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Target</label>
                <p className="text-white capitalize">{selectedNotification.targetAudience}</p>
              </div>
            </div>
            {selectedNotification.status === 'sent' && (
              <div className="bg-[#0f0f14] rounded-lg p-4 border border-gray-800">
                <h4 className="text-sm font-medium text-white mb-3">Performance</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-lg font-bold text-white">
                      {selectedNotification.sentCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Sent</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-400">
                      {selectedNotification.deliveredCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Delivered</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-400">
                      {selectedNotification.openedCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Opened</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Click-Through Rate</span>
                    <span className="text-white font-medium">
                      {selectedNotification.clickThroughRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(selectedNotification.clickThroughRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default PushNotificationPanel;
