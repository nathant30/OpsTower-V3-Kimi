/**
 * SignalR WebSocket Client
 * Manages real-time connection to the backend hub
 * URL: https://testapi.xpress.ph/hubs
 */

import * as signalR from '@microsoft/signalr';
import { SIGNALR_CONFIG } from '@/config/api.config';
import { useAuthStore } from '@/lib/stores/auth.store';
import { showError, showInfo } from '@/lib/stores/ui.store';

// Connection status types
export type ConnectionStatus = 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'disconnected';

// Event callback type
export type EventCallback<T = unknown> = (data: T) => void;

// Event subscription map
interface EventSubscriptions {
  [eventName: string]: Set<EventCallback>;
}

/**
 * SignalR Client Singleton
 * Manages WebSocket connection and event subscriptions
 */
class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscriptions: EventSubscriptions = {};
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private connectionStartTime: number | null = null;

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  /**
   * Update connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * Build connection URL with authentication
   */
  private buildConnectionUrl(): string {
    const token = useAuthStore.getState().token;
    const url = SIGNALR_CONFIG.hubUrl;
    
    if (token) {
      return `${url}?access_token=${encodeURIComponent(token)}`;
    }
    return url;
  }

  /**
   * Initialize and start SignalR connection
   */
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Check if user is authenticated
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('[SignalR] Cannot connect: No authentication token');
      return;
    }

    this.setStatus('connecting');
    this.reconnectAttempts = 0;

    try {
      // Create connection with automatic reconfiguration
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(this.buildConnectionUrl(), {
          accessTokenFactory: () => useAuthStore.getState().token || '',
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, then 30s max
            const delay = Math.min(
              1000 * Math.pow(2, retryContext.previousRetryCount),
              30000
            );
            // SignalR reconnecting
            return delay;
          },
        })
        .configureLogging(
          import.meta.env.VITE_ENABLE_DEBUG === 'true' 
            ? signalR.LogLevel.Debug 
            : signalR.LogLevel.Warning
        )
        .build();

      // Setup event handlers
      this.setupConnectionHandlers();

      // Start connection
      await this.connection.start();
      this.connectionStartTime = Date.now();
      this.setStatus('connected');
      // SignalR connected successfully

    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Setup SignalR connection event handlers
   */
  private setupConnectionHandlers(): void {
    if (!this.connection) return;

    // Handle reconnection starting
    this.connection.onreconnecting((error) => {
      console.warn('[SignalR] Reconnecting...', error);
      this.setStatus('reconnecting');
    });

    // Handle reconnection success
    this.connection.onreconnected((connectionId) => {
      // SignalR reconnected
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      showInfo('Real-time connection restored', 3000);
    });

    // Handle connection closed
    this.connection.onclose((error) => {
      console.warn('[SignalR] Connection closed:', error);
      this.setStatus('disconnected');
      
      // Only show error if we were previously connected
      if (this.connectionStartTime) {
        showError('Real-time connection lost. Reconnecting...', 5000);
      }
      
      this.scheduleReconnect();
    });

    // Setup all server-to-client event handlers
    this.setupEventHandlers();
  }

  /**
   * Setup all server-to-client event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Order events
    this.connection.on('order.created', (data) => this.emit('order.created', data));
    this.connection.on('order.updated', (data) => this.emit('order.updated', data));
    this.connection.on('order.assigned', (data) => this.emit('order.assigned', data));
    this.connection.on('order.completed', (data) => this.emit('order.completed', data));
    this.connection.on('order.cancelled', (data) => this.emit('order.cancelled', data));

    // Driver events
    this.connection.on('driver.status.changed', (data) => this.emit('driver.status.changed', data));
    this.connection.on('driver.location.updated', (data) => this.emit('driver.location.updated', data));
    this.connection.on('driver.shift.started', (data) => this.emit('driver.shift.started', data));
    this.connection.on('driver.shift.ended', (data) => this.emit('driver.shift.ended', data));

    // Vehicle events
    this.connection.on('vehicle.location.updated', (data) => this.emit('vehicle.location.updated', data));
    this.connection.on('vehicle.status.changed', (data) => this.emit('vehicle.status.changed', data));

    // Incident events
    this.connection.on('incident.created', (data) => this.emit('incident.created', data));
    this.connection.on('incident.updated', (data) => this.emit('incident.updated', data));

    // Dashboard events
    this.connection.on('dashboard.stats.updated', (data) => this.emit('dashboard.stats.updated', data));
  }

  /**
   * Emit event to all subscribers
   */
  private emit(eventName: string, data: unknown): void {
    const callbacks = this.subscriptions[eventName];
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SignalR] Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Check if max reconnection attempts reached
    if (this.reconnectAttempts >= SIGNALR_CONFIG.maxReconnectAttempts) {
      console.error('[SignalR] Max reconnection attempts reached');
      showError('Unable to establish real-time connection. Please refresh the page.', 10000);
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );

    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      // SignalR attempting to reconnect
      this.connect();
    }, delay);
  }

  /**
   * Subscribe to a SignalR event
   */
  subscribe<T>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.subscriptions[eventName]) {
      this.subscriptions[eventName] = new Set();
    }
    
    this.subscriptions[eventName].add(callback as EventCallback);

    // Return unsubscribe function
    return () => {
      this.subscriptions[eventName]?.delete(callback as EventCallback);
    };
  }

  /**
   * Unsubscribe from a SignalR event
   */
  unsubscribe<T>(eventName: string, callback: EventCallback<T>): void {
    this.subscriptions[eventName]?.delete(callback as EventCallback);
  }

  /**
   * Send event to server (if needed for client-to-server communication)
   */
  async invoke<T>(methodName: string, ...args: unknown[]): Promise<T | null> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(`[SignalR] Cannot invoke ${methodName}: Not connected`);
      return null;
    }

    try {
      return await this.connection.invoke<T>(methodName, ...args);
    } catch (error) {
      console.error(`[SignalR] Error invoking ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR hub
   */
  async disconnect(): Promise<void> {
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Stop connection
    if (this.connection) {
      try {
        await this.connection.stop();
        // SignalR disconnected
      } catch (error) {
        console.error('[SignalR] Error during disconnect:', error);
      }
      this.connection = null;
    }

    this.setStatus('disconnected');
    this.connectionStartTime = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Get connection ID
   */
  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }
}

// Export singleton instance
export const signalRClient = new SignalRClient();

// Hook for connection status
export function useConnectionStatus(): ConnectionStatus {
  return signalRClient.getConnectionStatus();
}
