// src/services/auth.service.ts
// Authentication Service

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/db.js';
import { NotFoundError, UnauthorizedError, ValidationError } from '../middleware/errorHandler.js';

// ============================================================================
// TYPES
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

// ============================================================================
// DEFAULT USERS (for demo)
// ============================================================================

const DEFAULT_USERS = [
  {
    email: 'admin@opstower.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
  {
    email: 'dispatch@opstower.com',
    password: 'dispatch123',
    firstName: 'Dispatch',
    lastName: 'Operator',
    role: 'DISPATCH_LEAD',
  },
  {
    email: 'viewer@opstower.com',
    password: 'viewer123',
    firstName: 'Viewer',
    lastName: 'User',
    role: 'VIEWER',
  },
];

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  // For demo: Check default users first
  const defaultUser = DEFAULT_USERS.find(u => u.email === input.email);
  
  if (defaultUser) {
    if (input.password !== defaultUser.password) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        userId: `demo-${defaultUser.email}`,
        email: defaultUser.email,
        role: defaultUser.role,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: `demo-${defaultUser.email}`, type: 'refresh' },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: `demo-${defaultUser.email}`,
        email: defaultUser.email,
        firstName: defaultUser.firstName,
        lastName: defaultUser.lastName,
        role: defaultUser.role,
      },
      token,
      refreshToken,
    };
  }

  // Check database user
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
    refreshToken,
  };
}

/**
 * Register new user
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new ValidationError('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phoneNumber,
      role: (input.role as any) || 'VIEWER',
      // Note: username field not in current schema
    },
  });

  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token,
    refreshToken,
  };
}

/**
 * Refresh token
 */
export async function refreshToken(refreshToken: string): Promise<{ token: string }> {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'default-secret') as any;
    
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    let user;
    if (decoded.userId.startsWith('demo-')) {
      const email = decoded.userId.replace('demo-', '');
      const defaultUser = DEFAULT_USERS.find(u => u.email === email);
      if (!defaultUser) throw new UnauthorizedError('User not found');
      user = {
        id: decoded.userId,
        email: defaultUser.email,
        role: defaultUser.role,
      };
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });
    }

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const newToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return { token: newToken };
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(userId: string) {
  if (userId.startsWith('demo-')) {
    const email = userId.replace('demo-', '');
    const defaultUser = DEFAULT_USERS.find(u => u.email === email);
    if (!defaultUser) return null;
    return {
      id: userId,
      email: defaultUser.email,
      firstName: defaultUser.firstName,
      lastName: defaultUser.lastName,
      role: defaultUser.role,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  return user;
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const authService = {
  login,
  register,
  refreshToken,
  getCurrentUser,
};

export default authService;
