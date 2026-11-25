/**
 * Performer Spectator & Free-Roam Law + Final Queue Withdrawal Law.
 *
 * Leaving the room ≠ leaving the line.
 * LEAVE QUEUE = immediate forfeiture of the active queue entry.
 * SPECTATE / JUMP OUT keep membership. JUMP BACK IN resumes only if still a member.
 * REJOIN after leave or elimination = new tail entry (e.g. was #2/10 → rejoin as #10/10).
 *
 * Durable enforcement is Claude-owned. This module is the shared HUD/server contract.
 * No second competition / queue engine.
 */

import {
  mayRejoinChallengerQueue,
  type EliminationKind,
  type InstantReEntryEligibility,
} from "@/lib/competition/InstantReEntryBackOfQueuePolicy";

export const PERFORMER_SPECTATOR_FREE_ROAM_POLICY_ID =
  "PERFORMER_SPECTATOR_FREE_ROAM_v1" as const;

export const FINAL_QUEUE_WITHDRAWAL_LAW_ID = "FINAL_QUEUE_WITHDRAWAL_LAW_v1" as const;

export const NEW_SPECTATOR_PLAYER_ENGINE = false as const;
export const NEW_FREE_ROAM_QUEUE_ENGINE = false as const;
export const SPECTATE_WITHDRAWS_FROM_QUEUE = 0 as const;
export const JUMP_OUT_WITHDRAWS_FROM_QUEUE = 0 as const;
export const QUEUE_MEMBERSHIP_GRANTS_WHISPER = 0 as const;
export const SPECTATE_GRANTS_STAGE_PUBLISH = 0 as const;
/** Forfeited seats are never restored by Jump Back In, refresh, or reconnect. */
export const FORFEITED_POSITION_NEVER_RESTORED = true as const;
export const LEAVE_QUEUE_REQUIRES_SERVER_CONFIRM = true as const;

export type FreeRoamAction =
  | "SPECTATE_CURRENT"
  | "SPECTATE_OTHER"
  | "JUMP_OUT"
  | "JUMP_BACK_IN"
  | "LEAVE_QUEUE"
  | "REJOIN_QUEUE"
  | "RETURN_TO_STAGE"
  | "PASS"
  | "IM_READY";

export type FreeRoamPresenceMode =
  | "GREEN_ROOM"
  | "SPECTATING_CURRENT"
  | "SPECTATING_OTHER"
  | "BROWSING"
  | "WITHDRAWN"
  | "LEAVE_PENDING"
  | "ON_STAGE"
  | "CALLED_WHILE_AWAY"
  | "PASSED_NOT_READY"
  | "READY_AGAIN";

export type QueueMembershipState =
  | "ACTIVE_MEMBER"
  | "AWAY_MEMBER"
  | "FORFEITED"
  | "NONE";

export type QueueEffect = {
  withdrawsFromQueue: boolean;
  preservesQueuePosition: boolean;
  restoresPreservedPosition: boolean;
  appendsToTail: boolean;
  grantsStagePublish: false;
  grantsWhisper: false;
  remountsUnrelatedStreams: false;
  usesCanonicalMonitors: true;
  requiresServerConfirmBeforeUiComplete: boolean;
  reason: string;
};

export function resolveFreeRoamQueueEffect(action: FreeRoamAction): QueueEffect {
  const base = {
    grantsStagePublish: false as const,
    grantsWhisper: false as const,
    remountsUnrelatedStreams: false as const,
    usesCanonicalMonitors: true as const,
  };

  switch (action) {
    case "SPECTATE_CURRENT":
    case "SPECTATE_OTHER":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: true,
        restoresPreservedPosition: false,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: false,
        reason: "Spectating keeps queue membership; view-only (no stage publish)",
      };
    case "JUMP_OUT":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: true,
        restoresPreservedPosition: false,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: false,
        reason: "Leaving the room — not the line; queue membership preserved",
      };
    case "JUMP_BACK_IN":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: true,
        restoresPreservedPosition: true,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: true,
        reason: "Resume existing membership only — never restore a forfeited seat",
      };
    case "LEAVE_QUEUE":
      return {
        ...base,
        withdrawsFromQueue: true,
        preservesQueuePosition: false,
        restoresPreservedPosition: false,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: true,
        reason: "Immediate forfeiture of active queue entry — remaining waiters advance in place",
      };
    case "REJOIN_QUEUE":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: false,
        restoresPreservedPosition: false,
        appendsToTail: true,
        requiresServerConfirmBeforeUiComplete: true,
        reason: "New tail entry after leave or elimination (e.g. was #2/10 → rejoin as last)",
      };
    case "RETURN_TO_STAGE":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: true,
        restoresPreservedPosition: true,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: true,
        reason: "Server-authorized call-up while browsing — return action only",
      };
    case "PASS":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: false,
        restoresPreservedPosition: false,
        appendsToTail: true,
        requiresServerConfirmBeforeUiComplete: true,
        reason:
          "PASS / NOT READY — stay enrolled; move to queue tail (not Leave; not match loss)",
      };
    case "IM_READY":
      return {
        ...base,
        withdrawsFromQueue: false,
        preservesQueuePosition: true,
        restoresPreservedPosition: true,
        appendsToTail: false,
        requiresServerConfirmBeforeUiComplete: true,
        reason:
          "I'M READY — READY_AGAIN at current seat; server owns next fair call-up (no client force)",
      };
  }
}

/**
 * Jump Back In is illegal after Leave Queue / forfeit.
 * Must use REJOIN QUEUE (tail) instead.
 */
export function mayJumpBackIn(membership: QueueMembershipState): {
  allowed: boolean;
  reason: string;
} {
  if (membership === "FORFEITED") {
    return {
      allowed: false,
      reason: "Leave Queue forfeited the seat — use Rejoin Queue (back of line)",
    };
  }
  if (membership === "NONE") {
    return {
      allowed: false,
      reason: "Not in the challenger queue — use Rejoin Queue",
    };
  }
  return {
    allowed: true,
    reason: "Active or away member — resume existing server-confirmed position",
  };
}

/**
 * Pure FIFO helper: remove performer; remaining keep relative order; reindex 0..n-1.
 * Rejoin is a separate append-to-tail step.
 */
export function applyLeaveQueueToLine(
  queue: ReadonlyArray<{ performerId: string; position: number }>,
  performerId: string,
): {
  ok: true;
  removed: boolean;
  queue: Array<{ performerId: string; position: number }>;
} {
  const filtered = queue.filter((e) => e.performerId !== performerId);
  const next = filtered.map((e, i) => ({ performerId: e.performerId, position: i }));
  return { ok: true, removed: filtered.length !== queue.length, queue: next };
}

/** Append rejoining performer at current tail (never restore prior index). */
export function applyRejoinAtTail(
  queue: ReadonlyArray<{ performerId: string; position: number }>,
  performerId: string,
):
  | { ok: true; queue: Array<{ performerId: string; position: number }>; position: number }
  | { ok: false; error: "DUPLICATE_QUEUE_ENTRY" } {
  if (queue.some((e) => e.performerId === performerId)) {
    return { ok: false, error: "DUPLICATE_QUEUE_ENTRY" };
  }
  const position = queue.length;
  return {
    ok: true,
    position,
    queue: [...queue.map((e) => ({ ...e })), { performerId, position }],
  };
}

export type RejoinTrigger =
  | { kind: "ELIMINATION"; eliminationKind: EliminationKind }
  | { kind: "WITHDRAWAL" };

/** Rejoin after elimination OR explicit leave — always tail, never prior slot. */
export function mayRejoinAfterFreeRoam(input: {
  performerId: string;
  roomId: string;
  trigger: RejoinTrigger;
  safetyBlocked?: boolean;
  misconductDisqualified?: boolean;
  eventDisqualified?: boolean;
  accountRestricted?: boolean;
  alreadyHasActiveQueueEntry?: boolean;
}): InstantReEntryEligibility {
  if (input.trigger.kind === "WITHDRAWAL") {
    if (input.alreadyHasActiveQueueEntry) {
      return {
        allowed: false,
        reason: "Already has one active queue entry",
        appendToTailOnly: true,
        restorePriorQueuePosition: false,
        grantStagePublish: false,
        grantWhisperAutomatically: false,
        preserveAudienceMonitor: true,
        preserveXpHistoryAndResults: true,
      };
    }
    if (
      input.safetyBlocked ||
      input.misconductDisqualified ||
      input.eventDisqualified ||
      input.accountRestricted
    ) {
      return {
        allowed: false,
        reason: "Restriction blocks re-entry",
        appendToTailOnly: true,
        restorePriorQueuePosition: false,
        grantStagePublish: false,
        grantWhisperAutomatically: false,
        preserveAudienceMonitor: true,
        preserveXpHistoryAndResults: true,
      };
    }
    return {
      allowed: true,
      reason: "Withdrawal rejoin — append to end of challenger queue",
      appendToTailOnly: true,
      restorePriorQueuePosition: false,
      grantStagePublish: false,
      grantWhisperAutomatically: false,
      preserveAudienceMonitor: true,
      preserveXpHistoryAndResults: true,
    };
  }

  return mayRejoinChallengerQueue({
    performerId: input.performerId,
    roomId: input.roomId,
    eliminationKind: input.trigger.eliminationKind,
    safetyBlocked: input.safetyBlocked,
    misconductDisqualified: input.misconductDisqualified,
    eventDisqualified: input.eventDisqualified,
    accountRestricted: input.accountRestricted,
    alreadyHasActiveQueueEntry: input.alreadyHasActiveQueueEntry,
  });
}

/** Canonical explore destinations — no second spectator player. */
export const FREE_ROAM_EXPLORE_DESTINATIONS = {
  lobbyWall: "/live/lobby-wall",
  liveHome: "/home/3",
  discovery: "/home/1-2",
} as const;
