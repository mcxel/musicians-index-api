import { getActiveSessions, type StreamCategory } from "@/lib/broadcast/globalLiveSessionStore";
import { getAnchorBySlug, type AnchorCategory } from "@/lib/live/AnchorRoomRegistry";
import { getVenueAsset, slugToVenueType, type VenueType } from "@/lib/venues/VenueAssetRegistry";

export type VenueResolutionSource =
  | "explicit-category"
  | "live-session"
  | "anchor-room"
  | "slug-inference"
  | "fallback-default";

export type ResolvedRoomVenueRuntime = {
  venueType: VenueType | null;
  venueIndex: 0 | 1 | 2 | 3 | 4 | 5 | null;
  source: VenueResolutionSource;
  fallbackUsed: boolean;
  fallbackReason: string | null;
  unavailable: boolean;
};

function mapStreamCategoryToVenueType(category: StreamCategory): VenueType {
  switch (category) {
    case "battle":
      return "battle";
    case "cypher":
      return "cypher";
    case "challenge":
      return "challenge";
    case "lounge":
      return "lounge";
    case "game":
      return "deal-or-feud";
    case "concert":
      return "concert";
    case "session":
      return "listening-party";
    case "live":
    default:
      return "concert";
  }
}

function mapAnchorCategoryToVenueType(category: AnchorCategory): VenueType {
  switch (category) {
    case "BATTLE":
      return "battle";
    case "CYPHER":
      return "cypher";
    case "SONG_CHALLENGE":
      return "challenge";
    case "LOUNGE":
      return "lounge";
    case "WORLD_DANCE":
      return "world-dance-party";
    case "GAME_SHOW":
      return "deal-or-feud";
    case "FAN_LOBBY":
    default:
      return "fan-lobby";
  }
}

function hasMeaningfulSlugSignal(roomId: string): boolean {
  const s = roomId.toLowerCase();
  return /(battle|cypher|challenge|lounge|vip|monday|concert|release|listening|fan-lobby|avatar-lobby|dance|feud|deal|game-show|game)/.test(s);
}

const ROOM_VENUE_OVERRIDES: Record<string, VenueType> = {
  "test-room": "monday-night-stage",
  "test-room-g1b": "monday-night-stage",
  "monday-night-stage": "monday-night-stage",
  "world-dance-party": "world-dance-party",
  "slow-jams": "listening-party",
  "battle-thunder-dome": "battle",
  "cypher-freestyle": "cypher",
  "lounge-playlist": "lounge",
  "game-show-deal-or-feud": "deal-or-feud",
};

function buildResolved(venueType: VenueType, source: VenueResolutionSource, fallbackReason: string | null): ResolvedRoomVenueRuntime {
  const venueIndex = getVenueAsset(venueType).venueIndex;
  return {
    venueType,
    venueIndex,
    source,
    fallbackUsed: source === "fallback-default",
    fallbackReason,
    unavailable: false,
  };
}

function buildUnavailable(source: VenueResolutionSource, fallbackReason: string): ResolvedRoomVenueRuntime {
  return {
    venueType: null,
    venueIndex: null,
    source,
    fallbackUsed: true,
    fallbackReason,
    unavailable: true,
  };
}

export function resolveRoomVenueRuntime(input: {
  roomId: string;
  categoryHint?: string | null;
}): ResolvedRoomVenueRuntime {
  const roomId = input.roomId.trim();
  const hint = String(input.categoryHint ?? "").trim().toLowerCase();
  const roomKey = roomId.toLowerCase();

  const explicitRoomVenue = ROOM_VENUE_OVERRIDES[roomKey];
  if (explicitRoomVenue) {
    return buildResolved(explicitRoomVenue, "slug-inference", null);
  }

  if (hint === "battle") return buildResolved("battle", "explicit-category", null);
  if (hint === "cypher") return buildResolved("cypher", "explicit-category", null);
  if (hint === "challenge") return buildResolved("challenge", "explicit-category", null);
  if (hint === "lounge") return buildResolved("lounge", "explicit-category", null);
  if (hint === "game") return buildResolved("deal-or-feud", "explicit-category", null);
  if (hint === "fan-lobby") return buildResolved("fan-lobby", "explicit-category", null);

  const liveSession = getActiveSessions().find((s) => s.roomId === roomId);
  if (liveSession) {
    return buildResolved(mapStreamCategoryToVenueType(liveSession.category), "live-session", null);
  }

  const anchor = getAnchorBySlug(roomId);
  if (anchor) {
    return buildResolved(mapAnchorCategoryToVenueType(anchor.category), "anchor-room", null);
  }

  if (hasMeaningfulSlugSignal(roomId)) {
    return buildResolved(slugToVenueType(roomId), "slug-inference", null);
  }

  return buildUnavailable("fallback-default", "no_room_to_venue_mapping");
}

// ============================================================================
// PERMANENT LAW: SHOW CONTINUITY DURING VENUE MAINTENANCE / REDESIGN
// "TMI CAN RENOVATE THE BUILDING WITHOUT CANCELLING THE SHOW."
// ============================================================================

export type VenueEnvironmentAvailabilityState =
  | "VENUE_AVAILABLE"
  | "VENUE_MAINTENANCE"
  | "VENUE_UPGRADING"
  | "VENUE_UNAVAILABLE"
  | "DEVICE_FALLBACK";

export type PresentationModeAdapter =
  | "PROJECTION_VIDEO_PANEL"
  | "FULL_3D_VENUE"
  | "MOBILE_LIGHTWEIGHT"
  | "ACCESSIBILITY_REDUCED_RENDER";

export const VENUE_INDEPENDENT_PROJECTION_LAWS = {
  showStateSeparateFromVenueState: true,
  projectionFallbackPermanent: true,
  buildingRenovationWithoutShowCancellation: true,
  duplicateSessionCreatedDuringFallback: false,
  liveVenueHotRestoreStatus: "FUTURE / NOT YET IMPLEMENTED",
} as const;

export interface VenuePresentationFallbackResolution {
  roomId: string;
  sessionId: string;
  venueState: VenueEnvironmentAvailabilityState;
  presentationMode: PresentationModeAdapter;
  showSurvives: boolean;
  webrtcPreserved: boolean;
  participantsPreserved: boolean;
  timerScoreRoundPreserved: boolean;
  chatPreserved: boolean;
  reactionsPreserved: boolean;
  votingPreserved: boolean;
  tipsPreserved: boolean;
  overlaysPreserved: boolean;
  duplicateSessionCreated: false;
  memberNotice: string | null;
}

/**
 * Resolves presentation adapter mode while guaranteeing show continuity.
 * When a venue is undergoing maintenance, upgrading, or is unavailable, the
 * show continues in canonical high-impact projection / video-panel mode
 * without dropping WebRTC, chat, timer, votes, or participants.
 */
export function resolveVenuePresentationMode(params: {
  roomId: string;
  sessionId?: string;
  venueState?: VenueEnvironmentAvailabilityState;
  isDeviceLowEnd?: boolean;
  userPreference?: PresentationModeAdapter;
}): VenuePresentationFallbackResolution {
  const venueState = params.venueState ?? "VENUE_AVAILABLE";
  const sessionId = params.sessionId ?? `session-${params.roomId}`;

  const isFallbackRequired =
    venueState === "VENUE_MAINTENANCE" ||
    venueState === "VENUE_UPGRADING" ||
    venueState === "VENUE_UNAVAILABLE" ||
    venueState === "DEVICE_FALLBACK" ||
    Boolean(params.isDeviceLowEnd);

  const presentationMode: PresentationModeAdapter = isFallbackRequired
    ? "PROJECTION_VIDEO_PANEL"
    : (params.userPreference ?? "FULL_3D_VENUE");

  let memberNotice: string | null = null;
  if (venueState === "VENUE_MAINTENANCE") {
    memberNotice = "Stage environment undergoing routine optimization. Show is streaming live in HD video-panel projection mode.";
  } else if (venueState === "VENUE_UPGRADING") {
    memberNotice = "Stage environment receiving visual enhancements. Show continues uninterrupted in projection mode.";
  } else if (venueState === "DEVICE_FALLBACK") {
    memberNotice = "Optimized lightweight projection mode active for your device.";
  }

  return {
    roomId: params.roomId,
    sessionId,
    venueState,
    presentationMode,
    showSurvives: true,
    webrtcPreserved: true,
    participantsPreserved: true,
    timerScoreRoundPreserved: true,
    chatPreserved: true,
    reactionsPreserved: true,
    votingPreserved: true,
    tipsPreserved: true,
    overlaysPreserved: true,
    duplicateSessionCreated: false,
    memberNotice,
  };
}

/**
 * Participant promotion contract:
 * Promotes a spectator to an authorized live performer/challenger without
 * destroying or duplicating the authoritative live session.
 */
export interface ParticipantPromotionContract {
  sessionId: string;
  roomId: string;
  userId: string;
  fromRole: "SPECTATOR" | "AUDIENCE";
  toRole: "PERFORMER" | "CHALLENGER" | "DANCER";
  promotedAt: number;
  assignedPanel: string;
  mediaStreamId: string;
  sameSessionPreserved: true;
}

export function promoteSpectatorToParticipant(params: {
  sessionId: string;
  roomId: string;
  userId: string;
  targetRole: "PERFORMER" | "CHALLENGER" | "DANCER";
  assignedPanel: string;
  mediaStreamId: string;
}): ParticipantPromotionContract {
  return {
    sessionId: params.sessionId,
    roomId: params.roomId,
    userId: params.userId,
    fromRole: "SPECTATOR",
    toRole: params.targetRole,
    promotedAt: Date.now(),
    assignedPanel: params.assignedPanel,
    mediaStreamId: params.mediaStreamId,
    sameSessionPreserved: true,
  };
}
