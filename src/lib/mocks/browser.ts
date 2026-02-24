/**
 * Mock Browser Setup
 * Configures MSW-style request interception for development
 */

import { handleMockRequest } from './handlers';
import { API_CONFIG } from '@/config/api.config';

// Check if mocks are enabled
const isMockEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
};

// Store original fetch
let originalFetch: typeof fetch | null = null;

// Mock fetch implementation
const mockFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  // Handle different input types properly
  let url: string;
  let method: string;
  let body: any;
  
  if (typeof input === 'object' && input !== null) {
    if ('url' in input && typeof (input as Request).url === 'string') {
      url = (input as Request).url;
      method = (input as Request).method;
    } else if (input instanceof URL) {
      url = input.toString();
      method = init?.method || 'GET';
    } else {
      url = String(input);
      method = init?.method || 'GET';
    }
  } else {
    url = String(input);
    method = init?.method || 'GET';
  }
  
  // Skip Mapbox requests - let them go to real API
  if (url.includes('api.mapbox.com') || url.includes('tiles.mapbox.com') || url.includes('events.mapbox.com')) {
    if (originalFetch) {
      return originalFetch(input, init);
    }
  }
  
  // Skip auth requests - let them go to real backend
  if (url.includes('/api/auth/')) {
    // Mock pass-through auth request
    if (originalFetch) {
      return originalFetch(input, init);
    }
  }
  
  // Skip Traksolid dashcam proxy requests
  if (url.includes('/traksolid-proxy/')) {
    if (originalFetch) {
      return originalFetch(input, init);
    }
  }
  
  // Parse body for non-GET requests
  body = undefined;
  if (method !== 'GET' && init?.body) {
    try {
      body = JSON.parse(init.body as string);
    } catch {
      body = init.body;
    }
  }
  
  // Parse query params
  const urlObj = new URL(url, window.location.origin);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  try {
    const response = await handleMockRequest(url, method, params, body);
    
    // Create a Response-like object
    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Mock] Error handling request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Mock server error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// Interceptor for XMLHttpRequest (for axios compatibility)
class MockXMLHttpRequest extends XMLHttpRequest {
  private _url: string = '';
  private _method: string = 'GET';
  private _requestHeaders: Record<string, string> = {};
  private _listeners: Record<string, Function[]> = {};

  open(method: string, url: string, _async: boolean = true): void {
    this._method = method;
    this._url = url;
    // Don't call super.open since we're mocking
  }

  setRequestHeader(header: string, value: string): void {
    this._requestHeaders[header] = value;
  }

  send(body?: Document | BodyInit | null): void {
    // Handle the request asynchronously
    setTimeout(async () => {
      // Construct full URL based on path type:
      // - Full http(s) URLs: use as-is
      // - Absolute paths starting with /: use as-is (for Vite proxy support)
      // - Relative paths: prepend backend base URL
      let fullUrl: string;
      if (this._url.startsWith('http')) {
        fullUrl = this._url;
      } else if (this._url.startsWith('/')) {
        // Absolute path - use with current origin (supports Vite proxy)
        fullUrl = this._url;
      } else {
        // Relative path - prepend backend base URL
        const version = API_CONFIG.version ? `/${API_CONFIG.version}` : '';
        fullUrl = `${API_CONFIG.baseURL}${version}/api/${this._url}`;
      }
      
      // Pass-through auth requests to real backend
      if (fullUrl.includes('/api/auth/')) {
        // Mock pass-through XHR auth request
        // Use original fetch since XMLHttpRequest is replaced
        try {
          const response = await fetch(fullUrl, {
            method: this._method,
            headers: this._requestHeaders,
            body: body as string | undefined,
          });
          const responseData = await response.text();
          Object.defineProperty(this, 'status', { value: response.status, writable: true });
          Object.defineProperty(this, 'statusText', { value: response.statusText, writable: true });
          Object.defineProperty(this, 'response', { value: responseData, writable: true });
          Object.defineProperty(this, 'responseText', { value: responseData, writable: true });
          this._triggerEvent('load');
          this._triggerEvent('loadend');
          return;
        } catch (error) {
          Object.defineProperty(this, 'status', { value: 500, writable: true });
          Object.defineProperty(this, 'statusText', { value: 'Network Error', writable: true });
          this._triggerEvent('error');
          return;
        }
      }
      
      // Pass-through Traksolid dashcam proxy requests
      if (fullUrl.includes('/traksolid-proxy/')) {
        console.log('[Mock XHR] Pass-through Traksolid request:', fullUrl);
        try {
          // For absolute paths, we need to use the current origin
          const proxyUrl = fullUrl.startsWith('/') 
            ? `${window.location.origin}${fullUrl}`
            : fullUrl;
          console.log('[Mock XHR] Fetching:', proxyUrl);
          const response = await fetch(proxyUrl, {
            method: this._method,
            headers: this._requestHeaders,
            body: body as string | undefined,
          });
          console.log('[Mock XHR] Response status:', response.status);
          const responseData = await response.text();
          console.log('[Mock XHR] Response data:', responseData.substring(0, 200));
          Object.defineProperty(this, 'status', { value: response.status, writable: true });
          Object.defineProperty(this, 'statusText', { value: response.statusText, writable: true });
          Object.defineProperty(this, 'response', { value: responseData, writable: true });
          Object.defineProperty(this, 'responseText', { value: responseData, writable: true });
          this._triggerEvent('load');
          this._triggerEvent('loadend');
          return;
        } catch (error) {
          console.error('[Mock XHR] Error:', error);
          Object.defineProperty(this, 'status', { value: 500, writable: true });
          Object.defineProperty(this, 'statusText', { value: 'Network Error', writable: true });
          this._triggerEvent('error');
          return;
        }
      }
      
      const parsedBody = body ? JSON.parse(body as string) : undefined;
      
      try {
        const response = await handleMockRequest(fullUrl, this._method, {}, parsedBody);
        
        // Simulate response using Object.defineProperty for readonly properties
        Object.defineProperty(this, 'status', { value: response.status, writable: true });
        Object.defineProperty(this, 'statusText', { value: response.status === 200 ? 'OK' : 'Error', writable: true });
        Object.defineProperty(this, 'response', { value: JSON.stringify(response.body), writable: true });
        Object.defineProperty(this, 'responseText', { value: JSON.stringify(response.body), writable: true });
        
        // Trigger events
        this._triggerEvent('load');
        this._triggerEvent('loadend');
      } catch (error) {
        Object.defineProperty(this, 'status', { value: 500, writable: true });
        Object.defineProperty(this, 'statusText', { value: 'Internal Server Error', writable: true });
        this._triggerEvent('error');
      }
    }, Math.random() * 600 + 200);
  }

  addEventListener(event: string, callback: EventListener): void {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  removeEventListener(event: string, callback: EventListener): void {
    if (this._listeners[event]) {
      this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    }
  }

  private _triggerEvent(event: string): void {
    if (this._listeners[event]) {
      this._listeners[event].forEach(callback => {
        callback.call(this, new Event(event));
      });
    }
    
    // Also trigger on* handlers
    const handlerName = `on${event}` as keyof this;
    const handler = this[handlerName] as Function;
    if (handler) {
      handler.call(this, new Event(event));
    }
  }

  getAllResponseHeaders(): string {
    return 'Content-Type: application/json';
  }

  getResponseHeader(header: string): string | null {
    if (header.toLowerCase() === 'content-type') {
      return 'application/json';
    }
    return null;
  }
}



/**
 * Enable mock data interception
 */
export const enableMocks = (): void => {
  if (!isMockEnabled()) {
    // Mocks are disabled
    return;
  }

  if (originalFetch) {
    // Mocks already enabled
    return;
  }

  // Enabling mock data
  
  // Store original fetch
  originalFetch = window.fetch;
  
  // Replace fetch with mock
  window.fetch = mockFetch as typeof fetch;
  
  // Replace XMLHttpRequest for axios compatibility
  (window as any).XMLHttpRequest = MockXMLHttpRequest;
  
  // Mock data enabled successfully
};

/**
 * Disable mock data interception
 */
export const disableMocks = (): void => {
  if (!originalFetch) {
    // Mocks are not enabled
    return;
  }

  // Disabling mock data
  
  // Restore original fetch
  window.fetch = originalFetch;
  originalFetch = null;
  
  // Note: XMLHttpRequest cannot be fully restored in this context
  // A page reload would be needed to fully disable
  
  // Mock data disabled
};

/**
 * Check if mocks are currently enabled
 */
export const areMocksEnabled = (): boolean => {
  return originalFetch !== null;
};

/**
 * Get mock status information
 */
export const getMockStatus = (): {
  enabled: boolean;
  envVariable: boolean;
  interceptorActive: boolean;
} => {
  return {
    enabled: isMockEnabled(),
    envVariable: isMockEnabled(),
    interceptorActive: areMocksEnabled(),
  };
};

/**
 * Setup mocks on application startup
 * Call this function in main.tsx before rendering the app
 */
export const setupMocks = async (): Promise<void> => {
  if (!isMockEnabled()) {
    // Mocks disabled, using real API
    return;
  }

  // Setting up mock environment
  
  // Log mock data stats
  const { mockDrivers, mockVehicles, mockOrders, mockIncidents, mockTransactions } = await import('./data');
  
  // Mock environment setup complete
  
  enableMocks();
};

// Default export for convenience
export default {
  enable: enableMocks,
  disable: disableMocks,
  setup: setupMocks,
  isEnabled: areMocksEnabled,
  getStatus: getMockStatus,
};
