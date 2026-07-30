// VenueAssetRegistry
// Single source of truth for every TMI room's canonical visual assets and
// environment configuration. These are NOT decoration — they are the
// art-direction blueprints that drove the reference videos in
// public/assets/videos/rooms/.
//
// Ambient loops: every ambientVideoUrl points at an existing file under
// /assets/videos/rooms/ (NOT missing /assets/environments/ background files).
// Fallbacks when no dedicated loop exists:
//   concert / world-concert / mini-concert -> monday-night-stage.mp4 (stage)
//   release-party / world-release -> world-dance-party.mp4 (party floor)
//   mini-release / listening-party -> lounge.mp4 (intimate room)
// Phase 5B mesh / walkable VenueRuntime stays IDLE.
//
// Rule 8 (Registry First): pages and components read FROM here.
// Rule 14 (No Empty Surface): every field has a fallback.
// Rule 20 (Reality Rule): no fabricated asset paths — only real files.
// Rule 21 (Venue Runtime Convergence): one runtime, venue type = mode.

export type VenueType =
  | "battle"
  | "challenge"
  | "cypher"
  | "deal-or-feud"
  | "fan-lobby"
  | "lounge"
  | "monday-night-stage"
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
  /** 0=Theater 1=Arena 2=Club 3=Outdoor 4=Studio — matches AudienceScene VenueIndex */
  venueIndex: 0 | 1 | 2 | 3 | 4;
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
    label: "Challenge Arena",
    tagline: "Accept the challenge. Prove it live.",
    accentColor: "#00FFFF",
    secondaryColor: "#AA2DFF",
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
    venueIndex: 3,
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
  return VENUE_REGISTRY[type];
}

export function getAllVenueTypes(): VenueType[] {
  return Object.keys(VENUE_REGISTRY) as VenueType[];
}

/** Maps ArenaEventShell event types to VenueType */
export function arenaEventTypeToVenueType(
  eventType: "concert" | "battle" | "cypher" | "challenge" | "live-show" | "monday-stage" | "deal-or-feud" | "lounge" | "world-dance-party"
): VenueType {
  const map: Record<string, VenueType> = {
    concert:             "concert",
    battle:              "battle",
    cypher:              "cypher",
    challenge:           "challenge",
    "live-show":         "concert",
    "monday-stage":      "monday-night-stage",
    "deal-or-feud":      "deal-or-feud",
    "lounge":            "lounge",
    "world-dance-party": "world-dance-party",
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
  if (s.includes("fan-lobby") || s.includes("avatar-lobby")) return "fan-lobby";
  if (s.includes("lounge") || s.includes("vip")) return "lounge";
  return "concert"; // default for live shows
}

export type { VenueAsset as VenueAssetType };
export default VENUE_REGISTRY;
