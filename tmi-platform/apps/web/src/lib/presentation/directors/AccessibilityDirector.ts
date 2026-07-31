/**
 * AccessibilityDirector — reduced-motion / caption flag stubs.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class AccessibilityDirectorEngine {
  private lastIntent: PlacementIntent | null = null;
  private unsub: (() => void) | null = null;
  private reducedMotion = false;
  private captionsEnabled = false;

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

  public setCaptionsEnabled(enabled: boolean) {
    this.captionsEnabled = enabled;
  }

  public getFlags() {
    return {
      reducedMotion: this.reducedMotion,
      captionsEnabled: this.captionsEnabled,
    };
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "accessibility",
      status: "STUB",
      lastIntent: this.lastIntent,
      notes: "Flags only — full caption pipeline deferred.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const intent: PlacementIntent = {
      directorId: "accessibility",
      at: Date.now(),
      layer: "CRITICAL_ALERTS",
      anchorId: "BOTTOM",
      command: this.captionsEnabled ? "CAPTIONS_ON" : "CAPTIONS_OFF",
      meta: {
        reducedMotion: this.reducedMotion,
        captionsEnabled: this.captionsEnabled,
        phaseId: snap.phaseId,
      },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const AccessibilityDirector = new AccessibilityDirectorEngine();
export default AccessibilityDirector;
