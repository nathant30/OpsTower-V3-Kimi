import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Smartphone,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
  Apple,
} from 'lucide-react';
import type { AppVersion } from '@/services/mobile/types';

interface AppVersionCardProps {
  versions: AppVersion[];
  onViewAll?: () => void;
}

const statusConfig = {
  stable: { variant: 'success' as const, icon: CheckCircle, label: 'Stable' },
  beta: { variant: 'warning' as const, icon: Clock, label: 'Beta' },
  deprecated: { variant: 'default' as const, icon: Clock, label: 'Deprecated' },
  forced_update: { variant: 'alert' as const, icon: AlertTriangle, label: 'Force Update' },
};

export function AppVersionCard({ versions, onViewAll }: AppVersionCardProps) {
  const activeVersions = versions.filter((v) => v.status === 'stable' || v.status === 'beta');
  const forcedUpdateCount = versions.filter((v) => v.forceUpdate).length;

  return (
    <XpressCard
      title="App Versions"
      subtitle={`${activeVersions.length} active versions${forcedUpdateCount > 0 ? ` • ${forcedUpdateCount} force update` : ''}`}
      headerAction={
        onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {versions.slice(0, 4).map((version) => {
          const status = statusConfig[version.status];
          const StatusIcon = status.icon;
          const isIOS = version.platform === 'ios';

          return (
            <div
              key={version.id}
              className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isIOS ? 'bg-gray-800' : 'bg-green-500/10'
                  }`}
                >
                  {isIOS ? (
                    <Apple className="w-5 h-5 text-white" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{version.version}</span>
                    <Badge variant={status.variant}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                    {version.forceUpdate && (
                      <Badge variant="alert">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Required
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span>Build {version.buildNumber}</span>
                    <span>•</span>
                    <span>{version.adoptionRate.toFixed(1)}% adoption</span>
                    <span>•</span>
                    <span className="text-gray-400">
                      {version.activeInstalls.toLocaleString()} installs
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {new Date(version.releaseDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Min: {version.minRequiredVersion}</div>
              </div>
            </div>
          );
        })}

        {versions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No versions available</p>
          </div>
        )}
      </div>
    </XpressCard>
  );
}

export default AppVersionCard;
