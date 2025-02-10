import { z } from 'zod';

// PR Status enum
export const PRStatusSchema = z.enum(['open', 'closed', 'merged']);
export type PRStatus = z.infer<typeof PRStatusSchema>;

// Pull Request schema
export const PullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  status: PRStatusSchema,
  repository: z.object({
    name: z.string(),
    fullName: z.string(),
  }),
  author: z.object({
    login: z.string(),
    avatarUrl: z.string().optional(),
  }),
  stats: z.object({
    additions: z.number(),
    deletions: z.number(),
    comments: z.number(),
  }),
  dates: z.object({
    createdAt: z.string(),
    closedAt: z.string().nullable(),
  }),
  isAtRisk: z.boolean(),
});

export type PullRequest = z.infer<typeof PullRequestSchema>;

// Filter options schema
export const FilterOptionsSchema = z.object({
  dateRange: z.object({
    start: z.string().nullable(),
    end: z.string().nullable(),
  }),
  status: z.array(PRStatusSchema).optional(),
  repository: z.string().optional(),
  showAtRisk: z.boolean().optional(),
});

export type FilterOptions = z.infer<typeof FilterOptionsSchema>;

// API response schema
export const APIResponseSchema = z.object({
  items: z.array(PullRequestSchema),
  totalCount: z.number(),
});

export type APIResponse = z.infer<typeof APIResponseSchema>; 