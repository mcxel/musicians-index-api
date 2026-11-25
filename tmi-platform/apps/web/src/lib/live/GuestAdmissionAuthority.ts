/**
 * Unified guest / challenger admission — ONE backstage prep infrastructure,
 * TWO admission authorities:
 *
 *   REGULAR LIVE  → HUMAN_HOST (performer Bring In / Instant on accept)
 *   COMPETITION   → AUTHORIZED_AUTOMATION (LiveChallengerQueuePolicy / competition engine)
 *
 * Reuses: backstagePublishGate, venueEntryModeLaw, LiveChallengerQueuePolicy.
 * Does NOT invent a second call/messaging/WebRTC stack.
 */

import { resolveBackstagePublish } from "@/lib/live/backstagePublishGate";
import type { ParticipationState } from "@/lib/live/ParticipationStateMachine";
import {
  COMPETITION_VENUE_ENTRY_POLICY,
  DEFAULT_VENUE_ENTRY_POLICY,
  type StageAdmissionAuthority,
  type VenueEntryPolicy,
} from "@/lib/live/venueEntryModeLaw";

export type GuestAdmissionMode = "REGULAR_LIVE" | "COMPETITION";

export type GuestInviteStatus =
  | "INVITED"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED"
  | "CANCELLED"
  | "BACKSTAGE"
  | "ADMITTED"
  | "LIVE"
  | "REMOVED"
  | "DISCONNECTED"
  | "LEFT";

export type GuestInviteRecord = {
  inviteId: string;
  roomId: string;
  liveSessionId: string;
  hostPerformerId: string;
  guestUserId: string;
  guestDisplayName: string;
  status: GuestInviteStatus;
  admissionMode: GuestAdmissionMode;
  instantOnAccept: boolean;
  mediaReady: boolean;
  guestConsentToBroadcast: boolean;
  panelSlotId: string | null;
  createdAtMs: number;
  updatedAtMs: number;
};

type ScopeKey = string;

const invites = new Map<string, GuestInviteRecord>();
const byRoom = new Map<ScopeKey, Set<string>>();

function roomKey(roomId: string, liveSessionId: string): ScopeKey {
  return `${roomId}::${liveSessionId}`;
}

function track(invite: GuestInviteRecord): void {
  invites.set(invite.inviteId, invite);
  const rk = roomKey(invite.roomId, invite.liveSessionId);
  let set = byRoom.get(rk);
  if (!set) {
    set = new Set();
    byRoom.set(rk, set);
  }
  set.add(invite.inviteId);
}

export function resolveAdmissionPolicyForExperience(
  experienceKind: string | null | undefined,
): { mode: GuestAdmissionMode; policy: VenueEntryPolicy } {
  const k = (experienceKind ?? "").toUpperCase();
  const competition =
    k.includes("BATTLE") ||
    k.includes("CHALLENGE") ||
    k.includes("CYPHER") ||
    k.includes("GAUNTLET") ||
    k.includes("SONG_CHALLENGE") ||
    k.includes("DIRTY_DOZENS") ||
    k.includes("TITLE");
  if (competition) {
    return { mode: "COMPETITION", policy: COMPETITION_VENUE_ENTRY_POLICY };
  }
  return { mode: "REGULAR_LIVE", policy: DEFAULT_VENUE_ENTRY_POLICY };
}

/** Champion/host guest veto must NEVER apply in competition mode. */
export function hostMayVetoAdmission(mode: GuestAdmissionMode): boolean {
  return mode === "REGULAR_LIVE";
}

export function createGuestInvite(input: {
  roomId: string;
  liveSessionId: string;
  hostPerformerId: string;
  guestUserId: string;
  guestDisplayName: string;
  experienceKind?: string | null;
  instantOnAccept?: boolean;
}): GuestInviteRecord {
  const { mode } = resolveAdmissionPolicyForExperience(input.experienceKind);
  const now = Date.now();
  const invite: GuestInviteRecord = {
    inviteId: `inv_${now}_${Math.random().toString(36).slice(2, 8)}`,
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
    hostPerformerId: input.hostPerformerId,
    guestUserId: input.guestUserId,
    guestDisplayName: input.guestDisplayName,
    status: "INVITED",
    admissionMode: mode,
    instantOnAccept: Boolean(input.instantOnAccept) && mode === "REGULAR_LIVE",
    mediaReady: false,
    guestConsentToBroadcast: false,
    panelSlotId: null,
    createdAtMs: now,
    updatedAtMs: now,
  };
  track(invite);
  return { ...invite };
}

export function acceptGuestInvite(
  inviteId: string,
  opts?: { mediaReady?: boolean; consentToBroadcast?: boolean },
): {
  ok: boolean;
  invite: GuestInviteRecord | null;
  reason: string;
  publiclyVisible: false;
} {
  const inv = invites.get(inviteId);
  if (!inv) return { ok: false, invite: null, reason: "INVITE_NOT_FOUND", publiclyVisible: false };
  if (inv.status !== "INVITED") {
    return { ok: false, invite: { ...inv }, reason: `INVALID_STATUS_${inv.status}`, publiclyVisible: false };
  }
  inv.status = "ACCEPTED";
  inv.mediaReady = opts?.mediaReady ?? false;
  inv.guestConsentToBroadcast = opts?.consentToBroadcast ?? false;
  inv.updatedAtMs = Date.now();

  // Enter private backstage — never public solely from accept
  inv.status = "BACKSTAGE";
  track(inv);

  if (inv.instantOnAccept && inv.admissionMode === "REGULAR_LIVE") {
    const admitted = admitGuestFromBackstage({
      inviteId,
      hostAuthorized: true,
      panelSlotId: `guest-panel:${inv.guestUserId}`,
      participationState: inv.mediaReady ? "READY" : "QUEUED",
    });
    return {
      ok: admitted.ok,
      invite: admitted.invite,
      reason: admitted.ok ? "INSTANT_ADMIT_AFTER_ACCEPT" : admitted.reason,
      publiclyVisible: false,
    };
  }

  return {
    ok: true,
    invite: { ...inv },
    reason: "BACKSTAGE_PRIVATE",
    publiclyVisible: false,
  };
}

export function admitGuestFromBackstage(input: {
  inviteId: string;
  hostAuthorized: boolean;
  panelSlotId: string;
  participationState?: ParticipationState;
}): {
  ok: boolean;
  invite: GuestInviteRecord | null;
  reason: string;
  authority: StageAdmissionAuthority;
} {
  const inv = invites.get(input.inviteId);
  if (!inv) return { ok: false, invite: null, reason: "INVITE_NOT_FOUND", authority: "HUMAN_HOST" };

  const authority: StageAdmissionAuthority =
    inv.admissionMode === "COMPETITION" ? "AUTHORIZED_AUTOMATION" : "HUMAN_HOST";

  if (inv.admissionMode === "REGULAR_LIVE" && !input.hostAuthorized) {
    return { ok: false, invite: { ...inv }, reason: "HOST_APPROVAL_REQUIRED", authority };
  }
  if (inv.admissionMode === "COMPETITION" && hostMayVetoAdmission(inv.admissionMode)) {
    // unreachable — competition never allows host veto
  }

  const gate = resolveBackstagePublish({
    roomId: inv.roomId,
    participantId: inv.guestUserId,
    participationState: input.participationState ?? (inv.mediaReady ? "READY" : "QUEUED"),
    guestAcceptedInvite: inv.status === "BACKSTAGE" || inv.status === "ACCEPTED" || inv.status === "ADMITTED",
    guestConsentToBroadcast: inv.guestConsentToBroadcast || inv.admissionMode === "COMPETITION",
    mediaReady: inv.mediaReady || inv.admissionMode === "COMPETITION",
    hostAuthorizedAdmission: inv.admissionMode === "REGULAR_LIVE" ? input.hostAuthorized : false,
    admissionAuthority: authority,
    automationAuthorized: inv.admissionMode === "COMPETITION",
  });

  if (!gate.mayPublishToProgram) {
    return { ok: false, invite: { ...inv }, reason: gate.reason, authority };
  }

  inv.status = "ADMITTED";
  inv.panelSlotId = input.panelSlotId;
  inv.updatedAtMs = Date.now();
  track(inv);
  return { ok: true, invite: { ...inv }, reason: "ADMITTED_TO_PANEL", authority };
}

/** Competition auto-promote — host veto ignored. */
export function promoteCompetitionChallenger(input: {
  roomId: string;
  liveSessionId: string;
  hostPerformerId: string;
  challengerUserId: string;
  challengerDisplayName: string;
  panelSlotId: string;
  mediaReady: boolean;
}): {
  ok: boolean;
  invite: GuestInviteRecord;
  reason: string;
  hostVetoAllowed: false;
} {
  const invite = createGuestInvite({
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
    hostPerformerId: input.hostPerformerId,
    guestUserId: input.challengerUserId,
    guestDisplayName: input.challengerDisplayName,
    experienceKind: "BATTLE",
    instantOnAccept: false,
  });
  invite.status = "BACKSTAGE";
  invite.mediaReady = input.mediaReady;
  invite.guestConsentToBroadcast = true;
  track(invite);

  const admitted = admitGuestFromBackstage({
    inviteId: invite.inviteId,
    hostAuthorized: false, // ignored — automation authority
    panelSlotId: input.panelSlotId,
    participationState: input.mediaReady ? "READY" : "ON_STAGE",
  });

  return {
    ok: admitted.ok,
    invite: admitted.invite ?? invite,
    reason: admitted.ok ? "COMPETITION_AUTO_PROMOTE" : admitted.reason,
    hostVetoAllowed: false,
  };
}

export function returnGuestToBackstage(inviteId: string): GuestInviteRecord | null {
  const inv = invites.get(inviteId);
  if (!inv) return null;
  inv.status = "BACKSTAGE";
  inv.panelSlotId = null;
  inv.updatedAtMs = Date.now();
  track(inv);
  return { ...inv };
}

export function removeGuest(inviteId: string): GuestInviteRecord | null {
  const inv = invites.get(inviteId);
  if (!inv) return null;
  inv.status = "REMOVED";
  inv.panelSlotId = null;
  inv.updatedAtMs = Date.now();
  track(inv);
  return { ...inv };
}

export function listWaitingBackstage(
  roomId: string,
  liveSessionId: string,
): GuestInviteRecord[] {
  const set = byRoom.get(roomKey(roomId, liveSessionId));
  if (!set) return [];
  return [...set]
    .map((id) => invites.get(id))
    .filter((i): i is GuestInviteRecord => i !== undefined && i.status === "BACKSTAGE")
    .map((i) => ({ ...i }));
}

export function resetGuestAdmissionForTests(): void {
  invites.clear();
  byRoom.clear();
}
