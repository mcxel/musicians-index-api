/**
 * BroadcastDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns multi-cam program selection, picture-in-picture, replay sequences, commercial bumpers, and lower thirds.
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

class BroadcastDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "broadcast";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "BROADCAST") {
      return { valid: false, reason: `Invalid director '${command.director}' for BroadcastDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const intent: PlacementIntent = {
      directorId: "broadcast",
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

  public getSuggestedRoomType(): string {
    return "battle_arena";
  }

  public getSnapshot(runtimeId: string = "default"): DirectorSnapshot {
    const last = this.lastIntents.get(runtimeId) ?? null;
    return {
      directorId: "broadcast",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Television producer & broadcast composite feed controller.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const BroadcastDirector = new BroadcastDirectorEngine();
export default BroadcastDirector;
