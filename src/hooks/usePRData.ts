import { useQuery } from '@tanstack/react-query';
import { GitHubAPI } from '../api/github';
import type { FilterOptions } from '../types';

const api = new GitHubAPI();

export const usePRData = (filters: FilterOptions) => {
  return useQuery({
    queryKey: ['pull-requests', filters],
    queryFn: () => api.searchPullRequests(filters),
    enabled: !!filters.repository, // Only run query when repository is selected
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('rate limit')) {
        return false; // Don't retry rate limit errors
      }
      return failureCount < 3;
    },
  });
};

// Utility function to check if a PR is at risk
export const isAtRisk = (createdAt: string): boolean => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(createdAt) < oneWeekAgo;
}; 