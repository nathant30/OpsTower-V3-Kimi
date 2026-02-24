import { useState } from 'react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Video,
  VideoOff,
  Wifi,
  WifiOff,
  AlertTriangle,
  Battery,
  Thermometer,
  Signal,
  HardDrive,
  Car,
  User,
  MapPin,
  Settings,
  Play,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DashcamDevice } from '@/services/dashcam/dashcam.service';

interface DeviceCardProps {
  device: DashcamDevice;
  onLiveView?: (device: DashcamDevice) => void;
  onSettings?: (device: DashcamDevice) => void;
  onSelect?: (device: DashcamDevice) => void;
  selected?: boolean;
  showAlerts?: boolean;
}

export function DeviceCard({
  device,
  onLiveView,
  onSettings,
  onSelect,
  selected = false,
  showAlerts = true,
}: DeviceCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusVariant = (status: DashcamDevice['status']) => {
    switch (status) {
      case 'online':
        return 'active';
      case 'offline':
        return 'offline';
      case 'recording':
        return 'success';
      case 'error':
        return 'alert';
      default:
        return 'default';
    }
  };

  const getHealthColor = (health: DashcamDevice['health']['status']) => {
    switch (health) {
      case 'healthy':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getBatteryIcon = (level?: number) => {
    if (!level) return <Battery className="w-4 h-4 text-gray-400" />;
    if (level < 20) return <Battery className="w-4 h-4 text-red-400" />;
    if (level < 50) return <Battery className="w-4 h-4 text-yellow-400" />;
    return <Battery className="w-4 h-4 text-green-400" />;
  };

  const getSignalIcon = (strength?: number) => {
    if (!strength) return <Signal className="w-4 h-4 text-gray-400" />;
    if (strength < 30) return <Signal className="w-4 h-4 text-red-400" />;
    if (strength < 70) return <Signal className="w-4 h-4 text-yellow-400" />;
    return <Signal className="w-4 h-4 text-green-400" />;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const storagePercentage = (device.storage.used / device.storage.total) * 100;
  const isStorageLow = storagePercentage > 80;

  return (
    <XpressCard
      className={`transition-all ${selected ? 'ring-2 ring-orange-500' : ''} ${
        onSelect ? 'cursor-pointer' : ''
      }`}
      onClick={onSelect ? () => onSelect(device) : undefined}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(device.status)}>
              {device.status === 'online' && <Wifi className="w-3 h-3 mr-1" />}
              {device.status === 'offline' && <WifiOff className="w-3 h-3 mr-1" />}
              {device.status.toUpperCase()}
            </Badge>
            {device.isRecording && (
              <Badge variant="success">
                <Video className="w-3 h-3 mr-1" />
                REC
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {device.health.status !== 'healthy' && (
              <AlertTriangle className={`w-4 h-4 ${getHealthColor(device.health.status)}`} />
            )}
            <span className={`text-xs font-medium ${getHealthColor(device.health.status)}`}>
              {device.health.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Device Name & Model */}
        <h3 className="text-white font-semibold text-base mb-1">{device.name}</h3>
        <p className="text-gray-400 text-xs mb-3">
          {device.model} • S/N: {device.serialNumber}
        </p>

        {/* Vehicle & Driver */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Car className="w-4 h-4 text-gray-500" />
            <span className="text-white">{device.vehicle.plateNumber}</span>
            {device.vehicle.model && (
              <span className="text-gray-500 text-xs">({device.vehicle.model})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-white">{device.driver.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400 text-xs truncate">
              {device.location.address || `${device.location.lat.toFixed(4)}, ${device.location.lng.toFixed(4)}`}
            </span>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="flex items-center gap-4 mb-3 py-2 border-y border-gray-800">
          <div className="flex items-center gap-1" title={`Battery: ${device.health.batteryLevel}%`}>
            {getBatteryIcon(device.health.batteryLevel)}
            <span className="text-xs text-gray-400">{device.health.batteryLevel}%</span>
          </div>
          <div className="flex items-center gap-1" title={`Signal: ${device.health.signalStrength}%`}>
            {getSignalIcon(device.health.signalStrength)}
            <span className="text-xs text-gray-400">{device.health.signalStrength}%</span>
          </div>
          <div className="flex items-center gap-1" title={`Temperature: ${device.health.temperature}°C`}>
            <Thermometer className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">{device.health.temperature}°C</span>
          </div>
        </div>

        {/* Storage */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <HardDrive className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-400">Storage</span>
            </div>
            <span className={`text-xs ${isStorageLow ? 'text-red-400' : 'text-gray-400'}`}>
              {device.storage.used} / {device.storage.total} GB
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                isStorageLow ? 'bg-red-500' : storagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>

        {/* Last Seen */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          <span>Last seen: {formatTimeAgo(device.lastSeen)}</span>
        </div>

        {/* Alerts */}
        {showAlerts && device.alerts.length > 0 && (
          <div className="space-y-2 mb-3">
            {device.alerts.slice(0, expanded ? undefined : 2).map((alert) => (
              <div
                key={alert.id}
                className={`p-2 rounded-lg text-xs ${
                  alert.severity === 'critical'
                    ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                    : alert.severity === 'warning'
                    ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-medium">{alert.type}</span>
                </div>
                <p>{alert.message}</p>
              </div>
            ))}
            {device.alerts.length > 2 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> Show {device.alerts.length - 2} more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onLiveView?.(device);
            }}
            disabled={device.status === 'offline'}
          >
            <Play className="w-3 h-3 mr-1" />
            Live View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSettings?.(device);
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </XpressCard>
  );
}

export default DeviceCard;
