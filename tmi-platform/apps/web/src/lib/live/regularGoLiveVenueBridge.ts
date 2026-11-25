/**
 * Regular Go Live venue bridge — smallest connection authority.
 *
 * Occupancy stays in audienceRuntimeEngine.
 * World presence stays a projection (worldPresenceBridge).
 * Daily publish uses hubDailyPublisherSession (canonical unwired → now the
 * intended hub caller). No second transport.
 */

import {
  getCanonicalVenueRecipe,
  REGULAR_LIVE_RECIPE,
  type CanonicalVenueRecipe,
} from "@/lib/venues/CanonicalVenueRecipe";
import { fromAudienceAvatar, type AvatarEntity } from "@/lib/avatars/UnifiedAvatarRuntime";
import type { WorldPresenceSnapshot } from "@/lib/world/worldPresenceBridge";

export const REGULAR_LIVE_RECIPE_ID = "regular-live";

/** Was CANONICAL_UNWIRED (zero callers). Now the intended hub publisher. */
export const DAILY_PUBLISHER_CLASSIFICATION = "CANONICAL" as const;

export type RegularGoLiveProgramBinding = {
  sessionId: string;
  performerParticipantId: string;
  mediaSourceId: "PROGRAM.PERFORMER_CAMERA";
  displaySurface: "VENUE_PROGRAM_SCREEN";
  presentationState: "LIVE" | "CAMERA_OFF" | "RECONNECTING" | "ENDED";
};

const FOREIGN_EXPERIENCES = [
  "battle",
  "cypher",
  "monday-night",
  "monday-stage",
  "dance",
  "fan-lobby",
  "fan_lobby",
];

export function isForeignRegularGoLiveExperience(value?: string | null): boolean {
  const key = String(value ?? "").toLowerCase();
  return FOREIGN_EXPERIENCES.some((token) => key.includes(token));
}

export function isRegularGoLiveExperience(
  experience?: string | null,
  roomId?: string | null,
): boolean {
  if (isForeignRegularGoLiveExperience(experience) || isForeignRegularGoLiveExperience(roomId)) {
    return false;
  }
  const blob = `${experience ?? ""} ${roomId ?? ""}`.toLowerCase();
  if (!blob.trim()) return true;
  return (
    blob.includes("live") ||
    blob.includes("regular") ||
    blob.includes("room-hub") ||
    blob.includes("concert") ||
    blob.includes("general") ||
    blob.includes("broadcast")
  );
}

export function resolveRegularGoLiveRecipe(
  experience?: string | null,
  roomId?: string | null,
): CanonicalVenueRecipe {
  if (isForeignRegularGoLiveExperience(experience)) {
    return getCanonicalVenueRecipe(experience);
  }
  if (isRegularGoLiveExperience(experience, roomId)) {
    return REGULAR_LIVE_RECIPE;
  }
  return getCanonicalVenueRecipe(experience || roomId);
}

export function shouldMountCanonicalVenueHouseForRegularLive(opts: {
  lounge?: boolean;
  performerLobby?: boolean;
  experience?: string | null;
  roomId?: string | null;
}): boolean {
  if (opts.lounge || opts.performerLobby) return false;
  return isRegularGoLiveExperience(opts.experience, opts.roomId);
}

export function regularLiveFanJoinPublishesMedia(): false {
  return false;
}

/** Host looking at their own house must not mint a fan occupancy row. */
export function regularLiveHostSkipsOccupancyJoin(isHostView: boolean): boolean {
  return isHostView;
}

/**
 * CAMERA PREVIEW ≠ DAILY PUBLISHER ≠ REMOTE SUBSCRIBER ≠ PROGRAM SCREEN.
 * Host house uses the already-captured preview; fans use the receive-only bind.
 */
export function resolveRegularLiveProgramMedia(opts: {
  isHostView: boolean;
  localPreview?: MediaStream | null;
  remoteSubscriber?: MediaStream | null;
}): MediaStream | null {
  if (opts.isHostView) return opts.localPreview ?? null;
  return opts.remoteSubscriber ?? null;
}

export function bindRegularLiveProgramIdentity(opts: {
  sessionId: string;
  performerParticipantId: string;
  hasPerformerTrack: boolean;
  reconnecting?: boolean;
  ended?: boolean;
}): RegularGoLiveProgramBinding {
  const presentationState: RegularGoLiveProgramBinding["presentationState"] = opts.ended
    ? "ENDED"
    : opts.reconnecting
      ? "RECONNECTING"
      : opts.hasPerformerTrack
        ? "LIVE"
        : "CAMERA_OFF";
  return {
    sessionId: opts.sessionId,
    performerParticipantId: opts.performerParticipantId,
    mediaSourceId: "PROGRAM.PERFORMER_CAMERA",
    displaySurface: "VENUE_PROGRAM_SCREEN",
    presentationState,
  };
}

function actionToAudienceState(presence: WorldPresenceSnapshot): string {
  if (presence.action === "CLAP") return "clapping";
  if (presence.action === "WAVE") return "waving";
  if (presence.action === "DANCE") return "dancing";
  if (presence.action === "WALK") return "walking";
  if (presence.posture === "seated") return "sitting";
  return "standing";
}

export function worldPresenceToAvatarEntity(presence: WorldPresenceSnapshot): AvatarEntity {
  const entity = fromAudienceAvatar(
    {
      userId: presence.participantId,
      displayName: presence.publicPersona.displayName,
      avatarImageUrl: presence.publicPersona.avatarUrl,
      seatId: presence.seatId ?? `wp-${presence.participantId}`,
      state: actionToAudienceState(presence),
      tier: "fan",
      isBot: presence.kind === "bot",
      joinedAt: presence.updatedAt,
    },
    presence.roomId,
  );
  return {
    ...entity,
    worldX: presence.position.x,
    worldY: presence.position.y,
    worldZ: presence.position.z,
    facing: presence.rotation.y,
    worldPosition: presence.posture === "seated" ? "seated" : "lobby",
  };
}

/**
 * One human population for Performer + Fan venue views.
 * Humans come only from world-presence projection (occupancy truth).
 * Bots/proxies may fill leftover visual seats and must yield those seats.
 */
export function mergeVenueAudienceEntities(
  worldPresence: WorldPresenceSnapshot[] | undefined,
  crowdEntities: AvatarEntity[],
): AvatarEntity[] {
  const humans = (worldPresence ?? [])
    .filter((p) => p.kind === "human")
    .map(worldPresenceToAvatarEntity);
  const humanIds = new Set(humans.map((h) => h.id));
  const humanSeats = new Set(humans.map((h) => h.seatId).filter((id): id is string => Boolean(id)));
  const proxies = crowdEntities.filter(
    (entity) =>
      entity.isBot &&
      !humanIds.has(entity.id) &&
      !(entity.seatId && humanSeats.has(entity.seatId)),
  );
  return [...humans, ...proxies];
}

export function selectHumanWorldPresence(
  worldPresence: WorldPresenceSnapshot[] | undefined,
): WorldPresenceSnapshot[] {
  return (worldPresence ?? []).filter((p) => p.kind === "human");
}
