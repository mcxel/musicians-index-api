/**
 * PresentationTimelineEngine — Time-coded event execution engine.
 * Plays declarative presentation packages from PresentationPackageRegistry.
 * Executes camera cuts, lighting sweeps, overlay mountings, audio cues, and crowd bursts.
 */

import PresentationDirector from "./PresentationDirector";
import {
  PRESENTATION_PACKAGE_REGISTRY,
  type PresentationPackage,
} from "./PresentationPackageRegistry";

export interface ActiveTimelinePlayback {
  playbackId: string;
  packageId: string;
  startedAt: number;
  status: "PLAYING" | "PAUSED" | "COMPLETED";
}

class PresentationTimelineEngineClass {
  private activePlayback: ActiveTimelinePlayback | null = null;
  private timerIds: number[] = [];

  public playPackage(packageId: string, customData?: Record<string, unknown>): boolean {
    const pkg = PRESENTATION_PACKAGE_REGISTRY[packageId];
    if (!pkg) return false;

    this.stopCurrent();

    this.activePlayback = {
      playbackId: `playback-${Date.now()}`,
      packageId,
      startedAt: Date.now(),
      status: "PLAYING",
    };

    // Execute each time-coded action in the package timeline
    pkg.timeline.forEach((action) => {
      const timer = window.setTimeout(() => {
        if (!this.activePlayback || this.activePlayback.status !== "PLAYING") return;

        switch (action.type) {
          case "CAMERA":
            if (action.anchorId) {
              PresentationDirector.setCameraTarget({
                mode: action.command === "CINEMATIC_ORBIT" ? "ORBIT" : "CINEMATIC_FLY_IN",
                targetAnchorId: action.anchorId,
                transitionDurationMs: 1500,
              });
            }
            break;

          case "OVERLAY":
            if (action.overlayType && action.anchorId) {
              PresentationDirector.mountOverlay({
                id: `overlay-${Date.now()}`,
                type: action.overlayType,
                targetAnchorId: action.anchorId,
                visible: true,
                opacity: 1,
                scale: 1,
                data: customData,
              });
            }
            break;

          case "LIGHTING":
          case "PARTICLES":
          case "AUDIO":
          case "SPONSOR":
          case "CROWD":
            // Dispatches semantic presentation events to subscribers
            try {
              window.dispatchEvent(
                new CustomEvent("tmi:presentation:action", {
                  detail: { type: action.type, command: action.command, data: customData },
                })
              );
            } catch (e) {}
            break;
        }
      }, action.offsetMs);

      this.timerIds.push(timer as unknown as number);
    });

    // Schedule completion
    const endTimer = window.setTimeout(() => {
      if (this.activePlayback) {
        this.activePlayback.status = "COMPLETED";
      }
    }, pkg.totalDurationMs);
    this.timerIds.push(endTimer as unknown as number);

    return true;
  }

  public stopCurrent() {
    this.timerIds.forEach((id) => clearTimeout(id));
    this.timerIds = [];
    if (this.activePlayback) {
      this.activePlayback.status = "COMPLETED";
      this.activePlayback = null;
    }
  }

  public getPlaybackState(): ActiveTimelinePlayback | null {
    return this.activePlayback;
  }
}

export const PresentationTimelineEngine = new PresentationTimelineEngineClass();
export default PresentationTimelineEngine;
