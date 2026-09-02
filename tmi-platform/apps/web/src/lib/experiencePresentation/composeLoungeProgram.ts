/**
 * composeLoungeProgram — Phase 1 Lounge / Playlist Lounge presentation.
 *
 * DNA: WebRTC free-roam panels + proximity talk — NO bobblehead avatar occupancy.
 * Playlist Lounge = same presence + playlist skin center (Rule 19).
 * NEVER Battle VS, NEVER Cypher combat, NEVER Game Show board, NEVER Fan Lobby stadium fill.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents panel counts, friends, or attendance (Rule 20).
 */

import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source ids (matrix + DNA). */
export const PROGRAM_LOUNGE = "PROGRAM.LOUNGE" as const;
export const PROGRAM_PLAYLIST_LOUNGE = "PROGRAM.PLAYLIST_LOUNGE" as const;

export const ISO_SELF_PANEL = "ISO.SELF_PANEL" as const;
export const ISO_ROOM_WIDE = "ISO.ROOM_WIDE" as const;
export const ISO_LOUNGE_PLAYLIST = "ISO.LOUNGE_PLAYLIST" as const;

export type LoungeMode = "CHILL_LOUNGE" | "PLAYLIST_LOUNGE";

export type LoungeLifecyclePhase =
  | "ENTERING"
  | "ROAM"
  | "PROXIMITY_TALK"
  | "PLAYLIST"
  | "DEPARTING";

export type LoungeProgramComposition = {
  sessionId: string;
  roomId: string;
  packId: Extract<ExperiencePackId, "Lounge">;
  loungeMode: LoungeMode;
  worldMiniBadge: "⭐ LOUNGE" | "⭐ PLAYLIST";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: LoungeLifecyclePhase;
  programSourceId: typeof PROGRAM_LOUNGE | typeof PROGRAM_PLAYLIST_LOUNGE;
  /** Real playlist id when known — never invent. */
  playlistId: string | null;
  playlistTitle: string | null;
  /**
   * Real WebRTC panel presence count when known from loungeVideoPresenceLaw.
   * null = unknown — never invent occupancy (Rule 20). Never avatar stadium counts.
   */
  panelPresenceCount: number | null;
  /** Always false — Lounge DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always null — Lounge forbids winner finale chrome. */
  winnerId: null;
  /** Hard law: panels only — never FAN_AVATARS. */
  presenceModel: "WEBRTC_PANELS";
  /** Hard law: avatar occupancy rejected for Lounge DNA. */
  avatarOccupancyAllowed: false;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: LoungeProgramComposition | null = null;

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
 * Map Lounge lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS).
 * Never CIRCLE_FOCUS (Cypher). Never GAME_BOARD. Never FLOOR_WIDE (WDP / avatar floor).
 */
export function mapLoungePhaseToComposition(
  phase: LoungeLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "ENTERING":
    case "DEPARTING":
      return "HOST_CLOSE";
    case "PROXIMITY_TALK":
      return "SPLIT";
    case "PLAYLIST":
      return "PIP";
    case "ROAM":
    default:
      return "HOST_CLOSE";
  }
}

function normalizePanelPresence(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  return Math.floor(count);
}

function normalizePlaylist(
  playlistId?: string | null,
  playlistTitle?: string | null
): { playlistId: string | null; playlistTitle: string | null } {
  const id = playlistId?.trim() || null;
  if (!id) return { playlistId: null, playlistTitle: null };
  return { playlistId: id, playlistTitle: playlistTitle?.trim() || id };
}

/**
 * Compose / refresh Lounge PROGRAM for an existing lounge session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeLoungeProgram(opts: {
  sessionId: string;
  roomId: string;
  loungeMode?: LoungeMode;
  /** Real playlist only — omit rather than invent. */
  playlistId?: string | null;
  playlistTitle?: string | null;
  /** Real panel occupancy only — null when unknown. Never pass avatar counts. */
  panelPresenceCount?: number | null;
  lifecyclePhase?: LoungeLifecyclePhase;
  /** Prefer HOST_CLOSE / PIP / SPLIT. Never pass VS / CIRCLE / GAME_BOARD / FLOOR_WIDE. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): LoungeProgramComposition {
  const packId = "Lounge" as const;
  const pack = getPresentationPack(packId);
  if (pack.presenceModel !== "WEBRTC_PANELS") {
    throw new Error("Lounge pack rejects avatar presence model");
  }

  const loungeMode: LoungeMode =
    opts.loungeMode === "PLAYLIST_LOUNGE" ? "PLAYLIST_LOUNGE" : "CHILL_LOUNGE";
  const programSourceId =
    loungeMode === "PLAYLIST_LOUNGE" ? PROGRAM_PLAYLIST_LOUNGE : PROGRAM_LOUNGE;
  const worldMiniBadge =
    loungeMode === "PLAYLIST_LOUNGE" ? ("⭐ PLAYLIST" as const) : ("⭐ LOUNGE" as const);

  const lifecyclePhase: LoungeLifecyclePhase =
    opts.lifecyclePhase ??
    (loungeMode === "PLAYLIST_LOUNGE" ? "PLAYLIST" : "ROAM");
  const layout = mapLoungePhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition(packId, layout);

  const bindJumbotron = Boolean(opts.bindJumbotron);
  const { playlistId, playlistTitle } = normalizePlaylist(opts.playlistId, opts.playlistTitle);
  const panelPresenceCount = normalizePanelPresence(opts.panelPresenceCount);

  activeRegistry = new ExperienceSourceRegistry(opts.sessionId);

  activeRegistry.registerSource({
    sourceId: programSourceId,
    kind: "PROGRAM",
    label:
      loungeMode === "PLAYLIST_LOUNGE"
        ? "Playlist Lounge · panel social PROGRAM"
        : "Lounge · WebRTC panel PROGRAM",
    decoderId: "lounge-lifecycle",
    boundTargets: defaultTargets(bindJumbotron),
  });

  activeRegistry.registerSource({
    sourceId: ISO_SELF_PANEL,
    kind: "ISO",
    label: "Self WebRTC panel",
    decoderId: "lounge-video-presence",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_ROOM_WIDE,
    kind: "ISO",
    label: "Lounge room-wide panels",
    decoderId: "lounge-video-presence",
    boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
  });

  if (playlistId || loungeMode === "PLAYLIST_LOUNGE") {
    activeRegistry.registerSource({
      sourceId: ISO_LOUNGE_PLAYLIST,
      kind: "ISO",
      label: playlistTitle
        ? `Playlist · ${playlistTitle}`
        : "Playlist Lounge · waiting for real playlist",
      decoderId: "playlist-lounge",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.LOUNGE",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · Lounge PROGRAM",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(programSourceId, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    roomId: opts.roomId,
    packId,
    loungeMode,
    worldMiniBadge,
    composition: layout,
    lifecyclePhase,
    programSourceId,
    playlistId,
    playlistTitle,
    panelPresenceCount,
    dualOccupancy: false,
    winnerId: null,
    presenceModel: "WEBRTC_PANELS",
    avatarOccupancyAllowed: false,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveLoungeProgram(): LoungeProgramComposition | null {
  return activeComposition;
}

export function clearLoungeProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_LOUNGE_PROGRAM__?: LoungeProgramComposition | null;
    };
    w.__TMI_LOUNGE_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_LOUNGE_PROGRAM__?: LoungeProgramComposition | null }
  ).__TMI_LOUNGE_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isLoungeProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Lounge never presents as Battle VS / Cypher / Fan Lobby avatar stadium. */
export function isLoungeVsFree(program: LoungeProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "Lounge" &&
    program.presenceModel === "WEBRTC_PANELS" &&
    program.avatarOccupancyAllowed === false &&
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
