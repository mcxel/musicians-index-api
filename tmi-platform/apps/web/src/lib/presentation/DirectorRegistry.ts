/**
 * DirectorRegistry.ts — Canonical registry for discovering and dispatching commands
 * to all 12 Presentation Directors in TMI.
 * Manages runtime isolation, health checks, and aggregated telemetry snapshots.
 */

import {
  DirectorId,
  DirectorSnapshot,
  DirectorValidationResult,
  PresentationCommand,
  PresentationContext,
  PresentationDirectorService,
} from "./directors/types";

class DirectorRegistryEngine {
  private directors: Map<DirectorId, PresentationDirectorService> = new Map();

  /** Register a director service */
  public register(director: PresentationDirectorService): void {
    this.directors.set(director.id, director);
  }

  /** Retrieve a specific director by ID */
  public getDirector(id: DirectorId): PresentationDirectorService | undefined {
    return this.directors.get(id);
  }

  /** Dispatch a PresentationCommand envelope to the appropriate director */
  public async dispatch<TResult = void>(
    command: PresentationCommand,
    context: PresentationContext,
  ): Promise<{ ok: boolean; result?: TResult; error?: string }> {
    const directorId = command.director.toLowerCase() as DirectorId;
    const director = this.directors.get(directorId);

    if (!director) {
      return { ok: false, error: `Director '${command.director}' is not registered.` };
    }

    const val: DirectorValidationResult = director.validate(command);
    if (!val.valid) {
      return { ok: false, error: val.reason ?? "Command validation failed." };
    }

    try {
      const res = (await director.execute(command, context)) as TResult;
      return { ok: true, result: res };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Director execution error";
      return { ok: false, error: msg };
    }
  }

  /** Cancel all commands for a specific runtime across all directors */
  public async cancelRuntime(runtimeId: string, reason: string): Promise<void> {
    const tasks = Array.from(this.directors.values()).map((d) =>
      d.cancel(runtimeId, reason),
    );
    await Promise.all(tasks);
  }

  /** Reset state for a specific runtime across all directors */
  public async resetRuntime(runtimeId: string): Promise<void> {
    const tasks = Array.from(this.directors.values()).map((d) => d.reset(runtimeId));
    await Promise.all(tasks);
  }

  /** Get aggregated telemetry snapshots from all directors */
  public getAggregatedSnapshots(runtimeId?: string): Record<DirectorId, DirectorSnapshot> {
    const snapshots = {} as Record<DirectorId, DirectorSnapshot>;
    this.directors.forEach((director, id) => {
      snapshots[id] = director.getSnapshot(runtimeId);
    });
    return snapshots;
  }

  /** List all registered director IDs */
  public getRegisteredDirectorIds(): DirectorId[] {
    return Array.from(this.directors.keys());
  }
}

export const DirectorRegistry = new DirectorRegistryEngine();
export default DirectorRegistry;
