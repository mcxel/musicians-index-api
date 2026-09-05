/**
 * composeFanLobbyProgram — Phase 1 Fan Lobby presentation.
 *
 * Social hangout DNA: fan avatars / lobby wall / invite friends (Rule 26 FAN).
 * NEVER Battle VS, NEVER Cypher combat, NEVER Game Show board.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents occupancy, friend lists, or attendance (Rule 20).
 */

import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_FAN_LOBBY = "PROGRAM.FAN_LOBBY" as const;

export const ISO_SELF_AVATAR = "ISO.SELF_AVATAR" as const;
export const ISO_FRIENDS = "ISO.FRIENDS" as const;
export const ISO_LOBBY_WALL = "ISO.LOBBY_WALL" as const;
export const ISO_LOBBY_PLAYLIST = "ISO.LOBBY_PLAYLIST" as const;

export type FanLobbyLifecyclePhase =
  | "ENTERING"
  | "HANGOUT"
  | "WALL_FOCUS"
  | "PLAYLIST"
  | "INVITE"
  | "DEPARTING";

export type FanLobbyHostSnapshot = {
  id: string;
  displayName: string;
  isBot: boolean;
};

export type FanLobbyProgramComposition = {
  sessionId: string;
  roomId: string;
  packId: Extract<ExperiencePackId, "FanLive">;
  /** Fan Lobby is fan-owned social space — not World championship stage. */
  worldMiniBadge: "⭐ FAN";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: FanLobbyLifecyclePhase;
  programSourceId: typeof PROGRAM_FAN_LOBBY;
  /** Real skin id when known — never invent store cosmetics. */
  skinId: string | null;
  skinLabel: string | null;
  /**
   * Real presence count from lobby-sync only.
   * null = unknown — never invent occupancy (Rule 20).
   */
  presenceCount: number | null;
  /** Always false — Fan Lobby DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always null — Fan Lobby forbids winner finale chrome. */
  winnerId: null;
  /** Presence model honesty — fan avatars authorized (Rule 26). */
  presenceModel: "FAN_AVATARS";
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: FanLobbyProgramComposition | null = null;

function defaultTargets(bindJumbotron: boolean): ExperienceDisplayTarget[] {
  const targets: ExperienceDisplayTarget[] = [
    "UNIVERSAL_PLAYER_PRIMARY",
    "UNIVERSAL_PLAYER_SECONDARY",
  ];
  if (bindJumbotron) {
    targets.push("JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY");
  }
  return targets;
}

/**
 * Map Fan Lobby lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS).
 * Never CIRCLE_FOCUS (Cypher). Never GAME_BOARD (Game Show). Never FLOOR_WIDE (WDP).
 */
export function mapFanLobbyPhaseToComposition(
  phase: FanLobbyLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "ENTERING":
    case "DEPARTING":
      return "HOST_CLOSE";
    case "WALL_FOCUS":
      return "PIP";
    case "PLAYLIST":
      return "SPLIT";
    case "INVITE":
      return "PIP";
    case "HANGOUT":
    default:
      return "HOST_CLOSE";
  }
}

function normalizePresence(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  return Math.floor(count);
}

function normalizeSkin(
  skinId?: string | null,
  skinLabel?: string | null
): { skinId: string | null; skinLabel: string | null } {
  const id = skinId?.trim() || null;
  if (!id) return { skinId: null, skinLabel: null };
  return { skinId: id, skinLabel: skinLabel?.trim() || id };
}

/**
 * Compose / refresh Fan Lobby PROGRAM for an existing lobby session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeFanLobbyProgram(opts: {
  sessionId: string;
  roomId: string;
  /** Real skin from FanLobbySkinRegistry — omit rather than invent. */
  skinId?: string | null;
  skinLabel?: string | null;
  /** Real lobby-sync occupancy only — null when unknown. */
  presenceCount?: number | null;
  lifecyclePhase?: FanLobbyLifecyclePhase;
  /** Prefer HOST_CLOSE / PIP / SPLIT. Never pass VS / CIRCLE / GAME_BOARD / FLOOR_WIDE. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): FanLobbyProgramComposition {
  const packId = "FanLive" as const;
  const pack = getPresentationPack(packId);
  if (pack.presenceModel !== "FAN_AVATARS" && pack.presenceModel !== "MIXED_SOCIAL") {
    throw new Error("FanLive pack must authorize fan avatar / social presence for Fan Lobby");
  }

  const lifecyclePhase: FanLobbyLifecyclePhase = opts.lifecyclePhase ?? "HANGOUT";
  const layout = mapFanLobbyPhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition(packId, layout);

  const bindJumbotron = opts.bindJumbotron !== false;
  const { skinId, skinLabel } = normalizeSkin(opts.skinId, opts.skinLabel);
  const presenceCount = normalizePresence(opts.presenceCount);

  activeRegistry = new ExperienceSourceRegistry(opts.sessionId);
  for (const t of defaultTargets(bindJumbotron)) {
    void t;
  }

  activeRegistry.registerSource({
    sourceId: PROGRAM_FAN_LOBBY,
    kind: "PROGRAM",
    label: "Fan Lobby · social hangout PROGRAM",
    decoderId: "fan-lobby-lifecycle",
    boundTargets: defaultTargets(bindJumbotron),
  });

  activeRegistry.registerSource({
    sourceId: ISO_SELF_AVATAR,
    kind: "ISO",
    label: "Self avatar viewpoint",
    decoderId: "fan-lobby-presence",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_LOBBY_WALL,
    kind: "ISO",
    label: "Lobby wall mosaic",
    decoderId: "fan-lobby-wall",
    boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
  });

  if (presenceCount != null && presenceCount > 1) {
    activeRegistry.registerSource({
      sourceId: ISO_FRIENDS,
      kind: "AUDIENCE",
      label: `Lobby presence · ${presenceCount}`,
      decoderId: "lobby-sync",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (skinId) {
    activeRegistry.registerSource({
      sourceId: ISO_LOBBY_PLAYLIST,
      kind: "ISO",
      label: `Lobby skin · ${skinLabel ?? skinId}`,
      decoderId: "fan-lobby-skin",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.FAN_LOBBY",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · Fan Lobby PROGRAM",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_FAN_LOBBY, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_FAN_LOBBY, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_FAN_LOBBY, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    roomId: opts.roomId,
    packId,
    worldMiniBadge: "⭐ FAN",
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_FAN_LOBBY,
    skinId,
    skinLabel,
    presenceCount,
    dualOccupancy: false,
    winnerId: null,
    presenceModel: "FAN_AVATARS",
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveFanLobbyProgram(): FanLobbyProgramComposition | null {
  return activeComposition;
}

export function clearFanLobbyProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_FAN_LOBBY_PROGRAM__?: FanLobbyProgramComposition | null;
    };
    w.__TMI_FAN_LOBBY_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_FAN_LOBBY_PROGRAM__?: FanLobbyProgramComposition | null }
  ).__TMI_FAN_LOBBY_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isFanLobbyProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Fan Lobby never presents as Battle VS / Cypher / Game Show. */
export function isFanLobbyVsFree(program: FanLobbyProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "FanLive" &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS" &&
    program.composition !== "GAME_BOARD" &&
    program.composition !== "FLOOR_WIDE"
  );
}
