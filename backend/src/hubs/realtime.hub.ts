/**
 * Real-time WebSocket Hub
 * Handles live updates for dashboard, driver locations, orders, etc.
 */

import { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';

// Connected clients
const clients = new Map<string, WebSocket>();

// Hub instance
let fastifyInstance: FastifyInstance | null = null;

export function initializeRealtimeHub(fastify: FastifyInstance) {
  fastifyInstance = fastify;

  // Register WebSocket route
  fastify.get('/ws/realtime', { websocket: true }, (socket, req) => {
    const clientId = req.id || `client-${Date.now()}`;
    clients.set(clientId, socket);

    console.log(`[WebSocket] Client connected: ${clientId}. Total clients: ${clients.size}`);

    // Send welcome message
    socket.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    }));

    // Handle messages from client
    socket.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(clientId, data, socket);
      } catch (error) {
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON format'
        }));
      }
    });

    // Handle disconnect
    socket.on('close', () => {
      clients.delete(clientId);
      console.log(`[WebSocket] Client disconnected: ${clientId}. Total clients: ${clients.size}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`[WebSocket] Error for client ${clientId}:`, error);
    });
  });

  console.log('[WebSocket] Realtime hub initialized at /ws/realtime');
}

function handleClientMessage(clientId: string, data: any, socket: WebSocket) {
  switch (data.type) {
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      break;

    case 'subscribe':
      // Handle subscription to specific events
      socket.send(JSON.stringify({
        type: 'subscribed',
        channel: data.channel,
        timestamp: new Date().toISOString()
      }));
      break;

    case 'driver-location':
      // Handle driver location updates
      broadcast('driver-location', data.payload, clientId);
      break;

    default:
      socket.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${data.type}`
      }));
  }
}

// Broadcast message to all connected clients
export function broadcast(type: string, payload: any, excludeClientId?: string) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });

  clients.forEach((socket, clientId) => {
    if (clientId !== excludeClientId && socket.readyState === 1) {
      socket.send(message);
    }
  });
}

// Send message to specific client
export function sendToClient(clientId: string, type: string, payload: any) {
  const socket = clients.get(clientId);
  if (socket && socket.readyState === 1) {
    socket.send(JSON.stringify({
      type,
      payload,
      timestamp: new Date().toISOString()
    }));
  }
}

// Get connected client count
export function getClientCount(): number {
  return clients.size;
}
