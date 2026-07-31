/**
 * SoundDirector — stub sound cue intents. No production VFX/audio library.
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

class SoundDirectorEngine {
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
      directorId: "sound",
      status: "STUB",
      lastIntent: this.lastIntent,
      notes: "STUB — Sound FX library deferred.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const cue = phase?.soundCue ?? "NONE";
    const intent: PlacementIntent = {
      directorId: "sound",
      at: Date.now(),
      command: cue,
      meta: { stub: true, phaseId: snap.phaseId },
    };
    this.lastIntent = intent;
    if (cue !== "NONE") emitPlacementIntent(intent);
  }
}

export const SoundDirector = new SoundDirectorEngine();
export default SoundDirector;
