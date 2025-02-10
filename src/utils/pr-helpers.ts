import type { PullRequest } from '../types';
import { isOlderThanDays } from './date';

export const calculateAtRiskStatus = (pr: PullRequest): boolean => {
  return pr.status === 'open' && isOlderThanDays(pr.dates.createdAt, 7);
};

export const getStatusColor = (status: PullRequest['status']): string => {
  const colors = {
    open: '#28a745',    // Green
    closed: '#dc3545',  // Red
    merged: '#6f42c1',  // Purple
  };
  return colors[status];
};

export const formatPRStats = (pr: PullRequest): string => {
  const { additions, deletions } = pr.stats;
  return `+${additions} -${deletions}`;
};

export const sortPRs = (
  prs: PullRequest[],
  sortBy: keyof PullRequest | 'changes',
  direction: 'asc' | 'desc' = 'desc'
): PullRequest[] => {
  return [...prs].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'changes') {
      const aChanges = a.stats.additions + a.stats.deletions;
      const bChanges = b.stats.additions + b.stats.deletions;
      comparison = aChanges - bChanges;
    } else if (sortBy === 'dates') {
      comparison = new Date(a.dates.createdAt).getTime() - new Date(b.dates.createdAt).getTime();
    } else {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};

export const filterPRs = (
  prs: PullRequest[],
  searchTerm: string
): PullRequest[] => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  if (!normalizedSearch) return prs;

  return prs.filter(pr => {
    return (
      pr.title.toLowerCase().includes(normalizedSearch) ||
      pr.author.login.toLowerCase().includes(normalizedSearch) ||
      pr.repository.fullName.toLowerCase().includes(normalizedSearch) ||
      String(pr.number).includes(normalizedSearch)
    );
  });
}; 