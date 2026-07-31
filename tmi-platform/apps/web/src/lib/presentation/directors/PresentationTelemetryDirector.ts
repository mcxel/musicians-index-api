/**
 * PresentationTelemetryDirector.ts — Phase 5.1 Presentation Director Service.
 * Aggregates live production metrics, active packages, mounted overlays,
 * camera targets, and director states into a control-room feed for the Observatory.
 */

import ShowPackageDirector, { type ActiveShowPackageSnapshot } from "../ShowPackageDirector";
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
import {
  DirectorId,
  DirectorSnapshot,
  DirectorValidationResult,
  PresentationCommand,
  PresentationContext,
  PresentationDirectorService,
  emitPlacementIntent,
  type PlacementIntent,
} from "./types";

export interface PresentationDirectorTelemetry {
  at: number;
  showPackage: ActiveShowPackageSnapshot;
  directors: DirectorSnapshot[];
  suggestedBroadcastRoomType: string;
  monitorAllocations: number;
}

type TelemetryListener = (t: PresentationDirectorTelemetry) => void;

class PresentationTelemetryDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "telemetry";
  private listeners = new Set<TelemetryListener>();
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();
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

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "TELEMETRY") {
      return { valid: false, reason: `Invalid director '${command.director}' for PresentationTelemetryDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "telemetry",
      at: Date.now(),
      command: command.action,
      meta: { runtimeId: command.runtimeId, payload: command.payload },
    };

    this.lastIntents.set(command.runtimeId, intent);
    emitPlacementIntent(intent);
    this.publish();
  }

  public async cancel(runtimeId: string, _reason: string): Promise<void> {
    this.activeCommands.delete(runtimeId);
  }

  public subscribe(fn: TelemetryListener): () => void {
    this.listeners.add(fn);
    if (this.last) fn(this.last);
    return () => this.listeners.delete(fn);
  }

  public getTelemetry(runtimeId: string = "default"): PresentationDirectorTelemetry {
    return this.build(runtimeId);
  }

  public getSnapshot(runtimeId: string = "default"): DirectorSnapshot {
    const last = this.lastIntents.get(runtimeId) ?? null;
    return {
      directorId: "telemetry",
      status: "ACTIVE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Exposes live production state & director snapshots to Observatory.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }

  private build(runtimeId: string = "default"): PresentationDirectorTelemetry {
    return {
      at: Date.now(),
      showPackage: ShowPackageDirector.getSnapshot(),
      directors: [
        CameraDirector.getSnapshot(runtimeId),
        OverlayDirector.getSnapshot(runtimeId),
        UnderlayDirector.getSnapshot(runtimeId),
        MotionDirector.getSnapshot(runtimeId),
        LightingDirector.getSnapshot(runtimeId),
        FXDirector.getSnapshot(runtimeId),
        SoundDirector.getSnapshot(runtimeId),
        CrowdDirector.getSnapshot(runtimeId),
        BroadcastDirector.getSnapshot(runtimeId),
        MonitorDirector.getSnapshot(runtimeId),
        AccessibilityDirector.getSnapshot(runtimeId),
        this.getSnapshot(runtimeId),
      ],
      suggestedBroadcastRoomType: BroadcastDirector.getSuggestedRoomType(),
      monitorAllocations: MonitorDirector.getAllocations(runtimeId).length,
    };
  }

  private publish() {
    this.last = this.build("default");
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
