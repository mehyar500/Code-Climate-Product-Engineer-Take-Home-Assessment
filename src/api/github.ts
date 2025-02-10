import axios from 'axios';
import { APIResponse, FilterOptions, PullRequest } from '../types';
import { z } from 'zod';

const GITHUB_API_URL = 'https://api.github.com';
const MAX_PER_PAGE = 100; // GitHub's max items per page
const MAX_TOTAL_PRS = 500; // Our max total PRs to fetch

// GitHub API response schema for PR search
const GitHubPRSearchSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  created_at: z.string(),
  closed_at: z.string().nullable(),
  comments: z.number(),
  pull_request: z.object({
    url: z.string(),
  }).optional(),
});

const GitHubPRDetailsSchema = z.object({
  additions: z.number(),
  deletions: z.number(),
  base: z.object({
    repo: z.object({
      name: z.string(),
      full_name: z.string(),
    }),
  }),
});

export class GitHubAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

export class GitHubAPI {
  private readonly client;

  constructor(token?: string) {
    const authToken = token || import.meta.env.VITE_GITHUB_TOKEN;
    if (!authToken) {
      throw new Error('GitHub token is required. Please set VITE_GITHUB_TOKEN in your .env file.');
    }

    this.client = axios.create({
      baseURL: GITHUB_API_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/vnd.github.v3+json',
      }
    });
  }

  private buildSearchQuery(filters: FilterOptions): string {
    const parts: string[] = ['is:pr'];

    // Repository is required to avoid too many results
    if (!filters.repository) {
      throw new GitHubAPIError('Repository is required for searching pull requests');
    }

    // Validate repository format (owner/repo)
    if (!/^[\w.-]+\/[\w.-]+$/.test(filters.repository)) {
      throw new GitHubAPIError('Invalid repository format. Must be in the format owner/repo');
    }

    parts.push(`repo:${filters.repository}`);

    if (filters.status?.length) {
      const statusMap = {
        open: 'is:open',
        closed: 'is:closed',
        merged: 'is:merged'
      };
      filters.status.forEach(status => parts.push(statusMap[status]));
    }

    if (filters.dateRange.start) {
      parts.push(`created:>=${filters.dateRange.start.split('T')[0]}`);
    }

    if (filters.dateRange.end) {
      parts.push(`created:<=${filters.dateRange.end.split('T')[0]}`);
    }

    if (filters.showAtRisk) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      parts.push(`created:<=${oneWeekAgo.toISOString().split('T')[0]} is:open`);
    }

    return parts.join(' ');
  }

  private async fetchPRDetails(pullRequestUrl: string): Promise<z.infer<typeof GitHubPRDetailsSchema>> {
    const response = await this.client.get(pullRequestUrl);
    return GitHubPRDetailsSchema.parse(response.data);
  }

  private async transformPRData(searchData: z.infer<typeof GitHubPRSearchSchema>): Promise<PullRequest> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const createdAt = new Date(searchData.created_at);

    // Fetch additional PR details
    const prDetails = await this.fetchPRDetails(searchData.pull_request?.url ?? '');

    return {
      id: searchData.id,
      number: searchData.number,
      title: searchData.title,
      status: searchData.state as 'open' | 'closed' | 'merged',
      repository: {
        name: prDetails.base.repo.name,
        fullName: prDetails.base.repo.full_name,
      },
      author: {
        login: searchData.user.login,
        avatarUrl: searchData.user.avatar_url,
      },
      stats: {
        additions: prDetails.additions,
        deletions: prDetails.deletions,
        comments: searchData.comments,
      },
      dates: {
        createdAt: searchData.created_at,
        closedAt: searchData.closed_at,
      },
      isAtRisk: searchData.state === 'open' && createdAt < oneWeekAgo,
    };
  }

  private async fetchPage(query: string, page: number): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      per_page: MAX_PER_PAGE.toString(),
      page: page.toString(),
      sort: 'created',
      order: 'desc'
    });

    return this.client.get('/search/issues', { params });
  }

  async searchPullRequests(filters: FilterOptions): Promise<APIResponse> {
    try {
      const query = this.buildSearchQuery(filters);
      let allItems: any[] = [];
      let page = 1;
      const maxPages = 5; // Limit to 5 pages to prevent excessive requests
      let hasMore = true;

      // First check rate limit
      try {
        const rateLimit = await this.client.get('/rate_limit');
        const remaining = rateLimit.data.resources.search.remaining;
        if (remaining < 2) {
          const resetTime = new Date(rateLimit.data.resources.search.reset * 1000);
          throw new GitHubAPIError(
            `Rate limit exceeded. Reset time: ${resetTime.toLocaleTimeString()}. ` +
            `Please try again after ${resetTime.toLocaleTimeString()}.`,
            429
          );
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          throw new GitHubAPIError('Invalid GitHub token. Please check your token permissions.', 401);
        }
        throw error;
      }

      // Fetch pages until we have MAX_TOTAL_PRS items or no more results
      while (hasMore && allItems.length < MAX_TOTAL_PRS && page <= maxPages) {
        const response = await this.fetchPage(query, page);
        const items = response.data.items || [];
        
        // Filter to only include pull requests
        const pullRequests = items.filter((item: any) => item.pull_request);
        
        allItems = allItems.concat(pullRequests);
        hasMore = pullRequests.length === MAX_PER_PAGE;
        page++;

        // Respect rate limits by adding a small delay between requests
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Limit to MAX_TOTAL_PRS
      allItems = allItems.slice(0, MAX_TOTAL_PRS);

      const items = await Promise.all(
        allItems.map(async (item) => {
          const searchData = GitHubPRSearchSchema.parse(item);
          return this.transformPRData(searchData);
        })
      );

      return {
        items,
        totalCount: Math.min(items.length, MAX_TOTAL_PRS),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Failed to fetch pull requests';
        const status = error.response?.status;

        if (status === 422) {
          throw new GitHubAPIError(
            'Search query is too broad. Please try:\n' +
            '1. Using a more specific repository name\n' +
            '2. Adding date filters\n' +
            '3. Selecting specific PR status',
            status
          );
        }

        if (status === 403 || message.toLowerCase().includes('rate limit')) {
          throw new GitHubAPIError(
            'Rate limit exceeded. Please wait a few minutes before trying again.',
            403
          );
        }

        throw new GitHubAPIError(
          `GitHub API Error: ${message}`,
          status
        );
      }
      throw error;
    }
  }
} 