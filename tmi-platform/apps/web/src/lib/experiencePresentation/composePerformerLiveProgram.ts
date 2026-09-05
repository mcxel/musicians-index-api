/**
 * composePerformerLiveProgram — Phase 1 vertical slice.
 *
 * Composes production PERFORMER_LIVE_PROGRAM from Regular GO LIVE canary /
 * fabric sources + PerformerLive pack DNA. Does NOT mint a second LiveSession
 * or WebRTC runtime. Green/debug observatory remains diagnostic-only.
 */

import { assertPackAllowsComposition, getPresentationPack } from "./ExperiencePresentationDirector";
import {
  ExperienceSourceRegistry,
  type ExperienceDisplayTarget,
  type ExperienceSourceRecord,
} from "./ExperienceSourceRegistry";
import type { BroadcastCompositionLayout } from "./types";
import { getRegularGoLiveCanaryObservatory } from "@/lib/live/canary/regularGoLiveFabricCanary";

/** Canonical PROGRAM source id (matrix + DNA). */
export const PROGRAM_PERFORMER_CAMERA = "PROGRAM.PERFORMER_CAMERA" as const;

/** Fabric canary camera source mirrored into PROGRAM. */
export const FABRIC_PERFORMER_CAM = "src-performer-cam" as const;

export type PerformerLiveProgramComposition = {
  sessionId: string;
  roomId: string;
  packId: "PerformerLive";
  composition: BroadcastCompositionLayout;
  programSourceId: typeof PROGRAM_PERFORMER_CAMERA;
  fabricPrimarySourceId: string | null;
  hostDisplayName: string | null;
  surfaceKind: "production";
  sources: ExperienceSourceRecord[];
  jumbotronBound: boolean;
  composedAtMs: number;
};

let activeRegistry: ExperienceSourceRegistry | null = null;
let activeComposition: PerformerLiveProgramComposition | null = null;

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
 * Compose / refresh Performer Live PROGRAM for an existing Regular GO LIVE session.
 * Idempotent for the same sessionId — rebinds targets without minting a new session.
 */
export function composePerformerLiveProgram(opts: {
  sessionId: string;
  roomId: string;
  hostDisplayName?: string | null;
  /** Prefer HOST_CLOSE (PerformerLive DNA); FLAT allowed as single-screen fallback. */
  composition?: BroadcastCompositionLayout;
  bindJumbotron?: boolean;
}): PerformerLiveProgramComposition {
  const pack = getPresentationPack("PerformerLive");
  if (!pack.isRegularGoLive) {
    throw new Error("PerformerLive pack must be Regular GO LIVE DNA");
  }

  const layout: BroadcastCompositionLayout = opts.composition ?? "HOST_CLOSE";
  assertPackAllowsComposition("PerformerLive", layout);

  const obs = getRegularGoLiveCanaryObservatory();
  const fabricPrimary =
    obs.programPrimary ??
    obs.sources.find((s) => s.sourceId === FABRIC_PERFORMER_CAM)?.sourceId ??
    FABRIC_PERFORMER_CAM;

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

  const program = activeRegistry.registerSource({
    sourceId: PROGRAM_PERFORMER_CAMERA,
    kind: "PROGRAM",
    label: "Performer Live · Host Camera",
    decoderId: "universal-media-player",
    boundTargets: targets,
  });

  activeRegistry.registerSource({
    sourceId: FABRIC_PERFORMER_CAM,
    kind: "ISO",
    label: "Performer cam ISO",
    decoderId: "webrtc-local-preview",
    boundTargets: ["UNIVERSAL_PLAYER_PRIMARY"],
  });

  if (obs.sources.some((s) => s.sourceId === "src-audience-renderer")) {
    activeRegistry.registerSource({
      sourceId: "ISO.AUDIENCE",
      kind: "AUDIENCE",
      label: "Audience presence renderer",
      decoderId: "venue-audience-renderer",
      boundTargets: ["UNIVERSAL_PLAYER_SECONDARY"],
    });
  }

  if (bindJumbotron) {
    activeRegistry.registerSource({
      sourceId: "JUMBOTRON.PERFORMER_LIVE",
      kind: "JUMBOTRON",
      label: "In-venue Jumbotron · same PROGRAM",
      decoderId: "jumbotron-surface",
      boundTargets: ["JUMBOTRON_IN_VENUE", "JUMBOTRON_DISCOVERY"],
    });
    activeRegistry.bindTarget(PROGRAM_PERFORMER_CAMERA, "JUMBOTRON_IN_VENUE");
  }

  // Ensure PROGRAM stays bound to Universal Player slots (Freedom Law — any slot).
  activeRegistry.bindTarget(PROGRAM_PERFORMER_CAMERA, "UNIVERSAL_PLAYER_PRIMARY");
  activeRegistry.bindTarget(PROGRAM_PERFORMER_CAMERA, "UNIVERSAL_PLAYER_SECONDARY");

  activeComposition = {
    sessionId: opts.sessionId,
    roomId: opts.roomId,
    packId: "PerformerLive",
    composition: layout,
    programSourceId: PROGRAM_PERFORMER_CAMERA,
    fabricPrimarySourceId: fabricPrimary,
    hostDisplayName: opts.hostDisplayName?.trim() || null,
    surfaceKind: "production",
    sources: activeRegistry.listSources(),
    jumbotronBound: bindJumbotron,
    composedAtMs: Date.now(),
  };

  exposeProductionHook();
  return activeComposition;
}

export function getActivePerformerLiveProgram(): PerformerLiveProgramComposition | null {
  return activeComposition;
}

export function clearPerformerLiveProgram(reason?: string): void {
  activeRegistry = null;
  activeComposition = null;
  if (typeof window !== "undefined") {
    const w = window as unknown as {
      __TMI_PERFORMER_LIVE_PROGRAM__?: PerformerLiveProgramComposition | null;
    };
    w.__TMI_PERFORMER_LIVE_PROGRAM__ = null;
    void reason;
  }
}

function exposeProductionHook(): void {
  if (typeof window === "undefined") return;
  (window as unknown as { __TMI_PERFORMER_LIVE_PROGRAM__?: PerformerLiveProgramComposition | null }).__TMI_PERFORMER_LIVE_PROGRAM__ =
    activeComposition;
}

/** Cert helper — production surface only (never green_debug). */
export function isPerformerLiveProgramProductionSurface(): boolean {
  return activeComposition?.surfaceKind === "production";
}
