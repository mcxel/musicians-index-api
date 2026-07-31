/**
 * Presentation runtime compatibility — experience mode × director lane.
 * Honest status only.
 */

export type CompatibilityStatus = "READY" | "PARTIAL" | "STUB" | "UNSUPPORTED";

export type ExperienceMode =
  | "BATTLE"
  | "CYPHER"
  | "CHALLENGE"
  | "CONCERT"
  | "LOBBY"
  | "DANCE_PARTY"
  | "GAME_SHOW";

export type DirectorLane =
  | "camera"
  | "overlay"
  | "lighting"
  | "fx"
  | "broadcast"
  | "monitor"
  | "sound"
  | "crowd"
  | "motion"
  | "accessibility"
  | "telemetry";

export interface CompatibilityCell {
  mode: ExperienceMode;
  lane: DirectorLane;
  status: CompatibilityStatus;
  note?: string;
}

const READY: CompatibilityStatus = "READY";
const PARTIAL: CompatibilityStatus = "PARTIAL";
const STUB: CompatibilityStatus = "STUB";
const UNSUPPORTED: CompatibilityStatus = "UNSUPPORTED";

/** Flat matrix — query via getCompatibility / listCompatibility */
export const PRESENTATION_RUNTIME_COMPATIBILITY: CompatibilityCell[] = [
  // Battle — strongest path (certified foundation)
  { mode: "BATTLE", lane: "camera", status: READY, note: "ShowPackageDirector + PresentationDirector" },
  { mode: "BATTLE", lane: "overlay", status: READY },
  { mode: "BATTLE", lane: "lighting", status: PARTIAL, note: "Cue strings only" },
  { mode: "BATTLE", lane: "fx", status: STUB },
  { mode: "BATTLE", lane: "broadcast", status: READY, note: "BroadcastDirectorEngine Battle profile" },
  { mode: "BATTLE", lane: "monitor", status: READY, note: "MonitorAnchorZones" },
  { mode: "BATTLE", lane: "sound", status: STUB },
  { mode: "BATTLE", lane: "crowd", status: STUB },
  { mode: "BATTLE", lane: "motion", status: PARTIAL },
  { mode: "BATTLE", lane: "accessibility", status: STUB },
  { mode: "BATTLE", lane: "telemetry", status: READY },

  // Cypher — pack v1 scaffold
  { mode: "CYPHER", lane: "camera", status: PARTIAL, note: "Pack + Broadcast Cypher profile" },
  { mode: "CYPHER", lane: "overlay", status: PARTIAL },
  { mode: "CYPHER", lane: "lighting", status: STUB },
  { mode: "CYPHER", lane: "fx", status: STUB },
  { mode: "CYPHER", lane: "broadcast", status: READY },
  { mode: "CYPHER", lane: "monitor", status: PARTIAL },
  { mode: "CYPHER", lane: "sound", status: STUB },
  { mode: "CYPHER", lane: "crowd", status: STUB },
  { mode: "CYPHER", lane: "motion", status: STUB },
  { mode: "CYPHER", lane: "accessibility", status: STUB },
  { mode: "CYPHER", lane: "telemetry", status: PARTIAL },

  // Challenge
  { mode: "CHALLENGE", lane: "camera", status: PARTIAL },
  { mode: "CHALLENGE", lane: "overlay", status: PARTIAL },
  { mode: "CHALLENGE", lane: "lighting", status: STUB },
  { mode: "CHALLENGE", lane: "fx", status: STUB },
  { mode: "CHALLENGE", lane: "broadcast", status: READY },
  { mode: "CHALLENGE", lane: "monitor", status: PARTIAL },
  { mode: "CHALLENGE", lane: "sound", status: STUB },
  { mode: "CHALLENGE", lane: "crowd", status: STUB },
  { mode: "CHALLENGE", lane: "motion", status: STUB },
  { mode: "CHALLENGE", lane: "accessibility", status: STUB },
  { mode: "CHALLENGE", lane: "telemetry", status: PARTIAL },

  // Concert / Lobby / Dance / Game show — lighter wiring
  { mode: "CONCERT", lane: "camera", status: PARTIAL },
  { mode: "CONCERT", lane: "overlay", status: STUB },
  { mode: "CONCERT", lane: "lighting", status: STUB },
  { mode: "CONCERT", lane: "fx", status: UNSUPPORTED },
  { mode: "CONCERT", lane: "broadcast", status: PARTIAL },
  { mode: "CONCERT", lane: "monitor", status: PARTIAL },
  { mode: "CONCERT", lane: "sound", status: STUB },
  { mode: "CONCERT", lane: "crowd", status: STUB },
  { mode: "CONCERT", lane: "motion", status: STUB },
  { mode: "CONCERT", lane: "accessibility", status: STUB },
  { mode: "CONCERT", lane: "telemetry", status: STUB },

  { mode: "LOBBY", lane: "camera", status: PARTIAL, note: "Fan Lobby broadcast profile" },
  { mode: "LOBBY", lane: "overlay", status: STUB },
  { mode: "LOBBY", lane: "lighting", status: STUB },
  { mode: "LOBBY", lane: "fx", status: UNSUPPORTED },
  { mode: "LOBBY", lane: "broadcast", status: READY },
  { mode: "LOBBY", lane: "monitor", status: PARTIAL },
  { mode: "LOBBY", lane: "sound", status: STUB },
  { mode: "LOBBY", lane: "crowd", status: PARTIAL, note: "Seat fill engines exist" },
  { mode: "LOBBY", lane: "motion", status: STUB },
  { mode: "LOBBY", lane: "accessibility", status: STUB },
  { mode: "LOBBY", lane: "telemetry", status: STUB },

  { mode: "DANCE_PARTY", lane: "camera", status: PARTIAL },
  { mode: "DANCE_PARTY", lane: "overlay", status: STUB },
  { mode: "DANCE_PARTY", lane: "lighting", status: STUB },
  { mode: "DANCE_PARTY", lane: "fx", status: UNSUPPORTED },
  { mode: "DANCE_PARTY", lane: "broadcast", status: READY },
  { mode: "DANCE_PARTY", lane: "monitor", status: STUB },
  { mode: "DANCE_PARTY", lane: "sound", status: STUB },
  { mode: "DANCE_PARTY", lane: "crowd", status: STUB },
  { mode: "DANCE_PARTY", lane: "motion", status: STUB },
  { mode: "DANCE_PARTY", lane: "accessibility", status: STUB },
  { mode: "DANCE_PARTY", lane: "telemetry", status: STUB },

  { mode: "GAME_SHOW", lane: "camera", status: STUB },
  { mode: "GAME_SHOW", lane: "overlay", status: STUB },
  { mode: "GAME_SHOW", lane: "lighting", status: UNSUPPORTED },
  { mode: "GAME_SHOW", lane: "fx", status: UNSUPPORTED },
  { mode: "GAME_SHOW", lane: "broadcast", status: STUB },
  { mode: "GAME_SHOW", lane: "monitor", status: STUB },
  { mode: "GAME_SHOW", lane: "sound", status: UNSUPPORTED },
  { mode: "GAME_SHOW", lane: "crowd", status: UNSUPPORTED },
  { mode: "GAME_SHOW", lane: "motion", status: UNSUPPORTED },
  { mode: "GAME_SHOW", lane: "accessibility", status: STUB },
  { mode: "GAME_SHOW", lane: "telemetry", status: STUB },
];

export function getCompatibility(
  mode: ExperienceMode,
  lane: DirectorLane
): CompatibilityCell | undefined {
  return PRESENTATION_RUNTIME_COMPATIBILITY.find(
    (c) => c.mode === mode && c.lane === lane
  );
}

export function listCompatibilityForMode(mode: ExperienceMode): CompatibilityCell[] {
  return PRESENTATION_RUNTIME_COMPATIBILITY.filter((c) => c.mode === mode);
}
