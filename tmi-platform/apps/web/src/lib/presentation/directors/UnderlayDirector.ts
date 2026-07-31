/**
 * UnderlayDirector — underlay / battle-frame placement intents.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class UnderlayDirectorEngine {
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
      directorId: "underlay",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const underlays = snap.activeSurfaceIds.filter((id) =>
      id.includes("frame") || id.includes("underlay")
    );
    if (!underlays.length && snap.mode === "IDLE") return;
    const intent: PlacementIntent = {
      directorId: "underlay",
      at: Date.now(),
      layer: "UNDERLAY",
      anchorId: "SAFE_AREA",
      command: underlays.length ? "MOUNT_UNDERLAY" : "CLEAR_UNDERLAY",
      meta: { surfaceIds: underlays, phaseId: snap.phaseId },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const UnderlayDirector = new UnderlayDirectorEngine();
export default UnderlayDirector;
