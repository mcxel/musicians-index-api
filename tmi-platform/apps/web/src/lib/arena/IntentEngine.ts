/**
 * IntentEngine — tracks engagement history in sessionStorage, derives intent category.
 * Drives BillboardArena sorting so the world reshapes itself for each user.
 */

import type { IntentCategory, DistrictTheme } from '@/lib/arena/BillboardArenaEngine';

interface EngagementEvent {
  theme: DistrictTheme;
  weight: number;
  ts: number;
}

const STORAGE_KEY = 'tmi_intent_history';
const MAX_EVENTS  = 60;
const DECAY_MS    = 7 * 24 * 60 * 60 * 1000; // 7 days

function load(): EngagementEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EngagementEvent[];
  } catch {
    return [];
  }
}

function save(events: EngagementEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
  } catch {
    // storage quota — silently ignore
  }
}

export function recordEngagement(theme: DistrictTheme, weight = 1): void {
  const events = load();
  events.unshift({ theme, weight, ts: Date.now() });
  save(events);
}

export function getIntent(): IntentCategory {
  const now    = Date.now();
  const events = load().filter((e) => now - e.ts < DECAY_MS);
  if (events.length < 3) return null;

  const scores: Partial<Record<DistrictTheme, number>> = {};
  for (const e of events) {
    scores[e.theme] = (scores[e.theme] ?? 0) + e.weight;
  }

  let best: DistrictTheme | null = null;
  let bestScore = 0;
  for (const [theme, score] of Object.entries(scores) as [DistrictTheme, number][]) {
    if (score > bestScore) { bestScore = score; best = theme; }
  }
  return best as IntentCategory;
}

export function clearIntent(): void {
  if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
}
