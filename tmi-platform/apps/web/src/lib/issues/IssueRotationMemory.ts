/**
 * IssueRotationMemory.ts
 * PASS 8 — Issue Intelligence Engine
 *
 * Prevents repeating:
 *  - same promo phrases in succession
 *  - same top artist order across issue cycles
 *  - same issue mood in back-to-back issues
 *
 * Uses a simple in-memory ring with session persistence via localStorage (client only).
 * Server renders always return safe defaults without touching storage.
 */

import type { IssueMood } from "./IssueThemeResolver";

// ── Storage keys ──────────────────────────────────────────────────────────────

const STORAGE_KEY_PROMO   = "tmi_rotation_promo";
const STORAGE_KEY_ARTIST  = "tmi_rotation_artist";
const STORAGE_KEY_MOOD    = "tmi_rotation_mood";

// ── Safe localStorage helpers ─────────────────────────────────────────────────

function isClient(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ── Promo phrase rotation ─────────────────────────────────────────────────────

/**
 * Pick the next promo phrase from the pool, skipping the most-recently used ones.
 * Stores a seen-queue of length `antiRepeatDepth` to prevent back-to-back repeats.
 */
export function pickNextPromoPhrase(
  pool: readonly string[],
  antiRepeatDepth = 2,
): string {
  if (pool.length === 0) return "";
  if (pool.length === 1) return pool[0];

  const seen: string[] = readJSON<string[]>(STORAGE_KEY_PROMO, []);
  const candidates = pool.filter((p) => !seen.slice(-antiRepeatDepth).includes(p));
  const chosen = candidates.length > 0
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  const updated = [...seen, chosen].slice(-(antiRepeatDepth + 1));
  writeJSON(STORAGE_KEY_PROMO, updated);
  return chosen;
}

// ── Top artist order rotation ─────────────────────────────────────────────────

/**
 * Shuffle an artist ID list such that the same top-3 order never repeats
 * across consecutive issue cycles. Returns a new ordered list.
 */
export function rotateArtistOrder(
  artistIds: string[],
  topN = 3,
): string[] {
  if (artistIds.length <= topN) return [...artistIds];

  const lastOrder: string[] = readJSON<string[]>(STORAGE_KEY_ARTIST, []);

  // Fisher-Yates shuffle, biased to avoid matching lastOrder in top-N positions
  const pool = [...artistIds];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // If top-N matches last order, rotate one position forward
  const topMatches = pool.slice(0, topN).every((id, idx) => id === lastOrder[idx]);
  if (topMatches && pool.length > topN) {
    const shifted = [...pool.slice(1, topN + 1), pool[0], ...pool.slice(topN + 1)];
    writeJSON(STORAGE_KEY_ARTIST, shifted.slice(0, topN));
    return shifted;
  }

  writeJSON(STORAGE_KEY_ARTIST, pool.slice(0, topN));
  return pool;
}

// ── Issue mood anti-repeat ────────────────────────────────────────────────────

/**
 * Return true if the given mood was used in any of the last `depth` issues.
 * Callers should use this to skip or penalize mood candidates.
 */
export function isMoodRecentlyUsed(mood: IssueMood, depth = 2): boolean {
  const recentMoods: IssueMood[] = readJSON<IssueMood[]>(STORAGE_KEY_MOOD, []);
  return recentMoods.slice(-depth).includes(mood);
}

/**
 * Record that a mood has been used for the current issue cycle.
 */
export function recordMoodUsed(mood: IssueMood): void {
  const recentMoods: IssueMood[] = readJSON<IssueMood[]>(STORAGE_KEY_MOOD, []);
  const updated = [...recentMoods, mood].slice(-5); // keep last 5 only
  writeJSON(STORAGE_KEY_MOOD, updated);
}

/**
 * Clear all rotation memory. Call on season reset or manual override.
 */
export function clearRotationMemory(): void {
  if (!isClient()) return;
  window.localStorage.removeItem(STORAGE_KEY_PROMO);
  window.localStorage.removeItem(STORAGE_KEY_ARTIST);
  window.localStorage.removeItem(STORAGE_KEY_MOOD);
}
