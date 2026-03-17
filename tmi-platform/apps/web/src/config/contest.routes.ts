/**
 * contest.routes.ts
 * Repo: apps/web/src/config/contest.routes.ts
 * Action: CREATE | Wave: W3
 * Source: Split from Drop 2 ContestEntities.ts
 * Usage: import { CONTEST_ROUTES } from '@/config/contest.routes';
 *
 * DO NOT hardcode route strings in components. Always import from here.
 */

export const CONTEST_ROUTES = {
  home: '/contest',
  qualify: '/contest/qualify',
  rules: '/contest/rules',
  leaderboard: '/contest/leaderboard',
  host: '/contest/host',
  sponsors: '/contest/sponsors',
  season: (seasonId: string) => `/contest/season/${seasonId}`,
  seasonArchive: (seasonId: string) => `/contest/season/${seasonId}/archive`,
  admin: {
    root: '/contest/admin',
    contestants: '/contest/admin/contestants',
    sponsors: '/contest/admin/sponsors',
    reveal: '/contest/admin/reveal',
    payouts: '/contest/admin/payouts',
    seasons: '/contest/admin/seasons',
    audit: '/contest/admin/audit',
    host: '/contest/admin/host',
  },
} as const;

export type ContestRoute = typeof CONTEST_ROUTES;
