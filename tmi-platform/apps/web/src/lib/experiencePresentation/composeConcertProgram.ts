/**
 * composeConcertProgram — Phase 1 Concert / World Concert presentation.
 *
 * Composes production PROGRAM.CONCERT_STAGE (⭐ Mini) or PROGRAM.WORLD_CONCERT (🌍 World)
 * from existing ConcertRuntimeEngine lifecycle states. Stage-forward + audience presence —
 * NEVER Battle VS, NEVER Cypher circle combat.
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents headliner, setlist, attendance, tips, or scores (Rule 20).
 */

import type { ConcertState } from "@/lib/concert/ConcertRuntimeEngine";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source ids (matrix + DNA). */
export const PROGRAM_CONCERT_STAGE = "PROGRAM.CONCERT_STAGE" as const;
export const PROGRAM_WORLD_CONCERT = "PROGRAM.WORLD_CONCERT" as const;

export const ISO_STAGE = "ISO.STAGE" as const;
export const ISO_AUDIENCE_WIDE = "ISO.AUDIENCE_WIDE" as const;
export const ISO_SETLIST = "ISO.SETLIST" as const;

/** World vs Mini naming (Rule 21) — never invent World without scope=WORLD. */
export type ConcertScope = "MINI" | "WORLD";

export type ConcertLifecyclePhase = ConcertState;

export type ConcertHeadliner = {
  id: string;
  displayName: string;
};

export type ConcertSetlistTrack = {
  trackId: string;
  title: string;
  /** Optional duration label when known — never invent. */
  durationLabel?: string | null;
  isEncoreTrack?: boolean;
};

export type ConcertProgramComposition = {
  sessionId: string;
  concertId: string;
  roomId: string;
  packId: "Concert" | "WorldConcert";
  scope: ConcertScope;
  /** ⭐ MINI or 🌍 WORLD — visual honesty (Rule 21). */
  worldMiniBadge: "⭐ MINI" | "🌍 WORLD";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: ConcertLifecyclePhase;
  programSourceId: typeof PROGRAM_CONCERT_STAGE | typeof PROGRAM_WORLD_CONCERT;
  headliner: ConcertHeadliner | null;
  /** Real setlist only — empty when none supplied. */
  setlist: ConcertSetlistTrack[];
  /** Current track when index is in-bounds of real setlist — else null. */
  nowPlaying: ConcertSetlistTrack | null;
  /** Always false — Concert DNA is not Battle VS. */
  dualOccupancy: false;
  /** Always null — Concert pack forbids winner finale chrome. */
  winnerId: null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: ConcertProgramComposition | null = null;

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

function resolvePackId(scope: ConcertScope): Extract<ExperiencePackId, "Concert" | "WorldConcert"> {
  return scope === "WORLD" ? "WorldConcert" : "Concert";
}

function resolveProgramId(
  scope: ConcertScope
): typeof PROGRAM_CONCERT_STAGE | typeof PROGRAM_WORLD_CONCERT {
  return scope === "WORLD" ? PROGRAM_WORLD_CONCERT : PROGRAM_CONCERT_STAGE;
}

/**
 * Map ConcertRuntimeEngine lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * Never CIRCLE_FOCUS (Cypher DNA).
 * WorldConcert may use SPLIT for sponsor dual-panel moments when preferred.
 */
export function mapConcertPhaseToComposition(
  phase: ConcertLifecyclePhase,
  scope: ConcertScope,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "VENUE_PREP":
    case "HOUSE_LIGHTS":
    case "SEATING":
      return "STAGE_WIDE";
    case "SPONSOR_ROLL":
    case "SPONSOR_MOMENT":
      // World may prefer SPLIT for sponsor + stage; Mini stays stage-wide / host.
      return scope === "WORLD" ? "SPLIT" : "HOST_CLOSE";
    case "ARTIST_INTRO":
    case "STAGE_ENTRANCE":
      return "HOST_CLOSE";
    case "OPENING_SONG":
    case "PERFORMANCE_ACTIVE":
    case "ENCORE":
      return "STAGE_WIDE";
    case "BETWEEN_SONG_INTERACTION":
    case "GUEST_APPEARANCE":
    case "AUDIENCE_WAVE":
      return "PIP";
    case "ENCORE_VOTE":
    case "MEET_AND_GREET":
    case "PRIZE_AWARDED":
      return "HOST_CLOSE";
    case "CREDITS":
    case "AFTER_PARTY":
      return "PIP";
    default:
      return "STAGE_WIDE";
  }
}

function normalizeHeadliner(
  id: string | undefined | null,
  displayName?: string | null
): ConcertHeadliner | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name };
}

function normalizeSetlist(
  tracks: Array<{
    trackId: string;
    title: string;
    durationLabel?: string | null;
    isEncoreTrack?: boolean;
  }> | null | undefined
): ConcertSetlistTrack[] {
  if (!Array.isArray(tracks)) return [];
  const out: ConcertSetlistTrack[] = [];
  const seen = new Set<string>();
  for (const t of tracks) {
    const trackId = t?.trackId?.trim();
    const title = t?.title?.trim();
    if (!trackId || !title || seen.has(trackId)) continue;
    seen.add(trackId);
    out.push({
      trackId,
      title,
      durationLabel: t.durationLabel?.trim() || null,
      isEncoreTrack: Boolean(t.isEncoreTrack),
    });
  }
  return out;
}

/**
 * Compose / refresh Concert PROGRAM for an existing concert session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeConcertProgram(opts: {
  sessionId: string;
  concertId: string;
  roomId: string;
  /** Mini = ⭐ user-qualified; World = 🌍 platform/bot only — never invent World. */
  scope?: ConcertScope;
  /** Real headliner only — omit rather than invent. */
  headlinerId?: string | null;
  headlinerDisplayName?: string | null;
  /** Real setlist tracks only — empty when none. */
  setlist?: Array<{
    trackId: string;
    title: string;
    durationLabel?: string | null;
    isEncoreTrack?: boolean;
  }> | null;
  /** Index into real setlist — ignored when out of bounds. */
  nowPlayingIndex?: number | null;
  lifecyclePhase?: ConcertLifecyclePhase;
  /** Prefer STAGE_WIDE / HOST_CLOSE. Never pass DUAL/A_DOMINANT/B_DOMINANT/CIRCLE_FOCUS. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): ConcertProgramComposition {
  const scope: ConcertScope = opts.scope === "WORLD" ? "WORLD" : "MINI";
  const packId = resolvePackId(scope);
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

  const headliner = normalizeHeadliner(opts.headlinerId, opts.headlinerDisplayName);
  const setlist = normalizeSetlist(opts.setlist);
  let nowPlaying: ConcertSetlistTrack | null = null;
  if (
    typeof opts.nowPlayingIndex === "number" &&
    opts.nowPlayingIndex >= 0 &&
    opts.nowPlayingIndex < setlist.length
  ) {
    nowPlaying = setlist[opts.nowPlayingIndex] ?? null;
  }

  const lifecyclePhase: ConcertLifecyclePhase =
    opts.lifecyclePhase ??
    (nowPlaying
      ? "PERFORMANCE_ACTIVE"
      : headliner
        ? "ARTIST_INTRO"
        : "VENUE_PREP");

  const layout = mapConcertPhaseToComposition(lifecyclePhase, scope, opts.composition);
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
  const programSourceId = resolveProgramId(scope);
  const badge = scope === "WORLD" ? ("🌍 WORLD" as const) : ("⭐ MINI" as const);
  const headlinerLabel = headliner?.displayName ?? "Waiting for headliner";

  activeRegistry.registerSource({
    sourceId: programSourceId,
    kind: "PROGRAM",
    label: `${badge} Concert · ${headlinerLabel}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_STAGE,
    kind: "ISO",
    label: headliner ? `Stage · ${headliner.displayName}` : "Stage · empty",
    decoderId: "webrtc-stage-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_AUDIENCE_WIDE,
    kind: "ISO",
    label: "Audience wide — real presence only",
    decoderId: "audience-wide",
    boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
  });

  if (setlist.length > 0) {
    const nowLabel = nowPlaying?.title ?? "Setlist ready";
    activeRegistry.registerSource({
      sourceId: ISO_SETLIST,
      kind: "ISO",
      label: `Setlist · ${setlist.length} · ${nowLabel}`,
      decoderId: "concert-setlist",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: scope === "WORLD" ? "JUMBOTRON.WORLD_CONCERT" : "JUMBOTRON.CONCERT",
      kind: "JUMBOTRON",
      label: `In-venue Jumbotron · ${badge} Concert PROGRAM`,
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(programSourceId, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(programSourceId, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    concertId: opts.concertId,
    roomId: opts.roomId,
    packId,
    scope,
    worldMiniBadge: badge,
    composition: layout,
    lifecyclePhase,
    programSourceId,
    headliner,
    setlist,
    nowPlaying,
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

export function getActiveConcertProgram(): ConcertProgramComposition | null {
  return activeComposition;
}

export function clearConcertProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_CONCERT_PROGRAM__?: ConcertProgramComposition | null;
    };
    w.__TMI_CONCERT_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_CONCERT_PROGRAM__?: ConcertProgramComposition | null }
  ).__TMI_CONCERT_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isConcertProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: Concert never presents as Battle VS / Cypher circle combat. */
export function isConcertVsFree(program: ConcertProgramComposition | null): boolean {
  if (!program) return true;
  return (
    (program.packId === "Concert" || program.packId === "WorldConcert") &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS"
  );
}
