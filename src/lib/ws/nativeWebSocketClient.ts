/**
 * Native WebSocket Client
 * Compatible wrapper replacing SignalR for our custom backend
 * URL: wss://backend-domain.com/ws/realtime
 */

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

// Hub message type
interface HubMessage {
  type: string;
  payload?: any;
  timestamp?: string;
}

/**
 * Native WebSocket Client Singleton
 * Replaces SignalR with our custom WebSocket backend
 */
class NativeWebSocketClient {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscriptions: EventSubscriptions = {};
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
  private connectionStartTime: number | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get connection ID (for compatibility)
   */
  getConnectionId(): string | null {
    return this.connectionStartTime ? `ws-${this.connectionStartTime}` : null;
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
   * Build WebSocket URL with authentication
   */
  private buildConnectionUrl(): string {
    const token = useAuthStore.getState().token;
    const baseUrl = SIGNALR_CONFIG.hubUrl.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');
    
    if (token) {
      return `${baseUrl}?token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
  }

  /**
   * Initialize and start WebSocket connection
   */
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    // Check if user is authenticated
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('[WebSocket] Cannot connect: No authentication token');
      return;
    }

    this.setStatus('connecting');
    this.reconnectAttempts = 0;

    try {
      const url = this.buildConnectionUrl();
      console.log('[WebSocket] Connecting to:', url);
      
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('[WebSocket] Connected');
        this.connectionStartTime = Date.now();
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        showInfo('Real-time connection established', 3000);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: HubMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      this.socket.onclose = () => {
        console.warn('[WebSocket] Connection closed');
        this.setStatus('disconnected');
        
        if (this.connectionStartTime) {
          showError('Real-time connection lost. Reconnecting...', 5000);
        }
        
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: HubMessage): void {
    switch (message.type) {
      case 'connected':
        console.log('[WebSocket] Server acknowledged connection:', message);
        break;
      case 'pong':
        // Ping/pong handling
        break;
      default:
        // Emit to subscribers
        this.emit(message.type, message.payload);
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      showError('Unable to establish real-time connection', 5000);
      return;
    }

    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.setStatus('disconnected');
    this.connectionStartTime = null;
    return Promise.resolve();
  }

  /**
   * Subscribe to an event
   */
  on<T>(eventName: string, callback: EventCallback<T>): () => void {
    if (!this.subscriptions[eventName]) {
      this.subscriptions[eventName] = new Set();
    }
    this.subscriptions[eventName].add(callback as EventCallback);

    return () => {
      this.subscriptions[eventName]?.delete(callback as EventCallback);
    };
  }

  /**
   * Emit event to subscribers
   */
  private emit(eventName: string, data: unknown): void {
    this.subscriptions[eventName]?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Error in event handler for ${eventName}:`, error);
      }
    });
  }

  /**
   * Send message to server
   */
  send(type: string, payload?: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WebSocket] Cannot send: not connected');
    }
  }

  /**
   * Subscribe to an event (alias for 'on' method)
   */
  subscribe<T>(eventName: string, callback: EventCallback<T>): () => void {
    return this.on(eventName, callback);
  }

  /**
   * Invoke a server method (for compatibility with SignalR)
   */
  invoke<T>(methodName: string, ...args: any[]): Promise<T | null> {
    this.send(methodName, args);
    return Promise.resolve(null);
  }
}

// Export singleton instance
export const signalrClient = new NativeWebSocketClient();

// Export types for compatibility
export { NativeWebSocketClient };
export default signalrClient;
