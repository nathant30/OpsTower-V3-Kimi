// src/middleware/rbac.ts
// Role-Based Access Control middleware

import { FastifyRequest, FastifyReply } from 'fastify';

// Permission map
const PERMISSIONS: Record<string, string[]> = {
  'drivers.read': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'OVERWATCH_STAFF', 'DISPATCH_LEAD', 'DISPATCH_STAFF', 'VIEWER'],
  'drivers.write': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'DISPATCH_LEAD'],
  'shifts.read': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'OVERWATCH_STAFF', 'DISPATCH_LEAD', 'DISPATCH_STAFF', 'VIEWER'],
  'shifts.write': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'DISPATCH_LEAD', 'DISPATCH_STAFF'],
  'bonds.read': ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'OVERWATCH_LEAD'],
  'bonds.write': ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
  'incidents.read': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'OVERWATCH_STAFF', 'DISPATCH_LEAD', 'DISPATCH_STAFF', 'VIEWER'],
  'incidents.write': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'OVERWATCH_STAFF', 'DISPATCH_LEAD', 'DISPATCH_STAFF'],
  'finance.read': ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'AUDITOR'],
  'finance.write': ['SUPER_ADMIN', 'ADMIN', 'FINANCE'],
  'fleet.read': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'DISPATCH_LEAD', 'DISPATCH_STAFF', 'VIEWER'],
  'fleet.write': ['SUPER_ADMIN', 'ADMIN', 'OVERWATCH_LEAD', 'DISPATCH_LEAD'],
  'users.read': ['SUPER_ADMIN', 'ADMIN'],
  'users.write': ['SUPER_ADMIN', 'ADMIN'],
  'compliance.read': ['SUPER_ADMIN', 'ADMIN', 'AUDITOR'],
  'compliance.write': ['SUPER_ADMIN', 'ADMIN'],
};

/**
 * Require specific permission
 */
export function requirePermission(permission: string) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const userRole = request.user?.role;
    
    if (!userRole) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Role not found',
        },
      });
    }

    const allowedRoles = PERMISSIONS[permission] || [];
    
    if (!allowedRoles.includes(userRole)) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: `Permission denied: ${permission}`,
        },
      });
    }
  };
}

export default requirePermission;
