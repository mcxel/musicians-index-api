// WinnerProgressionEngine
// Tracks performer progression: streaks, crowns, advancement tier, rematch eligibility, ranking XP
// Consumed by: battle result surfaces, ranking displays, cypher leaderboards, reward gates

export type ProgressionTier =
  | "newcomer"
  | "contender"
  | "qualifier"
  | "champion"
  | "crown_holder"
  | "legend";

export type RematchStatus = "eligible" | "pending" | "blocked" | "not_applicable";

export type WinnerRecord = {
  performerId: string;
  name: string;
  // Streak
  currentStreak: number;
  longestStreak: number;
  // Crown tracking
  crownCount: number;        // number of times crowned #1
  lastCrownedAt?: number;    // unix ms
  // XP
  rankingXp: number;
  totalXpEarned: number;
  // Tier
  tier: ProgressionTier;
  // Advancement
  advancementEligible: boolean;
  nextTierXpThreshold: number;
  // Rematch
  rematchStatus: RematchStatus;
  rematchRequestedAt?: number;
  // History
  wins: number;
  losses: number;
  draws: number;
  lastResultAt?: number;
};

// XP thresholds per tier
const TIER_THRESHOLDS: Record<ProgressionTier, number> = {
  newcomer:     0,
  contender:    500,
  qualifier:    1500,
  champion:     3500,
  crown_holder: 8000,
  legend:       20000,
};

const TIER_ORDER: ProgressionTier[] = [
  "newcomer", "contender", "qualifier", "champion", "crown_holder", "legend",
];

// XP grants
const XP_WIN        = 250;
const XP_CROWN      = 500;
const XP_LOSS       = 40;
const XP_DRAW       = 80;
const XP_STREAK_3   = 150;  // bonus for 3-win streak
const XP_STREAK_5   = 400;  // bonus for 5-win streak

// In-memory store
const _store: Record<string, WinnerRecord> = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeTier(xp: number): ProgressionTier {
  let tier: ProgressionTier = "newcomer";
  for (const t of TIER_ORDER) {
    if (xp >= TIER_THRESHOLDS[t]) tier = t;
  }
  return tier;
}

function nextTierThreshold(tier: ProgressionTier): number {
  const idx = TIER_ORDER.indexOf(tier);
  if (idx === TIER_ORDER.length - 1) return TIER_THRESHOLDS.legend;
  return TIER_THRESHOLDS[TIER_ORDER[idx + 1]!];
}

function initRecord(performerId: string, name: string): WinnerRecord {
  return {
    performerId,
    name,
    currentStreak: 0,
    longestStreak: 0,
    crownCount: 0,
    rankingXp: 0,
    totalXpEarned: 0,
    tier: "newcomer",
    advancementEligible: false,
    nextTierXpThreshold: TIER_THRESHOLDS.contender,
    rematchStatus: "not_applicable",
    wins: 0,
    losses: 0,
    draws: 0,
  };
}

function getOrInit(performerId: string, name = ""): WinnerRecord {
  if (!_store[performerId]) {
    _store[performerId] = initRecord(performerId, name);
  }
  return _store[performerId];
}

function refreshDerivedFields(record: WinnerRecord): void {
  const newTier = computeTier(record.rankingXp);
  const wasLowerTier = TIER_ORDER.indexOf(newTier) > TIER_ORDER.indexOf(record.tier);
  record.tier = newTier;
  record.advancementEligible = wasLowerTier;
  record.nextTierXpThreshold = nextTierThreshold(newTier);
}

// ── Core API ──────────────────────────────────────────────────────────────────

export function getRecord(performerId: string): WinnerRecord | undefined {
  return _store[performerId];
}

export function getOrCreateRecord(performerId: string, name: string): WinnerRecord {
  return getOrInit(performerId, name);
}

export function recordWin(performerId: string, name: string, isCrown = false): WinnerRecord {
  const r = getOrInit(performerId, name);
  r.wins += 1;
  r.currentStreak += 1;
  r.longestStreak = Math.max(r.longestStreak, r.currentStreak);

  let xp = XP_WIN;
  if (r.currentStreak === 3) xp += XP_STREAK_3;
  if (r.currentStreak === 5) xp += XP_STREAK_5;

  if (isCrown) {
    r.crownCount += 1;
    r.lastCrownedAt = Date.now();
    xp += XP_CROWN;
  }

  r.rankingXp += xp;
  r.totalXpEarned += xp;
  r.lastResultAt = Date.now();
  r.rematchStatus = "eligible";
  refreshDerivedFields(r);
  return r;
}

export function recordLoss(performerId: string, name: string): WinnerRecord {
  const r = getOrInit(performerId, name);
  r.losses += 1;
  r.currentStreak = 0;
  r.rankingXp = Math.max(0, r.rankingXp + XP_LOSS);
  r.totalXpEarned += XP_LOSS;
  r.lastResultAt = Date.now();
  r.rematchStatus = "eligible";
  refreshDerivedFields(r);
  return r;
}

export function recordDraw(performerId: string, name: string): WinnerRecord {
  const r = getOrInit(performerId, name);
  r.draws += 1;
  r.rankingXp += XP_DRAW;
  r.totalXpEarned += XP_DRAW;
  r.lastResultAt = Date.now();
  r.rematchStatus = "eligible";
  refreshDerivedFields(r);
  return r;
}

export function requestRematch(performerId: string): RematchStatus {
  const r = _store[performerId];
  if (!r) return "not_applicable";
  if (r.rematchStatus === "eligible") {
    r.rematchStatus = "pending";
    r.rematchRequestedAt = Date.now();
  }
  return r.rematchStatus;
}

export function approveRematch(performerId: string): void {
  const r = _store[performerId];
  if (r) r.rematchStatus = "eligible";
}

export function blockRematch(performerId: string): void {
  const r = _store[performerId];
  if (r) r.rematchStatus = "blocked";
}

// ── Leaderboard helpers ───────────────────────────────────────────────────────

export function getAllRecords(): WinnerRecord[] {
  return Object.values(_store);
}

export function getTopByXp(limit = 10): WinnerRecord[] {
  return getAllRecords()
    .sort((a, b) => b.rankingXp - a.rankingXp)
    .slice(0, limit);
}

export function getTopByStreak(limit = 5): WinnerRecord[] {
  return getAllRecords()
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, limit);
}

export function getCrownHolders(): WinnerRecord[] {
  return getAllRecords()
    .filter((r) => r.crownCount > 0)
    .sort((a, b) => b.crownCount - a.crownCount);
}

export function getByTier(tier: ProgressionTier): WinnerRecord[] {
  return getAllRecords().filter((r) => r.tier === tier);
}

export function getAdvancementCandidates(): WinnerRecord[] {
  return getAllRecords().filter((r) => r.advancementEligible);
}

export function formatXpProgress(record: WinnerRecord): string {
  const pct = Math.min(
    Math.round((record.rankingXp / record.nextTierXpThreshold) * 100),
    100,
  );
  return `${record.rankingXp.toLocaleString()} / ${record.nextTierXpThreshold.toLocaleString()} XP (${pct}%)`;
}
