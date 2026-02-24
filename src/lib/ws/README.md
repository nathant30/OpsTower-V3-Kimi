# WebSocket / SignalR Implementation

Real-time updates for OpsTower V2 using SignalR WebSocket connections.

## Hub URL
```
https://testapi.xpress.ph/hubs
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Components/Features                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Dashboard│ │  Orders  │ │  Drivers │ │ Incidents│            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │            │            │            │                   │
│       └────────────┴──────┬─────┴────────────┘                   │
│                           │                                      │
│                    useWebSocket() Hook                          │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────┐             │
│  │              WebSocketProvider                   │             │
│  │         (Context + Auto-Subscribe)               │             │
│  └────────────────────────┬────────────────────────┘             │
│                           │                                      │
│                    signalRClient                                 │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ WebSocket
                    ┌───────▼────────┐
                    │  SignalR Hub   │
                    │testapi.xpress.ph│
                    └────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `signalrClient.ts` | SignalR connection manager (singleton) |
| `useWebSocket.ts` | React hooks for event subscription |
| `WebSocketProvider.tsx` | Context provider with auto-subscription |
| `handlers/orderHandlers.ts` | Order event cache updates |
| `handlers/driverHandlers.ts` | Driver event cache updates |
| `handlers/vehicleHandlers.ts` | Vehicle event cache updates |
| `handlers/incidentHandlers.ts` | Incident event cache updates + sound alerts |

## Event Types

### Order Events
- `order.created` - New order received
- `order.updated` - Order status changed
- `order.assigned` - Driver assigned to order
- `order.completed` - Order finished
- `order.cancelled` - Order cancelled

### Driver Events
- `driver.status.changed` - Online/Offline/OnTrip status
- `driver.location.updated` - GPS position update (throttled)
- `driver.shift.started` - Shift started
- `driver.shift.ended` - Shift ended

### Vehicle Events
- `vehicle.location.updated` - GPS position update (throttled)
- `vehicle.status.changed` - Active/Maintenance/Offline status

### Incident Events
- `incident.created` - New incident reported (with sound alert)
- `incident.updated` - Incident status changed

### Dashboard Events
- `dashboard.stats.updated` - Stats refresh

## Usage

### 1. Basic Event Subscription

```typescript
import { useWebSocket } from '@/lib/ws';

function OrderList() {
  const queryClient = useQueryClient();

  useWebSocket('order.updated', (event) => {
    // Update cache
    queryClient.setQueryData(['order', event.orderId], event.data);
    queryClient.invalidateQueries(['orders', 'list']);
    
    // Show notification
    showInfo(`Order ${event.orderId} updated to ${event.status}`);
  });

  // ...
}
```

### 2. Multiple Events

```typescript
import { useWebSocketEvents } from '@/lib/ws';

function Dashboard() {
  useWebSocketEvents([
    { event: 'order.created', handler: handleOrderCreated },
    { event: 'order.completed', handler: handleOrderCompleted },
    { event: 'driver.status.changed', handler: handleDriverStatus },
  ]);

  // ...
}
```

### 3. Conditional Subscription

```typescript
useWebSocket('driver.location.updated', (event) => {
  updateMapMarker(event.driverId, event.lat, event.lng);
}, { 
  enabled: isMapVisible,  // Only subscribe when map is shown
  deps: [driverId]        // Re-subscribe when driverId changes
});
```

### 4. Connection Status

```typescript
import { useWebSocketContext, ConnectionStatusBadge } from '@/lib/ws';

function Header() {
  const { status, isConnected, reconnect } = useWebSocketContext();
  
  return (
    <header>
      <ConnectionStatusBadge />
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </header>
  );
}
```

### 5. Optimistic Updates

```typescript
import { useOptimisticUpdate } from '@/lib/ws';

function OrderActions({ orderId }) {
  const { update, rollback, commit } = useOptimisticUpdate<Order>(
    ['order', orderId]
  );

  const handleComplete = async () => {
    // Optimistic update
    update((old) => ({ ...old!, status: 'Completed' }));
    
    try {
      await completeOrderAPI(orderId);
      commit(); // Success, keep changes
    } catch {
      rollback(); // Error, revert changes
      showError('Failed to complete order');
    }
  };

  // ...
}
```

## Configuration

### Environment Variables

```env
# SignalR Hub URL (optional, defaults to testapi)
VITE_SIGNALR_HUB_URL=https://testapi.xpress.ph/hubs

# Enable debug logging
VITE_ENABLE_DEBUG=true
```

### SignalR Config

```typescript
// src/config/api.config.ts
export const SIGNALR_CONFIG = {
  hubUrl: 'https://testapi.xpress.ph/hubs',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
};
```

## Connection Lifecycle

1. **Login** → `signalRClient.connect()` called automatically
2. **Connected** → Status badge shows "Live"
3. **Reconnecting** → Auto-retry with exponential backoff (1s, 2s, 4s... max 30s)
4. **Disconnected** → Manual retry button shown
5. **Logout** → Connection closed, cache cleared

## Features

- ✅ Automatic connection on login
- ✅ Exponential backoff reconnection
- ✅ Connection status indicator in header
- ✅ Toast notifications for events
- ✅ Sound alerts for critical incidents
- ✅ React Query cache updates
- ✅ Throttled location updates (1s)
- ✅ Type-safe event handlers
- ✅ Optimistic updates with rollback

## Best Practices

1. **Use auto-subscription** via `WebSocketProvider` for global events
2. **Use `useWebSocket`** hook for component-specific events
3. **Always handle cleanup** - hooks auto-unsubscribe on unmount
4. **Throttle high-frequency events** - location updates are already throttled
5. **Show notifications sparingly** - avoid notification spam
6. **Use optimistic updates** for better UX on user actions
