import { cn } from '@/lib/utils/cn';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import type { ActivityItem, ActivityType } from '@/services/command/command.service';
import {
  Package,
  AlertTriangle,
  User,
  Settings,
  Bell,
  Car,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface ActivityFeedProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  order: <Package className="w-4 h-4" />,
  incident: <AlertTriangle className="w-4 h-4" />,
  driver: <Car className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
  alert: <Bell className="w-4 h-4" />,
};

const activityColors: Record<ActivityType, string> = {
  order: 'bg-blue-500/20 text-blue-400',
  incident: 'bg-red-500/20 text-red-400',
  driver: 'bg-green-500/20 text-green-400',
  system: 'bg-purple-500/20 text-purple-400',
  alert: 'bg-amber-500/20 text-amber-400',
};

const priorityBadges = {
  low: { variant: 'default' as const, label: 'Low' },
  medium: { variant: 'warning' as const, label: 'Medium' },
  high: { variant: 'alert' as const, label: 'High' },
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function ActivityItemRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-white/5 transition-colors group cursor-pointer">
      {/* Icon */}
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        activityColors[activity.type]
      )}>
        {activityIcons[activity.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
              {activity.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
              {activity.description}
            </p>
          </div>
          {activity.priority && activity.priority !== 'low' && (
            <Badge variant={priorityBadges[activity.priority].variant} className="shrink-0">
              {priorityBadges[activity.priority].label}
            </Badge>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(activity.timestamp)}
          </div>
          {activity.actor && activity.actor.type !== 'system' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{activity.actor.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0 self-center" />
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <div className="w-9 h-9 rounded-lg bg-gray-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
            <div className="h-3 bg-gray-800 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({ activities = [], isLoading, maxItems = 50 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <XpressCard
      title="Live Activity Feed"
      subtitle="Recent events across the platform"
      badge={`${activities.length} new`}
      badgeVariant="info"
      className="h-full"
      headerAction={
        <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          View All
        </button>
      }
    >
      <div className="space-y-1 -mx-5 -mb-5">
        {isLoading ? (
          <ActivityFeedSkeleton />
        ) : displayActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-400">No recent activity</p>
            <p className="text-xs text-gray-500 mt-1">Events will appear here as they happen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {displayActivities.map((activity) => (
              <ActivityItemRow key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </XpressCard>
  );
}

export default ActivityFeed;
