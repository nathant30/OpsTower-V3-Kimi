import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { ConnectionStatusBadge } from '@/lib/ws';
import { cn } from '@/lib/utils/cn';
import { initAudio } from '@/lib/utils/sound';
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Command,
  Menu,
  X,

  Package,
  User as DriverIcon,
  Car,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';

const resultIcons = {
  order: Package,
  driver: DriverIcon,
  vehicle: Car,
};

const resultColors = {
  order: 'bg-blue-500/20 text-blue-400',
  driver: 'bg-green-500/20 text-green-400',
  vehicle: 'bg-purple-500/20 text-purple-400',
};

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { notifications, removeNotification, setSidebarMobileOpen, sidebarMobileOpen } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    query,
    setQuery,
    groupedResults,
    isOpen,
    openSearch,
    closeSearch,

    hasResults,
    isSearching,
  } = useGlobalSearch({ debounceMs: 150, minQueryLength: 2, maxResults: 15 });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeSearch]);

  // Handle CMD+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // CMD+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
        searchInputRef.current?.focus();
        // Initialize audio on user interaction
        initAudio();
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  const handleResultClick = useCallback((url: string) => {
    navigate(url);
    closeSearch();
  }, [navigate, closeSearch]);

  return (
    <header className="h-16 bg-xpress-bg-secondary border-b border-xpress-border flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile Menu Toggle + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
          className={cn(
            'lg:hidden p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
            sidebarMobileOpen
              ? 'bg-xpress-bg-tertiary text-xpress-text-primary'
              : 'text-xpress-text-muted hover:text-xpress-text-primary hover:bg-xpress-bg-tertiary'
          )}
          aria-label={sidebarMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarMobileOpen}
        >
          {sidebarMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Search */}
        <div ref={searchContainerRef} className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-xpress-text-muted" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search orders, drivers, vehicles..."
            className="pl-10 pr-20 w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) {
                openSearch();
              }
            }}
            onFocus={() => {
              if (query.length >= 2) {
                openSearch();
              }
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-xpress-text-muted">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
          
          {/* Search Dropdown */}
          {isOpen && isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-xpress-bg-tertiary border border-xpress-border rounded-lg shadow-xl z-50 overflow-hidden">
              {hasResults ? (
                <div className="max-h-96 overflow-y-auto py-2">
                  {groupedResults.map((group) => (
                    <div key={group.type}>
                      <div className="px-4 py-1.5 text-xs font-semibold text-xpress-text-muted uppercase tracking-wider">
                        {group.label}
                      </div>
                      {group.items.map((result) => {
                        const Icon = resultIcons[result.type];
                        return (
                          <button
                            key={`${result.type}-${result.id}`}
                            onClick={() => handleResultClick(result.url)}
                            className="w-full px-4 py-3 hover:bg-xpress-bg-secondary/50 flex items-center gap-3 transition-colors text-left min-h-[44px]"
                          >
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', resultColors[result.type])}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-xpress-text-primary truncate">
                                {result.title}
                              </p>
                              <p className="text-xs text-xpress-text-muted truncate">
                                {result.subtitle}
                              </p>
                            </div>
                            {result.status && (
                              <span className={cn(
                                'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                                result.status === 'Online' && 'bg-green-500/20 text-green-400',
                                result.status === 'Offline' && 'bg-gray-500/20 text-gray-400',
                                result.status === 'OnTrip' && 'bg-blue-500/20 text-blue-400',
                                result.status === 'Active' && 'bg-green-500/20 text-green-400',
                                result.status === 'Completed' && 'bg-green-500/20 text-green-400',
                                result.status === 'Cancelled' && 'bg-red-500/20 text-red-400',
                                result.status === 'Assigned' && 'bg-yellow-500/20 text-yellow-400',
                                ['Maintenance', 'Idle'].includes(result.status) && 'bg-yellow-500/20 text-yellow-400',
                              )}>
                                {result.status}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center text-xpress-text-muted">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found for &quot;{query}&quot;</p>
                  <p className="text-xs mt-1">Try searching by ID, name, or phone number</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Button */}
        <button
          onClick={() => {
            openSearch();
            searchInputRef.current?.focus();
          }}
          className="sm:hidden p-2 rounded-lg text-xpress-text-muted hover:text-xpress-text-primary hover:bg-xpress-bg-tertiary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Connection Status */}
        <div className="hidden sm:block">
          <ConnectionStatusBadge />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              'relative p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center',
              showNotifications
                ? 'bg-xpress-bg-tertiary text-xpress-text-primary'
                : 'text-xpress-text-muted hover:text-xpress-text-primary hover:bg-xpress-bg-tertiary'
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-xpress-accent-red rounded-full" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-xpress-bg-tertiary border border-xpress-border rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-xpress-border flex items-center justify-between">
                <span className="font-medium text-xpress-text-primary">Notifications</span>
                <button
                  onClick={() => removeNotification('all')}
                  className="text-xs text-xpress-accent-blue hover:underline min-h-[32px] px-2 flex items-center"
                >
                  Clear all
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xpress-text-muted text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 border-b border-xpress-border last:border-0 hover:bg-xpress-bg-secondary/50"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                            notification.type === 'error' && 'bg-xpress-accent-red',
                            notification.type === 'warning' && 'bg-xpress-status-warning',
                            notification.type === 'success' && 'bg-xpress-status-active',
                            notification.type === 'info' && 'bg-xpress-accent-blue'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-xpress-text-primary">
                            {notification.message}
                          </p>
                          <span className="text-xs text-xpress-text-muted">
                            {notification.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              'flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 rounded-lg transition-colors min-h-[44px]',
              showUserMenu
                ? 'bg-xpress-bg-tertiary'
                : 'hover:bg-xpress-bg-tertiary'
            )}
            aria-label="User menu"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 bg-xpress-accent-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-xpress-accent-blue" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-xpress-text-primary truncate max-w-[120px]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-xpress-text-muted">{user?.role}</p>
            </div>
            <ChevronDown className="hidden md:block w-4 h-4 text-xpress-text-muted flex-shrink-0" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-xpress-bg-tertiary border border-xpress-border rounded-lg shadow-xl z-50">
              <div className="py-1">
                <button
                  className="w-full px-4 py-3 text-left text-sm text-xpress-text-secondary hover:bg-xpress-bg-secondary hover:text-xpress-text-primary flex items-center gap-2 min-h-[44px]"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 text-left text-sm text-xpress-text-secondary hover:bg-xpress-bg-secondary hover:text-xpress-accent-red flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
