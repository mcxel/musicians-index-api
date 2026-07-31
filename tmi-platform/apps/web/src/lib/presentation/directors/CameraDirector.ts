/**
 * CameraDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns active camera targets, spatial anchor framing, cinematic transitions, and fly-in behaviors.
 */

import ShowPackageDirector, { type ActiveShowPackageSnapshot } from "../ShowPackageDirector";
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
import { MASTER_SPATIAL_ANCHORS, SpatialAnchorId } from "../PresentationDirector";

class CameraDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "camera";
  private activeCommands: Map<string, PresentationCommand> = new Map(); // Keyed by runtimeId
  private lastIntents: Map<string, PlacementIntent> = new Map();
  private unsub: (() => void) | null = null;

  public start() {
    if (this.unsub) return;
    this.unsub = ShowPackageDirector.subscribe((snap) => this.onPackage(snap));
  }

  public stop() {
    this.unsub?.();
    this.unsub = null;
  }

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "CAMERA") {
      return { valid: false, reason: `Invalid director '${command.director}' for CameraDirector.` };
    }
    const payload = command.payload as { targetAnchorId?: string };
    if (payload?.targetAnchorId && !MASTER_SPATIAL_ANCHORS[payload.targetAnchorId as SpatialAnchorId]) {
      return { valid: false, reason: `Target anchor '${payload.targetAnchorId}' is not registered.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const payload = (command.payload ?? {}) as { targetAnchorId?: string; caption?: string; mode?: string };
    const intent: PlacementIntent = {
      directorId: "camera",
      at: Date.now(),
      command: command.action,
      caption: payload.caption ?? command.action,
      meta: {
        runtimeId: command.runtimeId,
        correlationId: command.correlationId,
        targetAnchorId: payload.targetAnchorId ?? "performer-primary",
        mode: payload.mode ?? "FOLLOW",
      },
    };

    this.lastIntents.set(command.runtimeId, intent);
    emitPlacementIntent(intent);
  }

  public async cancel(runtimeId: string, _reason: string): Promise<void> {
    this.activeCommands.delete(runtimeId);
  }

  public getSnapshot(runtimeId: string = "default"): DirectorSnapshot {
    const last = this.lastIntents.get(runtimeId) ?? null;
    return {
      directorId: "camera",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Spatial camera framing via certified spatial anchors.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
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
    this.lastIntents.set("default", intent);
    emitPlacementIntent(intent);
  }
}

export const CameraDirector = new CameraDirectorEngine();
export default CameraDirector;
