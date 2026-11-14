/**
 * Backstage privacy — private by default; public publish is server-enforced.
 * Host UI alone must never leak backstage A/V into the program composition.
 */

import type { ParticipationState } from "@/lib/live/ParticipationStateMachine";
import type { StageAdmissionAuthority } from "@/lib/live/venueEntryModeLaw";

export type BackstagePublishRequest = {
  roomId: string;
  participantId: string;
  participationState: ParticipationState;
  guestAcceptedInvite: boolean;
  guestConsentToBroadcast: boolean;
  mediaReady: boolean;
  hostAuthorizedAdmission: boolean;
  admissionAuthority: StageAdmissionAuthority;
  automationAuthorized?: boolean;
  admissionToken?: string | null;
  admissionTokenExpiresAtMs?: number | null;
  nowMs?: number;
};

export type BackstagePublishDecision = {
  mayPublishToProgram: boolean;
  reason: string;
};

/**
 * Program composition publish gate.
 * Backstage / queued / requested participants stay private until all gates pass.
 */
export function resolveBackstagePublish(req: BackstagePublishRequest): BackstagePublishDecision {
  const now = req.nowMs ?? Date.now();
  if (!req.guestAcceptedInvite) {
    return { mayPublishToProgram: false, reason: "Guest has not accepted the invitation" };
  }
  if (!req.guestConsentToBroadcast) {
    return { mayPublishToProgram: false, reason: "Guest has not consented to public broadcast" };
  }
  if (!req.mediaReady) {
    return { mayPublishToProgram: false, reason: "Guest media is not ready" };
  }
  if (
    req.participationState !== "READY" &&
    req.participationState !== "ON_STAGE" &&
    req.participationState !== "ACTIVE"
  ) {
    return {
      mayPublishToProgram: false,
      reason: `Participation state ${req.participationState} is not stage-eligible`,
    };
  }
  if (req.admissionAuthority === "HUMAN_HOST" && !req.hostAuthorizedAdmission) {
    return { mayPublishToProgram: false, reason: "Host has not authorized stage admission" };
  }
  if (req.admissionAuthority === "AUTHORIZED_AUTOMATION" && !req.automationAuthorized) {
    return { mayPublishToProgram: false, reason: "Automation has not authorized stage admission" };
  }
  if (req.admissionToken) {
    const exp = req.admissionTokenExpiresAtMs;
    if (typeof exp === "number" && exp < now) {
      return { mayPublishToProgram: false, reason: "Admission token expired" };
    }
  } else if (req.participationState === "READY" || req.participationState === "ON_STAGE") {
    // READY/ON_STAGE without token still requires host/automation flag above.
  }
  return { mayPublishToProgram: true, reason: "Authorized for program composition" };
}
