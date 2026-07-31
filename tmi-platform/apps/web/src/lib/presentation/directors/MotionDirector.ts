/**
 * MotionDirector — reduced-motion-aware transition cues (no particle systems).
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class MotionDirectorEngine {
  private lastIntent: PlacementIntent | null = null;
  private unsub: (() => void) | null = null;
  private reducedMotion = false;

  public start() {
    if (this.unsub) return;
    if (typeof window !== "undefined" && window.matchMedia) {
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "motion",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
      notes: this.reducedMotion ? "prefers-reduced-motion: transitions shortened" : undefined,
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const intent: PlacementIntent = {
      directorId: "motion",
      at: Date.now(),
      layer: "TRANSITIONS",
      command: this.reducedMotion ? "CUT" : "SOFT_TRANSITION",
      meta: {
        phaseId: snap.phaseId,
        reducedMotion: this.reducedMotion,
        durationMs: this.reducedMotion ? 0 : 400,
      },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const MotionDirector = new MotionDirectorEngine();
export default MotionDirector;
