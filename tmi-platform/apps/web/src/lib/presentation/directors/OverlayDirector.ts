/**
 * OverlayDirector — emits overlay placement intents from active surfaces (OVERLAYS+).
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class OverlayDirectorEngine {
  private lastIntent: PlacementIntent | null = null;
  private unsub: (() => void) | null = null;

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "overlay",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const surfaces = snap.activeSurfaceIds;
    if (!surfaces.length) return;
    const intent: PlacementIntent = {
      directorId: "overlay",
      at: Date.now(),
      layer: "OVERLAYS",
      command: "MOUNT_PACKAGE_OVERLAYS",
      meta: {
        packId: snap.packId,
        phaseId: snap.phaseId,
        surfaceIds: surfaces,
      },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const OverlayDirector = new OverlayDirectorEngine();
export default OverlayDirector;
