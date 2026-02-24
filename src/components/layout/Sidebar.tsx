/**
 * Sidebar Component - Module-Based Navigation
 * 
 * Organized by functional modules (not by "Phase 1/2")
 * with role-based visibility and device-aware rendering
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/lib/stores/ui.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { cn } from '@/lib/utils/cn';
import type { UserRole } from '@/types/auth.types';
import {
  LayoutDashboard,
  Terminal,
  ClipboardList,
  Truck,
  Users,
  Wallet,
  BarChart3,
  Headphones,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Video,
} from 'lucide-react';

// Module navigation item type
interface NavModule {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: UserRole[];
  badge?: number;
  shortcut?: string;
  description?: string;
}

// Detect device type
function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipod|android.*mobile|windows phone/.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/.test(userAgent);
  
  if (isMobile || width < 640) return 'mobile';
  if (isTablet || (width >= 640 && width < 1024)) return 'tablet';
  return 'desktop';
}

// Check if user has access to module
function hasModuleAccess(userRole: UserRole | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  if (allowedRoles.includes(userRole)) return true;
  if (userRole === 'SuperAdmin') return true;
  
  // Role hierarchy check
  const hierarchy: Record<UserRole, number> = {
    'SuperAdmin': 100,
    'CCHead': 90,
    'CCManager': 80,
    'CCTeamLead': 70,
    'CCOperator': 60,
    'DepotManager': 70,
    'UtilityCrew': 50,
    'ERT': 60,
    'FieldOperator': 55,
    'Compliance': 65,
    'Audit': 50,
    'Finance': 60,
    'Support': 50,
    'OperationsDirector': 85,
    'OperationsManager': 75,
    'FleetManager': 70,
    'FinanceManager': 70,
    'SupportAgent': 50,
    'Viewer': 10,
  };
  
  const userLevel = hierarchy[userRole] || 0;
  const minRequired = Math.min(...allowedRoles.map(r => hierarchy[r] || 0));
  return userLevel >= minRequired;
}

// ============ MODULE DEFINITIONS ============

const MODULES: NavModule[] = [
  // ============ CORE ============
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    allowedRoles: ['CCHead', 'CCManager', 'CCTeamLead', 'CCOperator', 'ERT', 'FieldOperator', 'DepotManager', 'UtilityCrew', 'Compliance', 'Audit', 'Finance', 'Support', 'SuperAdmin', 'OperationsDirector', 'OperationsManager', 'FleetManager', 'FinanceManager', 'SupportAgent', 'Viewer'],
    shortcut: '⌘D',
  },
  
  // ============ COMMAND CENTER ============
  {
    id: 'command',
    label: 'Command Center',
    icon: Terminal,
    path: '/command',
    allowedRoles: ['CCHead', 'CCManager', 'CCTeamLead', 'CCOperator', 'FieldOperator', 'ERT', 'SuperAdmin'],
    badge: 5, // Live incidents + dispatches
    shortcut: '⌘1',
    description: 'Live ops, dispatch, incidents',
  },
  
  // ============ GROUND OPERATIONS ============
  {
    id: 'ground',
    label: 'Ground Ops',
    icon: ClipboardList,
    path: '/ground',
    allowedRoles: ['CCHead', 'CCManager', 'ERT', 'FieldOperator', 'UtilityCrew', 'DepotManager', 'SuperAdmin'],
    shortcut: '⌘2',
    description: 'ERT, field ops, verifications',
  },
  
  // ============ DASHCAMS ============
  {
    id: 'dashcams',
    label: 'Dashcams',
    icon: Video,
    path: '/ground/dashcams',
    allowedRoles: ['CCHead', 'CCManager', 'DepotManager', 'Compliance', 'Audit', 'SuperAdmin'],
    shortcut: '⌘9',
    description: 'Vehicle dashcam management',
  },
  
  // ============ DEPOTS ============
  {
    id: 'depots',
    label: 'Depots',
    icon: Truck,
    path: '/depots',
    allowedRoles: ['CCHead', 'CCManager', 'DepotManager', 'UtilityCrew', 'SuperAdmin'],
    shortcut: '⌘3',
    description: 'Prep, checkout, damage log',
  },
  
  // ============ DRIVERS ============
  {
    id: 'drivers',
    label: 'Drivers',
    icon: Users,
    path: '/drivers',
    allowedRoles: ['CCHead', 'CCManager', 'CCTeamLead', 'DepotManager', 'Compliance', 'Audit', 'SuperAdmin'],
    shortcut: '⌘4',
    description: 'Driver management & shifts',
  },
  
  // ============ FINANCE (Restricted) ============
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    path: '/finance',
    allowedRoles: ['CCHead', 'Finance', 'FinanceManager', 'SuperAdmin'],
    shortcut: '⌘5',
    description: 'Financial operations',
  },
  
  // ============ INSIGHTS ============
  {
    id: 'insights',
    label: 'Insights',
    icon: BarChart3,
    path: '/insights',
    allowedRoles: ['CCHead', 'CCManager', 'Audit', 'OperationsDirector', 'SuperAdmin'],
    shortcut: '⌘6',
    description: 'Analytics, reports, audit',
  },
  
  // ============ SUPPORT ============
  {
    id: 'support',
    label: 'Support',
    icon: Headphones,
    path: '/support',
    allowedRoles: ['CCHead', 'CCManager', 'Support', 'SupportAgent', 'SuperAdmin'],
    badge: 3,
    shortcut: '⌘7',
    description: 'Customer support & tickets',
  },
  
  // ============ ADMIN (Restricted) ============
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    path: '/admin/settings',
    allowedRoles: ['CCHead', 'SuperAdmin'],
    shortcut: '⌘8',
    description: 'System & access control',
  },
];

// ============ UTILITY NAVIGATION ============

const UTILITY_ITEMS = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    path: '/profile',
  },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const deviceType = getDeviceType();
  
  const userRole = user?.role;
  
  // Filter modules based on user role and device
  const visibleModules = MODULES.filter(module => {
    // Check role access
    if (!hasModuleAccess(userRole, module.allowedRoles)) {
      return false;
    }
    
    // Device restrictions for specific modules
    if (module.id === 'command' && deviceType === 'mobile') {
      // Command Center is desktop/tablet only
      return false;
    }
    
    return true;
  });
  
  // Check if route is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    // Close mobile sidebar
    if (sidebarMobileOpen) {
      setSidebarMobileOpen(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/rbac/login');
  };
  
  // Role badge color
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'CCHead':
        return 'bg-purple-500';
      case 'CCManager':
      case 'CCTeamLead':
        return 'bg-blue-500';
      case 'ERT':
        return 'bg-red-500';
      case 'DepotManager':
        return 'bg-amber-500';
      case 'Audit':
        return 'bg-green-500';
      case 'SuperAdmin':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50',
          'bg-[#0f0f14] border-r border-gray-800',
          'flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-16' : 'w-64',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-gray-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">OP</span>
              </div>
              <div>
                <span className="text-white font-semibold text-sm">OpsTower</span>
                <div className="flex items-center gap-1">
                  <div className={cn('w-2 h-2 rounded-full', getRoleBadgeColor(userRole))} />
                  <span className="text-xs text-gray-500">{userRole || 'Guest'}</span>
                </div>
              </div>
            </div>
          )}
          
          {sidebarCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">OP</span>
            </div>
          )}
          
          {/* Toggle button - desktop only */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors',
              sidebarCollapsed && 'mx-auto'
            )}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Main modules */}
          <div className="px-2 space-y-1">
            {visibleModules.map((module) => {
              const Icon = module.icon;
              const active = isActive(module.path);
              
              return (
                <button
                  key={module.id}
                  onClick={() => handleNavigate(module.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'group relative',
                    active
                      ? 'bg-orange-500/10 text-orange-400 border-l-2 border-orange-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
                  )}
                  title={sidebarCollapsed ? module.label : undefined}
                >
                  <Icon className={cn(
                    'w-5 h-5 shrink-0',
                    active && 'text-orange-400'
                  )} />
                  
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium text-left">
                        {module.label}
                      </span>
                      
                      {module.badge && (
                        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                          {module.badge}
                        </span>
                      )}
                      
                      {module.shortcut && (
                        <span className="text-xs text-gray-600 group-hover:text-gray-500">
                          {module.shortcut}
                        </span>
                      )}
                    </>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {module.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Divider */}
          <div className="my-3 mx-4 border-t border-gray-800" />
          
          {/* Utility items */}
          <div className="px-2 space-y-1">
            {UTILITY_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'group relative',
                    active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-sm font-medium text-left">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-800">
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'text-gray-400 hover:text-red-400 hover:bg-red-500/10',
              'transition-all duration-200 group relative',
              sidebarCollapsed && 'justify-center'
            )}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && (
              <span className="flex-1 text-sm font-medium text-left">Logout</span>
            )}
          </button>
          
          {/* Device indicator */}
          {!sidebarCollapsed && (
            <div className="mt-3 px-3 py-2 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Device</span>
                <span className="text-gray-400 capitalize">{deviceType}</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
