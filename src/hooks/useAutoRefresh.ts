/**
 * Auto-refresh hook with timestamp tracking
 * Shows last updated time and loading indicators
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAutoRefreshOptions {
  intervalMs: number;
  enabled?: boolean;
  onRefresh?: () => void | Promise<void>;
}

export interface UseAutoRefreshReturn {
  lastUpdated: Date | null;
  lastUpdatedText: string;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  timeUntilNextRefresh: number;
}

/**
 * Format time difference into human-readable text
 */
function formatTimeAgo(date: Date | null): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleTimeString();
}

export function useAutoRefresh(options: UseAutoRefreshOptions): UseAutoRefreshReturn {
  const { intervalMs, enabled = true, onRefresh } = options;
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [lastUpdatedText, setLastUpdatedText] = useState<string>('Never');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilNextRefresh, setTimeUntilNextRefresh] = useState(intervalMs);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refresh function
  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastUpdated(new Date());
      setTimeUntilNextRefresh(intervalMs);
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh, intervalMs]);

  // Initial refresh
  useEffect(() => {
    refresh();
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, refresh]);

  // Update "time ago" text every second
  useEffect(() => {
    const updateText = () => {
      setLastUpdatedText(formatTimeAgo(lastUpdated));
    };

    updateText(); // Initial update
    const textInterval = setInterval(updateText, 1000);

    return () => clearInterval(textInterval);
  }, [lastUpdated]);

  // Countdown timer for next refresh
  useEffect(() => {
    if (!enabled) return;

    countdownRef.current = setInterval(() => {
      setTimeUntilNextRefresh((prev) => {
        if (prev <= 1000) {
          return intervalMs;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [enabled, intervalMs]);

  return {
    lastUpdated,
    lastUpdatedText,
    isRefreshing,
    refresh,
    timeUntilNextRefresh,
  };
}

export default useAutoRefresh;
