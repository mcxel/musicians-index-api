/**
 * SoundDirector.ts — Phase 5.1 Presentation Director Service.
 * Routes UI sounds, broadcast stingers, ambience, crowd audio, and AI voice responses.
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

class SoundDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "sound";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "SOUND") {
      return { valid: false, reason: `Invalid director '${command.director}' for SoundDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "sound",
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
      directorId: "sound",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Unified presentation sound & audio focus routing.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const SoundDirector = new SoundDirectorEngine();
export default SoundDirector;
