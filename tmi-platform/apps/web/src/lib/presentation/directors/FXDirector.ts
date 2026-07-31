/**
 * FXDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns particle budgets, emitters (confetti, smoke, sparks, lasers), and device-tier limits.
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

class FXDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "fx";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "FX") {
      return { valid: false, reason: `Invalid director '${command.director}' for FXDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const tier = context.deviceCapabilityProfile?.tier ?? "high";
    const intent: PlacementIntent = {
      directorId: "fx",
      at: Date.now(),
      command: command.action,
      meta: { runtimeId: command.runtimeId, payload: command.payload, qualityTier: tier },
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
      directorId: "fx",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Particle budget & environmental FX management.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const FXDirector = new FXDirectorEngine();
export default FXDirector;
