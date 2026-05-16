// FrequencyCapEngine
// Prevents any article from being shown too many times in a given period per surface.
// Protects CTR and value from decay.

import type { PlacementSurface } from "./types";

export interface FrequencyRecord {
  articleId: string;
  surface: PlacementSurface;
  maxPerPeriod: number;
  periodMs: number;
  shownAt: number[]; // unix timestamps
}

// In-memory store — replace with Redis/DB in production
const _store = new Map<string, FrequencyRecord>();

function key(articleId: string, surface: PlacementSurface): string {
  return `${articleId}::${surface}`;
}

export function registerCap(
  articleId: string,
  surface: PlacementSurface,
  maxPerPeriod = 3,
  periodMs = 24 * 60 * 60 * 1000, // 24 hours
): void {
  const k = key(articleId, surface);
  if (!_store.has(k)) {
    _store.set(k, { articleId, surface, maxPerPeriod, periodMs, shownAt: [] });
  }
}

export function isCapped(articleId: string, surface: PlacementSurface): boolean {
  const k = key(articleId, surface);
  const record = _store.get(k);
  if (!record) return false; // no cap registered → not capped

  const now = Date.now();
  const periodStart = now - record.periodMs;
  const recentShows = record.shownAt.filter(t => t >= periodStart);
  return recentShows.length >= record.maxPerPeriod;
}

export function recordShow(articleId: string, surface: PlacementSurface): void {
  const k = key(articleId, surface);
  const record = _store.get(k);
  if (!record) return;

  const now = Date.now();
  // Prune old timestamps
  const periodStart = now - record.periodMs;
  record.shownAt = record.shownAt.filter(t => t >= periodStart);
  record.shownAt.push(now);
}

export function filterUncapped<T extends { articleId: string }>(
  entries: T[],
  surface: PlacementSurface,
): T[] {
  return entries.filter(e => !isCapped(e.articleId, surface));
}

export function resetCaps(articleId: string, surface: PlacementSurface): void {
  const k = key(articleId, surface);
  const record = _store.get(k);
  if (record) record.shownAt = [];
}
