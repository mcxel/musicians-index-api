/**
 * CrowdDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns audience reaction behaviors (cheer, clap, stand, sit, dance, wave, flashlights, emoji rain).
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

class CrowdDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "crowd";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "CROWD") {
      return { valid: false, reason: `Invalid director '${command.director}' for CrowdDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "crowd",
      at: Date.now(),
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
      directorId: "crowd",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Audience behavior & reaction orchestration.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const CrowdDirector = new CrowdDirectorEngine();
export default CrowdDirector;
