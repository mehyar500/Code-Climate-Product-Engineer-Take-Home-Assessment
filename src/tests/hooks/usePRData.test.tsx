import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePRData, isAtRisk } from '../../hooks/usePRData';
import { GitHubAPI } from '../../api/github';
import { FilterOptions, PRStatus } from '../../types';

const mockSearchPullRequests = vi.fn();

// Mock the GitHubAPI
vi.mock('../../api/github', () => ({
  GitHubAPI: function() {
    return { searchPullRequests: mockSearchPullRequests };
  }
}));

describe('usePRData', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockFilters: FilterOptions = {
    dateRange: {
      start: null,
      end: null,
    },
    status: ['open' as PRStatus],
    repository: 'test/repo',
    showAtRisk: false,
  };

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('should fetch PR data successfully', async () => {
    const mockData = {
      items: [
        {
          id: 1,
          number: 100,
          title: 'Test PR',
          status: 'open' as PRStatus,
          repository: {
            name: 'repo',
            fullName: 'owner/repo',
          },
          author: {
            login: 'testuser',
            avatarUrl: 'https://avatar.url',
          },
          stats: {
            additions: 10,
            deletions: 5,
            comments: 3,
          },
          dates: {
            createdAt: '2024-03-10T00:00:00Z',
            closedAt: null,
          },
          isAtRisk: false,
        },
      ],
      totalCount: 1,
    };

    mockSearchPullRequests.mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => usePRData(mockFilters), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockSearchPullRequests.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePRData(mockFilters), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('isAtRisk', () => {
  it('should identify PRs older than a week as at risk', () => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(isAtRisk(twoWeeksAgo.toISOString())).toBe(true);
  });

  it('should not identify recent PRs as at risk', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(isAtRisk(yesterday.toISOString())).toBe(false);
  });
}); 