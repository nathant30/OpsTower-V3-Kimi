// SignalR Connection Status Indicator
import { useState, useEffect } from 'react';
import { signalRClient, type ConnectionStatus as ConnStatus } from '@/lib/ws/signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ConnectionStatus = ({
  showLabel = true,
  size = 'md',
  className = '',
}: ConnectionStatusIndicatorProps) => {
  const [status, setStatus] = useState<ConnStatus>('disconnected');
  const [isReconnecting, setIsReconnecting] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = signalRClient.onStatusChange((newStatus: ConnStatus) => {
      setStatus(newStatus);
    });

    // Get initial status
    setStatus(signalRClient.getConnectionStatus());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleReconnect = async () => {
    if (isReconnecting) return;
    setIsReconnecting(true);
    try {
      await signalRClient.connect();
    } finally {
      setIsReconnecting(false);
    }
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      textColor: 'text-green-400',
      icon: Wifi,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
    },
    connecting: {
      color: 'bg-yellow-500 animate-pulse',
      text: 'Connecting...',
      textColor: 'text-yellow-400',
      icon: RefreshCw,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
    },
    reconnecting: {
      color: 'bg-orange-500 animate-pulse',
      text: 'Reconnecting...',
      textColor: 'text-orange-400',
      icon: RefreshCw,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      textColor: 'text-red-400',
      icon: WifiOff,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={handleReconnect}
      disabled={status === 'connecting' || status === 'reconnecting' || isReconnecting}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
        config.bgColor
      } ${config.borderColor} ${
        status === 'disconnected' ? 'hover:bg-red-500/20 cursor-pointer' : 'cursor-default'
      } ${className}`}
      title={
        status === 'disconnected'
          ? 'Click to reconnect'
          : `Real-time connection: ${config.text}`
      }
    >
      {/* Status Dot */}
      <div className={`${sizeClasses[size]} rounded-full ${config.color}`} />

      {/* Icon */}
      <Icon
        className={`${iconSizes[size]} ${config.textColor} ${
          status === 'connecting' || status === 'reconnecting' ? 'animate-spin' : ''
        }`}
      />

      {/* Label */}
      {showLabel && (
        <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
      )}
    </button>
  );
};

// Compact version for header/sidebar
export const ConnectionStatusDot = ({ className = '' }: { className?: string }) => {
  const [status, setStatus] = useState<ConnStatus>('disconnected');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const unsubscribe = signalRClient.onStatusChange((newStatus: ConnStatus) => {
      setStatus(newStatus);
    });
    setStatus(signalRClient.getConnectionStatus());
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) return null;

  const colorClasses = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500 animate-pulse',
    reconnecting: 'bg-orange-500 animate-pulse',
    disconnected: 'bg-red-500',
  };

  const tooltips = {
    connected: 'Real-time connection active',
    connecting: 'Connecting to real-time service...',
    reconnecting: 'Reconnecting to real-time service...',
    disconnected: 'Real-time connection lost',
  };

  return (
    <div
      className={`w-2 h-2 rounded-full ${colorClasses[status]} ${className}`}
      title={tooltips[status]}
    />
  );
};

// Connection Status Badge with details
export const ConnectionStatusBadge = () => {
  const [status, setStatus] = useState<ConnStatus>('disconnected');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const unsubscribe = signalRClient.onStatusChange((newStatus: ConnStatus) => {
      setStatus(newStatus);
      if (newStatus === 'connected') {
        setConnectionId(signalRClient.getConnectionId());
      }
    });
    setStatus(signalRClient.getConnectionStatus());
    return () => unsubscribe();
  }, []);

  if (!isAuthenticated) return null;

  const config = {
    connected: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      label: 'Live',
    },
    connecting: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      label: 'Connecting',
    },
    reconnecting: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      label: 'Reconnecting',
    },
    disconnected: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      label: 'Offline',
    },
  }[status];

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-2 py-1 rounded-md border ${config.bg} ${config.border} hover:opacity-80 transition-opacity`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            status === 'connected'
              ? 'bg-green-500'
              : status === 'connecting' || status === 'reconnecting'
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-red-500'
          }`}
        />
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#12121a] border border-gray-800 rounded-lg shadow-xl z-50 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Connection Details</span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-white"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={config.text}>{status}</span>
            </div>
            {connectionId && (
              <div className="flex justify-between">
                <span className="text-gray-400">Connection ID:</span>
                <span className="text-gray-300 font-mono text-xs">
                  {connectionId.slice(0, 8)}...
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500">
                Real-time updates are {status === 'connected' ? 'active' : 'unavailable'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
