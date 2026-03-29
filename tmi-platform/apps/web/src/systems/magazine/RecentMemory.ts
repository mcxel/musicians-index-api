import type { RecentPageEntry } from './types';

const MAX_RECENT_PAGES = 20;

export function trimRecentPages(entries: RecentPageEntry[], limit: number = MAX_RECENT_PAGES): RecentPageEntry[] {
  return entries
    .sort((a, b) => b.visitedAt - a.visitedAt)
    .slice(0, limit);
}

export function recordRecentPage(
  entries: RecentPageEntry[],
  page: Omit<RecentPageEntry, 'visitedAt'>,
  now: number = Date.now()
): RecentPageEntry[] {
  const next = entries.filter((entry) => entry.route !== page.route);
  next.unshift({ ...page, visitedAt: now });
  return trimRecentPages(next);
}

export function getRecentPages(entries: RecentPageEntry[]): RecentPageEntry[] {
  return trimRecentPages(entries);
}
