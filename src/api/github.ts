import axios from 'axios';
import { APIResponse, FilterOptions, PullRequest } from '../types';
import { z } from 'zod';

const GITHUB_API_URL = 'https://api.github.com';
const MAX_PER_PAGE = 100; // GitHub's max items per page

// GitHub API response schema for PR search
const GitHubPRSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  state: z.string(),
  user: z.object({
    login: z.string(),
    avatar_url: z.string(),
  }),
  repository: z.object({
    name: z.string(),
    full_name: z.string(),
  }),
  created_at: z.string(),
  closed_at: z.string().nullable(),
  additions: z.number(),
  deletions: z.number(),
  comments: z.number(),
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
    this.client = axios.create({
      baseURL: GITHUB_API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  private buildSearchQuery(filters: FilterOptions): string {
    const parts: string[] = ['type:pr'];

    if (filters.repository) {
      parts.push(`repo:${filters.repository}`);
    }

    if (filters.status?.length) {
      parts.push(`state:${filters.status.join(',')}`);
    }

    if (filters.dateRange.start) {
      parts.push(`created:>=${filters.dateRange.start}`);
    }

    if (filters.dateRange.end) {
      parts.push(`created:<=${filters.dateRange.end}`);
    }

    return parts.join(' ');
  }

  private transformPRData(data: z.infer<typeof GitHubPRSchema>): PullRequest {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const createdAt = new Date(data.created_at);

    return {
      id: data.id,
      number: data.number,
      title: data.title,
      status: data.state as 'open' | 'closed' | 'merged',
      repository: {
        name: data.repository.name,
        fullName: data.repository.full_name,
      },
      author: {
        login: data.user.login,
        avatarUrl: data.user.avatar_url,
      },
      stats: {
        additions: data.additions,
        deletions: data.deletions,
        comments: data.comments,
      },
      dates: {
        createdAt: data.created_at,
        closedAt: data.closed_at,
      },
      isAtRisk: data.state === 'open' && createdAt < oneWeekAgo,
    };
  }

  async searchPullRequests(filters: FilterOptions): Promise<APIResponse> {
    try {
      const query = this.buildSearchQuery(filters);
      const response = await this.client.get('/search/issues', {
        params: {
          q: query,
          per_page: MAX_PER_PAGE,
          page: 1,
        },
      });

      const items = await Promise.all(
        response.data.items.map(async (item: any) => {
          const prData = GitHubPRSchema.parse(item);
          return this.transformPRData(prData);
        })
      );

      return {
        items,
        totalCount: Math.min(response.data.total_count, 500), // GitHub API limit
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new GitHubAPIError(
          error.response?.data?.message || 'Failed to fetch pull requests',
          error.response?.status
        );
      }
      throw new GitHubAPIError('An unexpected error occurred');
    }
  }
} 