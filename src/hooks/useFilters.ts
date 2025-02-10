import { useState, useCallback } from 'react';
import type { FilterOptions, PRStatus } from '../types';

const defaultFilters: FilterOptions = {
  dateRange: {
    start: null,
    end: null,
  },
  status: ['open'],
  repository: undefined,
  showAtRisk: false,
};

export const useFilters = (initialFilters: Partial<FilterOptions> = {}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    ...initialFilters,
  });

  const setDateRange = useCallback((start: string | null, end: string | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const setStatus = useCallback((status: PRStatus[]) => {
    setFilters(prev => ({
      ...prev,
      status,
    }));
  }, []);

  const setRepository = useCallback((repository: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      repository,
    }));
  }, []);

  const toggleAtRisk = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      showAtRisk: !prev.showAtRisk,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    filters,
    setDateRange,
    setStatus,
    setRepository,
    toggleAtRisk,
    resetFilters,
  };
}; 