/**
 * BotQueueDirector — auto-advance hook for bot/system-operated competition rooms.
 *
 * Wires existing engines only:
 *   - queueEngine (FIFO / next-up)
 *   - ChallengeQueueEngine (post-result challenger call)
 *   - WinnerStaysLifecycleEngine (winner-stays rotation)
 *
 * Does NOT invent fake participants or approvals (Rule 20).
 * Human-owned rooms skip this director — host approve path stays in Venue HUD.
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

export type QueueDirectorPolicy =
  | "fifo"
  | "rotation"
  | "winner_stays"
  | "challenge_acceptance"
  | "timeout_no_show";

export type QueueDirectorAdvanceResult = {
  ok: boolean;
  reason?: string;
  nextSlot?: QueueSlot;
  participationState?: ParticipationState;
  policy: QueueDirectorPolicy;
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
 */
export function directorTick(input: {
  venueSlug: string;
  battleId?: string;
  ownership: RoomOwnershipModel;
  policy?: QueueDirectorPolicy;
}): QueueDirectorAdvanceResult {
  if (!shouldUseBotQueueDirector(input.ownership)) {
    return { ok: false, reason: "human-owned-requires-host", policy: input.policy ?? "fifo" };
  }

  const policy = input.policy ?? (input.battleId ? "winner_stays" : "fifo");

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

  return directorAdvanceFifo(input.venueSlug);
}
