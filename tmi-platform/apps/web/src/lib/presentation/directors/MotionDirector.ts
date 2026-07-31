/**
 * MotionDirector.ts — Phase 5.1 Presentation Director Service.
 * Owns reusable animation presets, camera wipes, and drawer transitions with reduced motion support.
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

class MotionDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "motion";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "MOTION") {
      return { valid: false, reason: `Invalid director '${command.director}' for MotionDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const reduced = context.accessibilityProfile?.reducedMotion ?? false;
    const action = reduced ? `REDUCED_${command.action}` : command.action;

    const intent: PlacementIntent = {
      directorId: "motion",
      at: Date.now(),
      command: action,
      meta: { runtimeId: command.runtimeId, payload: command.payload, reducedMotion: reduced },
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
      directorId: "motion",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: "Animation vocabulary & broadcast wipes.",
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const MotionDirector = new MotionDirectorEngine();
export default MotionDirector;
