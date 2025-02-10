import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import dayjs from 'dayjs';
import {
  formatDate,
  formatRelativeTime,
  isOlderThanDays,
  getDateRangeForPeriod,
  validateDateRange,
} from '../../utils/date';

describe('Date Utils', () => {
  beforeAll(() => {
    // Mock the current date to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2024-03-15T12:00:00Z')).toBe('Mar 15, 2024');
    });

    it('should handle null date', () => {
      expect(formatDate(null)).toBe('-');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const yesterday = dayjs().subtract(1, 'day').toISOString();
      expect(formatRelativeTime(yesterday)).toBe('a day ago');

      const weekAgo = dayjs().subtract(7, 'day').toISOString();
      expect(formatRelativeTime(weekAgo)).toBe('7 days ago');
    });
  });

  describe('isOlderThanDays', () => {
    it('should correctly identify dates older than specified days', () => {
      const sixDaysAgo = dayjs().subtract(6, 'day').toISOString();
      const eightDaysAgo = dayjs().subtract(8, 'day').toISOString();

      expect(isOlderThanDays(sixDaysAgo, 7)).toBe(false);
      expect(isOlderThanDays(eightDaysAgo, 7)).toBe(true);
    });
  });

  describe('getDateRangeForPeriod', () => {
    it('should return correct date range for week', () => {
      const { start, end } = getDateRangeForPeriod('week');
      const expectedStart = dayjs().subtract(1, 'week').startOf('day').toISOString();
      const expectedEnd = dayjs().endOf('day').toISOString();

      expect(start).toBe(expectedStart);
      expect(end).toBe(expectedEnd);
    });

    it('should return correct date range for month', () => {
      const { start, end } = getDateRangeForPeriod('month');
      const expectedStart = dayjs().subtract(1, 'month').startOf('day').toISOString();
      const expectedEnd = dayjs().endOf('day').toISOString();

      expect(start).toBe(expectedStart);
      expect(end).toBe(expectedEnd);
    });

    it('should return correct date range for year', () => {
      const { start, end } = getDateRangeForPeriod('year');
      const expectedStart = dayjs().subtract(1, 'year').startOf('day').toISOString();
      const expectedEnd = dayjs().endOf('day').toISOString();

      expect(start).toBe(expectedStart);
      expect(end).toBe(expectedEnd);
    });
  });

  describe('validateDateRange', () => {
    it('should validate date ranges correctly', () => {
      const start = '2024-03-01T00:00:00Z';
      const end = '2024-03-15T00:00:00Z';

      expect(validateDateRange(start, end)).toBe(true);
      expect(validateDateRange(end, start)).toBe(false);
    });

    it('should handle null values', () => {
      expect(validateDateRange(null, null)).toBe(true);
      expect(validateDateRange('2024-03-01T00:00:00Z', null)).toBe(true);
      expect(validateDateRange(null, '2024-03-15T00:00:00Z')).toBe(true);
    });
  });
}); 