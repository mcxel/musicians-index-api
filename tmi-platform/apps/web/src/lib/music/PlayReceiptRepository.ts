/**
 * PlayReceiptRepository — canonical qualified-play event authority.
 *
 * Built per the forensic finding (2026-10-29) that Song.playCount/Video.viewCount
 * have zero real write callers anywhere in the app, and StreamAndWinEngine's
 * qualification logic (real, proven, 30% threshold) is in-memory and scoped
 * only to its own Lounge — no canonical event/source-of-truth layer exists for
 * rankings/charts/creator analytics/boost attribution. This is that layer.
 * Aggregate counters (playCount, Top 10/50/100, etc.) must be DERIVED from
 * receipts going forward, never an independent second truth.
 *
 * Dedup follows ContentTelemetryService's proven pattern: a DB-level unique
 * constraint on a computed dedupeKey (race-safe under concurrency), not an
 * application-level check-then-insert. "The same USER + MEDIA + PLAYBACK_
 * SESSION may generate at most ONE qualified play receipt" is enforced by the
 * database, not by application discipline alone.
 *
 * Schema (PlayReceipt, packages/db/prisma/schema.prisma) and migration source
 * (packages/db/prisma/migrations/20261029000000_play_receipts/migration.sql)
 * are prepared and validated via `prisma generate` (schema-parse only, no DB
 * connection). PRODUCTION_DB_MIGRATION = NO — this has not been applied to any
 * real database, same treatment as VideoShuffleStationRepository.
 */

import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import { evaluateQualification, type QualificationResult } from "@/lib/music/PlayQualificationAuthority";

export type DiscoverySource =
  | "GENRE_STATION"
  | "MIXED_ALL_MUSIC"
  | "DISCOVERY"
  | "VIDEO_SHUFFLE"
  | "STREAM_WIN"
  | "CHART"
  | "DIRECT"
  | "ARTIST_PROFILE"
  | "YO_PHO"
  | "SEARCH"
  | "SHARE"
  | "BOOSTED_PROGRAMMING"
  /** A real, named, saved user playlist (e.g. /api/user/playlists/:id/songs) — distinct from DIRECT. Added 2026-10-29 per owner correction: DIRECT must not be overloaded to mean "any user-initiated play." */
  | "PLAYLIST"
  | "OTHER_CANONICAL";

export interface PlayReceiptDraftInput {
  playbackSessionId: string;
  mediaId: string;
  mediaType: string;
  creatorId: string;
  /** Authenticated listener id when known. */
  listenerId?: string | null;
  /** Client-supplied session id, used for identity only when listenerId is absent. */
  clientSessionId?: string | null;
  consumedSeconds: number;
  validDurationSeconds: number;
  discoverySource: DiscoverySource;
  boostCampaignId?: string | null;
  submissionId?: string | null;
  programEntryId?: string | null;
  queueEntryId?: string | null;
  stationId?: string | null;
  programId?: string | null;
  /** Real saved-playlist id (e.g. /api/user/playlists/:id) — only when discoverySource is PLAYLIST. */
  playlistId?: string | null;
}

export interface PlayReceiptDraft {
  qualification: QualificationResult;
  qualifies: boolean;
  isSelfPlay: boolean;
  isRankingEligible: boolean;
  isRewardEligible: boolean;
  sessionIdentity: string;
  dedupeKey: string;
}

export function computeReceiptDedupeKey(parts: {
  mediaId: string;
  sessionIdentity: string;
  playbackSessionId: string;
}): string {
  const raw = `${parts.mediaId}:${parts.sessionIdentity}:${parts.playbackSessionId}`;
  return createHash("sha256").update(raw).digest("hex");
}

/**
 * Pure draft builder — combines qualification + self-play + eligibility rules
 * with no DB access. "PLAYBACK OCCURRED" (qualification.qualified) is tracked
 * separately from "RANKING-QUALIFIED PLAY" (isRankingEligible) — a creator
 * playing their own media can genuinely qualify by listen-time, but
 * isSelfPlay=true forces isRankingEligible/isRewardEligible to false. This
 * never hides that playback happened; it just doesn't let it count twice
 * (Rule 25's cardinal rule: never rewarded for listening to your own music).
 */
export function buildPlayReceiptDraft(input: PlayReceiptDraftInput): PlayReceiptDraft {
  const qualification = evaluateQualification({
    consumedSeconds: input.consumedSeconds,
    validDurationSeconds: input.validDurationSeconds,
  });

  const sessionIdentity = input.listenerId || input.clientSessionId || "anon";
  const isSelfPlay = Boolean(input.listenerId) && input.listenerId === input.creatorId;

  return {
    qualification,
    qualifies: qualification.qualified,
    isSelfPlay,
    isRankingEligible: qualification.qualified && !isSelfPlay,
    isRewardEligible: qualification.qualified && !isSelfPlay,
    sessionIdentity,
    dedupeKey: computeReceiptDedupeKey({
      mediaId: input.mediaId,
      sessionIdentity,
      playbackSessionId: input.playbackSessionId,
    }),
  };
}

export type RecordQualifiedPlayResult =
  | { ok: true; deduped: false }
  | { ok: true; deduped: true }
  | { ok: false; error: "not_qualified" };

/**
 * Persists a qualified play as a receipt. Only meaningful when draft.qualifies
 * is true — callers should not call this for an unqualified listen. Dedup is
 * enforced by the DB-level unique constraint on dedupeKey; a duplicate insert
 * is a benign no-op, not an error. NOT YET PHYSICALLY VERIFIED against a real
 * database (no safe non-production DATABASE_URL was available — see migration
 * file header).
 */
export async function recordQualifiedPlay(
  input: PlayReceiptDraftInput,
  draft: PlayReceiptDraft,
): Promise<RecordQualifiedPlayResult> {
  if (!draft.qualifies) {
    return { ok: false, error: "not_qualified" };
  }

  try {
    await prisma.playReceipt.create({
      data: {
        playbackSessionId: input.playbackSessionId,
        mediaId: input.mediaId,
        mediaType: input.mediaType,
        creatorId: input.creatorId,
        listenerId: input.listenerId ?? null,
        sessionIdentity: draft.sessionIdentity,
        submissionId: input.submissionId ?? null,
        programEntryId: input.programEntryId ?? null,
        queueEntryId: input.queueEntryId ?? null,
        stationId: input.stationId ?? null,
        programId: input.programId ?? null,
        playlistId: input.playlistId ?? null,
        discoverySource: input.discoverySource,
        boostCampaignId: input.boostCampaignId ?? null,
        qualifiedConsumedSeconds: input.consumedSeconds,
        validMediaDurationSeconds: input.validDurationSeconds,
        qualificationPercentage: draft.qualification.qualificationPercentage,
        isSelfPlay: draft.isSelfPlay,
        isRankingEligible: draft.isRankingEligible,
        isRewardEligible: draft.isRewardEligible,
        dedupeKey: draft.dedupeKey,
      },
    });
    return { ok: true, deduped: false };
  } catch (err) {
    const isUniqueViolation =
      typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
    if (isUniqueViolation) {
      return { ok: true, deduped: true };
    }
    throw err;
  }
}

function isMissingPlayReceiptsTable(err: unknown): boolean {
  const code = (err as { code?: string } | null)?.code;
  if (code === "P2021" || code === "P2022") return true;
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /play_receipts/i.test(msg) && /does not exist/i.test(msg);
}

/** Derived aggregate — never an independent truth from the receipts it counts. */
export async function getQualifiedPlayCount(mediaId: string): Promise<number> {
  try {
    return await prisma.playReceipt.count({ where: { mediaId, isRankingEligible: true } });
  } catch (err) {
    if (isMissingPlayReceiptsTable(err)) return 0;
    throw err;
  }
}

/** Distinct sessionIdentity count — "unique listeners," distinct from total qualified plays. */
export async function getUniqueListenerCount(mediaId: string): Promise<number> {
  try {
    const rows = await prisma.playReceipt.findMany({
      where: { mediaId, isRankingEligible: true },
      select: { sessionIdentity: true },
      distinct: ["sessionIdentity"],
    });
    return rows.length;
  } catch (err) {
    if (isMissingPlayReceiptsTable(err)) return 0;
    throw err;
  }
}
