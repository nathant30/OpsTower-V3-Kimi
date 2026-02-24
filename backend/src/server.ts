import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

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

// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'opstower-v2-backend',
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
// CI/CD Test: Tue 24 Feb 2026 08:47:21 PST
// CI/CD Test Trigger
// CI/CD Trigger: Azure Deployment Test 1771894102
