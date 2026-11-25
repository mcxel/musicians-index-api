/**
 * Interactive Room Capacity Law — 13 unique participant identities.
 *
 * Interactive members ≠ video tiles ≠ monitors ≠ challenger-queue entries ≠
 * broadcast spectators. One person in MY CAMERA + PERFORMER + AUDIENCE panels
 * still counts as one identity.
 *
 * Server admission (Claude) must enforce this. This module is the shared contract.
 * Preserves BACKSTAGE max 3 simultaneous on-stage guests separately.
 */

export const INTERACTIVE_ROOM_CAPACITY_POLICY_ID =
  "INTERACTIVE_ROOM_CAPACITY_13_v1" as const;

/** Max simultaneous interactive participant identities per room. */
export const MAX_INTERACTIVE_ROOM_MEMBERS = 13 as const;

/** Unchanged guest-on-stage cap (BackstageTransportService). */
export const MAX_SIMULTANEOUS_ON_STAGE_GUESTS = 3 as const;

/** 1–16 Voltron reference slots — not the same as interactive membership. */
export const MAX_VOLTRON_REFERENCE_SLOTS = 16 as const;

export const NEW_ROOM_CAPACITY_ENGINE = false as const;
export const QUEUE_CONSUMES_INTERACTIVE_SLOT = 0 as const;
export const SPECTATOR_CONSUMES_INTERACTIVE_SLOT = 0 as const;
export const MULTI_PANEL_COUNTS_MULTIPLE_IDENTITIES = 0 as const;

export type InteractiveAdmissionDecision =
  | {
      ok: true;
      action: "ADMIT" | "RECLAIM_EXISTING_SLOT";
      membersAfter: number;
      reason: string;
    }
  | {
      ok: false;
      action: "WAIT" | "UNAVAILABLE";
      membersAfter: number;
      reason: string;
    };

/**
 * Pure admission gate. Count unique authenticated identities already interactive.
 * Reconnect with same userId reclaims — never duplicates.
 */
export function evaluateInteractiveRoomAdmission(input: {
  currentMemberIds: ReadonlyArray<string>;
  joiningUserId: string;
  /** True when this join is a reconnect of an existing authorized slot. */
  isReconnect?: boolean;
  maxMembers?: number;
}): InteractiveAdmissionDecision {
  const max = input.maxMembers ?? MAX_INTERACTIVE_ROOM_MEMBERS;
  const unique = new Set(input.currentMemberIds.filter(Boolean));
  const already = unique.has(input.joiningUserId);

  if (already || input.isReconnect) {
    return {
      ok: true,
      action: "RECLAIM_EXISTING_SLOT",
      membersAfter: unique.size,
      reason: "Reconnect / existing identity — reclaim slot, do not double-count",
    };
  }

  if (unique.size >= max) {
    return {
      ok: false,
      action: "WAIT",
      membersAfter: unique.size,
      reason: `Room full (${unique.size}/${max} interactive members) — waiting / unavailable, not silent over-admit`,
    };
  }

  return {
    ok: true,
    action: "ADMIT",
    membersAfter: unique.size + 1,
    reason: `Admitted interactive member (${unique.size + 1}/${max})`,
  };
}

export function countUniqueIdentities(ids: ReadonlyArray<string>): number {
  return new Set(ids.filter(Boolean)).size;
}
