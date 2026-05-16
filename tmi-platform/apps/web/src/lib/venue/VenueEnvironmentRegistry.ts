export type VenueEnvironmentClass =
  | "lobby"
  | "auditorium"
  | "theater"
  | "amphitheater"
  | "cypher"
  | "dance-floor"
  | "game-show"
  | "backstage"
  | "premiere"
  | "interview";

export type VenueSeatMode = "seated" | "open-floor" | "hybrid";
export type VenueCameraMode = "single" | "multi-grid" | "spotlight";

export type VenueEnvironmentProfile = {
  id: string;
  name: string;
  class: VenueEnvironmentClass;
  seatMode: VenueSeatMode;
  cameraMode: VenueCameraMode;
  lightingPreset: "warm-amber" | "battle-red" | "cypher-blue" | "dance-neon" | "concert-white" | "game-show-rainbow" | "interview-soft";
  skinId: string;
  adZones: string[];
  props: string[];
  maxCapacity: number;
  confidenceBotsMax: number;
};

const REGISTRY: Record<string, VenueEnvironmentProfile> = {
  "brick-auditorium": {
    id: "brick-auditorium",
    name: "Brick Auditorium",
    class: "auditorium",
    seatMode: "seated",
    cameraMode: "single",
    lightingPreset: "warm-amber",
    skinId: "neon-club",
    adZones: ["main-screen", "side-wall-left", "side-wall-right"],
    props: ["chairs", "stage-platform", "screen-wall"],
    maxCapacity: 300,
    confidenceBotsMax: 12,
  },
  "theater": {
    id: "theater",
    name: "Theater",
    class: "theater",
    seatMode: "seated",
    cameraMode: "spotlight",
    lightingPreset: "concert-white",
    skinId: "theater",
    adZones: ["main-screen", "back-wall", "stage-backdrop"],
    props: ["theater-seats", "stage", "curtains", "screen"],
    maxCapacity: 2000,
    confidenceBotsMax: 30,
  },
  "amphitheater": {
    id: "amphitheater",
    name: "Amphitheater",
    class: "amphitheater",
    seatMode: "seated",
    cameraMode: "multi-grid",
    lightingPreset: "concert-white",
    skinId: "arena",
    adZones: ["main-screen", "side-walls", "ceiling-banners", "sponsor-pillars"],
    props: ["tiered-seating", "stage", "light-rigs", "camera-cranes"],
    maxCapacity: 20000,
    confidenceBotsMax: 0,
  },
  "cypher-circle": {
    id: "cypher-circle",
    name: "Cypher Circle",
    class: "cypher",
    seatMode: "hybrid",
    cameraMode: "spotlight",
    lightingPreset: "cypher-blue",
    skinId: "cypher",
    adZones: ["beat-screen", "floor-projection"],
    props: ["circular-seating", "center-floor", "dj-booth", "beat-screen"],
    maxCapacity: 500,
    confidenceBotsMax: 8,
  },
  "dance-floor": {
    id: "dance-floor",
    name: "Dance Floor",
    class: "dance-floor",
    seatMode: "open-floor",
    cameraMode: "multi-grid",
    lightingPreset: "dance-neon",
    skinId: "neon-club",
    adZones: ["dj-screen", "sponsor-walls", "stage-wall"],
    props: ["dj-booth", "dance-zones", "light-rigs", "sponsor-signs"],
    maxCapacity: 10000,
    confidenceBotsMax: 15,
  },
  "game-show": {
    id: "game-show",
    name: "Game Show",
    class: "game-show",
    seatMode: "seated",
    cameraMode: "multi-grid",
    lightingPreset: "game-show-rainbow",
    skinId: "game-show",
    adZones: ["prize-screen", "sponsor-props", "back-wall"],
    props: ["podiums", "prize-doors", "host-stage", "sponsor-props"],
    maxCapacity: 500,
    confidenceBotsMax: 20,
  },
  "backstage": {
    id: "backstage",
    name: "Backstage",
    class: "backstage",
    seatMode: "seated",
    cameraMode: "single",
    lightingPreset: "interview-soft",
    skinId: "rehearsal",
    adZones: [],
    props: ["practice-monitors", "chairs", "music-stands"],
    maxCapacity: 20,
    confidenceBotsMax: 0,
  },
  "interview-room": {
    id: "interview-room",
    name: "Interview Room",
    class: "interview",
    seatMode: "seated",
    cameraMode: "multi-grid",
    lightingPreset: "interview-soft",
    skinId: "interview",
    adZones: ["back-wall", "sponsor-sign"],
    props: ["interview-chairs", "plants", "camera"],
    maxCapacity: 50,
    confidenceBotsMax: 5,
  },
};

const EVENT_TYPE_MAP: Record<string, string> = {
  "artist-live":    "brick-auditorium",
  "interview":      "interview-room",
  "song-battle":    "theater",
  "song-for-song":  "theater",
  "battle":         "cypher-circle",
  "cypher":         "cypher-circle",
  "dance-party":    "dance-floor",
  "dj-set":         "dance-floor",
  "concert":        "amphitheater",
  "premiere":       "amphitheater",
  "award-show":     "amphitheater",
  "contest":        "game-show",
  "trivia":         "game-show",
  "game":           "game-show",
  "rehearsal":      "backstage",
  "backstage":      "backstage",
  "listening-party":"brick-auditorium",
};

export function resolveEnvironment(eventType: string): VenueEnvironmentProfile {
  const envId = EVENT_TYPE_MAP[eventType] ?? "brick-auditorium";
  return REGISTRY[envId] ?? REGISTRY["brick-auditorium"];
}

export function getEnvironmentById(id: string): VenueEnvironmentProfile | undefined {
  return REGISTRY[id];
}

export function listEnvironments(): VenueEnvironmentProfile[] {
  return Object.values(REGISTRY);
}

export function isOpenFloor(eventType: string): boolean {
  return resolveEnvironment(eventType).seatMode === "open-floor";
}
