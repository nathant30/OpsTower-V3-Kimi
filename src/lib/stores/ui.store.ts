import { create } from 'zustand';
import type { Notification } from '@/types/ui.types';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Theme
  theme: 'dark' | 'light';
  
  // Modals
  activeModal: string | null;
  modalData: unknown;
  
  // Notifications
  notifications: Notification[];
  
  // Global loading states
  isGlobalLoading: boolean;
  globalLoadingMessage: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

// Generate unique ID for notifications
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'dark',
  activeModal: null,
  modalData: null,
  notifications: [],
  isGlobalLoading: false,
  globalLoadingMessage: '',

  // Sidebar actions
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },
  
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },
  
  setSidebarMobileOpen: (open: boolean) => {
    set({ sidebarMobileOpen: open });
  },

  // Theme actions
  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  // Modal actions
  openModal: (modalId: string, data?: unknown) => {
    set({ 
      activeModal: modalId,
      modalData: data 
    });
  },
  
  closeModal: () => {
    set({ 
      activeModal: null,
      modalData: null 
    });
  },

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000, // Default 5 seconds
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
  },
  
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Global loading actions
  setGlobalLoading: (loading: boolean, message = '') => {
    set({
      isGlobalLoading: loading,
      globalLoadingMessage: message,
    });
  },
}));

// Helper functions for common notifications
export function showSuccess(message: string, duration?: number) {
  useUIStore.getState().addNotification({
    type: 'success',
    message,
    duration,
  });
}

export function showError(message: string, duration?: number) {
  useUIStore.getState().addNotification({
    type: 'error',
    message,
    duration: duration || 8000, // Errors stay longer
  });
}

export function showWarning(message: string, duration?: number) {
  useUIStore.getState().addNotification({
    type: 'warning',
    message,
    duration,
  });
}

export function showInfo(message: string, duration?: number) {
  useUIStore.getState().addNotification({
    type: 'info',
    message,
    duration,
  });
}
