import { describe, it, expect } from 'vitest';
import {
  calculateAtRiskStatus,
  getStatusColor,
  formatPRStats,
  sortPRs,
  filterPRs,
} from '../../utils/pr-helpers';
import type { PullRequest } from '../../types';

describe('PR Helpers', () => {
  const mockPR: PullRequest = {
    id: 1,
    number: 100,
    title: 'Test PR',
    status: 'open',
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
      createdAt: new Date().toISOString(),
      closedAt: null,
    },
    isAtRisk: false,
  };

  describe('calculateAtRiskStatus', () => {
    it('should identify at-risk PRs correctly', () => {
      const oldPR: PullRequest = {
        ...mockPR,
        dates: {
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          closedAt: null,
        },
      };

      expect(calculateAtRiskStatus(oldPR)).toBe(true);
      expect(calculateAtRiskStatus(mockPR)).toBe(false);
    });

    it('should not mark closed PRs as at risk', () => {
      const closedPR: PullRequest = {
        ...mockPR,
        status: 'closed',
        dates: {
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          closedAt: new Date().toISOString(),
        },
      };

      expect(calculateAtRiskStatus(closedPR)).toBe(false);
    });
  });

  describe('getStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      expect(getStatusColor('open')).toBe('#28a745');
      expect(getStatusColor('closed')).toBe('#dc3545');
      expect(getStatusColor('merged')).toBe('#6f42c1');
    });
  });

  describe('formatPRStats', () => {
    it('should format PR stats correctly', () => {
      expect(formatPRStats(mockPR)).toBe('+10 -5');

      const bigPR: PullRequest = {
        ...mockPR,
        stats: {
          ...mockPR.stats,
          additions: 1000,
          deletions: 500,
        },
      };
      expect(formatPRStats(bigPR)).toBe('+1000 -500');
    });
  });

  describe('sortPRs', () => {
    const prs: PullRequest[] = [
      {
        ...mockPR,
        number: 101,
        stats: { additions: 10, deletions: 5, comments: 3 },
        dates: { createdAt: '2024-03-15T00:00:00Z', closedAt: null },
      },
      {
        ...mockPR,
        number: 102,
        stats: { additions: 20, deletions: 10, comments: 1 },
        dates: { createdAt: '2024-03-14T00:00:00Z', closedAt: null },
      },
    ];

    it('should sort by changes correctly', () => {
      const sorted = sortPRs(prs, 'changes', 'desc');
      expect(sorted[0].number).toBe(102); // PR with more changes
      expect(sorted[1].number).toBe(101);
    });

    it('should sort by date correctly', () => {
      const sorted = sortPRs(prs, 'dates', 'desc');
      expect(sorted[0].number).toBe(101); // More recent PR
      expect(sorted[1].number).toBe(102);
    });
  });

  describe('filterPRs', () => {
    const prs: PullRequest[] = [
      { ...mockPR, title: 'Feature PR', author: { login: 'user1', avatarUrl: '' } },
      { ...mockPR, title: 'Bug fix', author: { login: 'user2', avatarUrl: '' } },
      { ...mockPR, title: 'Documentation', author: { login: 'user3', avatarUrl: '' } },
    ];

    it('should filter PRs by title', () => {
      const filtered = filterPRs(prs, 'feature');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Feature PR');
    });

    it('should filter PRs by author', () => {
      const filtered = filterPRs(prs, 'user2');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].author.login).toBe('user2');
    });

    it('should return all PRs when search term is empty', () => {
      expect(filterPRs(prs, '')).toHaveLength(prs.length);
      expect(filterPRs(prs, '   ')).toHaveLength(prs.length);
    });

    it('should handle case-insensitive search', () => {
      const filtered = filterPRs(prs, 'FEATURE');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Feature PR');
    });
  });
}); 