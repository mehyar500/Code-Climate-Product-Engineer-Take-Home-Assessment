import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilters } from '../../hooks/useFilters';
import type { FilterOptions, PRStatus } from '../../types';

describe('useFilters', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.filters).toEqual({
      dateRange: {
        start: null,
        end: null,
      },
      status: ['open'],
      repository: undefined,
      showAtRisk: false,
    });
  });

  it('should initialize with custom filters', () => {
    const initialFilters: Partial<FilterOptions> = {
      repository: 'test/repo',
      showAtRisk: true,
    };

    const { result } = renderHook(() => useFilters(initialFilters));

    expect(result.current.filters).toEqual({
      dateRange: {
        start: null,
        end: null,
      },
      status: ['open'],
      repository: 'test/repo',
      showAtRisk: true,
    });
  });

  it('should update date range', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.setDateRange('2024-01-01', '2024-02-01');
    });

    expect(result.current.filters.dateRange).toEqual({
      start: '2024-01-01',
      end: '2024-02-01',
    });
  });

  it('should update status', () => {
    const { result } = renderHook(() => useFilters());

    const newStatus: PRStatus[] = ['closed', 'merged'];
    act(() => {
      result.current.setStatus(newStatus);
    });

    expect(result.current.filters.status).toEqual(newStatus);
  });

  it('should update repository', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.setRepository('test/repo');
    });

    expect(result.current.filters.repository).toBe('test/repo');
  });

  it('should toggle at risk status', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.toggleAtRisk();
    });

    expect(result.current.filters.showAtRisk).toBe(true);

    act(() => {
      result.current.toggleAtRisk();
    });

    expect(result.current.filters.showAtRisk).toBe(false);
  });

  it('should reset filters to default values', () => {
    const initialFilters: Partial<FilterOptions> = {
      repository: 'test/repo',
      showAtRisk: true,
      status: ['closed'],
    };

    const { result } = renderHook(() => useFilters(initialFilters));

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filters).toEqual({
      dateRange: {
        start: null,
        end: null,
      },
      status: ['open'],
      repository: undefined,
      showAtRisk: false,
    });
  });
}); 