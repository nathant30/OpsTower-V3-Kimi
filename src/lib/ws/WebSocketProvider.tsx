/**
 * WebSocket Provider Component
 * Manages SignalR connection lifecycle and global event subscriptions
 * Provides connection status context to children
 */

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  type ReactNode
} from 'react';
import { signalRClient, type ConnectionStatus } from './signalrClient';
import { useAuthStore } from '@/lib/stores/auth.store';
import { 
  subscribeToOrderEvents, 
  subscribeToDriverEvents,
  subscribeToVehicleEvents,
  subscribeToIncidentEvents 
} from './handlers';

import { queryClient } from '@/lib/api/queryClient';

// Context type definition
interface WebSocketContextType {
  /** Current connection status */
  status: ConnectionStatus;
  /** Whether connected to the WebSocket server */
  isConnected: boolean;
  /** Manually trigger a reconnect */
  reconnect: () => void;
  /** Current connection ID */
  connectionId: string | null;
  /** Time since connection established */
  connectedSince: Date | null;
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  status: 'disconnected',
  isConnected: false,
  reconnect: () => {},
  connectionId: null,
  connectedSince: null,
});

// Hook to use WebSocket context
export const useWebSocketContext = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
  /** Whether to auto-subscribe to all events */
  autoSubscribe?: boolean;
  /** Event types to subscribe to (if autoSubscribe is true) */
  eventTypes?: Array<'orders' | 'drivers' | 'vehicles' | 'incidents'>;
}

/**
 * WebSocket Provider Component
 * 
 * Usage:
 * <WebSocketProvider autoSubscribe eventTypes={['orders', 'drivers']}>
 *   <App />
 * </WebSocketProvider>
 */
export function WebSocketProvider({ 
  children, 
  autoSubscribe = true,
  eventTypes = ['orders', 'drivers', 'vehicles', 'incidents'],
}: WebSocketProviderProps): React.JSX.Element {
  const { isAuthenticated, token } = useAuthStore();
  const [status, setStatus] = useState<ConnectionStatus>(signalRClient.getConnectionStatus());
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectedSince, setConnectedSince] = useState<Date | null>(null);

  // Handle status changes
  useEffect(() => {
    const unsubscribe = signalRClient.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      if (newStatus === 'connected') {
        setConnectionId(signalRClient.getConnectionId());
        setConnectedSince(new Date());
      } else if (newStatus === 'disconnected') {
        setConnectionId(null);
        setConnectedSince(null);
      }
    });

    return unsubscribe;
  }, []);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      signalRClient.connect();
    } else {
      signalRClient.disconnect();
    }

    return () => {
      signalRClient.disconnect();
    };
  }, [isAuthenticated, token]);

  // Subscribe to events
  useEffect(() => {
    if (!isAuthenticated || !autoSubscribe) return;

    const unsubscribes: Array<() => void> = [];

    if (eventTypes.includes('orders')) {
      unsubscribes.push(...subscribeToOrderEvents(signalRClient));
    }
    if (eventTypes.includes('drivers')) {
      unsubscribes.push(...subscribeToDriverEvents(signalRClient));
    }
    if (eventTypes.includes('vehicles')) {
      unsubscribes.push(...subscribeToVehicleEvents(signalRClient));
    }
    if (eventTypes.includes('incidents')) {
      unsubscribes.push(...subscribeToIncidentEvents(signalRClient));
    }

    // Subscribe to dashboard stats update
    const unsubDashboard = signalRClient.subscribe('dashboard.stats.updated', (_data) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Optional: Show notification for significant changes
      // showInfo('Dashboard statistics updated', 3000);
    });
    unsubscribes.push(unsubDashboard);

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [isAuthenticated, autoSubscribe, eventTypes.join(',')]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    signalRClient.disconnect().then(() => {
      signalRClient.connect();
    });
  }, []);

  const value: WebSocketContextType = {
    status,
    isConnected: status === 'connected',
    reconnect,
    connectionId,
    connectedSince,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
      <ConnectionStatusIndicator />
    </WebSocketContext.Provider>
  );
}

/**
 * Connection Status Indicator Component
 * Shows a small indicator in the UI when connection issues occur
 */
function ConnectionStatusIndicator(): React.JSX.Element | null {
  const { status, reconnect } = useWebSocketContext();
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-dismiss when connected
  useEffect(() => {
    if (status === 'connected') {
      setIsDismissed(false);
    }
  }, [status]);

  if (status === 'connected' || isDismissed) {
    return null;
  }

  const statusConfig = {
    connecting: {
      color: 'bg-yellow-500',
      text: 'Connecting...',
      icon: '⏳',
    },
    reconnecting: {
      color: 'bg-orange-500',
      text: 'Reconnecting...',
      icon: '🔄',
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      icon: '⚠️',
    },
  };

  const config = statusConfig[status];

  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 
        flex items-center gap-2 
        px-4 py-2 rounded-lg 
        text-white text-sm font-medium
        shadow-lg animate-in slide-in-from-bottom-2
        ${config.color}
      `}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
      {status === 'disconnected' && (
        <>
          <button
            onClick={reconnect}
            className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="ml-1 text-white/70 hover:text-white"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Connection Status Badge Component
 * Use this in header or status bar
 */
export function ConnectionStatusBadge(): React.JSX.Element {
  const { status } = useWebSocketContext();

  const statusColors = {
    connected: 'bg-green-500',
    connecting: 'bg-yellow-500 animate-pulse',
    reconnecting: 'bg-orange-500 animate-pulse',
    disconnected: 'bg-red-500',
  };

  const statusLabels = {
    connected: 'Live',
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    disconnected: 'Offline',
  };

  return (
    <div 
      className="flex items-center gap-1.5 text-xs text-gray-400"
      title={`WebSocket: ${status}`}
    >
      <span 
        className={`
          w-2 h-2 rounded-full 
          ${statusColors[status]}
        `}
      />
      <span>{statusLabels[status]}</span>
    </div>
  );
}

export default WebSocketProvider;
