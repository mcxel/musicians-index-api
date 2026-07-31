/**
 * PresentationTelemetryDirector — aggregates active package + director snapshots
 * for Observatory / presentation-preview. Real registry data only.
 */

import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "../ShowPackageDirector";
import CameraDirector from "./CameraDirector";
import OverlayDirector from "./OverlayDirector";
import UnderlayDirector from "./UnderlayDirector";
import MotionDirector from "./MotionDirector";
import LightingDirector from "./LightingDirector";
import FXDirector from "./FXDirector";
import SoundDirector from "./SoundDirector";
import CrowdDirector from "./CrowdDirector";
import BroadcastDirector from "./BroadcastDirector";
import MonitorDirector from "./MonitorDirector";
import AccessibilityDirector from "./AccessibilityDirector";
import type { DirectorSnapshot } from "./types";

export interface PresentationDirectorTelemetry {
  at: number;
  showPackage: ActiveShowPackageSnapshot;
  directors: DirectorSnapshot[];
  suggestedBroadcastRoomType: string;
  monitorAllocations: number;
}

type TelemetryListener = (t: PresentationDirectorTelemetry) => void;

class PresentationTelemetryDirectorEngine {
  private listeners = new Set<TelemetryListener>();
  private unsub: (() => void) | null = null;
  private last: PresentationDirectorTelemetry | null = null;

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe(() => this.publish());
    this.publish();
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public subscribe(fn: TelemetryListener): () => void {
    this.listeners.add(fn);
    if (this.last) fn(this.last);
    return () => this.listeners.delete(fn);
  }

  public getTelemetry(): PresentationDirectorTelemetry {
    return this.build();
  }

  public getSnapshot(): DirectorSnapshot {
    return {
      directorId: "telemetry",
      status: "ACTIVE",
      lastIntent: null,
      notes: "Exposes package + director snapshots to Observatory.",
    };
  }

  private build(): PresentationDirectorTelemetry {
    return {
      at: Date.now(),
      showPackage: ShowPackageDirector.getSnapshot(),
      directors: [
        CameraDirector.getSnapshot(),
        OverlayDirector.getSnapshot(),
        UnderlayDirector.getSnapshot(),
        MotionDirector.getSnapshot(),
        LightingDirector.getSnapshot(),
        FXDirector.getSnapshot(),
        SoundDirector.getSnapshot(),
        CrowdDirector.getSnapshot(),
        BroadcastDirector.getSnapshot(),
        MonitorDirector.getSnapshot(),
        AccessibilityDirector.getSnapshot(),
        this.getSnapshot(),
      ],
      suggestedBroadcastRoomType: BroadcastDirector.getSuggestedRoomType(),
      monitorAllocations: MonitorDirector.getAllocations().length,
    };
  }

  private publish() {
    this.last = this.build();
    this.listeners.forEach((fn) => fn(this.last!));
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent("tmi:presentation:telemetry", { detail: this.last })
        );
      } catch {
        /* SSR */
      }
    }
  }
}

export const PresentationTelemetryDirector = new PresentationTelemetryDirectorEngine();
export default PresentationTelemetryDirector;
