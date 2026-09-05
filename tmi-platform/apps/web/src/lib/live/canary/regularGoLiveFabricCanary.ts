/**
 * Regular GO LIVE → Live Media Fabric canary bridge.
 *
 * Controlled boundary ONLY for REGULAR_GO_LIVE. Lives outside `lib/liveFabric/`
 * so the fabric kernel stays free of legacy dock/registry imports.
 *
 * External truth unchanged: GlobalLiveSessionRegistry, DiscoveryBus, Lobby Wall,
 * MediaPlayerGoLiveControl / presentInstantGoLiveInPlace still own publication.
 * This bridge observes + orchestrates fabric kernel/graph/composer beside that path.
 *
 * Rollback: NEXT_PUBLIC_LIVE_FABRIC_REGULAR_CANARY=0 (or false) → no-ops.
 */

import {
  LiveSessionKernel,
  SessionMediaGraph,
  LiveFrameGraph,
  SurfaceComposer,
  AdaptivePresentationDirector,
  LiveAudioDirector,
  LiveRecoveryDirector,
  getExperiencePresentationContract,
  DEFAULT_PUBLIC_SOURCE_RIGHTS,
  DEFAULT_PUBLIC_PRIVACY,
} from "@/lib/liveFabric";
import type { LiveSessionState } from "@/lib/liveFabric/contracts/LiveSessionContracts";
import type { PresentationLayout } from "@/lib/liveFabric/contracts/PresentationContracts";

export const REGULAR_GO_LIVE_CANARY_EXPERIENCE = "REGULAR_GO_LIVE" as const;

const SOURCE_CAM = "src-performer-cam";
const SOURCE_MIC = "src-performer-mic";
const SOURCE_VENUE = "src-venue-renderer";
const SOURCE_AUDIENCE = "src-audience-renderer";

/** Layout cycle for surface proof (within REGULAR_GO_LIVE contract). */
export const CANARY_SURFACE_CYCLE: PresentationLayout[] = [
  "FLAT", // single-screen / normal
  "HYBRID", // split-class composition
  "PIP",
  "FOCUS", // fullscreen-class focus
  "FLAT", // return
];

export type RegularGoLiveCanaryObservatory = {
  canaryActive: boolean;
  experienceType: typeof REGULAR_GO_LIVE_CANARY_EXPERIENCE;
  sessionId: string | null;
  roomId: string | null;
  state: LiveSessionState | "IDLE_NO_SESSION";
  stateHistory: LiveSessionState[];
  generation: number;
  revision: number;
  mediaClockMs: number;
  sources: Array<{
    sourceId: string;
    mediaKind: string;
    health: string;
    publishEligible: boolean;
  }>;
  programPrimary: string | null;
  previewPrimary: string | null;
  layout: string | null;
  audioAuthoritySourceId: string | null;
  programAudibleSourceIds: string[];
  audienceHumanCount: number;
  recoveryIncidents: Array<{ code: string; fallbackApplied: boolean }>;
  transport: { reconnectCount: number; lastError: string | null };
  preflightDefaults: {
    cameraPreviewActive: boolean;
    micPreviewActive: boolean;
    isLivePublished: boolean;
  };
  teardownComplete: boolean;
  errors: string[];
};

type CanarySession = {
  kernel: LiveSessionKernel;
  media: SessionMediaGraph;
  frames: LiveFrameGraph;
  composer: SurfaceComposer;
  director: AdaptivePresentationDirector;
  audio: LiveAudioDirector;
  recovery: LiveRecoveryDirector;
  stateHistory: LiveSessionState[];
  audienceHumanCount: number;
  preflightDefaults: RegularGoLiveCanaryObservatory["preflightDefaults"];
  errors: string[];
  teardownComplete: boolean;
  roomId: string;
  hostUserId: string;
};

let active: CanarySession | null = null;
let audienceListenerBound = false;

function ensureAudienceTruthListener(): void {
  if (typeof window === "undefined" || audienceListenerBound) return;
  audienceListenerBound = true;
  window.addEventListener("tmi:watch-audience-count", ((ev: Event) => {
    const detail = (ev as CustomEvent<{ roomId?: string; viewers?: number }>).detail;
    if (!active || !detail) return;
    if (detail.roomId && detail.roomId !== active.roomId) return;
    if (typeof detail.viewers === "number") {
      syncRegularGoLiveCanaryAudience(detail.viewers);
    }
  }) as EventListener);
}

function readEnvFlag(): boolean | null {
  if (typeof process === "undefined") return null;
  const v = process.env.NEXT_PUBLIC_LIVE_FABRIC_REGULAR_CANARY;
  if (v === "0" || v === "false" || v === "off") return false;
  if (v === "1" || v === "true" || v === "on") return true;
  return null;
}

/** Feature gate — default ON for this canary ship; set env=0 to rollback. */
export function isRegularGoLiveFabricCanaryEnabled(): boolean {
  const env = readEnvFlag();
  if (env != null) return env;
  return true;
}

/**
 * Allowlist Regular GO LIVE only. Battles/cyphers/challenges/concerts/fan social/etc. stay off fabric.
 */
export function isRegularGoLiveExperience(preferredExperience?: string | null): boolean {
  const raw = (preferredExperience ?? "live").trim().toLowerCase().replace(/_/g, "-");
  return (
    raw === "" ||
    raw === "live" ||
    raw === "live-show" ||
    raw === "regular" ||
    raw === "regular-go-live" ||
    raw === "go-live"
  );
}

export function shouldAttachRegularGoLiveFabricCanary(preferredExperience?: string | null): boolean {
  return isRegularGoLiveFabricCanaryEnabled() && isRegularGoLiveExperience(preferredExperience);
}

function pushState(session: CanarySession, to: LiveSessionState, reason: string): void {
  session.kernel.transitionTo(to, reason);
  session.stateHistory.push(to);
}

function exposeDebugHook(): void {
  if (typeof window === "undefined") return;
  (window as unknown as { __TMI_LIVE_FABRIC_CANARY__?: RegularGoLiveCanaryObservatory }).__TMI_LIVE_FABRIC_CANARY__ =
    getRegularGoLiveCanaryObservatory();
}

/**
 * PREFLIGHT — capture privacy defaults (must be OFF) and spin kernel to PREFLIGHT.
 * Does not publish and does not claim LIVE.
 */
export function beginRegularGoLiveCanary(opts: {
  roomId: string;
  hostUserId: string;
  cameraPreviewActive?: boolean;
  micPreviewActive?: boolean;
  isLivePublished?: boolean;
}): CanarySession | null {
  if (!isRegularGoLiveFabricCanaryEnabled()) return null;

  teardownRegularGoLiveCanary({ reason: "replace" });

  const experience = getExperiencePresentationContract(REGULAR_GO_LIVE_CANARY_EXPERIENCE);
  const kernel = new LiveSessionKernel({
    roomId: opts.roomId,
    hostUserId: opts.hostUserId,
    hostRole: "performer",
    experienceType: REGULAR_GO_LIVE_CANARY_EXPERIENCE,
    hostSuccessionPolicy: experience.hostSuccessionPolicy,
    hostGracePeriodMs: experience.hostGracePeriodMs,
  });

  const sessionId = kernel.getSessionId();
  const gen = kernel.getGeneration();
  const media = new SessionMediaGraph(sessionId, gen);
  const frames = new LiveFrameGraph(sessionId, gen);
  const composer = new SurfaceComposer(sessionId, frames, gen);
  const director = new AdaptivePresentationDirector(sessionId, gen, composer, frames, experience);
  const audio = new LiveAudioDirector(sessionId, gen);
  const recovery = new LiveRecoveryDirector(sessionId, gen);

  const session: CanarySession = {
    kernel,
    media,
    frames,
    composer,
    director,
    audio,
    recovery,
    stateHistory: [],
    audienceHumanCount: 0,
    preflightDefaults: {
      cameraPreviewActive: opts.cameraPreviewActive ?? false,
      micPreviewActive: opts.micPreviewActive ?? false,
      isLivePublished: opts.isLivePublished ?? false,
    },
    errors: [],
    teardownComplete: false,
    roomId: opts.roomId,
    hostUserId: opts.hostUserId,
  };

  pushState(session, "PREFLIGHT", "canary-begin");
  active = session;
  ensureAudienceTruthListener();
  exposeDebugHook();
  return session;
}

export function advanceRegularGoLiveCanaryReady(): boolean {
  if (!active) return false;
  try {
    if (active.kernel.getState() === "PREFLIGHT") {
      pushState(active, "READY", "canary-ready");
    }
    exposeDebugHook();
    return true;
  } catch (err) {
    active.errors.push(err instanceof Error ? err.message : String(err));
    return false;
  }
}

/**
 * CONNECTING → register media graph → PUBLISHING.
 * Publication itself remains in executeInstantGoLive; this only mirrors fabric state.
 */
export function advanceRegularGoLiveCanaryPublishing(opts?: {
  hasCamera?: boolean;
  hasMic?: boolean;
}): boolean {
  if (!active) return false;
  try {
    const state = active.kernel.getState();
    if (state === "READY" || state === "PREFLIGHT") {
      if (state === "PREFLIGHT") pushState(active, "READY", "canary-ready-before-connect");
      pushState(active, "CONNECTING", "canary-connecting");
    }

    registerRegularGoLiveMediaGraph({
      hasCamera: opts?.hasCamera ?? true,
      hasMic: opts?.hasMic ?? true,
    });

    if (active.kernel.getState() === "CONNECTING") {
      pushState(active, "PUBLISHING", "canary-publishing");
    }
    exposeDebugHook();
    return true;
  } catch (err) {
    active.errors.push(err instanceof Error ? err.message : String(err));
    return false;
  }
}

export function registerRegularGoLiveMediaGraph(opts?: {
  hasCamera?: boolean;
  hasMic?: boolean;
}): string[] {
  if (!active) return [];
  const host = active.hostUserId;
  const registered: string[] = [];

  const ensure = (
    sourceId: string,
    mediaKind: "CAMERA" | "MIC" | "VENUE_RENDERER" | "AUDIENCE_RENDERER",
    video: boolean,
    audio: boolean,
  ) => {
    if (active!.media.get(sourceId)) {
      registered.push(sourceId);
      return;
    }
    const rec = active!.media.register({
      sourceId,
      ownerId: host,
      ownerRole: "performer",
      mediaKind,
      rightsPolicy: { ...DEFAULT_PUBLIC_SOURCE_RIGHTS },
      privacyPolicy: { ...DEFAULT_PUBLIC_PRIVACY },
      videoPolicy: {
        hasVideo: video,
        width: 1280,
        height: 720,
        fps: 30,
        bitrateKbps: video ? 2500 : 0,
        aspectRatio: "16:9",
      },
      audioPolicy: {
        hasAudio: audio,
        channels: audio ? 1 : 0,
        sampleRate: 48000,
        isMuted: mediaKind === "MIC" ? !(opts?.hasMic ?? true) : false,
        gain: 1,
        priority: mediaKind === "MIC" || mediaKind === "CAMERA" ? 10 : 3,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    active!.media.updateHealth(rec.sourceId, "HEALTHY");
    active!.media.assertPublishable(rec.sourceId);
    registered.push(sourceId);
  };

  ensure(SOURCE_CAM, "CAMERA", opts?.hasCamera !== false, false);
  ensure(SOURCE_MIC, "MIC", false, opts?.hasMic !== false);
  ensure(SOURCE_VENUE, "VENUE_RENDERER", true, false);
  ensure(SOURCE_AUDIENCE, "AUDIENCE_RENDERER", true, false);

  active.kernel.setPresentationHints({
    activeSources: registered,
  });
  return registered;
}

/**
 * Prepare PREVIEW without mutating PROGRAM, then TAKE PREVIEW→PROGRAM (no stream recreate).
 */
export function prepareThenTakeRegularGoLiveProgram(layout: PresentationLayout = "FLAT"): {
  ok: boolean;
  programPrimary: string | null;
  previewBeforeTake: string | null;
  error?: string;
} {
  if (!active) return { ok: false, programPrimary: null, previewBeforeTake: null, error: "NO_CANARY" };

  const cam = active.media.get(SOURCE_CAM)?.sourceId ?? SOURCE_CAM;
  const venue = active.media.get(SOURCE_VENUE)?.sourceId ?? SOURCE_VENUE;
  const audience = active.media.get(SOURCE_AUDIENCE)?.sourceId ?? SOURCE_AUDIENCE;

  const programBefore = active.frames.getAssignment("PROGRAM", "PRIMARY").sourceId;

  const plan = active.director.buildPlan({
    toLayout: layout,
    frameAssignments: {
      PRIMARY: cam,
      SELF: cam,
      SECONDARY: venue,
      AUDIENCE: audience,
    },
    reason: "regular-go-live-canary-prepare",
    mediaClockMs: active.kernel.getClock().now(),
    reducedMotion: false,
    targetBus: "PREVIEW",
    takeAfterCommit: false,
  });

  const prepared = active.director.prepareThenTake(plan);
  if (!prepared.prepare.success) {
    const error = prepared.prepare.error ?? "PREPARE_FAILED";
    active.errors.push(error);
    return { ok: false, programPrimary: programBefore, previewBeforeTake: null, error };
  }

  // prepareThenTake already promoted PREVIEW→PROGRAM; programPrimary should equal cam
  const programAfter = active.frames.getAssignment("PROGRAM", "PRIMARY").sourceId;
  const previewAfter = active.frames.getAssignment("PREVIEW", "PRIMARY").sourceId;

  active.audio.ensureChannel("ch-program-mic", "MIC", SOURCE_MIC);
  active.audio.commitFocus({
    transactionId: `af-canary-${Date.now()}`,
    sessionId: active.kernel.getSessionId(),
    generation: active.kernel.getGeneration(),
    expectedRevision: active.audio.getRevision(),
    primaryOwnerSourceId: SOURCE_MIC,
    duckTargets: [],
    duckLevelDb: -12,
    programAudibleSourceIds: [SOURCE_MIC],
    monitorAudibleSourceIds: [SOURCE_MIC],
    issuedAtMs: Date.now(),
  });

  active.kernel.setPresentationHints({
    activeSources: active.media.list().map((s) => s.sourceId),
    programFrames: { PRIMARY: programAfter, SECONDARY: venue, AUDIENCE: audience },
    previewFrames: { PRIMARY: previewAfter },
    currentLayout: active.composer.getLayout(),
    activeAudioFocus: SOURCE_MIC,
  });

  exposeDebugHook();
  return {
    ok: true,
    programPrimary: programAfter,
    previewBeforeTake: previewAfter,
  };
}

export function cycleRegularGoLiveSurfaces(): {
  ok: boolean;
  layouts: string[];
  error?: string;
} {
  if (!active) return { ok: false, layouts: [], error: "NO_CANARY" };
  const applied: string[] = [];
  try {
    for (const layout of CANARY_SURFACE_CYCLE) {
      const plan = active.director.buildPlan({
        toLayout: layout,
        frameAssignments: {
          PRIMARY: SOURCE_CAM,
          SELF: SOURCE_CAM,
          SECONDARY: SOURCE_VENUE,
          AUDIENCE: SOURCE_AUDIENCE,
        },
        reason: `canary-surface-${layout}`,
        mediaClockMs: active.kernel.getClock().now(),
        reducedMotion: false,
        targetBus: "PROGRAM",
        takeAfterCommit: false,
      });
      // Direct program assign for layout cycle — same session, no stream recreate
      const result = active.composer.executePlan({
        ...plan,
        expectedRevision: active.composer.getRevision(),
        targetBus: "PROGRAM",
        takeAfterCommit: false,
      });
      if (!result.success) {
        throw new Error(result.error ?? `layout ${layout} failed`);
      }
      applied.push(active.composer.getLayout());
    }
    active.kernel.setPresentationHints({ currentLayout: active.composer.getLayout() });
    exposeDebugHook();
    return { ok: true, layouts: applied };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    active.errors.push(error);
    return { ok: false, layouts: applied, error };
  }
}

/** Audience count must come from canonical presence truth — never fabricate. */
export function syncRegularGoLiveCanaryAudience(humanCount: number): void {
  if (!active) return;
  if (!Number.isFinite(humanCount) || humanCount < 0) {
    active.errors.push(`INVALID_AUDIENCE_COUNT:${humanCount}`);
    return;
  }
  active.audienceHumanCount = Math.floor(humanCount);
  if (humanCount > 0 && !active.kernel.getSnapshot().participants.some((p) => p.role === "fan")) {
    active.kernel.addParticipant({
      userId: `fan-presence-${active.roomId}`,
      role: "fan",
      displayName: "Connected Fan",
      joinedAtMs: Date.now(),
    });
  }
  exposeDebugHook();
}

export function markRegularGoLiveCanaryLive(): boolean {
  if (!active) return false;
  try {
    const state = active.kernel.getState();
    if (state === "PUBLISHING" || state === "CONNECTING") {
      if (state === "CONNECTING") pushState(active, "PUBLISHING", "canary-publishing-before-live");
      pushState(active, "LIVE", "registry-published");
    } else if (state !== "LIVE") {
      active.errors.push(`CANNOT_MARK_LIVE_FROM:${state}`);
      return false;
    }
    exposeDebugHook();
    return true;
  } catch (err) {
    active.errors.push(err instanceof Error ? err.message : String(err));
    return false;
  }
}

export function simulateRegularGoLiveCanaryRecovery(
  code: "MEDIA-CAM-LOSS" | "NET-DROP" = "MEDIA-CAM-LOSS",
): { ok: boolean; sessionAlive: boolean; incidentCode?: string } {
  if (!active) return { ok: false, sessionAlive: false };
  try {
    if (code === "MEDIA-CAM-LOSS") {
      const cam = active.media.get(SOURCE_CAM);
      if (cam && cam.health === "HEALTHY") {
        active.media.updateHealth(SOURCE_CAM, "DEGRADED");
        active.media.updateHealth(SOURCE_CAM, "FAILED");
      }
      const incident = active.recovery.detect("MEDIA-CAM-LOSS", "canary simulated camera loss", {
        sourceId: SOURCE_CAM,
      });
      // Canonical recovery: demote source, keep session LIVE
      if (active.kernel.getState() === "LIVE") {
        active.kernel.transitionTo("RECONNECTING", "cam-loss-recovery");
        active.stateHistory.push("RECONNECTING");
        // Venue remains as program fallback — no orphan publisher
        active.frames.assign("PROGRAM", "PRIMARY", SOURCE_VENUE);
        active.kernel.transitionTo("LIVE", "cam-loss-recovered");
        active.stateHistory.push("LIVE");
        if (active.media.get(SOURCE_CAM)?.health === "FAILED") {
          active.media.updateHealth(SOURCE_CAM, "RECOVERING");
          active.media.updateHealth(SOURCE_CAM, "HEALTHY");
        }
      }
      exposeDebugHook();
      return {
        ok: true,
        sessionAlive: active.kernel.getState() === "LIVE",
        incidentCode: incident.code,
      };
    }

    // Transport reconnect (NET-DROP catalog code)
    if (active.kernel.getState() === "LIVE") {
      active.kernel.transitionTo("RECONNECTING", "transport-drop");
      active.stateHistory.push("RECONNECTING");
      active.recovery.detect("NET-DROP", "canary simulated transport reconnect", {});
      active.kernel.transitionTo("LIVE", "transport-recovered");
      active.stateHistory.push("LIVE");
    }
    exposeDebugHook();
    return { ok: true, sessionAlive: active.kernel.getState() === "LIVE", incidentCode: code };
  } catch (err) {
    active.errors.push(err instanceof Error ? err.message : String(err));
    return { ok: false, sessionAlive: active.kernel.isLive() };
  }
}

/**
 * END LIVE — unbind media graph, end kernel, clear canary. Does not touch registry
 * (caller still runs endInstantGoLiveSession for discovery/Lobby Wall cleanup).
 */
export function teardownRegularGoLiveCanary(opts?: { reason?: string }): RegularGoLiveCanaryObservatory {
  if (!active) {
    return getRegularGoLiveCanaryObservatory();
  }
  const session = active;
  try {
    for (const src of session.media.list()) {
      try {
        session.media.revoke(src.sourceId, opts?.reason ?? "end-live");
      } catch {
        /* already ended */
      }
    }
    const state = session.kernel.getState();
    if (state !== "ENDED" && state !== "ENDING") {
      if (session.kernel.canTransitionTo("ENDING")) {
        pushState(session, "ENDING", opts?.reason ?? "end-live");
      }
    }
    if (session.kernel.getState() === "ENDING" || session.kernel.canTransitionTo("ENDED")) {
      if (session.kernel.getState() !== "ENDED") {
        pushState(session, "ENDED", "canary-teardown");
      }
    }
  } catch (err) {
    session.errors.push(err instanceof Error ? err.message : String(err));
  }
  session.teardownComplete = true;
  const snap = buildObservatory(session);
  active = null;
  if (typeof window !== "undefined") {
    (window as unknown as { __TMI_LIVE_FABRIC_CANARY__?: RegularGoLiveCanaryObservatory }).__TMI_LIVE_FABRIC_CANARY__ =
      snap;
  }
  return snap;
}

export function getActiveRegularGoLiveCanary(): CanarySession | null {
  return active;
}

export function getRegularGoLiveCanaryObservatory(): RegularGoLiveCanaryObservatory {
  if (!active) {
    return {
      canaryActive: false,
      experienceType: REGULAR_GO_LIVE_CANARY_EXPERIENCE,
      sessionId: null,
      roomId: null,
      state: "IDLE_NO_SESSION",
      stateHistory: [],
      generation: 0,
      revision: 0,
      mediaClockMs: 0,
      sources: [],
      programPrimary: null,
      previewPrimary: null,
      layout: null,
      audioAuthoritySourceId: null,
      programAudibleSourceIds: [],
      audienceHumanCount: 0,
      recoveryIncidents: [],
      transport: { reconnectCount: 0, lastError: null },
      preflightDefaults: {
        cameraPreviewActive: false,
        micPreviewActive: false,
        isLivePublished: false,
      },
      teardownComplete: true,
      errors: [],
    };
  }
  return buildObservatory(active);
}

function buildObservatory(session: CanarySession): RegularGoLiveCanaryObservatory {
  const snap = session.kernel.getSnapshot();
  const audioSnap = session.audio.snapshot();
  return {
    canaryActive: !session.teardownComplete,
    experienceType: REGULAR_GO_LIVE_CANARY_EXPERIENCE,
    sessionId: snap.sessionId,
    roomId: snap.roomId,
    state: snap.state,
    stateHistory: [...session.stateHistory],
    generation: snap.generation,
    revision: snap.revision,
    mediaClockMs: snap.mediaClockMs,
    sources: session.media.list().map((s) => ({
      sourceId: s.sourceId,
      mediaKind: String(s.mediaKind),
      health: s.health,
      publishEligible: s.publishEligible,
    })),
    programPrimary: session.frames.getAssignment("PROGRAM", "PRIMARY").sourceId,
    previewPrimary: session.frames.getAssignment("PREVIEW", "PRIMARY").sourceId,
    layout: session.composer.getLayout(),
    audioAuthoritySourceId: audioSnap.primaryAudioAuthoritySourceId,
    programAudibleSourceIds: Object.values(audioSnap.channels)
      .filter((c) => c.isAudibleInProgram && c.sourceId)
      .map((c) => c.sourceId as string),
    audienceHumanCount: session.audienceHumanCount,
    recoveryIncidents: session.recovery.listIncidents().map((i) => ({
      code: i.code,
      fallbackApplied: Boolean(i.fallbackApplied),
    })),
    transport: {
      reconnectCount: snap.reconnectCount,
      lastError: snap.lastError?.message ?? null,
    },
    preflightDefaults: { ...session.preflightDefaults },
    teardownComplete: session.teardownComplete,
    errors: [...session.errors],
  };
}

/**
 * Full happy-path helper for unit/cert harnesses (no network).
 * Does not replace executeInstantGoLive — simulates fabric side only.
 */
export function runRegularGoLiveCanaryHappyPath(opts: {
  roomId: string;
  hostUserId: string;
  audienceHumanCount?: number;
}): RegularGoLiveCanaryObservatory {
  beginRegularGoLiveCanary({
    roomId: opts.roomId,
    hostUserId: opts.hostUserId,
    cameraPreviewActive: false,
    micPreviewActive: false,
    isLivePublished: false,
  });
  advanceRegularGoLiveCanaryReady();
  advanceRegularGoLiveCanaryPublishing({ hasCamera: true, hasMic: true });
  prepareThenTakeRegularGoLiveProgram("FLAT");
  cycleRegularGoLiveSurfaces();
  syncRegularGoLiveCanaryAudience(opts.audienceHumanCount ?? 0);
  markRegularGoLiveCanaryLive();
  simulateRegularGoLiveCanaryRecovery("MEDIA-CAM-LOSS");
  return getRegularGoLiveCanaryObservatory();
}
