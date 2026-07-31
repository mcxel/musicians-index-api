/**
 * CrowdDirector — stub crowd reaction cues. No fake 3D crowd.
 * Real seat fill remains in BotCrowdFillEngine / audience runtime.
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

class CrowdDirectorEngine {
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
      directorId: "crowd",
      status: "STUB",
      lastIntent: this.lastIntent,
      notes: "STUB cues only — audience occupancy stays in live audience engines.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const cue = phase?.crowdCue ?? "NONE";
    const intent: PlacementIntent = {
      directorId: "crowd",
      at: Date.now(),
      command: cue,
      meta: { stub: true, phaseId: snap.phaseId, inventAudience: false },
    };
    this.lastIntent = intent;
    if (cue !== "NONE") emitPlacementIntent(intent);
  }
}

export const CrowdDirector = new CrowdDirectorEngine();
export default CrowdDirector;
