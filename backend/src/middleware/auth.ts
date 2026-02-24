// src/middleware/auth.ts
// JWT Authentication middleware for Fastify

import { FastifyRequest, FastifyReply } from 'fastify';

// User type for JWT payload
export interface UserContext {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

// Extend FastifyJWT interface from @fastify/jwt
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserContext;
    user: UserContext;
  }
}

/**
 * Authenticate JWT token using Fastify JWT plugin
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Use fastify-jwt's built-in verification
    await request.jwtVerify();
  } catch (error) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing token',
      },
    });
  }
}

export default authenticate;
