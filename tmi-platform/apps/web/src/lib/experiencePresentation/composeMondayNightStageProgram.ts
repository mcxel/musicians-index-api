/**
 * composeMondayNightStageProgram — Phase 1 Monday Night Stage presentation.
 *
 * Composes production PROGRAM.MNS_SHOW from existing MNS lifecycle
 * (MondayShowtime + HostShowAssignment + ShowRuntime / submissions queue).
 * Performer focus + Who's Next + host package — NEVER Battle VS by default,
 * NEVER Cypher combat circle. Official 🌍 WORLD show only (bot-hosted lineup).
 * Does NOT mint a second LiveSession, WebRTC graph, or Universal Player runtime.
 * Never invents winners, attendance, scores, or featured acts (Rule 20).
 */

import { getShowHosts } from "@/lib/hosts/HostShowAssignmentEngine";
import { getHostById } from "@/lib/hosts/HostIdentityRegistry";
import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout, ExperiencePackId } from "./types";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_MNS_SHOW = "PROGRAM.MNS_SHOW" as const;

export const ISO_HOST = "ISO.HOST" as const;
export const ISO_FEATURED = "ISO.FEATURED" as const;
export const ISO_WHOS_NEXT = "ISO.WHOS_NEXT" as const;
export const ISO_AUDIENCE = "ISO.AUDIENCE" as const;
export const ISO_SPONSOR = "ISO.SPONSOR" as const;

/** Official World flagship only — never invent a Mini MNS. */
export type MondayNightStageScope = "WORLD";

export type MondayNightStageLifecyclePhase =
  | "PRESHOW"
  | "HOST_OPEN"
  | "FEATURED_ACT"
  | "WHOS_NEXT"
  | "APPLAUSE"
  | "SPONSOR_BREAK"
  | "INTERMISSION"
  | "POST_SHOW";

export type MondayNightStageHost = {
  id: string;
  displayName: string;
  /** True when host is a platform bot / system character. */
  isBot: boolean;
  role: "MAIN" | "CO_HOST";
};

export type MondayNightStagePerformer = {
  id: string;
  displayName: string;
};

export type MondayNightStageProgramComposition = {
  sessionId: string;
  showId: string;
  roomId: string;
  packId: Extract<ExperiencePackId, "MondayNightStage">;
  scope: MondayNightStageScope;
  /** Always 🌍 WORLD — Official Automated Event (Rule 21). */
  worldMiniBadge: "🌍 WORLD";
  composition: BroadcastCompositionLayout;
  lifecyclePhase: MondayNightStageLifecyclePhase;
  programSourceId: typeof PROGRAM_MNS_SHOW;
  mainHost: MondayNightStageHost | null;
  coHosts: MondayNightStageHost[];
  /** Current featured act from real queue — null when none. */
  featured: MondayNightStagePerformer | null;
  /** Who's Next from real queue — null when none. */
  whosNext: MondayNightStagePerformer | null;
  /**
   * Real audience/presence count when known from seat/presence engines.
   * null = unknown — never invent attendance (Rule 20).
   */
  audiencePresenceCount: number | null;
  /** Sponsor id only when a real placement hook exists — never invent. */
  sponsorId: string | null;
  /** Always false — MNS DNA is not Battle VS by default. */
  dualOccupancy: false;
  /** Always null — pack forbids winner finale chrome; never invent winners. */
  winnerId: null;
  /** Always false — MNS ≠ Regular GO LIVE. */
  isRegularGoLive: false;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: MondayNightStageProgramComposition | null = null;

const MNS_SHOW_ID = "monday-night-stage";

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
 * Map MNS lifecycle → pack-allowed layout.
 * Hard law: never DUAL / A_DOMINANT / B_DOMINANT (Battle VS DNA).
 * Never CIRCLE_FOCUS (Cypher DNA).
 * SPLIT allowed for host + featured / sponsor dual-panel — not corner VS.
 */
export function mapMondayNightStagePhaseToComposition(
  phase: MondayNightStageLifecyclePhase,
  preferred?: BroadcastCompositionLayout
): BroadcastCompositionLayout {
  if (preferred) return preferred;

  switch (phase) {
    case "PRESHOW":
    case "HOST_OPEN":
      return "HOST_CLOSE";
    case "FEATURED_ACT":
    case "APPLAUSE":
      return "STAGE_WIDE";
    case "WHOS_NEXT":
      return "PIP";
    case "SPONSOR_BREAK":
      return "SPLIT";
    case "INTERMISSION":
      return "HOST_CLOSE";
    case "POST_SHOW":
      return "STAGE_WIDE";
    default:
      return "STAGE_WIDE";
  }
}

function normalizePerformer(
  id: string | undefined | null,
  displayName?: string | null
): MondayNightStagePerformer | null {
  const trimmedId = id?.trim();
  if (!trimmedId) return null;
  const name = displayName?.trim() || trimmedId;
  return { id: trimmedId, displayName: name };
}

function normalizeAudiencePresence(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isFinite(count) || count < 0) return null;
  return Math.floor(count);
}

function resolveHostsFromRegistry(): {
  mainHost: MondayNightStageHost | null;
  coHosts: MondayNightStageHost[];
} {
  const assignment = getShowHosts(MNS_SHOW_ID);
  if (!assignment) {
    return { mainHost: null, coHosts: [] };
  }

  const mainIdentity = getHostById(assignment.mainHostId);
  const mainHost: MondayNightStageHost | null = assignment.mainHostId
    ? {
        id: assignment.mainHostId,
        displayName: mainIdentity?.name?.trim() || assignment.mainHostId,
        isBot: true,
        role: "MAIN",
      }
    : null;

  const coHosts: MondayNightStageHost[] = [];
  for (const coId of assignment.coHostIds ?? []) {
    const trimmed = coId?.trim();
    if (!trimmed) continue;
    const identity = getHostById(trimmed);
    coHosts.push({
      id: trimmed,
      displayName: identity?.name?.trim() || trimmed,
      isBot: true,
      role: "CO_HOST",
    });
  }

  return { mainHost, coHosts };
}

/**
 * Compose / refresh Monday Night Stage PROGRAM for an existing show session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composeMondayNightStageProgram(opts: {
  sessionId: string;
  showId?: string;
  roomId: string;
  /** Real featured act only — omit rather than invent. */
  featuredId?: string | null;
  featuredDisplayName?: string | null;
  /** Real Who's Next only — omit rather than invent. */
  whosNextId?: string | null;
  whosNextDisplayName?: string | null;
  /** Real audience occupancy only — null when unknown. */
  audiencePresenceCount?: number | null;
  /** Real sponsor placement id only — never invent. */
  sponsorId?: string | null;
  lifecyclePhase?: MondayNightStageLifecyclePhase;
  /** Prefer STAGE_WIDE / HOST_CLOSE / PIP / SPLIT. Never pass DUAL/A_DOMINANT/B_DOMINANT/CIRCLE_FOCUS. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): MondayNightStageProgramComposition {
  const packId = "MondayNightStage" as const;
  const pack = getPresentationPack(packId);

  if (pack.isRegularGoLive) {
    throw new Error(`${packId} pack must not alias Regular GO LIVE`);
  }
  if (pack.allowsVsLayout) {
    throw new Error(`${packId} pack must not allow VS layout`);
  }
  if (pack.allowsWinnerFinale) {
    throw new Error(`${packId} pack must not allow winner finale`);
  }
  if (pack.allowsEliminationFinale) {
    throw new Error(`${packId} pack must not allow elimination finale`);
  }

  const { mainHost, coHosts } = resolveHostsFromRegistry();
  const featured = normalizePerformer(opts.featuredId, opts.featuredDisplayName);
  const whosNext = normalizePerformer(opts.whosNextId, opts.whosNextDisplayName);
  const audiencePresenceCount = normalizeAudiencePresence(opts.audiencePresenceCount);
  const sponsorId = opts.sponsorId?.trim() || null;

  const lifecyclePhase: MondayNightStageLifecyclePhase =
    opts.lifecyclePhase ??
    (featured
      ? "FEATURED_ACT"
      : whosNext
        ? "WHOS_NEXT"
        : mainHost
          ? "HOST_OPEN"
          : "PRESHOW");

  const layout = mapMondayNightStagePhaseToComposition(lifecyclePhase, opts.composition);
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
  const showId = opts.showId?.trim() || MNS_SHOW_ID;
  const hostLabel = mainHost?.displayName ?? "Waiting for host";
  const featuredLabel = featured?.displayName ?? "Waiting for featured act";

  activeRegistry.registerSource({
    sourceId: PROGRAM_MNS_SHOW,
    kind: "PROGRAM",
    label: `🌍 WORLD Monday Night Stage · ${featured ? featuredLabel : hostLabel}`,
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: ISO_HOST,
    kind: "ISO",
    label: mainHost ? `Host · ${mainHost.displayName}` : "Host desk · empty",
    decoderId: "webrtc-host-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  activeRegistry.registerSource({
    sourceId: ISO_FEATURED,
    kind: "ISO",
    label: featured ? `Featured · ${featured.displayName}` : "Stage · empty",
    decoderId: "webrtc-stage-cam",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (whosNext) {
    activeRegistry.registerSource({
      sourceId: ISO_WHOS_NEXT,
      kind: "ISO",
      label: `Who's Next · ${whosNext.displayName}`,
      decoderId: "mns-queue-rail",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (audiencePresenceCount !== null) {
    activeRegistry.registerSource({
      sourceId: ISO_AUDIENCE,
      kind: "ISO",
      label: `Audience presence · ${audiencePresenceCount}`,
      decoderId: "audience-presence",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (sponsorId) {
    activeRegistry.registerSource({
      sourceId: ISO_SPONSOR,
      kind: "ISO",
      label: `Sponsor · ${sponsorId}`,
      decoderId: "sponsor-placement",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.MNS",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · 🌍 WORLD Monday Night Stage PROGRAM",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_MNS_SHOW, "JUMBOTRON_IN_VENUE");
  }

  activeRegistry.bindTarget(PROGRAM_MNS_SHOW, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_MNS_SHOW, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    showId,
    roomId: opts.roomId,
    packId,
    scope: "WORLD",
    worldMiniBadge: "🌍 WORLD",
    composition: layout,
    lifecyclePhase,
    programSourceId: PROGRAM_MNS_SHOW,
    mainHost,
    coHosts,
    featured,
    whosNext,
    audiencePresenceCount,
    sponsorId,
    dualOccupancy: false,
    winnerId: null,
    isRegularGoLive: false,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActiveMondayNightStageProgram(): MondayNightStageProgramComposition | null {
  return activeComposition;
}

export function clearMondayNightStageProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_MNS_PROGRAM__?: MondayNightStageProgramComposition | null;
    };
    w.__TMI_MNS_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (
    window as unknown as { __TMI_MNS_PROGRAM__?: MondayNightStageProgramComposition | null }
  ).__TMI_MNS_PROGRAM__ = activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isMondayNightStageProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}

/** Honest: MNS never presents as Battle VS / Cypher circle / Regular GO LIVE. */
export function isMondayNightStageVsFree(
  program: MondayNightStageProgramComposition | null
): boolean {
  if (!program) return true;
  return (
    program.packId === "MondayNightStage" &&
    program.dualOccupancy === false &&
    program.winnerId === null &&
    program.isRegularGoLive === false &&
    program.composition !== "DUAL" &&
    program.composition !== "A_DOMINANT" &&
    program.composition !== "B_DOMINANT" &&
    program.composition !== "CIRCLE_FOCUS"
  );
}
