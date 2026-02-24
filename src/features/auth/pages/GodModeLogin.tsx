/**
 * God Mode Login Page
 * 
 * ⚠️ DEVELOPMENT ONLY - Bypasses authentication for testing
 * 
 * Features:
 * - One-click SuperAdmin login
 * - Quick persona switching (CC Head, ERT, Depot Manager, etc.)
 * - No backend required
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { User, UserRole } from '@/types/auth.types';
import { 
  Shield, 
  Crown, 
  Terminal, 
  ClipboardList, 
  Truck, 
  Users, 
  Wallet, 
  BarChart3, 
  Headphones,
  AlertTriangle,
  Zap,
  LogIn
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GodModePersona {
  role: UserRole;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  permissions: string[];
}

const GOD_MODE_PERSONAS: GodModePersona[] = [
  {
    role: 'SuperAdmin',
    label: 'Super Admin',
    description: 'Full system access - God Mode',
    icon: Crown,
    color: 'from-orange-500 to-red-600',
    permissions: ['*:*'],
  },
  {
    role: 'CCHead',
    label: 'CC Head',
    description: 'Command Center Head - Full approval authority',
    icon: Terminal,
    color: 'from-purple-500 to-indigo-600',
    permissions: ['module:command', 'module:ground', 'module:depots', 'module:drivers', 'module:finance', 'module:insights', 'module:support', 'module:admin'],
  },
  {
    role: 'CCManager',
    label: 'CC Manager',
    description: 'Command Center Manager',
    icon: Terminal,
    color: 'from-blue-500 to-cyan-600',
    permissions: ['module:command', 'module:ground', 'module:depots', 'module:drivers', 'module:support'],
  },
  {
    role: 'ERT',
    label: 'ERT',
    description: 'Emergency Response Team - Field execution',
    icon: Zap,
    color: 'from-red-500 to-rose-600',
    permissions: ['module:command', 'module:ground', 'command:view', 'ground:ert.execute'],
  },
  {
    role: 'FieldOperator',
    label: 'Field Operator',
    description: 'Field operations - Mobile first',
    icon: ClipboardList,
    color: 'from-green-500 to-emerald-600',
    permissions: ['module:ground', 'ground:view', 'ground:task.execute'],
  },
  {
    role: 'UtilityCrew',
    label: 'Utility Crew',
    description: 'Prep tasks and ground support',
    icon: ClipboardList,
    color: 'from-teal-500 to-green-600',
    permissions: ['module:depots', 'depots:view', 'depots:prep'],
  },
  {
    role: 'DepotManager',
    label: 'Depot Manager',
    description: 'Depot operations and checkout approval',
    icon: Truck,
    color: 'from-amber-500 to-orange-600',
    permissions: ['module:depots', 'module:drivers', 'depots:checkout.approve'],
  },
  {
    role: 'Finance',
    label: 'Finance',
    description: 'Financial operations and reporting',
    icon: Wallet,
    color: 'from-cyan-500 to-blue-600',
    permissions: ['module:finance', 'module:insights', 'finance:view', 'finance:process'],
  },
  {
    role: 'Audit',
    label: 'Audit',
    description: 'View-only audit and analytics',
    icon: BarChart3,
    color: 'from-violet-500 to-purple-600',
    permissions: ['module:insights', 'module:drivers', 'insights:view', 'insights:audit'],
  },
  {
    role: 'Support',
    label: 'Support Agent',
    description: 'Customer support and tickets',
    icon: Headphones,
    color: 'from-pink-500 to-rose-600',
    permissions: ['module:support', 'support:view', 'support:ticket.manage'],
  },
];

export default function GodModeLogin() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [selectedPersona, setSelectedPersona] = useState<UserRole | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGodModeLogin = (persona: GodModePersona) => {
    setIsLoggingIn(true);
    setSelectedPersona(persona.role);

    // Create god mode user
    const godModeUser: User = {
      id: `god-${persona.role.toLowerCase()}-001`,
      email: `${persona.role.toLowerCase()}@opstower.god`,
      firstName: 'God',
      lastName: persona.label,
      role: persona.role,
      permissions: persona.permissions as any,
      avatar: undefined,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate brief delay for effect
    setTimeout(() => {
      login('god-mode-token', godModeUser);
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0f14] to-[#1a1a24] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 mb-6 shadow-2xl shadow-orange-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            God Mode Login
          </h1>
          <p className="text-gray-400 text-lg">
            Select a persona to instantly authenticate
          </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-semibold mb-1">Development Mode Only</h3>
            <p className="text-amber-400/70 text-sm">
              This page bypasses all authentication and should never be accessible in production. 
              It allows instant login with any role for testing purposes.
            </p>
          </div>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOD_MODE_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersona === persona.role;
            const isLoading = isSelected && isLoggingIn;

            return (
              <button
                key={persona.role}
                onClick={() => handleGodModeLogin(persona)}
                disabled={isLoggingIn}
                className={cn(
                  'relative group p-6 rounded-xl border-2 transition-all duration-300 text-left',
                  'hover:scale-[1.02] hover:shadow-xl',
                  isSelected
                    ? 'border-orange-500 bg-orange-500/10 shadow-orange-500/20'
                    : 'border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-800/50',
                  isLoggingIn && !isSelected && 'opacity-50 pointer-events-none'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                  'shadow-lg transition-transform duration-300 group-hover:scale-110',
                  persona.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-1">
                  {persona.label}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  {persona.description}
                </p>

                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {persona.role}
                </div>

                {/* Hover Action */}
                <div className={cn(
                  'absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center',
                  'bg-gray-800 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity',
                  isSelected && 'opacity-100 bg-orange-500 text-white'
                )}>
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a 
            href="/rbac/login" 
            className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
          >
            ← Back to regular login
          </a>
        </div>
      </div>
    </div>
  );
}
