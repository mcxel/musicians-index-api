/**
 * CanonicalPresentationTimeline — deterministic scene seed + reconnect checkpoint.
 *
 * sceneSeed = hash(sessionId + sceneSequence + presentationRevision)
 * Reconnect resumes elapsed time — never restarts intro from zero.
 */

import type { AcgbrPacingMode } from "./AcgbrLaws";
import type { CanonicalSceneNodeId } from "./CanonicalSceneGraph";

export type PresentationReconnectCheckpoint = Readonly<{
  sessionId: string;
  sceneSequence: number;
  presentationRevision: number;
  sceneNodeId: CanonicalSceneNodeId | string;
  /** Elapsed ms inside current scene — resume here, do not restart. */
  elapsedInSceneMs: number;
  pacingMode: AcgbrPacingMode;
  sceneSeed: string;
  capturedAtMs: number;
}>;

export type TimelineTick = Readonly<{
  sceneSequence: number;
  presentationRevision: number;
  sceneNodeId: string;
  sceneSeed: string;
  elapsedInSceneMs: number;
  remainingInSceneMs: number;
  pacingMode: AcgbrPacingMode;
}>;

const PACING_SCALE: Record<AcgbrPacingMode, number> = {
  FULL: 1,
  FAST: 0.55,
  RECONNECT: 0.35,
  REDUCED_MOTION: 0.4,
  LOW_DEVICE: 0.3,
};

/** Deterministic 32-bit FNV-1a style hash → hex seed string. */
export function computeSceneSeed(
  sessionId: string,
  sceneSequence: number,
  presentationRevision: number
): string {
  const input = `${sessionId}|${sceneSequence}|${presentationRevision}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // unsigned + pad
  return (`00000000${(h >>> 0).toString(16)}`).slice(-8);
}

export function scaleDurationMs(
  nominalDurationMs: number,
  pacingMode: AcgbrPacingMode
): number {
  return Math.max(0, Math.round(nominalDurationMs * PACING_SCALE[pacingMode]));
}

export class CanonicalPresentationTimeline {
  private sessionId: string;
  private presentationRevision: number;
  private sceneSequence = 0;
  private sceneNodeId: string;
  private elapsedInSceneMs = 0;
  private sceneDurationMs: number;
  private pacingMode: AcgbrPacingMode;
  private sceneSeed: string;

  constructor(opts: {
    sessionId: string;
    presentationRevision?: number;
    initialSceneNodeId?: string;
    nominalDurationMs?: number;
    pacingMode?: AcgbrPacingMode;
  }) {
    this.sessionId = opts.sessionId;
    this.presentationRevision = opts.presentationRevision ?? 1;
    this.sceneNodeId = opts.initialSceneNodeId ?? "INTRO";
    this.pacingMode = opts.pacingMode ?? "FULL";
    this.sceneDurationMs = scaleDurationMs(
      opts.nominalDurationMs ?? 4000,
      this.pacingMode
    );
    this.sceneSeed = computeSceneSeed(
      this.sessionId,
      this.sceneSequence,
      this.presentationRevision
    );
  }

  public getPacingMode(): AcgbrPacingMode {
    return this.pacingMode;
  }

  public setPacingMode(mode: AcgbrPacingMode, nominalDurationMs?: number): void {
    this.pacingMode = mode;
    if (typeof nominalDurationMs === "number") {
      this.sceneDurationMs = scaleDurationMs(nominalDurationMs, mode);
    } else {
      // Re-scale remaining proportionally from current duration baseline at FULL
      const fullMs =
        this.sceneDurationMs / (PACING_SCALE[mode] || 1) || this.sceneDurationMs;
      this.sceneDurationMs = scaleDurationMs(fullMs, mode);
    }
  }

  public advanceScene(
    nextNodeId: string,
    nominalDurationMs: number,
    bumpRevision = false
  ): TimelineTick {
    if (bumpRevision) this.presentationRevision++;
    this.sceneSequence++;
    this.sceneNodeId = nextNodeId;
    this.elapsedInSceneMs = 0;
    this.sceneDurationMs = scaleDurationMs(nominalDurationMs, this.pacingMode);
    this.sceneSeed = computeSceneSeed(
      this.sessionId,
      this.sceneSequence,
      this.presentationRevision
    );
    return this.tick(0);
  }

  public tick(deltaMs: number): TimelineTick {
    this.elapsedInSceneMs = Math.min(
      this.sceneDurationMs,
      this.elapsedInSceneMs + Math.max(0, deltaMs)
    );
    return {
      sceneSequence: this.sceneSequence,
      presentationRevision: this.presentationRevision,
      sceneNodeId: this.sceneNodeId,
      sceneSeed: this.sceneSeed,
      elapsedInSceneMs: this.elapsedInSceneMs,
      remainingInSceneMs: Math.max(
        0,
        this.sceneDurationMs - this.elapsedInSceneMs
      ),
      pacingMode: this.pacingMode,
    };
  }

  public createCheckpoint(): PresentationReconnectCheckpoint {
    return Object.freeze({
      sessionId: this.sessionId,
      sceneSequence: this.sceneSequence,
      presentationRevision: this.presentationRevision,
      sceneNodeId: this.sceneNodeId,
      elapsedInSceneMs: this.elapsedInSceneMs,
      pacingMode: this.pacingMode,
      sceneSeed: this.sceneSeed,
      capturedAtMs: Date.now(),
    });
  }

  /**
   * Restore from reconnect checkpoint — resumes elapsed, does not replay from zero.
   */
  public restoreFromCheckpoint(
    checkpoint: PresentationReconnectCheckpoint,
    sceneDurationMsHint?: number
  ): boolean {
    if (checkpoint.sessionId !== this.sessionId) return false;
    this.sceneSequence = checkpoint.sceneSequence;
    this.presentationRevision = checkpoint.presentationRevision;
    this.sceneNodeId = String(checkpoint.sceneNodeId);
    this.pacingMode = checkpoint.pacingMode;
    this.sceneSeed = checkpoint.sceneSeed;
    this.sceneDurationMs =
      sceneDurationMsHint ??
      Math.max(checkpoint.elapsedInSceneMs, scaleDurationMs(4000, this.pacingMode));
    this.elapsedInSceneMs = Math.min(
      this.sceneDurationMs,
      checkpoint.elapsedInSceneMs
    );
    return true;
  }

  public getSceneSeed(): string {
    return this.sceneSeed;
  }

  public getSceneSequence(): number {
    return this.sceneSequence;
  }

  public getPresentationRevision(): number {
    return this.presentationRevision;
  }
}
