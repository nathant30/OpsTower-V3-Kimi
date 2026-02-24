/**
 * SignalR WebSocket Client - Compatibility Layer
 * 
 * This module now uses NativeWebSocketClient to connect to our custom backend.
 * Maintains the same API as the original SignalR client for backward compatibility.
 */

// Re-export everything from the native WebSocket client
export { 
  signalrClient,
  signalrClient as signalRClient,  // Alias for backward compatibility
  NativeWebSocketClient as SignalRClient,
  type ConnectionStatus,
  type EventCallback,
} from './nativeWebSocketClient';

// Default export for compatibility
export { signalrClient as default } from './nativeWebSocketClient';
