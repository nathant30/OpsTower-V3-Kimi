// src/api/auth.routes.ts
// Auth Routes - Fastify

import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  role: z.string().optional(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Routes plugin
export default async function authRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // POST /api/auth/login - Login
  fastify.post('/login', async (request, reply) => {
    const validation = loginSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await authService.login(validation.data);
    return result;
  });

  // POST /api/auth/register - Register
  fastify.post('/register', async (request, reply) => {
    const validation = registerSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await authService.register(validation.data);
    reply.status(201);
    return result;
  });

  // POST /api/auth/refresh - Refresh token
  fastify.post('/refresh', async (request, reply) => {
    const validation = refreshSchema.safeParse(request.body);
    
    if (!validation.success) {
      throw new ValidationError(validation.error.errors.map(e => e.message).join(', '));
    }

    const result = await authService.refreshToken(validation.data.refreshToken);
    return result;
  });

  // GET /api/auth/me - Get current user
  fastify.get('/me', async (request, reply) => {
    // Get token from header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = fastify.jwt.verify(token) as any;
      const user = await authService.getCurrentUser(decoded.userId);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return { user };
    } catch (error) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
  });
}
