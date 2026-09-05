// VenueAssetRegistry
// Single source of truth for every TMI room's canonical visual assets and
// environment configuration. These are NOT decoration — they are the
// art-direction blueprints that drove the reference videos in
// public/assets/videos/rooms/.
//
// Ambient loops — confirmed source↔deployed mappings (SHA-256 identical):
//   _Monday_Night stage video base.mp4  → monday-night-stage.mp4
//   Battles video base.mp4              → battle.mp4
//   Deal_vs_Feud_video base.mp4         → deal-or-feud.mp4
//   world ance party video base.mp4     → world-dance-party.mp4
//   Now_we_have_to_do_one_for_our (1)   → fan-lobby.mp4
//
// Fallbacks when no dedicated loop exists:
//   concert / world-concert / mini-concert -> monday-night-stage.mp4 (stage)
//   release-party / world-release -> world-dance-party.mp4 (party floor)
//   mini-release / listening-party -> lounge.mp4 (intimate room)
//
// lounge-variant.mp4 — distinct loop from the Yopho source set; wired to slow-jams.
// unassigned-loop-1..4.mp4 — new source loops not yet mapped to a room type;
//   listed in UNASSIGNED_VIDEO_LOOPS below pending review.
//
// Phase 5B mesh / walkable VenueRuntime stays IDLE.
//
// Rule 8 (Registry First): pages and components read FROM here.
// Rule 14 (No Empty Surface): every field has a fallback.
// Rule 20 (Reality Rule): no fabricated asset paths — only real files.
// Rule 21 (Venue Runtime Convergence): one runtime, venue type = mode.

/**
 * Declares what role a video asset plays in the room. A video may decorate,
 * preview, or display on a surface — it may never substitute for geometry,
 * collision, seating, participant presence, or the Venue HUD.
 *
 * REFERENCE_ONLY  — blueprint only; never rendered at runtime
 * AMBIENT_SURFACE — plays on an in-world wall / screen surface
 * FALLBACK_PREVIEW — temporary background while production 3D is unavailable
 * IN_WORLD_SCREEN  — plays on a specific prop or monitor inside the 3D world
 */
export type VenueVideoRole =
  | "REFERENCE_ONLY"
  | "AMBIENT_SURFACE"
  | "FALLBACK_PREVIEW"
  | "IN_WORLD_SCREEN";

export type VenueType =
  | "battle"
  | "challenge"
  | "cypher"
  | "deal-or-feud"
  | "fan-lobby"
  | "lounge"
  | "monday-night-stage"
  | "slow-jams"
  | "world-dance-party"
  | "concert"
  | "world-concert"
  | "mini-concert"
  | "release-party"
  | "world-release"
  | "mini-release"
  | "listening-party";

/**
 * Describes the physical environment geometry of a venue — used by
 * RoomEnvironmentLayer to position overlays, seats, panels, and lighting.
 */
export interface VenueGeometry {
  /** Stage is elevated above audience floor */
  hasElevatedStage: boolean;
  /** Number of audience seating tiers (1 = floor only, 2 = floor+balcony, etc.) */
  seatTiers: 1 | 2 | 3;
  /** Approximate capacity (display only — real seat count from SeatingMeshEngine) */
  displayCapacity: number;
  /** LED media wall positions */
  ledWalls: Array<"stage-back" | "stage-left" | "stage-right" | "ceiling" | "floor">;
  /** Where sponsor panels sit in this venue */
  sponsorZones: Array<"stage-apron" | "side-rail" | "entry-arch" | "seat-back">;
  /** Overhead lighting rig style */
  lightingRig: "arena-truss" | "theater-grid" | "club-ceiling" | "outdoor-rig" | "studio-grid";
  /** DJ booth or control position */
  controlBooth: "front-floor" | "stage-left" | "balcony-center" | "none";
  /** Entrance/exit path labels */
  entranceTunnel: "stage-left" | "rear-center" | "none";
  /** Whether there's a dedicated VIP zone */
  hasVipSection: boolean;
  /** Crowd layout type */
  audienceLayout: "stadium-bowl" | "theater-rows" | "circle-pit" | "floor-standing" | "lounge-tables";
}

export interface VenueHostConfig {
  /** Canonical host IDs from HostIdentityRegistry */
  primaryHostId: string;
  coHostIds?: string[];
  announcer?: string;
}

export interface VenueAsset {
  /** Unique venue type key */
  type: VenueType;
  /** Display name */
  label: string;
  /** Short 1-line descriptor */
  tagline: string;
  /** TMI neon accent color for this venue */
  accentColor: string;
  /** Secondary color for gradients/trim */
  secondaryColor: string;

  // --- Video assets ---
  /** Looping ambient environment video (idle/attract mode, muted) */
  ambientVideoUrl: string;
  /**
   * How this video may be used by runtime renderers.
   * Defaults to "FALLBACK_PREVIEW" — temporary background until production 3D ships.
   * Set to "REFERENCE_ONLY" to suppress runtime rendering entirely.
   */
  ambientVideoRole?: VenueVideoRole;
  /**
   * True once a production walkable 3D world exists for this venue type.
   * When true, RoomEnvironmentLayer must NOT render the ambient video as the
   * primary background — the 3D world takes precedence.
   */
  hasCanonical3DWorld?: boolean;
  /** Seating perspective from the audience (muted loop) */
  audienceViewVideoUrl?: string;
  /** Performer perspective looking out to audience */
  performerViewVideoUrl?: string;

  // --- Image assets ---
  /** Full-width banner for room headers, event cards, lobby marquees */
  bannerUrl?: string;
  /** Cypher/game-show specific panel art */
  panelArtUrl?: string;

  // --- Environment geometry ---
  geometry: VenueGeometry;

  // --- Host assignments ---
  hosts: VenueHostConfig;

  // --- AudienceScene venueIndex (maps to 3D crowd layout) ---
  /** 0=Theater 1=Arena 2=Club 3=Outdoor 4=Studio 5=Contest — matches AudienceScene VenueIndex */
  venueIndex: 0 | 1 | 2 | 3 | 4 | 5;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

const VENUE_REGISTRY: Record<VenueType, VenueAsset> = {
  "battle": {
    type: "battle",
    label: "Battle Arena",
    tagline: "Two take the stage. One leaves crowned.",
    accentColor: "#FF2DAA",
    secondaryColor: "#FFD700",
    ambientVideoUrl: "/assets/videos/rooms/battle.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-1.mp4",
    bannerUrl: "/assets/banners/banner-battle.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 3,
      displayCapacity: 18500,
      ledWalls: ["stage-back", "stage-left", "stage-right"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch"],
      lightingRig: "arena-truss",
      controlBooth: "stage-left",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "stadium-bowl",
    },
    hosts: {
      primaryHostId: "nova-mc",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 1,
  },

  "challenge": {
    type: "challenge",
    label: "Song Challenge Contest Stage",
    tagline: "Work vs work. Song vs song. Prove it live.",
    accentColor: "#FFB000",
    secondaryColor: "#00E5C8",
    ambientVideoUrl: "/assets/videos/rooms/challenge.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-2.mp4",
    bannerUrl: "/assets/banners/banner-challenges.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 2,
      displayCapacity: 8200,
      ledWalls: ["stage-back", "ceiling"],
      sponsorZones: ["stage-apron", "side-rail"],
      lightingRig: "outdoor-rig",
      controlBooth: "stage-left",
      entranceTunnel: "rear-center",
      hasVipSection: false,
      audienceLayout: "theater-rows",
    },
    hosts: {
      primaryHostId: "big-ace",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 5,
  },

  "cypher": {
    type: "cypher",
    label: "Cypher Circle",
    tagline: "Step in. Every bar counts.",
    accentColor: "#AA2DFF",
    secondaryColor: "#00FFFF",
    ambientVideoUrl: "/assets/videos/rooms/cypher.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-3.mp4",
    bannerUrl: "/assets/banners/banner-cyhpers.png",
    panelArtUrl: "/assets/banners/cypher-panel.jpg",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 2730,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling"],
      sponsorZones: ["side-rail"],
      lightingRig: "theater-grid",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "circle-pit",
    },
    hosts: {
      primaryHostId: "jack-obrien",
      coHostIds: ["hector-lvanos", "aura-pa"],
    },
    venueIndex: 0,
  },

  "deal-or-feud": {
    type: "deal-or-feud",
    label: "Deal or Feud 1000",
    tagline: "Risk it all. One deal changes everything.",
    accentColor: "#FFD700",
    secondaryColor: "#FF2DAA",
    ambientVideoUrl: "/assets/videos/rooms/deal-or-feud.mp4",
    bannerUrl: "/assets/banners/banner-games.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 2,
      displayCapacity: 5000,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling", "floor"],
      sponsorZones: ["stage-apron", "side-rail", "seat-back"],
      lightingRig: "studio-grid",
      controlBooth: "front-floor",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "theater-rows",
    },
    hosts: {
      primaryHostId: "bobby-stanley",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 0,
  },

  "fan-lobby": {
    type: "fan-lobby",
    label: "Fan Avatar Lobby",
    tagline: "Your space before the show. Make friends. Stay ready.",
    accentColor: "#00FFFF",
    secondaryColor: "#AA2DFF",
    ambientVideoUrl: "/assets/videos/rooms/fan-lobby.mp4",
    bannerUrl: "/assets/banners/banner-lobbies.png",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 500,
      ledWalls: ["ceiling", "stage-back"],
      sponsorZones: ["side-rail", "entry-arch"],
      lightingRig: "club-ceiling",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "lounge-tables",
    },
    hosts: {
      primaryHostId: "kira",
      coHostIds: ["bebo"],
    },
    venueIndex: 2,
  },

  "lounge": {
    type: "lounge",
    label: "VIP Lounge",
    tagline: "Low lights. Real conversations. No cameras required.",
    accentColor: "#AA2DFF",
    secondaryColor: "#FFD700",
    ambientVideoUrl: "/assets/videos/rooms/lounge.mp4",
    bannerUrl: "/assets/banners/banner-lounges.png",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 200,
      ledWalls: ["ceiling"],
      sponsorZones: ["side-rail"],
      lightingRig: "club-ceiling",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: true,
      audienceLayout: "lounge-tables",
    },
    hosts: {
      primaryHostId: "kira",
    },
    venueIndex: 2,
  },

  "monday-night-stage": {
    type: "monday-night-stage",
    label: "Monday Night Stage",
    tagline: "Every Monday. Every crown on the line.",
    accentColor: "#FFD700",
    secondaryColor: "#FF2DAA",
    ambientVideoUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-4.mp4",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 2,
      displayCapacity: 5000,
      ledWalls: ["stage-back", "stage-left", "stage-right"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch"],
      lightingRig: "theater-grid",
      controlBooth: "balcony-center",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "theater-rows",
    },
    hosts: {
      primaryHostId: "tiana",
      coHostIds: ["gregory-marcel", "aura-pa"],
    },
    venueIndex: 0,
  },

  "world-dance-party": {
    type: "world-dance-party",
    label: "World Dance Party",
    tagline: "BPM in sync. The whole world on the floor.",
    accentColor: "#FF2DAA",
    secondaryColor: "#00FFFF",
    ambientVideoUrl: "/assets/videos/rooms/world-dance-party.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    bannerUrl: "/assets/banners/banner-world_dance_party.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 1,
      displayCapacity: 10000,
      ledWalls: ["stage-back", "ceiling", "floor"],
      sponsorZones: ["stage-apron", "side-rail"],
      lightingRig: "arena-truss",
      controlBooth: "front-floor",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "floor-standing",
    },
    hosts: {
      primaryHostId: "record-ralph",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 1,
  },

  "concert": {
    type: "concert",
    label: "Live Concert",
    tagline: "Lights up. Stage hot. It's your time.",
    accentColor: "#FFD700",
    secondaryColor: "#AA2DFF",
    // fallback: no concert.mp4 — monday-night-stage is the stage loop
    ambientVideoUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-1.mp4",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 3,
      displayCapacity: 18500,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch"],
      lightingRig: "arena-truss",
      controlBooth: "stage-left",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "stadium-bowl",
    },
    hosts: {
      primaryHostId: "gregory-marcel",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 1,
  },

  "world-concert": {
    type: "world-concert",
    label: "World Concert",
    tagline: "The global stage. One night. Unlimited seats.",
    accentColor: "#00FFFF",
    secondaryColor: "#FFD700",
    // fallback: no world-concert.mp4 — monday-night-stage is the stage loop
    ambientVideoUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-2.mp4",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 3,
      displayCapacity: 50000,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch", "seat-back"],
      lightingRig: "arena-truss",
      controlBooth: "stage-left",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "stadium-bowl",
    },
    hosts: {
      primaryHostId: "big-ace",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 1,
  },

  "mini-concert": {
    type: "mini-concert",
    label: "Mini Concert",
    tagline: "Intimate. Live. Just you and the room.",
    accentColor: "#FFD700",
    secondaryColor: "#FF2DAA",
    // fallback: no mini-concert.mp4 — monday-night-stage is the stage loop
    ambientVideoUrl: "/assets/videos/rooms/monday-night-stage.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-3.mp4",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 1,
      displayCapacity: 500,
      ledWalls: ["stage-back", "stage-left", "stage-right"],
      sponsorZones: ["stage-apron", "side-rail"],
      lightingRig: "theater-grid",
      controlBooth: "stage-left",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "theater-rows",
    },
    hosts: {
      primaryHostId: "kira",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 0,
  },

  "release-party": {
    type: "release-party",
    label: "Release Party",
    tagline: "The drop is live. Be here when it happens.",
    accentColor: "#FF2DAA",
    secondaryColor: "#AA2DFF",
    // fallback: no release-party.mp4 — world-dance-party for party-floor energy
    ambientVideoUrl: "/assets/videos/rooms/world-dance-party.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    bannerUrl: "/assets/banners/banner-live_sessions.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 2,
      displayCapacity: 5000,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch"],
      lightingRig: "theater-grid",
      controlBooth: "stage-left",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "theater-rows",
    },
    hosts: {
      primaryHostId: "gregory-marcel",
      coHostIds: ["aura-pa"],
    },
    venueIndex: 0,
  },

  "world-release": {
    type: "world-release",
    label: "World Release Party",
    tagline: "Worldwide drop. Every timezone. One moment.",
    accentColor: "#AA2DFF",
    secondaryColor: "#FFD700",
    // fallback: no world-release.mp4 — world-dance-party for party-floor energy
    ambientVideoUrl: "/assets/videos/rooms/world-dance-party.mp4",
    audienceViewVideoUrl: "/assets/videos/seating/fans-view.mp4",
    bannerUrl: "/assets/banners/banner-live_sessions.png",
    geometry: {
      hasElevatedStage: true,
      seatTiers: 3,
      displayCapacity: 50000,
      ledWalls: ["stage-back", "stage-left", "stage-right", "ceiling"],
      sponsorZones: ["stage-apron", "side-rail", "entry-arch", "seat-back"],
      lightingRig: "arena-truss",
      controlBooth: "stage-left",
      entranceTunnel: "stage-left",
      hasVipSection: true,
      audienceLayout: "stadium-bowl",
    },
    hosts: {
      primaryHostId: "tiana",
      coHostIds: ["big-ace", "aura-pa"],
    },
    venueIndex: 1,
  },

  "mini-release": {
    type: "mini-release",
    label: "Mini Release Party",
    tagline: "Your circle. Your drop. Real crowd energy.",
    accentColor: "#00FFFF",
    secondaryColor: "#FF2DAA",
    // fallback: no mini-release.mp4 — lounge for intimate drop circle
    ambientVideoUrl: "/assets/videos/rooms/lounge.mp4",
    performerViewVideoUrl: "/assets/videos/seating/performer-view-4.mp4",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 200,
      ledWalls: ["stage-back", "ceiling"],
      sponsorZones: ["side-rail"],
      lightingRig: "studio-grid",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "lounge-tables",
    },
    hosts: {
      primaryHostId: "kira",
    },
    venueIndex: 2,
  },

  "slow-jams": {
    type: "slow-jams",
    label: "Sunday Slow Jams",
    tagline: "Smooth energy. Intimate audience. Music in the air.",
    accentColor: "#AA2DFF",
    secondaryColor: "#FFD700",
    ambientVideoUrl: "/assets/videos/rooms/lounge-variant.mp4",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 300,
      ledWalls: ["ceiling"],
      sponsorZones: ["side-rail"],
      lightingRig: "club-ceiling",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "lounge-tables",
    },
    hosts: {
      primaryHostId: "julius",
    },
    venueIndex: 2,
  },

  "listening-party": {
    type: "listening-party",
    label: "Listening Party",
    tagline: "Everyone hears it together. First listen. All reactions live.",
    accentColor: "#FFD700",
    secondaryColor: "#AA2DFF",
    // fallback: no listening-party.mp4 — lounge for listen-room vibe
    ambientVideoUrl: "/assets/videos/rooms/lounge.mp4",
    geometry: {
      hasElevatedStage: false,
      seatTiers: 1,
      displayCapacity: 500,
      ledWalls: ["ceiling"],
      sponsorZones: ["side-rail"],
      lightingRig: "club-ceiling",
      controlBooth: "none",
      entranceTunnel: "none",
      hasVipSection: false,
      audienceLayout: "lounge-tables",
    },
    hosts: {
      primaryHostId: "julius",
    },
    venueIndex: 2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export function getVenueAsset(type: VenueType): VenueAsset {
  const entry = VENUE_REGISTRY[type];
  // Inject contract defaults so callers never need to null-check role.
  return {
    ambientVideoRole: "FALLBACK_PREVIEW",
    hasCanonical3DWorld: false,
    ...entry,
  };
}

/** RoomEnvironmentLayer may render this as a temporary background layer. */
export function canRenderAsFallbackBackground(asset?: VenueAsset): boolean {
  return asset?.ambientVideoRole === "FALLBACK_PREVIEW" && !asset.hasCanonical3DWorld;
}

/** Video belongs on an in-world environmental mesh or surface. */
export function canRenderOnAmbientSurface(asset?: VenueAsset): boolean {
  return asset?.ambientVideoRole === "AMBIENT_SURFACE";
}

/** Video belongs on a canonical monitor, prop, or media-player inside the world. */
export function canRenderOnWorldScreen(asset?: VenueAsset): boolean {
  return asset?.ambientVideoRole === "IN_WORLD_SCREEN";
}

export function getAllVenueTypes(): VenueType[] {
  return Object.keys(VENUE_REGISTRY) as VenueType[];
}

/** Maps ArenaEventShell event types to VenueType */
export function arenaEventTypeToVenueType(
  eventType: "concert" | "battle" | "cypher" | "challenge" | "song-challenge" | "live-show" | "monday-stage" | "deal-or-feud" | "lounge" | "world-dance-party" | "slow-jams"
): VenueType {
  const map: Record<string, VenueType> = {
    concert:             "concert",
    battle:              "battle",
    cypher:              "cypher",
    challenge:           "challenge",
    "song-challenge":      "challenge",
    "live-show":         "concert",
    "monday-stage":      "monday-night-stage",
    "deal-or-feud":      "deal-or-feud",
    "lounge":            "lounge",
    "world-dance-party": "world-dance-party",
    "slow-jams":         "listening-party",
  };
  return map[eventType] ?? "concert";
}

/**
 * Maps a room slug to the canonical VenueType.
 * Used by LobbyTheaterShell and other slug-driven surfaces.
 */
export function slugToVenueType(slug: string): VenueType {
  const s = slug.toLowerCase();
  if (s.includes("world-concert") || s === "world-concert") return "world-concert";
  if (s.includes("mini-concert"))   return "mini-concert";
  if (s.includes("world-release") || s.includes("world-premiere")) return "world-release";
  if (s.includes("mini-release"))   return "mini-release";
  if (s.includes("release-party") || s.includes("new-release")) return "release-party";
  if (s.includes("listening-party") || s.includes("listening-session")) return "listening-party";
  if (s.includes("monday") || s.includes("monday-stage") || s.includes("monday-night")) return "monday-night-stage";
  if (s.includes("battle"))         return "battle";
  if (s.includes("cypher"))         return "cypher";
  if (s.includes("challenge"))      return "challenge";
  if (s.includes("deal") || s.includes("feud")) return "deal-or-feud";
  if (s.includes("dance-party") || s.includes("world-dance")) return "world-dance-party";
  if (s.includes("slow-jam")) return "listening-party";
  if (s.includes("fan-lobby") || s.includes("avatar-lobby")) return "fan-lobby";
  if (s.includes("lounge") || s.includes("vip")) return "lounge";
  return "concert"; // default for live shows
}

export type { VenueAsset as VenueAssetType };
export default VENUE_REGISTRY;

/**
 * Video loops present in public/assets/videos/rooms/ that are not yet
 * assigned to a specific VenueType. These come from the Yopho source set
 * and need design review before wiring to a room type.
 *
 * Source filenames (original, truncated by AI video tool):
 *   unassigned-loop-1 ← Now_let_s_get_another_one_of_t.mp4
 *   unassigned-loop-2 ← Now_let_s_get_another_one_of_t (2).mp4
 *   unassigned-loop-3 ← Our_venues_are_to_simulate_a_r.mp4
 *   unassigned-loop-4 ← We_need_one_where_everyone_s_e.mp4
 */
export const UNASSIGNED_VIDEO_LOOPS: ReadonlyArray<{
  url: string;
  sourceFilename: string;
}> = [
  {
    url: "/assets/videos/rooms/unassigned-loop-1.mp4",
    sourceFilename: "Now_let_s_get_another_one_of_t.mp4",
  },
  {
    url: "/assets/videos/rooms/unassigned-loop-2.mp4",
    sourceFilename: "Now_let_s_get_another_one_of_t (2).mp4",
  },
  {
    url: "/assets/videos/rooms/unassigned-loop-3.mp4",
    sourceFilename: "Our_venues_are_to_simulate_a_r.mp4",
  },
  {
    url: "/assets/videos/rooms/unassigned-loop-4.mp4",
    sourceFilename: "We_need_one_where_everyone_s_e.mp4",
  },
] as const;
