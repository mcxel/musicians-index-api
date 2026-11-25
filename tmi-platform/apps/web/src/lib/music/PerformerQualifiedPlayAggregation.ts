/**
 * PerformerQualifiedPlayAggregation — real performer-level play/listener
 * signal authority (owner-locked, 2026-10-29). Reusable, keyed by canonical
 * User.id — belongs to neither CanonicalRankedUsers (the live read
 * authority) nor RankingScoreEngine (the dormant, not-yet-certified
 * scorer). Both may eventually read from this; neither owns it.
 *
 * Returns FACTS ONLY — never a score, never a weight, never an opinion on
 * how much a play or a listener should count toward anything. Scoring
 * remains a separate authority's decision.
 *
 * Source: PlayReceipt.creatorId — already server-resolved from the real
 * Song/Video.uploaderId at receipt-write time (api/music/play-receipts/route.ts),
 * never reconstructed here from artistName/displayName/slug/track title.
 * If a receipt's creatorId can't be resolved to a canonical identity, that
 * already failed at write time (the route 404s as media_or_creator_not_found)
 * — every PlayReceipt row that exists already carries a proven real User.id.
 *
 * Uniqueness is computed ACROSS the performer's entire eligible catalog,
 * not summed per track: Listener A playing Song 1 + Song 2 + Video 1 from
 * the same performer is 3 qualified plays but 1 unique performer listener,
 * never 3. This is why aggregation groups by creatorId directly over every
 * matching receipt, rather than summing TrackRankingEngine's per-mediaId
 * unique-listener counts (which would double-count that same listener).
 *
 * Reuses TrackRankingEngine's window math (windowStartDate/TrackRankingWindowType)
 * rather than a second time-window implementation.
 *
 * NOT YET RUN AGAINST A REAL DATABASE — same DB_RUNTIME_CERTIFIED=NO
 * constraint as every other PlayReceipt-reading file this session.
 */

import prisma from "@/lib/prisma";
import { windowStartDate, type TrackRankingWindowType } from "@/lib/music/TrackRankingEngine";

export interface PerformerPlaySignal {
  performerId: string;
  qualifiedPlayCount: number;
  uniqueQualifiedListenerCount: number;
  window: TrackRankingWindowType;
}

export interface PlayReceiptSignalRow {
  creatorId: string;
  sessionIdentity: string;
}

/**
 * Pure aggregation — groups real receipt rows by creatorId (the canonical
 * performer identity) and counts qualified plays + distinct sessionIdentity
 * values per performer. No Prisma, directly unit-testable.
 */
export function aggregatePerformerSignalsFromReceipts(
  rows: PlayReceiptSignalRow[],
  window: TrackRankingWindowType,
): Map<string, PerformerPlaySignal> {
  const byPerformer = new Map<string, { plays: number; listeners: Set<string> }>();
  for (const row of rows) {
    let entry = byPerformer.get(row.creatorId);
    if (!entry) {
      entry = { plays: 0, listeners: new Set() };
      byPerformer.set(row.creatorId, entry);
    }
    entry.plays += 1;
    entry.listeners.add(row.sessionIdentity);
  }

  const result = new Map<string, PerformerPlaySignal>();
  for (const [performerId, v] of byPerformer) {
    result.set(performerId, {
      performerId,
      qualifiedPlayCount: v.plays,
      uniqueQualifiedListenerCount: v.listeners.size,
      window,
    });
  }
  return result;
}

function isMissingPlayReceiptsTable(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  if (code === "P2021" || code === "P2022") return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /play_receipts/i.test(msg) && /does not exist/i.test(msg);
}

async function fetchRawReceiptRows(
  window: TrackRankingWindowType,
  now: number,
  creatorId?: string,
): Promise<PlayReceiptSignalRow[]> {
  const since = windowStartDate(window, now);
  try {
    return await prisma.playReceipt.findMany({
      where: {
        isRankingEligible: true,
        ...(since ? { qualifiedAt: { gte: since } } : {}),
        ...(creatorId ? { creatorId } : {}),
      },
      select: { creatorId: true, sessionIdentity: true },
    });
  } catch (err) {
    // Migration prepared but not applied (PRODUCTION_DB_MIGRATION = NO).
    // Honest empty signal — never fabricate plays; magazine/rankings stay up.
    if (isMissingPlayReceiptsTable(err)) return [];
    throw err;
  }
}

/**
 * One performer's real signal for a window. Returns a zero-valued, honest
 * signal (never undefined, never fabricated) when the performer has no
 * qualified plays in that window. NOT YET RUN AGAINST A REAL DATABASE.
 */
export async function fetchPerformerQualifiedPlaySignal(
  performerId: string,
  window: TrackRankingWindowType,
  now: number = Date.now(),
): Promise<PerformerPlaySignal> {
  const rows = await fetchRawReceiptRows(window, now, performerId);
  const map = aggregatePerformerSignalsFromReceipts(rows, window);
  return (
    map.get(performerId) ?? {
      performerId,
      qualifiedPlayCount: 0,
      uniqueQualifiedListenerCount: 0,
      window,
    }
  );
}

/**
 * Every performer's real signal for a window, in one query — for batch
 * consumers (e.g. a future scoring pass over the whole eligible population)
 * that would otherwise N+1. NOT YET RUN AGAINST A REAL DATABASE.
 */
export async function fetchAllPerformerQualifiedPlaySignals(
  window: TrackRankingWindowType,
  now: number = Date.now(),
): Promise<Map<string, PerformerPlaySignal>> {
  const rows = await fetchRawReceiptRows(window, now);
  return aggregatePerformerSignalsFromReceipts(rows, window);
}
