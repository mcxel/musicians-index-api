/**
 * IssueIntelligenceEngine.ts
 * PASS 8 — Issue Intelligence Engine
 *
 * Orchestrates:
 *  - current issue number (week-derived, auto-advancing)
 *  - weekly issue theme assignment via IssueThemeResolver
 *  - headline rotation (4 headline slots, non-repeating)
 *  - top artist rotation (ordered list, anti-repeat)
 *  - promo phrase rotation (randomized pool, anti-repeat)
 *
 * Designed to be called from React components via the `useIssueIntelligence` hook.
 * All state is derived from the current UTC week number and rotation memory.
 */

import { resolveIssueTheme, type IssueTheme } from "./IssueThemeResolver";
import {
  pickNextPromoPhrase,
  rotateArtistOrder,
  recordMoodUsed,
} from "./IssueRotationMemory";

// ── Config ────────────────────────────────────────────────────────────────────

/** First issue week anchor — ISO week 1 of 2026 */
const ISSUE_EPOCH_YEAR  = 2026;
const ISSUE_EPOCH_WEEK  = 1;

// ── Promo phrase pool ─────────────────────────────────────────────────────────

export const PROMO_PHRASE_POOL = [
  "Monthly Season Pass",
  "This Issue's Top Artists",
  "Join The Magazine",
  "Have You Seen This Week's Issue?",
  "Battle Season Live",
  "Vote Live Now",
  "Earn While You Watch",
  "Crown Duel Tonight",
  "New Rankings Drop Friday",
  "Artist Spotlight Active",
  "Genre Wars — Cast Your Vote",
  "Season Pass Boost Active",
] as const;

export type PromoPhrase = typeof PROMO_PHRASE_POOL[number];

// ── Headline roster ───────────────────────────────────────────────────────────

const HEADLINE_POOL: string[] = [
  "Crown Duel Season Opens",
  "Battle Rankings Reset — New Week",
  "Artist Spotlight: Week's Best",
  "New Genre Drop: Vote Now",
  "Cypher Zone Goes Live",
  "Top 10 Artists Revealed",
  "Season Pass Holders Get Early Access",
  "Friday Night Battles Return",
  "Fan Vote Decides Crown",
  "New Issue — New Champion",
  "Live Arena Drops Tonight",
  "Ranking Multiplier Active",
];

// ── Artist ID roster ──────────────────────────────────────────────────────────

const ARTIST_ID_POOL: string[] = [
  "kova",
  "nera-vex",
  "beatarchitect",
  "zuri-bloom",
  "krypt",
  "lyra-sine",
  "neon-vibe",
  "orion-drop",
];

// ── ISO week number utility ───────────────────────────────────────────────────

function getISOWeekNumber(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

/**
 * Compute the current issue number from the epoch anchor.
 * Issue number advances every calendar week (UTC).
 */
function computeCurrentIssueNumber(now: Date): number {
  const { week, year } = getISOWeekNumber(now);
  const epochWeeksTotal = (ISSUE_EPOCH_YEAR - 2000) * 52 + ISSUE_EPOCH_WEEK;
  const nowWeeksTotal   = (year - 2000) * 52 + week;
  const elapsed = Math.max(0, nowWeeksTotal - epochWeeksTotal);
  return elapsed + 1; // 1-indexed
}

// ── Deterministic headline picker ─────────────────────────────────────────────

/** Pick N headlines from the pool deterministically for a given issue number. */
function pickHeadlines(issueNumber: number, count = 4): string[] {
  const results: string[] = [];
  const pool = [...HEADLINE_POOL];
  let seed = issueNumber;
  while (results.length < count && pool.length > 0) {
    const idx = seed % pool.length;
    results.push(pool[idx]);
    pool.splice(idx, 1);
    seed = (seed * 31 + 7) % (pool.length + 1 || 1);
  }
  return results;
}

// ── Engine output type ────────────────────────────────────────────────────────

export interface IssueIntelligenceSnapshot {
  /** Current 1-indexed issue number */
  issueNumber: number;
  /** Full theme object — colors, mood, typography */
  theme: IssueTheme;
  /** 4 rotating headline strings */
  headlines: string[];
  /** Ordered top artist IDs for this cycle */
  topArtistIds: string[];
  /** Currently active promo phrase */
  activePromoPhrase: string;
  /** Formatted display string — "ISSUE 04 · ARTIST SPOTLIGHT" */
  issueLabel: string;
  /** Week number within current season (1-based) */
  weekInSeason: number;
}

// ── Main engine function ──────────────────────────────────────────────────────

/**
 * Build a full IssueIntelligenceSnapshot for the given moment.
 * Safe to call server-side (rotation memory will use defaults when no localStorage).
 *
 * @param now  Current Date (inject for testability)
 */
export function buildIssueSnapshot(now: Date = new Date()): IssueIntelligenceSnapshot {
  const issueNumber = computeCurrentIssueNumber(now);
  const theme = resolveIssueTheme(issueNumber);

  // Record mood usage for anti-repeat (client-side only, safe to call everywhere)
  recordMoodUsed(theme.mood);

  const headlines     = pickHeadlines(issueNumber, 4);
  const topArtistIds  = rotateArtistOrder(ARTIST_ID_POOL, 3);
  const activePromoPhrase = pickNextPromoPhrase(PROMO_PHRASE_POOL, 2);

  const issueLabel = `ISSUE ${String(issueNumber).padStart(2, "0")} · ${theme.descriptor}`;
  const weekInSeason = ((issueNumber - 1) % 8) + 1; // 8-week season cycle

  return {
    issueNumber,
    theme,
    headlines,
    topArtistIds,
    activePromoPhrase,
    issueLabel,
    weekInSeason,
  };
}

// ── React hook ────────────────────────────────────────────────────────────────

// Lazy import pattern — avoids pulling React into a pure lib file at module level
// Consumers import this hook directly; engine functions remain framework-agnostic.

/**
 * React hook — returns a memoized IssueIntelligenceSnapshot.
 * Refreshes on mount only (issue identity is week-stable, no interval needed).
 *
 * Usage:
 *   import { useIssueIntelligence } from "@/lib/issues/IssueIntelligenceEngine";
 *   const snapshot = useIssueIntelligence();
 */
export function useIssueIntelligence(): IssueIntelligenceSnapshot {
  // Dynamic require pattern keeps this tree-shakeable and avoids circular React imports
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useState, useEffect } = require("react") as typeof import("react");

  const [snapshot, setSnapshot] = useState<IssueIntelligenceSnapshot>(() =>
    buildIssueSnapshot(new Date()),
  );

  useEffect(() => {
    // Re-resolve on mount to pick up any rotation memory from localStorage
    setSnapshot(buildIssueSnapshot(new Date()));
  }, []);

  return snapshot;
}
