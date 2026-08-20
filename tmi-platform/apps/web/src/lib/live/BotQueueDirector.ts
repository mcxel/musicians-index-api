/**
 * BotQueueDirector — auto-advance hook for bot/system-operated competition rooms.
 *
 * Wires existing engines only:
 *   - queueEngine (FIFO / next-up)
 *   - ChallengeQueueEngine (post-result challenger call)
 *   - WinnerStaysLifecycleEngine (winner-stays rotation)
 *
 * Does NOT invent fake participants or approvals (Rule 20).
 * Auto-advance is bot/platform only. Human-owned rooms still call
 * directorCompetitionRestart after ending animation; host keeps on-air control.
 */

import {
  advanceQueue,
  getQueueSnapshot,
  type QueueSlot,
} from "@/lib/live/queueEngine";
import { challengeQueueEngine } from "@/lib/competition/ChallengeQueueEngine";
import { winnerStaysLifecycleEngine } from "@/lib/competition/WinnerStaysLifecycleEngine";
import {
  mapQueueSlotToParticipationState,
  type ParticipationState,
  type RoomOwnershipModel,
} from "@/lib/live/ParticipationStateMachine";
import {
  directorPolicyForPersonality,
  resolveExperiencePersonality,
  type ExperiencePersonality,
  type ExperiencePersonalityId,
} from "@/lib/live/ExperiencePersonality";
import { runCompetitionRestartLoop } from "@/lib/live/CompetitionRestartLoop";

export type QueueDirectorPolicy =
  | "fifo"
  | "rotation"
  | "winner_stays"
  | "challenge_acceptance"
  | "timeout_no_show"
  | "cypher_recruit"
  | "competition_restart";

export type QueueDirectorAdvanceResult = {
  ok: boolean;
  reason?: string;
  nextSlot?: QueueSlot;
  participationState?: ParticipationState;
  policy: QueueDirectorPolicy;
  /** Cypher empty → recruiting reopen (same venueSlug). */
  recruiting?: boolean;
  discoveryLabel?: string;
};

/**
 * Whether this room should use automatic Queue Director (no per-person host approve).
 */
export function shouldUseBotQueueDirector(ownership: RoomOwnershipModel): boolean {
  return ownership === "bot_operated" || ownership === "platform";
}

/**
 * Advance next eligible participant for a bot-operated venue queue (FIFO / next-up).
 * Returns honest empty when queue has no next-up slot.
 */
export function directorAdvanceFifo(venueSlug: string): QueueDirectorAdvanceResult {
  const snap = getQueueSnapshot(venueSlug);
  if (snap.paused) {
    return { ok: false, reason: "queue-paused", policy: "fifo" };
  }
  if (snap.count === 0) {
    return { ok: false, reason: "queue-empty", policy: "fifo" };
  }
  const next = advanceQueue(venueSlug);
  if (!next) {
    return { ok: false, reason: "no-next-up", policy: "fifo" };
  }
  return {
    ok: true,
    nextSlot: next,
    participationState: mapQueueSlotToParticipationState(next.status),
    policy: "fifo",
  };
}

/**
 * During Winner-Stays CHALLENGER_CALL, pick next eligible challenger from ChallengeQueueEngine.
 * No fake challengers — empty queue returns honest failure.
 */
export function directorPickNextChallenger(battleId: string): QueueDirectorAdvanceResult {
  const queue = challengeQueueEngine.getQueue(battleId);
  const entry = queue[0];
  if (!entry) {
    return { ok: false, reason: "no-challenger-queued", policy: "winner_stays" };
  }
  const locked = winnerStaysLifecycleEngine.lockNextChallenger(
    battleId,
    entry.challenger.userId,
    entry.challenger.displayName ?? entry.challenger.userId,
  );
  if (!locked) {
    return { ok: false, reason: "challenger-lock-failed", policy: "winner_stays" };
  }
  return {
    ok: true,
    participationState: "READY",
    policy: "winner_stays",
  };
}

/**
 * Unified tick for bot rooms: prefer winner-stays challenger window when open,
 * otherwise FIFO venue queue advance.
 * Cypher personality never uses winner_stays (rotation/FIFO only).
 */
export function directorTick(input: {
  venueSlug: string;
  battleId?: string;
  ownership: RoomOwnershipModel;
  policy?: QueueDirectorPolicy;
  personality?: ExperiencePersonality | ExperiencePersonalityId | null;
  roomKind?: string | null;
  cypherKing?: boolean;
}): QueueDirectorAdvanceResult {
  if (!shouldUseBotQueueDirector(input.ownership)) {
    return { ok: false, reason: "human-owned-requires-host", policy: input.policy ?? "fifo" };
  }

  const personality =
    typeof input.personality === "object" && input.personality
      ? input.personality
      : resolveExperiencePersonality({
          personalityId: typeof input.personality === "string" ? input.personality : null,
          roomKind: input.roomKind,
          cypherKing: input.cypherKing,
        });

  const personalityPolicy = directorPolicyForPersonality(personality);
  // Explicit policy wins only when personality allows winner_stays; cypher strips it.
  let policy: QueueDirectorPolicy =
    input.policy ??
    (personality.allowsWinnerStays && input.battleId ? "winner_stays" : personalityPolicy);

  if (!personality.allowsWinnerStays && policy === "winner_stays") {
    policy = personalityPolicy === "winner_stays" ? "rotation" : personalityPolicy;
  }

  if (policy === "winner_stays" && input.battleId) {
    if (challengeQueueEngine.isWindowOpen(input.battleId)) {
      return directorPickNextChallenger(input.battleId);
    }
    return { ok: false, reason: "challenger-window-closed", policy };
  }

  if (policy === "timeout_no_show") {
    // No-show handling is owned by show pages (e.g. monday-stage); director only advances FIFO.
    return directorAdvanceFifo(input.venueSlug);
  }

  const advanced = directorAdvanceFifo(input.venueSlug);
  if (
    !advanced.ok &&
    advanced.reason === "queue-empty" &&
    personality.restartOnEmpty
  ) {
    return directorCompetitionRestart({
      venueSlug: input.venueSlug,
      personality,
      roomKind: input.roomKind,
      cypherKing: input.cypherKing,
    });
  }
  return advanced;
}

/**
 * Post-ending restart: RESET → SHUFFLE → RECRUITING.
 * Bot rooms call from directorTick; human-owned rooms call after ending animation
 * (host still Approve Next / Bring On Stage once recruits join).
 */
export function directorCompetitionRestart(input: {
  venueSlug: string;
  personality?: ExperiencePersonality;
  roomKind?: string | null;
  cypherKing?: boolean;
  afterResultReveal?: boolean;
}): QueueDirectorAdvanceResult {
  const loop = runCompetitionRestartLoop({
    venueSlug: input.venueSlug,
    personality: input.personality,
    roomKind: input.roomKind,
    cypherKing: input.cypherKing,
    afterResultReveal: input.afterResultReveal ?? true,
  });
  return {
    ok: loop.ok,
    reason: loop.reason,
    policy: "competition_restart",
    recruiting: loop.recruiting,
    discoveryLabel: loop.discoveryLabel,
    participationState: "SPECTATOR",
  };
}

/**
 * @deprecated use directorCompetitionRestart — same RESET→SHUFFLE→RECRUITING loop.
 */
export function directorCypherEmptyRestart(
  venueSlug: string,
  personality?: ExperiencePersonality,
): QueueDirectorAdvanceResult {
  return directorCompetitionRestart({ venueSlug, personality, roomKind: "cypher" });
}
