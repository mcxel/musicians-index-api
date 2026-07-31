/**
 * AccessibilityDirector.ts — Phase 5.1 Presentation Director Service.
 * Applies accessibility profiles (reduced motion, high contrast, captions, screen reader summaries)
 * to presentation commands before execution.
 */

import {
  DirectorId,
  DirectorSnapshot,
  DirectorValidationResult,
  PresentationCommand,
  PresentationContext,
  PresentationDirectorService,
  UserAccessibilityProfile,
  emitPlacementIntent,
  type PlacementIntent,
} from "./types";

class AccessibilityDirectorEngine implements PresentationDirectorService {
  public readonly id: DirectorId = "accessibility";
  private activeCommands: Map<string, PresentationCommand> = new Map();
  private lastIntents: Map<string, PlacementIntent> = new Map();
  private activeProfile: UserAccessibilityProfile = {
    reducedMotion: false,
    highContrast: false,
    closedCaptions: true,
    textScale: 1.0,
    colorSafePalette: false,
    screenReaderEnabled: false,
  };

  public validate(command: PresentationCommand): DirectorValidationResult {
    if (command.director !== "ACCESSIBILITY") {
      return { valid: false, reason: `Invalid director '${command.director}' for AccessibilityDirector.` };
    }
    return { valid: true };
  }

  public async execute(command: PresentationCommand, _context: PresentationContext): Promise<void> {
    this.activeCommands.set(command.runtimeId, command);

    const payload = (command.payload ?? {}) as Partial<UserAccessibilityProfile>;
    this.activeProfile = { ...this.activeProfile, ...payload };

    const intent: PlacementIntent = {
      directorId: "accessibility",
      at: Date.now(),
      command: command.action,
      meta: { runtimeId: command.runtimeId, profile: this.activeProfile },
    };

    this.lastIntents.set(command.runtimeId, intent);
    emitPlacementIntent(intent);
  }

  public async cancel(runtimeId: string, _reason: string): Promise<void> {
    this.activeCommands.delete(runtimeId);
  }

  public getActiveProfile(): UserAccessibilityProfile {
    return this.activeProfile;
  }

  public getSnapshot(runtimeId: string = "default"): DirectorSnapshot {
    const last = this.lastIntents.get(runtimeId) ?? null;
    return {
      directorId: "accessibility",
      status: last ? "ACTIVE" : "IDLE",
      lastIntent: last,
      activeCommandsCount: this.activeCommands.size,
      notes: `Accessibility adaptation profile (reducedMotion: ${this.activeProfile.reducedMotion}).`,
    };
  }

  public async reset(runtimeId: string = "default"): Promise<void> {
    this.activeCommands.delete(runtimeId);
    this.lastIntents.delete(runtimeId);
  }
}

export const AccessibilityDirector = new AccessibilityDirectorEngine();
export default AccessibilityDirector;
