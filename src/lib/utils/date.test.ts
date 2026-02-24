import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  formatDistanceToNow,
  formatDate,
  formatTime,
  formatDateTime,
  formatCurrency,
  formatDistance,
  formatDuration,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
} from './date';

describe('Date Utilities', () => {
  // Mock current time for consistent tests
  const mockNow = new Date('2024-01-15T12:00:00Z');
  
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('formatDistanceToNow()', () => {
    it('should return "just now" for times less than 60 seconds ago', () => {
      const date = new Date(mockNow.getTime() - 30 * 1000);
      expect(formatDistanceToNow(date)).toBe('just now');
    });

    it('should return minutes ago for times less than 60 minutes ago', () => {
      const date = new Date(mockNow.getTime() - 5 * 60 * 1000);
      expect(formatDistanceToNow(date)).toBe('5m ago');
    });

    it('should return hours ago for times less than 24 hours ago', () => {
      const date = new Date(mockNow.getTime() - 3 * 60 * 60 * 1000);
      expect(formatDistanceToNow(date)).toBe('3h ago');
    });

    it('should return days ago for times less than 30 days ago', () => {
      const date = new Date(mockNow.getTime() - 5 * 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(date)).toBe('5d ago');
    });

    it('should return months ago for times less than 12 months ago', () => {
      const date = new Date(mockNow.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(date)).toBe('3mo ago');
    });

    it('should return years ago for times more than 12 months ago', () => {
      const date = new Date(mockNow.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(date)).toBe('2y ago');
    });

    it('should accept date string as input', () => {
      const dateStr = new Date(mockNow.getTime() - 60 * 60 * 1000).toISOString();
      expect(formatDistanceToNow(dateStr)).toBe('1h ago');
    });
  });

  describe('formatDate()', () => {
    it('should format date to locale string', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toContain('Mar');
      expect(result).toContain('2024');
    });

    it('should accept date string as input', () => {
      const result = formatDate('2024-03-15T10:30:00Z');
      expect(result).toContain('Mar');
    });

    it('should respect custom options', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDate(date, { month: 'long', day: 'numeric' });
      expect(result).toContain('March');
    });
  });

  describe('formatTime()', () => {
    it('should format time to locale string', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should accept date string as input', () => {
      const result = formatTime('2024-03-15T14:30:00Z');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDateTime()', () => {
    it('should combine date and time', () => {
      const date = new Date('2024-03-15T14:30:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('Mar');
      expect(result).toContain('2024');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatCurrency()', () => {
    it('should format number as PHP currency', () => {
      expect(formatCurrency(1234.56)).toBe('₱1,234.56');
    });

    it('should format whole numbers with decimal places', () => {
      expect(formatCurrency(1000)).toBe('₱1,000.00');
    });

    it('should format large numbers correctly', () => {
      expect(formatCurrency(1000000)).toBe('₱1,000,000.00');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('₱0.00');
    });
  });

  describe('formatDistance()', () => {
    it('should format meters when less than 1000', () => {
      expect(formatDistance(500)).toBe('500 m');
    });

    it('should format kilometers when 1000 or more', () => {
      expect(formatDistance(1500)).toBe('1.5 km');
    });

    it('should format large distances', () => {
      expect(formatDistance(5000)).toBe('5.0 km');
    });

    it('should round meters correctly', () => {
      expect(formatDistance(999)).toBe('999 m');
    });
  });

  describe('formatDuration()', () => {
    it('should format seconds when less than 60', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('should format minutes when less than 3600', () => {
      expect(formatDuration(300)).toBe('5m');
    });

    it('should format hours and minutes when 3600 or more', () => {
      expect(formatDuration(3660)).toBe('1h 1m');
    });

    it('should format exact hours', () => {
      expect(formatDuration(7200)).toBe('2h 0m');
    });
  });

  describe('startOfDay()', () => {
    it('should return start of day', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = startOfDay(date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should use current date by default', () => {
      const result = startOfDay();
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('endOfDay()', () => {
    it('should return end of day', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = endOfDay(date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('startOfWeek()', () => {
    it('should return start of week (Sunday)', () => {
      const date = new Date('2024-03-15T14:30:45.123Z'); // Friday
      const result = startOfWeek(date);
      expect(result.getDay()).toBe(0); // Sunday
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('startOfMonth()', () => {
    it('should return start of month', () => {
      const date = new Date('2024-03-15T14:30:45.123Z');
      const result = startOfMonth(date);
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });
  });
});
