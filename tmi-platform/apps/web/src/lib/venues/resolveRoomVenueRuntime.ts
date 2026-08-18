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
