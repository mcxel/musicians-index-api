/**
 * CanonicalParticipantMediaAdapter — maps existing room participants
 * onto ParticipantMediaIdentity. No media acquisition, no invented tracks,
 * no invented spatial pods.
 */

import { defaultPersonalMediaRouter, type PersonalMediaRouter } from "./PersonalMediaRouter";
import type { ParticipantMediaIdentity } from "./types";

export type CanonicalParticipantMediaAdapterInput = {
  participantId: string;
  canonicalIdentityId: string;
  roomId: string;
  displayName?: string;
  spatialPodId?: string | null;
  videoTrackId?: string | null;
  audioTrackId?: string | null;
  /** Existing MediaStreamTrack only. MediaStream refs are ignored (not a track identity). */
  videoTrackRef?: unknown;
  audioTrackRef?: unknown;
};

function existingId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function trackIdFromRef(ref: unknown, kind: "audio" | "video"): string | null {
  if (!ref || typeof ref !== "object") return null;
  const rec = ref as { id?: unknown; kind?: unknown; getTracks?: unknown };
  if (typeof rec.getTracks === "function") {
    return null;
  }
  if (typeof rec.id !== "string" || rec.id.length === 0) return null;
  if (rec.kind != null && rec.kind !== kind) return null;
  return rec.id;
}

/**
 * Normalize an already-present room participant. Null tracks stay null.
 * spatialPodId is stored only when the caller already has one.
 */
export function adaptRoomParticipantToMediaIdentity(
  input: CanonicalParticipantMediaAdapterInput,
): ParticipantMediaIdentity {
  return {
    participantId: input.participantId,
    canonicalIdentityId: input.canonicalIdentityId,
    roomId: input.roomId,
    videoTrackId: existingId(input.videoTrackId) ?? trackIdFromRef(input.videoTrackRef, "video"),
    audioTrackId: existingId(input.audioTrackId) ?? trackIdFromRef(input.audioTrackRef, "audio"),
    spatialPodId: existingId(input.spatialPodId ?? null),
    displayName: input.displayName,
  };
}

export function registerAndAdaptParticipant(
  input: CanonicalParticipantMediaAdapterInput,
  router: PersonalMediaRouter = defaultPersonalMediaRouter,
): ParticipantMediaIdentity {
  return router.registerParticipant(adaptRoomParticipantToMediaIdentity(input));
}
