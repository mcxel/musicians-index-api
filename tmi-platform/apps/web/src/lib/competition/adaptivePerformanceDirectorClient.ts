"use client";

/**
 * Client bridge for Adaptive Performance Director HUD actions.
 * CHECKPOINT sends top-level `stillPerforming` (boolean) as Claude expects.
 * Client love/signals never authorize extensions — only server `extensionApplied`.
 */

import {
  ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
  evaluateAdaptivePerformanceCheckpoint,
  resolveDirectorModeFromExperience,
  type AdaptiveDirectorDecision,
  type AdaptiveDirectorPlan,
  type AdaptiveDirectorSignalInput,
  type ContinuityBand,
  DEFAULT_FLEXIBLE_EXTENSION_SECONDS,
  DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
  DEFAULT_MAX_QUEUE_WAIT_MS,
} from "@/lib/competition/AdaptivePerformanceDirectorPolicy";

export type DirectorHudSnapshot = {
  roomId: string;
  decision: AdaptiveDirectorDecision;
  plan: AdaptiveDirectorPlan;
  durablePending: boolean;
  serverConfirmed: boolean;
  migrationNotApplied: boolean;
  extensionsGranted: number;
  lastMessage: string;
  updatedAt: string;
};

const STORAGE_KEY = "tmi.adaptiveDirector.v1";

function key(roomId: string) {
  return `${STORAGE_KEY}:${roomId}`;
}

export function readDirectorHudSnapshot(roomId: string): DirectorHudSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key(roomId));
    return raw ? (JSON.parse(raw) as DirectorHudSnapshot) : null;
  } catch {
    return null;
  }
}

function writeSnapshot(snap: DirectorHudSnapshot) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key(snap.roomId), JSON.stringify(snap));
  window.dispatchEvent(new CustomEvent("tmi:adaptive-director", { detail: snap }));
}

async function tryDurableDirector(body: Record<string, unknown>): Promise<{
  ok: boolean;
  durable: boolean;
  migrationNotApplied?: boolean;
  decision?: AdaptiveDirectorDecision;
  extensionSeconds?: number;
  extensionsGranted?: number;
  remainingSeconds?: number;
  error?: string;
  reason?: string;
}> {
  try {
    const res = await fetch("/api/live/adaptive-director", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      decision?: AdaptiveDirectorDecision;
      extensionSeconds?: number;
      extensionApplied?: number;
      extensionsGranted?: number;
      remainingSeconds?: number;
      error?: string;
      reason?: string;
    };
    if (res.status === 503 || data.error === "MIGRATION_NOT_APPLIED") {
      return {
        ok: false,
        durable: false,
        migrationNotApplied: true,
        error: "MIGRATION_NOT_APPLIED",
      };
    }
    if (res.status === 404) {
      return { ok: false, durable: false, error: "DURABLE_DIRECTOR_PENDING_CLAUDE" };
    }
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        durable: true,
        error: data.error ?? `HTTP_${res.status}`,
      };
    }
    const extensionSeconds =
      typeof data.extensionApplied === "number"
        ? data.extensionApplied
        : typeof data.extensionSeconds === "number"
          ? data.extensionSeconds
          : 0;
    return {
      ok: true,
      durable: true,
      decision: data.decision,
      extensionSeconds,
      extensionsGranted: data.extensionsGranted,
      remainingSeconds: data.remainingSeconds,
      reason: data.reason,
    };
  } catch {
    return { ok: false, durable: false, error: "NETWORK_OR_UNAVAILABLE" };
  }
}

export async function requestPerformerFinished(input: {
  roomId: string;
  liveSessionId?: string;
  performerId: string;
  experienceKind?: string | null;
}): Promise<DirectorHudSnapshot> {
  const localPlan = evaluateAdaptivePerformanceCheckpoint({
    mode: resolveDirectorModeFromExperience(input.experienceKind),
    roundRemainingSeconds: 0,
    extensionsGranted: readDirectorHudSnapshot(input.roomId)?.extensionsGranted ?? 0,
    maxExtensionsAllowed: DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
    extensionSeconds: DEFAULT_FLEXIBLE_EXTENSION_SECONDS,
    audienceLove: "MODERATE",
    continuity: "FINISHED_SIGNAL",
    atSafeMusicalBoundary: true,
    nextPerformerReady: true,
    nextWaitMs: 0,
    maxQueueWaitMs: DEFAULT_MAX_QUEUE_WAIT_MS,
    performerFinished: true,
    hostForceEnd: false,
    pastHardStop: false,
  });

  const durable = await tryDurableDirector({
    action: "PERFORMER_FINISHED",
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
  });

  const prev = readDirectorHudSnapshot(input.roomId);
  const snap: DirectorHudSnapshot = {
    roomId: input.roomId,
    decision: durable.decision ?? localPlan.decision,
    plan: localPlan,
    durablePending: !durable.ok,
    serverConfirmed: durable.ok,
    migrationNotApplied: Boolean(durable.migrationNotApplied),
    extensionsGranted: prev?.extensionsGranted ?? 0,
    lastMessage: durable.migrationNotApplied
      ? "MIGRATION NOT APPLIED — FINISHED not durable yet"
      : durable.ok
        ? "FINISHED confirmed — handoff at server authority"
        : durable.error === "DURABLE_DIRECTOR_PENDING_CLAUDE"
          ? "FINISHED recorded locally — waiting for Claude durable adaptive-director"
          : `FINISHED not confirmed: ${durable.error ?? "unavailable"}`,
    updatedAt: new Date().toISOString(),
  };
  writeSnapshot(snap);
  return snap;
}

export async function requestCheckpointRecommendation(input: {
  roomId: string;
  liveSessionId?: string;
  experienceKind?: string | null;
  /** From authoritative clock only — never forged. */
  roundRemainingSeconds: number;
  extensionsGranted: number;
  continuity: ContinuityBand;
  nextPerformerReady: boolean;
  nextWaitMs: number;
  atSafeMusicalBoundary?: boolean;
}): Promise<DirectorHudSnapshot> {
  /** Top-level field Claude/route expect — true when performer reports still delivering. */
  const stillPerforming = input.continuity === "ACTIVE";

  const signals: AdaptiveDirectorSignalInput = {
    mode: resolveDirectorModeFromExperience(input.experienceKind),
    roundRemainingSeconds: input.roundRemainingSeconds,
    extensionsGranted: input.extensionsGranted,
    maxExtensionsAllowed: DEFAULT_MAX_FLEXIBLE_EXTENSIONS,
    extensionSeconds: DEFAULT_FLEXIBLE_EXTENSION_SECONDS,
    // Local advisory only — server recomputes love from durable reactions.
    audienceLove: "MODERATE",
    continuity: input.continuity,
    atSafeMusicalBoundary: input.atSafeMusicalBoundary ?? false,
    nextPerformerReady: input.nextPerformerReady,
    nextWaitMs: input.nextWaitMs,
    maxQueueWaitMs: DEFAULT_MAX_QUEUE_WAIT_MS,
    performerFinished: false,
    hostForceEnd: false,
    pastHardStop: false,
  };
  const plan = evaluateAdaptivePerformanceCheckpoint(signals);

  const durable = await tryDurableDirector({
    action: "CHECKPOINT",
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
    stillPerforming,
    continuity: input.continuity,
    expectedExtensions: input.extensionsGranted,
    enforcementActivated: ADAPTIVE_DIRECTOR_ENFORCEMENT_ACTIVATED,
  });

  const extensionApplied =
    durable.ok && typeof durable.extensionSeconds === "number" ? durable.extensionSeconds : 0;

  const snap: DirectorHudSnapshot = {
    roomId: input.roomId,
    decision: durable.decision ?? plan.decision,
    plan,
    durablePending: !durable.ok,
    serverConfirmed: durable.ok,
    migrationNotApplied: Boolean(durable.migrationNotApplied),
    // Never treat an extension as granted until server applied seconds > 0.
    extensionsGranted:
      durable.ok && typeof durable.extensionsGranted === "number"
        ? durable.extensionsGranted
        : extensionApplied > 0
          ? input.extensionsGranted + 1
          : input.extensionsGranted,
    lastMessage: durable.migrationNotApplied
      ? "MIGRATION NOT APPLIED"
      : durable.reason ??
        (extensionApplied > 0
          ? `Server granted +${extensionApplied}s`
          : plan.reason),
    updatedAt: new Date().toISOString(),
  };
  writeSnapshot(snap);
  return snap;
}
