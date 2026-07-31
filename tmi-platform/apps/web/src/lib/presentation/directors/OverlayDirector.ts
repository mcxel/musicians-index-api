/**
 * OverlayDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns viewport & world-space lower thirds, winner banners, score bugs, and sponsor overlays.
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

class OverlayDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "overlay";
  private activeCommands: Map<string, PresentationCommand> = new Map();
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
    if (command.director !== "OVERLAY") {
      return { valid: false, reason: `Invalid director '${command.director}' for OverlayDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "overlay",
      at: Date.now(),
      layer: "OVERLAYS",
      command: command.action,
      meta: {
        runtimeId: command.runtimeId,
        correlationId: command.correlationId,
        payload: command.payload,
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
      directorId: "overlay",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Broadcast overlays, score bugs, and HUD cards.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }

  private onPackage(snap: ActiveShowPackageSnapshot) {
    const surfaces = snap.activeSurfaceIds;
    if (!surfaces.length) return;
    const intent: PlacementIntent = {
      directorId: "overlay",
      at: Date.now(),
      layer: "OVERLAYS",
      command: "MOUNT_PACKAGE_OVERLAYS",
      meta: { packId: snap.packId, phaseId: snap.phaseId, surfaceIds: surfaces },
    };
    this.lastIntents.set("default", intent);
    emitPlacementIntent(intent);
  }
}

export const OverlayDirector = new OverlayDirectorEngine();
export default OverlayDirector;
