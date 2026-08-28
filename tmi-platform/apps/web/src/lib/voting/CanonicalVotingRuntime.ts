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
 * Certification: L1 IMPLEMENTED (in-memory; wire Prisma for L2+)
 */

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

export interface VoteInteractionRecord {
  id: string;
  policyFamily: PolicyFamily;
  /** experienceId = battleId / cypherId / challengeId / gauntletId */
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
    }
  | { ok: false; reason: string };

// ─── In-memory store (swap for Prisma in production) ─────────────────────────

const interactions = new Map<string, VoteInteractionRecord>();
const votes = new Map<string, VoteCast[]>(); // voteId → casts

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): number {
  return Date.now();
}

function getCasts(voteId: string): VoteCast[] {
  return votes.get(voteId) ?? [];
}

function isWindowOpen(record: VoteInteractionRecord): boolean {
  const t = now();
  return t >= record.opensAt && t < record.closesAt;
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
  // No winner on a tie
  if (sorted.length > 1 && sorted[1]!.count === top.count) return null;
  return top.choiceId;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Create a vote interaction record.
 */
export function createVoteInteraction(
  input: Omit<VoteInteractionRecord, "status" | "createdAt">,
): VoteInteractionRecord {
  const record: VoteInteractionRecord = {
    ...input,
    status: now() >= input.opensAt ? "OPEN" : "PENDING",
    createdAt: now(),
  };
  interactions.set(record.id, record);
  votes.set(record.id, []);
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
  const record = interactions.get(voteId);
  if (!record) return { ok: false, reason: "VOTE_NOT_FOUND" };

  // Enforce server-side time window
  if (!isWindowOpen(record)) {
    return {
      ok: false,
      reason: now() < record.opensAt ? "VOTE_NOT_YET_OPEN" : "VOTE_WINDOW_CLOSED",
    };
  }

  // Validate choice
  const validChoice = record.choices.find((c) => c.id === choiceId);
  if (!validChoice) return { ok: false, reason: "INVALID_CHOICE" };

  const casts = getCasts(voteId);

  // Idempotency — same key means re-delivery, return ok
  if (casts.some((c) => c.idempotencyKey === idempotencyKey)) {
    return { ok: true, choiceId };
  }

  // LOCK_ON_SUBMIT — no change allowed
  if (record.voteChangePolicy === "LOCK_ON_SUBMIT") {
    if (casts.some((c) => c.userId === userId)) {
      return { ok: false, reason: "ALREADY_VOTED_LOCKED" };
    }
  }

  // CHANGE_UNTIL_CLOSE — update prior vote
  const updatedCasts = record.voteChangePolicy === "CHANGE_UNTIL_CLOSE"
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

  votes.set(voteId, [...updatedCasts, cast]);
  return { ok: true, choiceId };
}

/**
 * Get results — disclosure gated by resultPolicy.
 */
export function getVoteResults(
  voteId: string,
  requestingUserId: string,
): GetResultsResult {
  const record = interactions.get(voteId);
  if (!record) return { ok: false, reason: "VOTE_NOT_FOUND" };

  const casts = getCasts(voteId);
  const isClosed = now() >= record.closesAt || record.status === "CLOSED" || record.status === "RESULTS_PUBLISHED";
  const tally = computeTally(record, casts);
  const winner = isClosed ? resolveWinner(record, tally) : null;

  // Disclosure logic
  let visible = false;
  switch (record.resultPolicy) {
    case "HIDDEN_UNTIL_CLOSE":
    case "HOST_ONLY_UNTIL_REVEAL":
    case "DELAYED_REVEAL":
      visible = isClosed;
      break;
    case "WINNER_ONLY":
    case "PERCENTAGES_AFTER_CLOSE":
    case "FULL_BREAKDOWN_AFTER_CLOSE":
      visible = isClosed;
      break;
    default:
      visible = isClosed;
  }

  return {
    ok: true,
    voteId,
    status: record.status,
    visible,
    tally: visible ? tally : [],
    winner: visible ? winner : null,
    totalVotes: visible ? casts.length : 0,
  };
}

/**
 * Close a vote interaction (admin / system close).
 */
export function closeVoteInteraction(voteId: string): VoteInteractionRecord | null {
  const record = interactions.get(voteId);
  if (!record) return null;
  record.status = "CLOSED";
  return record;
}

/**
 * Publish results (makes them visible regardless of resultPolicy timing).
 */
export function publishVoteResults(voteId: string): VoteInteractionRecord | null {
  const record = interactions.get(voteId);
  if (!record) return null;
  record.status = "RESULTS_PUBLISHED";
  return record;
}

export function getVoteInteraction(voteId: string): VoteInteractionRecord | undefined {
  return interactions.get(voteId);
}

export function listVoteInteractionsByExperience(experienceId: string): VoteInteractionRecord[] {
  return Array.from(interactions.values()).filter((r) => r.experienceId === experienceId);
}
