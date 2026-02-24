/**
 * UI related type definitions
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  read?: boolean;
  timestamp?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  permission?: string;
  children?: NavItem[];
  badge?: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
