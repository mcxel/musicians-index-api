/**
 * EOS Phase 7 — Achievement Bridge (thin stub)
 *
 * Competition / runtime history from MemoryLedger (WINNER_DECLARED, MATCH_COMPLETED,
 * FIRST_PLACE, etc.) belongs on the Achievement / Profile path — NOT the Memory Wall
 * scrapbook (Memory & Collectibles Engine).
 *
 * This stub types the future handoff. No fake UI, no fabricated trophies (Rule 20).
 * Full Achievement Engine is out of scope for Phase 7.3.
 */

import type { LedgerEntry, MemoryEventKind } from "./memoryRegistry";
import { MemoryLedger } from "./memoryLedger";

/** Kinds that should never become photo-wall collectibles. */
export const ACHIEVEMENT_LEDGER_KINDS: ReadonlySet<MemoryEventKind> = new Set<MemoryEventKind>([
  "MATCH_STARTED",
  "MATCH_COMPLETED",
  "WINNER_DECLARED",
  "FIRST_PLACE",
  "SECOND_PLACE",
  "ROUND_COMPLETED",
  "NEW_RECORD",
  "PERFECT_SCORE",
  "HIGHEST_BOO_METER",
  "TOP_100_REACHED",
  "MONTHLY_IDOL_CHAMPION",
  "NEW_FOLLOWER",
  "TIP_RECEIVED",
  "PLAYLIST_CREATED",
  "PLAYLIST_SHARED",
  "VIRAL_PLAYLIST",
]);

export interface AchievementDraft {
  readonly entryId: string;
  readonly kind: MemoryEventKind;
  readonly actorId: string;
  readonly roomId?: string;
  readonly experienceId?: string;
  readonly occurredAtMs: number;
  readonly labelHint: string;
  readonly payload?: Record<string, unknown>;
}

/**
 * Map a WINNER_DECLARED (or other competition) ledger entry → AchievementDraft.
 * Returns null when entry is missing / not achievement-scoped.
 * Does not persist — Achievement Engine owns storage later.
 */
export function winnerDeclaredToAchievementDraft(
  entry: LedgerEntry,
): AchievementDraft | null {
  if (!entry?.actorId?.trim()) return null;
  if (!ACHIEVEMENT_LEDGER_KINDS.has(entry.kind) && entry.kind !== "WINNER_DECLARED") {
    return null;
  }
  return {
    entryId: entry.id,
    kind: entry.kind,
    actorId: entry.actorId,
    roomId: entry.roomId,
    experienceId: entry.experienceId,
    occurredAtMs: entry.occurredAtMs,
    labelHint: entry.kind === "WINNER_DECLARED" ? "Winner declared" : entry.kind,
    payload: entry.payload,
  };
}

/** Actor-scoped drafts from in-memory ledger. Honest [] when empty. */
export function getAchievementDraftsForActor(actorId: string): AchievementDraft[] {
  if (!actorId.trim()) return [];
  return MemoryLedger.getByActor(actorId)
    .map(winnerDeclaredToAchievementDraft)
    .filter((d): d is AchievementDraft => d !== null);
}
