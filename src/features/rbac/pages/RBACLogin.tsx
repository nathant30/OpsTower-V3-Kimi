// RBAC Login Page
// OpsTower V2 - RBAC & Mobile Coordinator
// Enhanced login with role selection and preview

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import {
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  User,
  Lock,
  LogIn
} from 'lucide-react';
import type { UserRole, Permission } from '@/types/auth.types';

interface Role {
  id: string;
  name: UserRole;
  description: string;
  color: string;
  permissions: string[];
}

// Mock roles data - in production, fetch from API
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

const RBACLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [roles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<UserRole>('SuperAdmin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePreview, setShowRolePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!username) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      // Mock login - in production, validate against backend
      const selectedRoleData = roles.find(r => r.name === selectedRole);
      
      const mockUser = {
        id: `user-${Date.now()}`,
        email: `${username}@opstower.com`,
        firstName: username,
        lastName: 'Test',
        role: selectedRole,
        permissions: (selectedRoleData?.permissions || []) as Permission[],
        avatar: undefined,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      login('mock-jwt-token', mockUser);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setUsername(`test-${role.toLowerCase()}`);
    setTimeout(() => {
      handleLogin();
    }, 100);
  };

  const selectedRoleData = roles.find(r => r.name === selectedRole);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f0f14]">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-[#0f0f14] to-[#0f0f14]" />

      <div className="relative z-10 w-full max-w-6xl px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-lg mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                RBAC Login Demo
              </h1>
              <p className="text-gray-400 mt-2">
                Test different user roles
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-500 font-medium">Login Failed</p>
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username / Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Login as Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-[#0f0f14] border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {import.meta.env.DEV && (
              <div className="mt-6 space-y-2">
                <div className="p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <p className="text-xs text-blue-400 text-center">
                    Development Mode: Use Quick Login buttons for testing
                  </p>
                </div>
                <a 
                  href="/god"
                  className="block p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-lg text-center hover:border-orange-400 transition-colors"
                >
                  <span className="text-sm font-bold text-orange-400">⚡ God Mode Login</span>
                  <p className="text-xs text-orange-400/70 mt-1">Instant access with any persona</p>
                </a>
              </div>
            )}
          </div>

          {/* Role Preview & Quick Login */}
          <div className="space-y-6">
            {/* Role Preview */}
            {selectedRoleData && (
              <Card>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: selectedRoleData.color + '20' }}
                    >
                      <Shield className="w-6 h-6" style={{ color: selectedRoleData.color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {selectedRoleData.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {selectedRoleData.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRolePreview(!showRolePreview)}
                    className="w-full text-left px-3 py-2 bg-[#0f0f14] rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        Permissions ({selectedRoleData.permissions.length})
                      </span>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  </button>

                  {showRolePreview && (
                    <div className="space-y-1 max-h-48 overflow-y-auto mt-2">
                      {selectedRoleData.permissions.includes('*:*') ? (
                        <Badge variant="warning" className="w-full justify-center">
                          ALL PERMISSIONS
                        </Badge>
                      ) : (
                        selectedRoleData.permissions.slice(0, 10).map((perm) => (
                          <div
                            key={perm}
                            className="text-xs font-mono text-gray-400 px-3 py-1 bg-[#0f0f14] rounded"
                          >
                            {perm}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Login Buttons */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Login (Testing)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin(role.name)}
                      disabled={isLoading}
                      className="justify-start"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center mr-2"
                        style={{ backgroundColor: role.color + '20' }}
                      >
                        <Shield className="w-3 h-3" style={{ color: role.color }} />
                      </div>
                      <span className="text-xs truncate">{role.name.split('_').join(' ')}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Role Comparison */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">About RBAC</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>
                    Role-Based Access Control (RBAC) restricts system access based on user roles.
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Each role has specific permissions</li>
                    <li>Permissions control feature access</li>
                    <li>SUPER_ADMIN has all permissions</li>
                    <li>Test different roles to see access changes</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RBACLogin;
