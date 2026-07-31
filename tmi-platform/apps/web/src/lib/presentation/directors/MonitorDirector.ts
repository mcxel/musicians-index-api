/**
 * MonitorDirector — allocates surfaces to MonitorAnchorZones / dual-monitor stack.
 * Never uses hardcoded pixels — zone tokens only.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import { getShowPack } from "../ShowPackCatalog";
import { getMonitorAnchorZone, type MonitorAnchorZoneId } from "../MonitorAnchorZones";
import {
  emitPlacementIntent,
  type DirectorSnapshot,
  type PlacementIntent,
} from "./types";

export interface MonitorAllocation {
  surfaceId: string;
  anchorId: MonitorAnchorZoneId;
  stackHint: "PRIMARY" | "SECONDARY" | "EITHER";
}

class MonitorDirectorEngine {
  private lastIntent: PlacementIntent | null = null;
  private allocations: MonitorAllocation[] = [];
  private unsub: (() => void) | null = null;

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public getAllocations(): readonly MonitorAllocation[] {
    return this.allocations;
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "monitor",
      status: this.allocations.length ? "ACTIVE" : "IDLE",
      lastIntent: this.lastIntent,
      notes: "CanonicalDualMonitorStack + MonitorAnchorZones — relative layout tokens only.",
    };
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const pack = getShowPack(snap.packId);
    const phase = snap.phaseId && pack ? pack.phases[snap.phaseId] : null;
    const next: MonitorAllocation[] = [];
    if (phase) {
      for (const surface of phase.surfaces) {
        const zone = getMonitorAnchorZone(surface.anchorId);
        if (!zone) continue;
        next.push({
          surfaceId: surface.surfaceId,
          anchorId: surface.anchorId,
          stackHint: surface.anchorId === "LEFT_PANEL" ? "SECONDARY" : "PRIMARY",
        });
      }
    }
    this.allocations = next;
    const intent: PlacementIntent = {
      directorId: "monitor",
      at: Date.now(),
      command: "ALLOCATE_SURFACES",
      meta: {
        allocations: next,
        packId: snap.packId,
        phaseId: snap.phaseId,
        pixelHardcoding: false,
      },
    };
    this.lastIntent = intent;
    emitPlacementIntent(intent);
  }
}

export const MonitorDirector = new MonitorDirectorEngine();
export default MonitorDirector;
