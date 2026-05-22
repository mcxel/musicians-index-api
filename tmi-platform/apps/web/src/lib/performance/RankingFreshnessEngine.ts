/**
 * RankingFreshnessEngine
 *
 * Enforces the rule: no performer stays at #1 in their genre for more than
 * TOP_MAX_DAYS. After hitting the limit they enter a cooldown and the next
 * eligible ranked performer is promoted to crown.
 *
 * Storage: localStorage keyed by genre → performerId.
 * Safe on server (returns true / first candidate when window is absent).
 */

const STORAGE_KEY  = "tmi_ranking_freshness_v1";
const TOP_MAX_DAYS = 60;                          // max days consecutive at #1
const COOLDOWN_DAYS = 30;                         // cooldown before re-eligibility

type FreshnessRecord = {
  firstAtTopMs:   number;  // when they first became #1 in this genre
  lastAtTopMs:    number;  // last time we saw them at #1
  coolingUntilMs: number;  // 0 = not cooling; >0 = blocked until this timestamp
};

type FreshnessStore = Record<string, Record<string, FreshnessRecord>>;
// shape: { [genre]: { [performerId]: FreshnessRecord } }

function load(): FreshnessStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as FreshnessStore;
  } catch {
    return {};
  }
}

function save(store: FreshnessStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota exceeded — skip silently */ }
}

/**
 * Call this every time a performer reaches the #1 slot for a genre.
 * Idempotent — safe to call on every render cycle that shows a crown.
 */
export function recordTopPerformer(genre: string, performerId: string): void {
  const now   = Date.now();
  const store = load();
  const byGenre = store[genre] ?? {};
  const existing = byGenre[performerId];

  byGenre[performerId] = existing
    ? { ...existing, lastAtTopMs: now }
    : { firstAtTopMs: now, lastAtTopMs: now, coolingUntilMs: 0 };

  store[genre] = byGenre;
  save(store);
}

/**
 * Returns false if the performer has been #1 for > TOP_MAX_DAYS
 * or is currently in cooldown. Triggers the cooldown flag on first violation.
 */
export function isEligibleForTop(genre: string, performerId: string): boolean {
  if (typeof window === "undefined") return true;

  const now    = Date.now();
  const store  = load();
  const record = store[genre]?.[performerId];

  if (!record) return true;

  // Still cooling down from a previous disqualification
  if (record.coolingUntilMs > now) return false;

  // Check if tenure exceeds max
  const daysAtTop = (record.lastAtTopMs - record.firstAtTopMs) / 86_400_000;
  if (daysAtTop >= TOP_MAX_DAYS) {
    // Stamp the cooldown in place
    const s2 = load();
    (s2[genre] ??= {})[performerId] = {
      ...record,
      coolingUntilMs: now + COOLDOWN_DAYS * 86_400_000,
    };
    save(s2);
    return false;
  }

  return true;
}

/**
 * From an ordered (best → worst) list of performer IDs, returns the first
 * one that is still eligible for the #1 slot, or the original first as a
 * safe fallback so the crown is never empty.
 */
export function getEligibleTopId(genre: string, rankedIds: string[]): string | null {
  if (rankedIds.length === 0) return null;
  return rankedIds.find(id => isEligibleForTop(genre, id)) ?? rankedIds[0]!;
}

/**
 * Manually clear cooldown (admin use / testing).
 */
export function resetEligibility(genre: string, performerId: string): void {
  const store = load();
  const byGenre = store[genre];
  if (!byGenre) return;
  delete byGenre[performerId];
  store[genre] = byGenre;
  save(store);
}
