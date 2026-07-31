/**
 * LightingDirector — emits lighting cue strings from package phase meta.
 * Does not run a full lighting engine.
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

class LightingDirectorEngine {
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
      directorId: "lighting",
      status: this.lastIntent ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
      notes: "Cue strings only — no fake light simulation.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const cue = phase?.lightingCue ?? "HOLD";
    const intent: PlacementIntent = {
      directorId: "lighting",
      at: Date.now(),
      command: cue,
      meta: { packId: snap.packId, phaseId: snap.phaseId },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const LightingDirector = new LightingDirectorEngine();
export default LightingDirector;
