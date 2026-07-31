/**
 * UnderlayDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns floor graphics, beat-reactive rings, dance floor grids, and stage projections.
 */

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

class UnderlayDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "underlay";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "UNDERLAY") {
      return { valid: false, reason: `Invalid director '${command.director}' for UnderlayDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "underlay",
      at: Date.now(),
      layer: "UNDERLAY",
      command: command.action,
      meta: { runtimeId: command.runtimeId, payload: command.payload },
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
      directorId: "underlay",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Stage floor projections and beat-reactive underlays.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const UnderlayDirector = new UnderlayDirectorEngine();
export default UnderlayDirector;
