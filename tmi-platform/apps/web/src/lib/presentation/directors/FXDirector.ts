/**
 * FXDirector — stub placement intents for FX cues. No particle systems.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import { getShowPack } from "../ShowPackCatalog";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

class FXDirectorEngine {
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
      directorId: "fx",
      status: this.lastIntent?.command && this.lastIntent.command !== "NONE" ? "STUB" : "IDLE",
      lastIntent: this.lastIntent,
      notes: "STUB — full FX libraries deferred.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const cue = phase?.fxCue ?? "NONE";
    const intent: PlacementIntent = {
      directorId: "fx",
      at: Date.now(),
      command: cue,
      meta: { stub: true, phaseId: snap.phaseId },
    };
    this.lastIntent = intent;
    if (cue !== "NONE") emitPlacementIntent(intent);
  }
}

export const FXDirector = new FXDirectorEngine();
export default FXDirector;
