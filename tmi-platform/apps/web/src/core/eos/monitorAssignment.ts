/**
 * Flight Deck monitor assignment contracts — Auto-Director Phase 3.x / 4.8.
 * Registry-first: slots are filled from AutoDirectorRegistry + ExperienceRegistry.
 * Rule 20: no fabricated viewer counts, opponents, or live status on assignments.
 */

/** Canonical 4 Flight Deck monitor slots (MonitorSatelliteSystem matrix). */
export type FlightDeckMonitorSlotId =
  | "MONITOR_A"
  | "MONITOR_B"
  | "PIP_LEFT"
  | "PIP_RIGHT";

export const FLIGHT_DECK_SLOT_IDS: readonly FlightDeckMonitorSlotId[] = [
  "MONITOR_A",
  "MONITOR_B",
  "PIP_LEFT",
  "PIP_RIGHT",
] as const;

/** Who owns the slot content. USER always wins over AUTO_DIRECTOR when locked. */
export type MonitorAssignmentSource = "USER" | "AUTO_DIRECTOR";

/**
 * What is on the monitor. EXPERIENCE / LIVE_PREVIEW use real entryRoutes.
 * USER surfaces (CAMERA, CHAT, PLAYLIST, MEMORY_WALL) lock the slot.
 */
export type MonitorContentType =
  | "EXPERIENCE"
  | "LIVE_PREVIEW"
  | "MEDIA_PLAYER"
  | "NEWS"
  | "AD"
  | "CAMERA"
  | "CHAT"
  | "PLAYLIST"
  | "MEMORY_WALL"
  | "LOBBY_WALL"
  | "EMPTY";

/**
 * Assignment for one Flight Deck slot.
 * `locked: true` → Auto-Director must never overwrite (performer/fan user content).
 * Never attach fake viewerCount / opponentFound fields — Rule 20.
 */
export interface MonitorAssignment {
  slotId: FlightDeckMonitorSlotId;
  source: MonitorAssignmentSource;
  contentType: MonitorContentType;
  /** ExperienceRegistry id, route key, or user-surface id */
  contentId: string;
  /** Higher = preferred when Auto-Director fills idle slots */
  priority: number;
  /** When true, Auto-Director skips this slot entirely */
  locked: boolean;
  /** Real StageLoader / page entryRoute — required for clickable discovery cards */
  entryRoute?: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
  icon?: string;
}

/** Snapshot of user/runtime locks used to seed current assignments. */
export interface MonitorSlotLockState {
  /** MONITOR_A: performer is live / broadcasting */
  monitorALive?: boolean;
  /** MONITOR_A: user-owned motion/intro media (not just platform fallback) */
  monitorAUserMedia?: boolean;
  /** MONITOR_B: user explicitly pinned lobby wall / custom content */
  monitorBLocked?: boolean;
  /** PIP_LEFT: user mic / custom pip media active */
  pipLeftUserMedia?: boolean;
  /** PIP_RIGHT: camera hardware on */
  cameraOn?: boolean;
  /** Optional explicit locks from chat / playlist / memory wall overlays */
  chatLocked?: boolean;
  playlistLocked?: boolean;
  memoryWallLocked?: boolean;
}
