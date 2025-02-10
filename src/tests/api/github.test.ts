import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { GitHubAPI, GitHubAPIError } from '../../api/github';
import { FilterOptions } from '../../types';

// Mock axios
vi.mock('axios');
const mockGet = vi.fn();
const mockCreate = vi.fn(() => ({ get: mockGet }));
(axios.create as any) = mockCreate;

describe('GitHubAPI', () => {
  let api: GitHubAPI;
  
  beforeEach(() => {
    api = new GitHubAPI('test-token');
    vi.clearAllMocks();
  });

  describe('searchPullRequests', () => {
    const mockFilters: FilterOptions = {
      dateRange: {
        start: null,
        end: null,
      },
      status: ['open'],
      repository: 'owner/repo',
      showAtRisk: false,
    };

    const mockPRResponse = {
      data: {
        total_count: 1,
        items: [{
          id: 1,
          number: 100,
          title: 'Test PR',
          state: 'open',
          user: {
            login: 'testuser',
            avatar_url: 'https://avatar.url',
          },
          repository: {
            name: 'repo',
            full_name: 'owner/repo',
          },
          created_at: '2024-03-10T00:00:00Z',
          closed_at: null,
          additions: 10,
          deletions: 5,
          comments: 3,
        }],
      },
    };

    it('should successfully fetch and transform pull requests', async () => {
      mockGet.mockResolvedValueOnce(mockPRResponse);

      const result = await api.searchPullRequests(mockFilters);

      expect(result.totalCount).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        number: 100,
        title: 'Test PR',
        status: 'open',
        repository: {
          name: 'repo',
          fullName: 'owner/repo',
        },
      });
    });

    it('should handle API errors correctly', async () => {
      const errorMessage = 'API rate limit exceeded';
      mockGet.mockRejectedValueOnce({
        response: {
          status: 403,
          data: { message: errorMessage },
        },
      });

      await expect(api.searchPullRequests(mockFilters))
        .rejects
        .toThrow(GitHubAPIError);
    });

    it('should correctly identify at-risk PRs', async () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const mockResponseWithOldPR = {
        data: {
          total_count: 1,
          items: [{
            ...mockPRResponse.data.items[0],
            created_at: twoWeeksAgo.toISOString(),
          }],
        },
      };

      mockGet.mockResolvedValueOnce(mockResponseWithOldPR);

      const result = await api.searchPullRequests(mockFilters);
      expect(result.items[0].isAtRisk).toBe(true);
    });

    it('should build correct search query with filters', async () => {
      mockGet.mockResolvedValueOnce(mockPRResponse);

      const filtersWithDates: FilterOptions = {
        dateRange: {
          start: '2024-01-01',
          end: '2024-02-01',
        },
        status: ['open', 'closed'],
        repository: 'test/repo',
        showAtRisk: true,
      };

      await api.searchPullRequests(filtersWithDates);

      expect(mockGet).toHaveBeenCalledWith(
        '/search/issues',
        expect.objectContaining({
          params: expect.objectContaining({
            q: expect.stringContaining('type:pr repo:test/repo state:open,closed created:>=2024-01-01 created:<=2024-02-01'),
          }),
        }),
      );
    });
  });
}); 