import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import route handlers
import authRoutes from './api/auth.routes.js';
import driversRoutes from './api/drivers.routes.js';
import fleetRoutes from './api/fleet.routes.js';
import incidentsRoutes from './api/incidents.routes.js';
import shiftsRoutes from './api/shifts.routes.js';
import bondsRoutes from './api/bonds.routes.js';
import financeRoutes from './api/finance.routes.js';
import complianceRoutes from './api/compliance.routes.js';
import kpiRoutes from './api/kpi.routes.js';
import paymentsRoutes from './api/payments.routes.js';
import locationRoutes from './api/location.routes.js';

// Import WebSocket hub
import { initializeRealtimeHub } from './hubs/realtime.hub.js';

dotenv.config();

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
});

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.LOG_PRETTY === 'true' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    } : undefined,
  },
});

// Register plugins
fastify.register(cors, {
  origin: process.env.NODE_ENV === 'development' ? ['http://localhost:8000', 'http://localhost:5173'] : true,
  credentials: true,
});

fastify.register(helmet);

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});

// Decorate fastify with prisma
fastify.decorate('prisma', prisma);

// Register WebSocket plugin
fastify.register(websocket);

// Initialize realtime hub
initializeRealtimeHub(fastify);

// Register API routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(driversRoutes, { prefix: '/api/drivers' });
fastify.register(fleetRoutes, { prefix: '/api/fleet' });
fastify.register(incidentsRoutes, { prefix: '/api/incidents' });
fastify.register(shiftsRoutes, { prefix: '/api/shifts' });
fastify.register(bondsRoutes, { prefix: '/api/bonds' });
fastify.register(financeRoutes, { prefix: '/api/finance' });
fastify.register(complianceRoutes, { prefix: '/api/compliance' });
fastify.register(kpiRoutes, { prefix: '/api/kpi' });
fastify.register(paymentsRoutes, { prefix: '/api/payments' });
fastify.register(locationRoutes, { prefix: '/api/locations' });

// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'opstower-v2-backend',
  };
});

// WebSocket status endpoint
fastify.get('/ws/status', async () => {
  return {
    status: 'ok',
    websocket: true,
    endpoint: '/ws/realtime',
  };
});

// Root endpoint
fastify.get('/', async () => {
  return {
    name: 'OpsTower V2 Backend',
    version: '1.0.0',
    status: 'running',
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '8080');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    fastify.log.info(`Server listening on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default fastify;
