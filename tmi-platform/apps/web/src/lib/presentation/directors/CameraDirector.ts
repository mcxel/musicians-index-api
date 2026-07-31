/**
 * CameraDirector — resolves show-package camera cues into placement intents.
 * Does not reimplement ShowPackageDirector or BroadcastDirectorEngine shot math.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class CameraDirectorEngine {
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
      directorId: "camera",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
      notes: "Spatial camera via PresentationDirector; broadcast profiles via BroadcastDirector.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    if (!snap.cameraCaption && !snap.phaseId) return;
    const intent: PlacementIntent = {
      directorId: "camera",
      at: Date.now(),
      command: snap.cameraCaption ?? snap.phaseId ?? "HOLD",
      caption: snap.cameraCaption ?? undefined,
      meta: { packId: snap.packId, phaseId: snap.phaseId, mode: snap.mode },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const CameraDirector = new CameraDirectorEngine();
export default CameraDirector;
