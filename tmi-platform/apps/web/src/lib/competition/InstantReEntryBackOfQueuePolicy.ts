/**
 * Instant Re-Entry / Back-of-Queue Competition Law
 *
 * After elimination (match loss, BO3 loss, authorized stall takeover, call-up
 * forfeiture, or format-defined single-round elimination), an eligible performer
 * may rejoin immediately — appended to the END of the challenger queue.
 *
 * Does NOT activate server promotion or SFU takeover. Claude owns durable queue
 * + stage publication revocation. This module is the shared eligibility contract
 * for HUD + future server transactions.
 *
 * Losing one round of an ongoing best-of-three is NOT elimination.
 */

export const INSTANT_REENTRY_POLICY_ID = "INSTANT_REENTRY_BACK_OF_QUEUE_v1" as const;

export const NEW_REENTRY_QUEUE_ENGINE = false as const;
export const ORDINARY_ELIMINATION_COOLDOWN_MS = 0 as const;
export const LINE_JUMPING_FORBIDDEN = true as const;
export const DUPLICATE_QUEUE_ENTRY_FORBIDDEN = true as const;
export const REJOIN_AUTO_GRANTS_STAGE_PUBLISH = 0 as const;
export const REJOIN_AUTO_GRANTS_WHISPER = 0 as const;
export const AUDIENCE_MONITOR_STAYS_CONNECTED = true as const;

export type EliminationKind =
  | "SINGLE_ROUND_ELIMINATION"
  | "MATCH_LOSS"
  | "BEST_OF_THREE_LOSS"
  | "ANTI_STALL_TAKEOVER"
  | "CALL_UP_FORFEIT"
  /** Continuing BO3 — not eliminated; must not offer REJOIN QUEUE. */
  | "BEST_OF_THREE_ROUND_LOSS_NOT_ELIMINATED";

export type InstantReEntryEligibility = {
  allowed: boolean;
  reason: string;
  appendToTailOnly: true;
  restorePriorQueuePosition: false;
  grantStagePublish: false;
  grantWhisperAutomatically: false;
  preserveAudienceMonitor: true;
  preserveXpHistoryAndResults: true;
};

export type InstantReEntryInput = {
  performerId: string;
  roomId: string;
  eliminationKind: EliminationKind;
  safetyBlocked?: boolean;
  misconductDisqualified?: boolean;
  eventDisqualified?: boolean;
  accountRestricted?: boolean;
  alreadyHasActiveQueueEntry?: boolean;
};

const ELIMINATION_TRIGGERS: ReadonlySet<EliminationKind> = new Set([
  "SINGLE_ROUND_ELIMINATION",
  "MATCH_LOSS",
  "BEST_OF_THREE_LOSS",
  "ANTI_STALL_TAKEOVER",
  "CALL_UP_FORFEIT",
]);

export function isEliminationForReentry(kind: EliminationKind): boolean {
  return ELIMINATION_TRIGGERS.has(kind);
}

export function mayRejoinChallengerQueue(input: InstantReEntryInput): InstantReEntryEligibility {
  const base = {
    appendToTailOnly: true as const,
    restorePriorQueuePosition: false as const,
    grantStagePublish: false as const,
    grantWhisperAutomatically: false as const,
    preserveAudienceMonitor: true as const,
    preserveXpHistoryAndResults: true as const,
  };

  if (input.eliminationKind === "BEST_OF_THREE_ROUND_LOSS_NOT_ELIMINATED") {
    return {
      ...base,
      allowed: false,
      reason: "Best-of-three round loss is not elimination — match continues",
    };
  }

  if (!isEliminationForReentry(input.eliminationKind)) {
    return { ...base, allowed: false, reason: "Not an elimination trigger" };
  }

  if (input.safetyBlocked) {
    return { ...base, allowed: false, reason: "Safety restriction blocks re-entry" };
  }
  if (input.misconductDisqualified) {
    return { ...base, allowed: false, reason: "Misconduct disqualification" };
  }
  if (input.eventDisqualified) {
    return { ...base, allowed: false, reason: "Event-specific disqualification" };
  }
  if (input.accountRestricted) {
    return { ...base, allowed: false, reason: "Account restriction" };
  }
  if (input.alreadyHasActiveQueueEntry) {
    return { ...base, allowed: false, reason: "Already has one active queue entry" };
  }

  return {
    ...base,
    allowed: true,
    reason: "Eligible — append to end of challenger queue; no stage publish until promotion",
  };
}

/**
 * Pure queue helper: append performer to tail; reject duplicates; never restore
 * prior index. Used by unit tests and as the contract Claude's durable txn must mirror.
 */
export function appendChallengerToQueueTail(
  queue: ReadonlyArray<{ performerId: string; position: number }>,
  performerId: string,
): { ok: true; queue: Array<{ performerId: string; position: number }> } | { ok: false; error: string } {
  if (queue.some((e) => e.performerId === performerId)) {
    return { ok: false, error: "DUPLICATE_QUEUE_ENTRY" };
  }
  const next = queue.map((e) => ({ ...e }));
  next.push({ performerId, position: next.length });
  return { ok: true, queue: next };
}
