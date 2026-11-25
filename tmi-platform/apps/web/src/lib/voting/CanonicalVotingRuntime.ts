/**
 * CanonicalVotingRuntime
 * Server-authoritative voting service.
 *
 * Policy families:
 *   COMPETITION_VOTE — Battle, Challenge, Gauntlet (winner vote allowed)
 *   JULIUS_INTERACTION — Julius companion polls (no winner concept; resolution via majority)
 *
 * Enforces:
 *   - Server-side open/close window (opensAt / closesAt) — never trusts the client
 *   - LOCK_ON_SUBMIT prevents vote changes
 *   - Rate-limit: 1 vote per user per interaction
 *   - Cypher EXCLUSION: COMPETITION_VOTE policyFamily must include `allowWinnerVote: true` for winner to be eligible
 *   - Result disclosure gated by resultPolicy
 *
 * Persistence (2026-11-11): durable file store via CanonicalVoteDurableStore.
 * Survives process restart. Prisma migration deferred (PRODUCTION_DB_MUTATIONS=NO).
 *
 * Certification: L2 DURABLE (file-backed) — not production DB certified.
 */

import {
  bumpRejectedDuplicate,
  getRejectedDuplicateCount,
  loadDurableVoteSnapshot,
  saveDurableVoteSnapshot,
  upsertAnalyticsRecord,
  type QuickVoteAnalyticsRecord,
} from "@/lib/voting/CanonicalVoteDurableStore";
import {
  computeUltimateScore,
  type ChannelWeights,
} from "@/lib/voting/UltimateScoreEngine";
import type { LockedCriteriaRuleset } from "@/lib/voting/JudgingCriteriaRegistry";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PolicyFamily = "COMPETITION_VOTE" | "JULIUS_INTERACTION";

export type VoteChangePolicy = "LOCK_ON_SUBMIT" | "CHANGE_UNTIL_CLOSE";

export type ResultPolicy =
  | "HIDDEN_UNTIL_CLOSE"
  | "WINNER_ONLY"
  | "PERCENTAGES_AFTER_CLOSE"
  | "FULL_BREAKDOWN_AFTER_CLOSE"
  | "HOST_ONLY_UNTIL_REVEAL"
  | "DELAYED_REVEAL";

export type VoteStatus = "PENDING" | "OPEN" | "CLOSED" | "RESULTS_PUBLISHED";

export interface VoteChoice {
  id: string;
  label: string;
}

export interface HostReportedLocalTally {
  source: "HOST_REPORTED";
  totals: { choiceId: string; count: number }[];
  reportedBy: string;
  reportedAt: number;
}

export interface VoteInteractionRecord {
  id: string;
  policyFamily: PolicyFamily;
  /** experienceId = battleId / cypherId / challengeId / gauntletId / room quick-vote */
  experienceId: string;
  roomId: string;
  roundId?: string;
  opensAt: number; // UTC ms
  closesAt: number; // UTC ms
  choices: VoteChoice[];
  resultPolicy: ResultPolicy;
  voteChangePolicy: VoteChangePolicy;
  /** When false, no winner can be declared even if policyFamily=COMPETITION_VOTE */
  allowWinnerVote: boolean;
  status: VoteStatus;
  createdAt: number;
  hostUserId?: string;
  title?: string;
  lockedCriteria?: LockedCriteriaRuleset;
  hostReportedLocal?: HostReportedLocalTally;
  channelWeights?: ChannelWeights;
  mode?: "QUICK_VOTE" | "JUDGED_CONTEST" | "FULL_COMPETITION";
}

export interface VoteCast {
  voteId: string;
  userId: string;
  choiceId: string;
  castAt: number;
  idempotencyKey: string;
  isSystemBot: boolean;
}

export type SubmitVoteResult =
  | { ok: true; choiceId: string }
  | { ok: false; reason: string };

export type GetResultsResult =
  | {
      ok: true;
      voteId: string;
      status: VoteStatus;
      visible: boolean;
      tally: { choiceId: string; label: string; count: number; percent: number }[];
      winner: string | null;
      totalVotes: number;
      hostReportedLocal?: HostReportedLocalTally;
      ultimateScore?: ReturnType<typeof computeUltimateScore>;
      lockedCriteria?: LockedCriteriaRuleset;
    }
  | { ok: false; reason: string };

// ─── Hot cache + durable hydrate ─────────────────────────────────────────────

const interactions = new Map<string, VoteInteractionRecord>();
const votes = new Map<string, VoteCast[]>(); // voteId → casts
let hydrated = false;

function hydrateFromDisk(): void {
  if (hydrated) return;
  hydrated = true;
  if (typeof window !== "undefined") return;
  const snap = loadDurableVoteSnapshot();
  interactions.clear();
  votes.clear();
  for (const rec of snap.interactions) {
    interactions.set(rec.id, rec);
  }
  for (const [voteId, casts] of Object.entries(snap.castsByVoteId)) {
    votes.set(voteId, casts);
  }
}

function persistToDisk(): void {
  if (typeof window !== "undefined") return;
  hydrateFromDisk();
  saveDurableVoteSnapshot({
    version: 1,
    interactions: Array.from(interactions.values()),
    castsByVoteId: Object.fromEntries(
      Array.from(votes.entries()).map(([id, casts]) => [id, casts]),
    ),
    analytics: loadDurableVoteSnapshot().analytics,
    updatedAt: Date.now(),
  });
}

/** Test helper: wipe memory and optionally re-hydrate from current durable file. */
export function __resetCanonicalVotingRuntimeForTests(options?: {
  rehydrate?: boolean;
}): void {
  interactions.clear();
  votes.clear();
  hydrated = false;
  if (options?.rehydrate) hydrateFromDisk();
  else hydrated = true; // stay empty until explicit rehydrate
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): number {
  return Date.now();
}

function getCasts(voteId: string): VoteCast[] {
  hydrateFromDisk();
  return votes.get(voteId) ?? [];
}

function isWindowOpen(record: VoteInteractionRecord): boolean {
  const t = now();
  return (
    record.status !== "CLOSED" &&
    record.status !== "RESULTS_PUBLISHED" &&
    t >= record.opensAt &&
    t < record.closesAt
  );
}

function isBotId(userId: string): boolean {
  return userId.startsWith("bot_") || userId.startsWith("system_");
}

function computeTally(
  record: VoteInteractionRecord,
  casts: VoteCast[],
): { choiceId: string; label: string; count: number; percent: number }[] {
  const countMap = new Map<string, number>();
  for (const c of record.choices) countMap.set(c.id, 0);
  for (const cast of casts) {
    countMap.set(cast.choiceId, (countMap.get(cast.choiceId) ?? 0) + 1);
  }
  const total = casts.length;
  return record.choices.map((ch) => {
    const count = countMap.get(ch.id) ?? 0;
    return {
      choiceId: ch.id,
      label: ch.label,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

function resolveWinner(
  record: VoteInteractionRecord,
  tally: { choiceId: string; count: number }[],
): string | null {
  if (!record.allowWinnerVote) return null;
  if (tally.length === 0) return null;
  const sorted = [...tally].sort((a, b) => b.count - a.count);
  const top = sorted[0];
  if (!top || top.count === 0) return null;
  if (sorted.length > 1 && sorted[1]!.count === top.count) return null;
  return top.choiceId;
}

function buildUltimate(record: VoteInteractionRecord, casts: VoteCast[]) {
  const online = record.choices.map((c) => ({
    choiceId: c.id,
    count: casts.filter((v) => v.choiceId === c.id).length,
  }));
  const local = record.hostReportedLocal?.totals ?? [];
  return computeUltimateScore({
    choiceIds: record.choices.map((c) => c.id),
    online,
    local,
    judge: [],
    weights: record.channelWeights ?? { online: 0.5, local: 0.3, judge: 0.2 },
  });
}

function writeAnalytics(record: VoteInteractionRecord, casts: VoteCast[]): void {
  const tally = computeTally(record, casts);
  const closed =
    record.status === "CLOSED" || record.status === "RESULTS_PUBLISHED";
  const ultimate = closed ? buildUltimate(record, casts) : undefined;
  const row: QuickVoteAnalyticsRecord = {
    voteId: record.id,
    experienceId: record.experienceId,
    roomId: record.roomId,
    hostUserId: record.hostUserId,
    status: record.status,
    choiceLabels: record.choices.map((c) => c.label),
    totalBallots: casts.length,
    uniqueVoters: new Set(casts.map((c) => c.userId)).size,
    rejectedDuplicates: getRejectedDuplicateCount(record.id),
    winnerChoiceId: closed ? resolveWinner(record, tally) : null,
    openedAt: record.opensAt,
    closedAt: closed ? Math.min(now(), record.closesAt) : null,
    finalizedAt: record.status === "RESULTS_PUBLISHED" ? now() : null,
    durationMs: closed ? Math.min(now(), record.closesAt) - record.opensAt : null,
    onlineTally: tally.map((t) => ({ choiceId: t.choiceId, count: t.count })),
    hostReportedLocal: record.hostReportedLocal,
    ultimateScore: ultimate
      ? {
          onlineNormalized: ultimate.onlineNormalized,
          localNormalized: ultimate.localNormalized,
          judgeNormalized: ultimate.judgeNormalized,
          combined: ultimate.combined,
          weights: ultimate.weights,
          winnerChoiceId: ultimate.winnerChoiceId,
        }
      : undefined,
    criteriaVersionId: record.lockedCriteria?.rulesetId,
  };
  upsertAnalyticsRecord(row);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a vote interaction record (durable).
 */
export function createVoteInteraction(
  input: Omit<VoteInteractionRecord, "status" | "createdAt">,
): VoteInteractionRecord {
  hydrateFromDisk();
  const record: VoteInteractionRecord = {
    ...input,
    status: now() >= input.opensAt ? "OPEN" : "PENDING",
    createdAt: now(),
    mode: input.mode ?? "QUICK_VOTE",
  };
  interactions.set(record.id, record);
  votes.set(record.id, []);
  persistToDisk();
  writeAnalytics(record, []);
  return record;
}

/**
 * Submit a vote — server-side enforcement of window and uniqueness.
 */
export function submitVote(
  voteId: string,
  userId: string,
  choiceId: string,
  idempotencyKey: string,
): SubmitVoteResult {
  hydrateFromDisk();
  const record = interactions.get(voteId);
  if (!record) return { ok: false, reason: "VOTE_NOT_FOUND" };

  if (!isWindowOpen(record)) {
    return {
      ok: false,
      reason: now() < record.opensAt ? "VOTE_NOT_YET_OPEN" : "VOTE_WINDOW_CLOSED",
    };
  }

  const validChoice = record.choices.find((c) => c.id === choiceId);
  if (!validChoice) return { ok: false, reason: "INVALID_CHOICE" };

  const casts = getCasts(voteId);

  if (casts.some((c) => c.idempotencyKey === idempotencyKey)) {
    return { ok: true, choiceId };
  }

  if (record.voteChangePolicy === "LOCK_ON_SUBMIT") {
    if (casts.some((c) => c.userId === userId)) {
      bumpRejectedDuplicate(voteId);
      writeAnalytics(record, casts);
      return { ok: false, reason: "ALREADY_VOTED_LOCKED" };
    }
  }

  const updatedCasts =
    record.voteChangePolicy === "CHANGE_UNTIL_CLOSE"
      ? casts.filter((c) => c.userId !== userId)
      : casts;

  const cast: VoteCast = {
    voteId,
    userId,
    choiceId,
    castAt: now(),
    idempotencyKey,
    isSystemBot: isBotId(userId),
  };

  const next = [...updatedCasts, cast];
  votes.set(voteId, next);
  persistToDisk();
  writeAnalytics(record, next);
  return { ok: true, choiceId };
}

/**
 * Get results — disclosure gated by resultPolicy.
 */
export function getVoteResults(
  voteId: string,
  _requestingUserId: string,
  options?: { asHost?: boolean },
): GetResultsResult {
  hydrateFromDisk();
  const record = interactions.get(voteId);
  if (!record) return { ok: false, reason: "VOTE_NOT_FOUND" };

  const casts = getCasts(voteId);
  const isClosed =
    now() >= record.closesAt ||
    record.status === "CLOSED" ||
    record.status === "RESULTS_PUBLISHED";
  const tally = computeTally(record, casts);
  const winner = isClosed ? resolveWinner(record, tally) : null;
  const ultimate = isClosed ? buildUltimate(record, casts) : undefined;

  let visible = false;
  if (options?.asHost) {
    visible = true;
  } else {
    switch (record.resultPolicy) {
      case "HIDDEN_UNTIL_CLOSE":
      case "HOST_ONLY_UNTIL_REVEAL":
      case "DELAYED_REVEAL":
      case "WINNER_ONLY":
      case "PERCENTAGES_AFTER_CLOSE":
      case "FULL_BREAKDOWN_AFTER_CLOSE":
        visible = isClosed || record.status === "RESULTS_PUBLISHED";
        break;
      default:
        visible = isClosed;
    }
  }

  return {
    ok: true,
    voteId,
    status: record.status,
    visible,
    tally: visible ? tally : [],
    winner: visible ? winner : null,
    totalVotes: visible ? casts.length : 0,
    hostReportedLocal: options?.asHost || visible ? record.hostReportedLocal : undefined,
    ultimateScore: visible || options?.asHost ? ultimate : undefined,
    lockedCriteria: record.lockedCriteria,
  };
}

export function closeVoteInteraction(voteId: string): VoteInteractionRecord | null {
  hydrateFromDisk();
  const record = interactions.get(voteId);
  if (!record) return null;
  record.status = "CLOSED";
  record.closesAt = Math.min(record.closesAt, now());
  persistToDisk();
  writeAnalytics(record, getCasts(voteId));
  return record;
}

export function publishVoteResults(voteId: string): VoteInteractionRecord | null {
  hydrateFromDisk();
  const record = interactions.get(voteId);
  if (!record) return null;
  if (record.status === "OPEN" || record.status === "PENDING") {
    record.status = "CLOSED";
    record.closesAt = Math.min(record.closesAt, now());
  }
  record.status = "RESULTS_PUBLISHED";
  persistToDisk();
  writeAnalytics(record, getCasts(voteId));
  return record;
}

export function recordHostReportedLocalTally(
  voteId: string,
  reportedBy: string,
  totals: { choiceId: string; count: number }[],
): { ok: true; record: VoteInteractionRecord } | { ok: false; reason: string } {
  hydrateFromDisk();
  const record = interactions.get(voteId);
  if (!record) return { ok: false, reason: "VOTE_NOT_FOUND" };
  for (const t of totals) {
    if (!record.choices.some((c) => c.id === t.choiceId)) {
      return { ok: false, reason: "INVALID_CHOICE" };
    }
    if (!Number.isFinite(t.count) || t.count < 0) {
      return { ok: false, reason: "INVALID_COUNT" };
    }
  }
  record.hostReportedLocal = {
    source: "HOST_REPORTED",
    totals: totals.map((t) => ({ choiceId: t.choiceId, count: Math.floor(t.count) })),
    reportedBy,
    reportedAt: now(),
  };
  persistToDisk();
  writeAnalytics(record, getCasts(voteId));
  return { ok: true, record };
}

export function getVoteInteraction(voteId: string): VoteInteractionRecord | undefined {
  hydrateFromDisk();
  return interactions.get(voteId);
}

export function listVoteInteractionsByExperience(experienceId: string): VoteInteractionRecord[] {
  hydrateFromDisk();
  return Array.from(interactions.values()).filter((r) => r.experienceId === experienceId);
}

export function listVoteInteractionsByRoom(roomId: string): VoteInteractionRecord[] {
  hydrateFromDisk();
  return Array.from(interactions.values()).filter((r) => r.roomId === roomId);
}

/** Active open Quick Vote for a live room (HUD audience panel). */
export function getActiveVoteForRoom(roomId: string): VoteInteractionRecord | undefined {
  hydrateFromDisk();
  const open = Array.from(interactions.values()).filter(
    (r) =>
      r.roomId === roomId &&
      (r.status === "OPEN" || r.status === "PENDING") &&
      isWindowOpen(r),
  );
  open.sort((a, b) => b.createdAt - a.createdAt);
  return open[0];
}

export function isCanonicalVoteOpenForRoom(roomId: string): boolean {
  return Boolean(getActiveVoteForRoom(roomId));
}
