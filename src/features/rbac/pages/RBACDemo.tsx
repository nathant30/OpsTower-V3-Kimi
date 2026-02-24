// RBAC Demo Page
// Interactive RBAC demonstration with permission matrix and role switcher

import { useState } from 'react';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Code,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { UserRole } from '@/types/auth.types';

interface Role {
  id: string;
  name: UserRole;
  description: string;
  color: string;
  permissions: string[];
}

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'SuperAdmin',
    description: 'Full system access',
    color: '#ef4444',
    permissions: ['*:*'],
  },
  {
    id: '2',
    name: 'OperationsDirector',
    description: 'Operations oversight',
    color: '#f97316',
    permissions: [
      'view:dashboard', 'view:analytics',
      'view:orders', 'create:orders', 'edit:orders', 'cancel:orders',
      'view:drivers', 'edit:drivers', 'suspend:drivers', 'verify:drivers',
      'view:fleet', 'edit:fleet', 'manage:maintenance',
      'view:incidents', 'create:incidents', 'edit:incidents', 'resolve:incidents', 'investigate:incidents',
      'view:finance', 'process:payouts', 'export:transactions',
      'manage:users', 'manage:settings', 'view:audit',
    ],
  },
  {
    id: '3',
    name: 'OperationsManager',
    description: 'Day-to-day operations',
    color: '#eab308',
    permissions: [
      'view:dashboard', 'view:analytics',
      'view:orders', 'create:orders', 'edit:orders',
      'view:drivers', 'edit:drivers', 'verify:drivers',
      'view:fleet', 'edit:fleet',
      'view:incidents', 'create:incidents', 'edit:incidents', 'resolve:incidents',
      'view:finance', 'export:transactions',
    ],
  },
  {
    id: '4',
    name: 'FleetManager',
    description: 'Fleet operations',
    color: '#22c55e',
    permissions: [
      'view:dashboard',
      'view:fleet', 'edit:fleet', 'manage:maintenance',
      'view:drivers', 'verify:drivers',
      'view:incidents',
    ],
  },
  {
    id: '5',
    name: 'FinanceManager',
    description: 'Financial management',
    color: '#3b82f6',
    permissions: [
      'view:dashboard', 'view:analytics',
      'view:finance', 'process:payouts', 'adjust:transactions', 'export:transactions', 'reverse:transactions',
      'view:drivers',
    ],
  },
  {
    id: '6',
    name: 'SupportAgent',
    description: 'Customer support',
    color: '#8b5cf6',
    permissions: [
      'view:dashboard',
      'view:orders', 'edit:orders',
      'view:drivers',
      'view:incidents', 'create:incidents',
    ],
  },
  {
    id: '7',
    name: 'Viewer',
    description: 'Read-only access',
    color: '#6b7280',
    permissions: [
      'view:dashboard',
      'view:orders',
      'view:drivers',
      'view:fleet',
      'view:incidents',
    ],
  },
];

// Mock permissions list
const mockPermissions = [
  'view:dashboard',
  'view:analytics',
  'view:orders',
  'create:orders',
  'edit:orders',
  'cancel:orders',
  'assign:drivers',
  'view:drivers',
  'edit:drivers',
  'suspend:drivers',
  'verify:drivers',
  'view:fleet',
  'edit:fleet',
  'manage:maintenance',
  'view:incidents',
  'create:incidents',
  'edit:incidents',
  'investigate:incidents',
  'resolve:incidents',
  'view:finance',
  'process:payouts',
  'adjust:transactions',
  'export:transactions',
  'reverse:transactions',
  'manage:users',
  'manage:settings',
  'view:audit',
];

const RBACDemo = () => {
  const [roles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<string[]>(mockPermissions);
  const [selectedRole, setSelectedRole] = useState<UserRole>('SuperAdmin');
  const [showPermissions, setShowPermissions] = useState(false);
  const [showCodeExamples, setShowCodeExamples] = useState(false);
  const [isLoading] = useState(false);

  const selectedRoleData = roles.find(r => r.name === selectedRole);

  const checkPermission = (permission: string, role: Role) => {
    if (role.permissions.includes('*:*')) return true;
    return role.permissions.includes(permission);
  };

  const features = [
    { name: 'Dashboard', permission: 'view:dashboard' },
    { name: 'Fleet Management', permission: 'fleet:write' },
    { name: 'Driver Management', permission: 'drivers:write' },
    { name: 'Financial Reports', permission: 'finance:read' },
    { name: 'Analytics', permission: 'analytics:read' },
    { name: 'System Settings', permission: 'manage:settings' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading RBAC Demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            RBAC Demo
          </h1>
          <p className="text-gray-400 mt-2">
            Interactive Role-Based Access Control demonstration
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => window.location.reload()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Current Role Indicator */}
      {selectedRoleData && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: selectedRoleData.color + '20' }}
                >
                  <Shield className="w-8 h-8" style={{ color: selectedRoleData.color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRoleData.name}
                  </h2>
                  <p className="text-gray-400">{selectedRoleData.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="active">
                      {selectedRoleData.permissions.includes('*:*')
                        ? 'All Permissions'
                        : `${selectedRoleData.permissions.length} Permissions`}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowPermissions(!showPermissions)}
                className="flex items-center gap-2"
              >
                {showPermissions ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Hide Permissions
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
                    Show Permissions
                  </>
                )}
              </Button>
            </div>

            {/* Permissions List */}
            {showPermissions && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-white mb-3">
                  Granted Permissions:
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRoleData.permissions.includes('*:*') ? (
                    <Badge variant="warning" className="col-span-3 justify-center">
                      ALL PERMISSIONS (Super Admin)
                    </Badge>
                  ) : (
                    selectedRoleData.permissions.map((perm) => (
                      <Badge key={perm} variant="active" className="text-xs">
                        {perm}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Role Switcher */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Switch Role</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.name)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRole === role.name
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: role.color + '20' }}
                >
                  <Shield className="w-5 h-5" style={{ color: role.color }} />
                </div>
                <h3 className="font-semibold text-sm text-white">
                  {role.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Permission Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-3 text-gray-400 font-semibold">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className="text-center p-3 text-gray-400 font-semibold"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Shield className="w-4 h-4" style={{ color: role.color }} />
                        <span className="text-xs">{role.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.slice(0, 15).map((permission) => (
                  <tr key={permission} className="border-b border-gray-800/50">
                    <td className="p-3 text-white font-mono text-xs">
                      {permission}
                    </td>
                    {roles.map((role) => {
                      const hasAccess = checkPermission(permission, role);
                      return (
                        <td key={role.id} className="text-center p-3">
                          {hasAccess ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Showing {Math.min(15, permissions.length)} of {permissions.length} permissions
          </p>
        </div>
      </Card>

      {/* Feature Access Checker */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Feature Access Checker</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature) => {
              const hasAccess = selectedRoleData
                ? checkPermission(feature.permission, selectedRoleData)
                : false;
              return (
                <div
                  key={feature.name}
                  className={`p-4 rounded-lg border-2 ${
                    hasAccess
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm text-white">
                      {feature.name}
                    </h3>
                    {hasAccess ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{feature.permission}</p>
                  <Badge
                    variant={hasAccess ? 'active' : 'alert'}
                    className="mt-2"
                  >
                    {hasAccess ? 'Access Granted' : 'Access Denied'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Code Examples */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Code Examples</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCodeExamples(!showCodeExamples)}
            >
              {showCodeExamples ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Show
                </>
              )}
            </Button>
          </div>
          {showCodeExamples && (
            <div className="space-y-4">
              <div className="bg-[#0f0f14] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-white">
                    Using hasPermission Hook
                  </h4>
                </div>
                <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
{`import { useAuth } from '@/lib/stores/auth.store'

const MyComponent = () => {
  const { hasPermission } = useAuth()

  if (!hasPermission('fleet:write')) {
    return <AccessDenied />
  }

  return <FleetEditor />
}`}
                </pre>
              </div>

              <div className="bg-[#0f0f14] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-white">
                    Conditional Rendering
                  </h4>
                </div>
                <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
{`{hasPermission('finance:write') && (
  <Button onClick={handleApprove}>
    Approve Transaction
  </Button>
)}`}
                </pre>
              </div>

              <div className="bg-[#0f0f14] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-white">
                    Check Multiple Roles
                  </h4>
                </div>
                <pre className="text-xs text-gray-400 font-mono overflow-x-auto">
{`const { user } = useAuth()

const canManageFleet = 
  user?.role === 'SuperAdmin' || 
  user?.role === 'OperationsDirector'`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Info Banner */}
      <Card>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                About RBAC Demo
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                This interactive demo shows how Role-Based Access Control works in OpsTower.
                Switch between roles to see how permissions change. The permission matrix shows
                which features each role can access. Use the code examples to implement RBAC
                checks in your components.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RBACDemo;
