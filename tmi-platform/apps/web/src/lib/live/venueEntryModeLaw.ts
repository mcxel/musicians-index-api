/**
 * Venue Entry Mode Law — one room authority, four entry modes, three operators.
 *
 * ROOM ENTRY ≠ STAGE ADMISSION.
 * WATCH/AUDIENCE stays separate from JOIN_STAGE/PARTICIPANT.
 * Host Go Live remains instant regardless of participant entry mode.
 *
 * Maps onto existing ParticipationStateMachine + LiveRoomEngine + HostRoomControlBridge.
 * Does not create a second venue/stage system.
 */

import type { RoomOwnershipModel } from "@/lib/live/ParticipationStateMachine";

/** How other participants reach the stage (not the host's own Go Live). */
export type VenueEntryMode =
  | "INSTANT_STAGE"
  | "HOST_APPROVAL"
  | "INVITED_DIRECT"
  | "QUEUE_SCHEDULED";

/** Who operates the event (automation changes operator, not which engine runs). */
export type EventOperatorMode = "TMI_AUTOMATED" | "HUMAN_HOSTED" | "HYBRID";

/** Who may admit a ready participant onto the live stage composition. */
export type StageAdmissionAuthority = "AUTHORIZED_AUTOMATION" | "HUMAN_HOST";

/** User intent at Lobby Wall / room entry — never inferred from account role alone. */
export type RoomJoinIntent = "WATCH" | "JOIN_STAGE";

export type VenueEntryPolicy = {
  venueEntryMode: VenueEntryMode;
  eventOperatorMode: EventOperatorMode;
  stageAdmissionAuthority: StageAdmissionAuthority;
};

export const DEFAULT_VENUE_ENTRY_POLICY: VenueEntryPolicy = {
  venueEntryMode: "HOST_APPROVAL",
  eventOperatorMode: "HUMAN_HOSTED",
  stageAdmissionAuthority: "HUMAN_HOST",
};

/** Competition defaults: queue + rules engine; operator still selectable. */
export const COMPETITION_VENUE_ENTRY_POLICY: VenueEntryPolicy = {
  venueEntryMode: "QUEUE_SCHEDULED",
  eventOperatorMode: "TMI_AUTOMATED",
  stageAdmissionAuthority: "AUTHORIZED_AUTOMATION",
};

export function normalizeVenueEntryMode(raw?: string | null): VenueEntryMode {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "INSTANT_STAGE" || v === "INSTANT" || v === "OPEN") return "INSTANT_STAGE";
  if (v === "INVITED_DIRECT" || v === "INVITED" || v === "DIRECT") return "INVITED_DIRECT";
  if (v === "QUEUE_SCHEDULED" || v === "QUEUE" || v === "SCHEDULED") return "QUEUE_SCHEDULED";
  return "HOST_APPROVAL";
}

export function normalizeEventOperatorMode(raw?: string | null): EventOperatorMode {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "TMI_AUTOMATED" || v === "BOT_AUTOMATED" || v === "AUTOMATED") return "TMI_AUTOMATED";
  if (v === "HYBRID") return "HYBRID";
  return "HUMAN_HOSTED";
}

export function normalizeStageAdmissionAuthority(
  raw?: string | null,
  operator?: EventOperatorMode,
): StageAdmissionAuthority {
  const v = (raw ?? "").trim().toUpperCase();
  if (v === "AUTHORIZED_AUTOMATION" || v === "AUTOMATION") return "AUTHORIZED_AUTOMATION";
  if (v === "HUMAN_HOST" || v === "HOST") return "HUMAN_HOST";
  if (operator === "TMI_AUTOMATED") return "AUTHORIZED_AUTOMATION";
  return "HUMAN_HOST";
}

export function resolveVenueEntryPolicy(input?: {
  venueEntryMode?: string | null;
  eventOperatorMode?: string | null;
  stageAdmissionAuthority?: string | null;
  roomKind?: string | null;
}): VenueEntryPolicy {
  const kind = (input?.roomKind ?? "").toLowerCase();
  const competition =
    kind === "battle" || kind === "cypher" || kind === "challenge" || kind === "contest";
  const base = competition ? COMPETITION_VENUE_ENTRY_POLICY : DEFAULT_VENUE_ENTRY_POLICY;
  const eventOperatorMode = input?.eventOperatorMode
    ? normalizeEventOperatorMode(input.eventOperatorMode)
    : base.eventOperatorMode;
  return {
    venueEntryMode: input?.venueEntryMode
      ? normalizeVenueEntryMode(input.venueEntryMode)
      : base.venueEntryMode,
    eventOperatorMode,
    stageAdmissionAuthority: normalizeStageAdmissionAuthority(
      input?.stageAdmissionAuthority,
      eventOperatorMode,
    ),
  };
}

/** Operator mode → existing ownership model (FanLobbyPresence / ParticipationStateMachine). */
export function operatorModeToOwnership(mode: EventOperatorMode): RoomOwnershipModel {
  if (mode === "TMI_AUTOMATED") return "bot_operated";
  return "human_owned";
}

/**
 * JOIN_STAGE path after WATCH is rejected.
 * Returns the participation initial state implied by venue entry mode.
 */
export function resolveJoinStageInitialState(input: {
  venueEntryMode: VenueEntryMode;
  isPreauthorizedInvite?: boolean;
  mediaReady?: boolean;
}): "SPECTATOR" | "REQUESTED" | "QUEUED" | "READY" | "ON_STAGE" {
  switch (input.venueEntryMode) {
    case "INSTANT_STAGE":
      return input.mediaReady === false ? "READY" : "ON_STAGE";
    case "INVITED_DIRECT":
      if (!input.isPreauthorizedInvite) return "REQUESTED";
      return input.mediaReady === false ? "READY" : "ON_STAGE";
    case "QUEUE_SCHEDULED":
      return "QUEUED";
    case "HOST_APPROVAL":
    default:
      return "REQUESTED";
  }
}

/** Host may change entry mode mid-show; existing participants are not disconnected. */
export function mayChangeVenueEntryModeDuringSession(): boolean {
  return true;
}

export function hostGoLiveIsAlwaysInstant(): boolean {
  return true;
}
