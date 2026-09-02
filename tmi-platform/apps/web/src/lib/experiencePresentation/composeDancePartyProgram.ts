/**
 * composeDancePartyProgram — Phase 1 World Dance Party presentation.
 *
 * Composes production PROGRAM.WDP_COMPOSITE from existing WDP lifecycle
 * (WorldDancePartyShowtime + RotationPool + DJ Record Ralph).
 * DJ + dance floor / group energy — NEVER Battle VS, NEVER Cypher combat circle.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents DJ, track, dancer counts, tips, or scores (Rule 20).
 * 🌍 WORLD = bot-hosted (Record Ralph) only — never invent World without scope=WORLD.
 */

import type { DancePartyState } from "@/lib/dance/WorldDancePartyRuntimeEngine";
import { RECORD_RALPH_BOT_ID } from "@/lib/dance/WorldDancePartyRotationPool";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_WDP_COMPOSITE = "PROGRAM.WDP_COMPOSITE" as const;

export const ISO_DJ = "ISO.DJ" as const;
export const ISO_DANCE_FLOOR = "ISO.DANCE_FLOOR" as const;
export const ISO_CROWD = "ISO.CROWD" as const;
export const ISO_TRACK_QUEUE = "ISO.TRACK_QUEUE" as const;

/** World vs Mini naming (Rule 21) — never invent World without scope=WORLD. */
export type DancePartyScope = "MINI" | "WORLD";

export type DancePartyLifecyclePhase = DancePartyState;

export type DancePartyDj = {
  id: string;
  displayName: string;
  /** True when host is a platform bot (World = Record Ralph). */
  isBot: boolean;
};

export type DancePartyTrack = {
  trackId: string;
  title: string;
  artistName: string;
  bpm?: number | null;
};

export type DancePartyProgramComposition = {
  sessionId: string;
  partyId: string;
  roomId: string;
  packId: Extract<ExperiencePackId, "DanceParty">;
  scope: DancePartyScope;
  /** ⭐ MINI or 🌍 WORLD — visual honesty (Rule 21). */
  worldMiniBadge: "⭐ MINI" | "🌍 WORLD";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: DancePartyLifecyclePhase;
  programSourceId: typeof PROGRAM_WDP_COMPOSITE;
  dj: DancePartyDj | null;
  /** Real now-playing only — null when pool idle / none. */
  nowPlaying: DancePartyTrack | null;
  /**
   * Real floor presence count when known from seat/presence engines.
   * null = unknown — never invent a dancer count (Rule 20).
   */
  floorPresenceCount: number | null;
  /** Always false — DanceParty DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always null — DanceParty pack forbids winner finale chrome. */
  winnerId: null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: DancePartyProgramComposition | null = null;

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
 * Map WDP lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * Never CIRCLE_FOCUS (Cypher DNA).
 * Hybrid DJ + floor may use SPLIT; floor energy prefers FLOOR_WIDE.
 */
export function mapDancePartyPhaseToComposition(
  phase: DancePartyLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "VENUE_OPENING":
    case "WARMUP":
      return "HOST_CLOSE";
    case "DANCE_SESSION":
    case "PEAK_HOUR":
      return "FLOOR_WIDE";
    case "SPONSOR_MOMENT":
    case "PRIZE_DROP":
      return "SPLIT";
    case "DJ_TRANSITION":
    case "THEME_CHANGE":
      return "HOST_CLOSE";
    case "COUNTDOWN":
      return "PIP";
    case "AFTER_HOURS":
    case "LOOP":
      return "FLOOR_WIDE";
    default:
      return "FLOOR_WIDE";
  }
}

function normalizeDj(
  id: string | undefined | null,
  displayName?: string | null,
  isBot?: boolean
): DancePartyDj | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return {
    id: trimmedId,
    displayName: name,
    isBot: Boolean(isBot),
  };
}

function normalizeTrack(
  track:
    | {
        trackId?: string | null;
        title?: string | null;
        artistName?: string | null;
        bpm?: number | null;
      }
    | null
    | undefined
): DancePartyTrack | null {
  if (!track) return null;
  const trackId = track.trackId?.trim();
  const title = track.title?.trim();
  const artistName = track.artistName?.trim();
  if (!trackId || !title) return null;
  return {
    trackId,
    title,
    artistName: artistName || "Unknown artist",
    bpm: typeof track.bpm === "number" && Number.isFinite(track.bpm) ? track.bpm : null,
  };
}

function normalizeFloorPresence(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  return Math.floor(count);
}

/**
 * Compose / refresh Dance Party PROGRAM for an existing WDP session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeDancePartyProgram(opts: {
  sessionId: string;
  partyId: string;
  roomId: string;
  /** Mini = ⭐ Gold DJ; World = 🌍 Record Ralph only — never invent World. */
  scope?: DancePartyScope;
  /** Real DJ only — omit rather than invent. World defaults supplied by consumer. */
  djId?: string | null;
  djDisplayName?: string | null;
  djIsBot?: boolean;
  /** Real now-playing from RotationPool / API — never invent. */
  nowPlaying?: {
    trackId?: string | null;
    title?: string | null;
    artistName?: string | null;
    bpm?: number | null;
  } | null;
  /** Real floor occupancy only — null when unknown. */
  floorPresenceCount?: number | null;
  lifecyclePhase?: DancePartyLifecyclePhase;
  /** Prefer FLOOR_WIDE / HOST_CLOSE / SPLIT. Never pass DUAL/A_DOMINANT/B_DOMINANT/CIRCLE_FOCUS. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): DancePartyProgramComposition {
  const scope: DancePartyScope = opts.scope === "MINI" ? "MINI" : "WORLD";
  const packId = "DanceParty" as const;
  const pack = getPresentationPack(packId);

  if (pack.allowsVsLayout) {
    throw new Error(`${packId} pack must not allow VS layout`);
  }
  if (pack.allowsWinnerFinale) {
    throw new Error(`${packId} pack must not allow winner finale`);
  }
  if (pack.allowsEliminationFinale) {
    throw new Error(`${packId} pack must not allow elimination finale`);
  }

  let dj = normalizeDj(opts.djId, opts.djDisplayName, opts.djIsBot);
  // World hard law: only Record Ralph may host 🌍 — never invent another World DJ.
  if (scope === "WORLD") {
    if (!dj) {
      dj = {
        id: RECORD_RALPH_BOT_ID,
        displayName: "DJ Record Ralph",
        isBot: true,
      };
    } else if (dj.id !== RECORD_RALPH_BOT_ID) {
      // Reject non-Ralph as World host — fall back to Ralph identity (do not invent a second World host).
      dj = {
        id: RECORD_RALPH_BOT_ID,
        displayName: "DJ Record Ralph",
        isBot: true,
      };
    } else {
      dj = {
        id: RECORD_RALPH_BOT_ID,
        displayName: dj.displayName.trim() || "DJ Record Ralph",
        isBot: true,
      };
    }
  }

  const nowPlaying = normalizeTrack(opts.nowPlaying);
  const floorPresenceCount = normalizeFloorPresence(opts.floorPresenceCount);

  const lifecyclePhase: DancePartyLifecyclePhase =
    opts.lifecyclePhase ??
    (nowPlaying ? "DANCE_SESSION" : dj ? "WARMUP" : "VENUE_OPENING");

  const layout = mapDancePartyPhaseToComposition(lifecyclePhase, opts.composition);
  assertPackAllowsComposition(packId, layout);

  if (activeRegistry && activeRegistry.getSessionId() !== opts.sessionId) {
    activeRegistry = null;
    activeComposition = null;
  }

  if (!activeRegistry) {
    activeRegistry = new ExperienceSourceRegistry(opts.sessionId);
  } else {
    activeRegistry.assertSameSession(opts.sessionId);
  }

  const bindJumbotron = opts.bindJumbotron ?? true;
  const targets = defaultTargets(bindJumbotron);
  const badge = scope === "WORLD" ? ("🌍 WORLD" as const) : ("⭐ MINI" as const);
  const djLabel = dj?.displayName ?? "Waiting for DJ";

  activeRegistry.registerSource({
    sourceId: PROGRAM_WDP_COMPOSITE,
    kind: "PROGRAM",
    label: `${badge} Dance Party · ${djLabel}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_DJ,
    kind: "ISO",
    label: dj ? `DJ · ${dj.displayName}` : "DJ booth · empty",
    decoderId: "webrtc-dj-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_DANCE_FLOOR,
    kind: "ISO",
    label: "Dance floor — fan avatars authorized",
    decoderId: "dance-floor-wide",
    boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
  });

  if (floorPresenceCount !== null) {
    activeRegistry.registerSource({
      sourceId: ISO_CROWD,
      kind: "ISO",
      label: `Floor presence · ${floorPresenceCount}`,
      decoderId: "crowd-presence",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (nowPlaying) {
    activeRegistry.registerSource({
      sourceId: ISO_TRACK_QUEUE,
      kind: "ISO",
      label: `Now playing · ${nowPlaying.title}`,
      decoderId: "wdp-rotation-pool",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.WDP",
      kind: "JUMBOTRON",
      label: `In-venue Jumbotron · ${badge} Dance Party PROGRAM`,
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_WDP_COMPOSITE, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_WDP_COMPOSITE, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_WDP_COMPOSITE, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    partyId: opts.partyId,
    roomId: opts.roomId,
    packId,
    scope,
    worldMiniBadge: badge,
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_WDP_COMPOSITE,
    dj,
    nowPlaying,
    floorPresenceCount,
    dualOccupancy: false,
    winnerId: null,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveDancePartyProgram(): DancePartyProgramComposition | null {
  return activeComposition;
}

export function clearDancePartyProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_DANCE_PARTY_PROGRAM__?: DancePartyProgramComposition | null;
    };
    w.__TMI_DANCE_PARTY_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_DANCE_PARTY_PROGRAM__?: DancePartyProgramComposition | null }
  ).__TMI_DANCE_PARTY_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isDancePartyProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Dance Party never presents as Battle VS / Cypher circle combat. */
export function isDancePartyVsFree(program: DancePartyProgramComposition | null): boolean {
  if (!program) return true;
  return (
    program.packId === "DanceParty" &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS"
  );
}
