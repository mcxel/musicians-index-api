import type { ModuleId, CheckpointData } from "./types.js";
import { randomUUID } from "crypto";

/** In-memory checkpoint store. In production, swap for Redis/DB persistence. */
export class RecoveryController {
  private moduleId: ModuleId;
  private checkpoints: CheckpointData[] = [];
  private maxCheckpoints: number;
  private checkpointTimer: ReturnType<typeof setInterval> | null = null;

  constructor(moduleId: ModuleId, maxCheckpoints = 10) {
    this.moduleId = moduleId;
    this.maxCheckpoints = maxCheckpoints;
  }

  /** Save a state snapshot. Returns the checkpoint ID. */
  checkpoint(state: Record<string, unknown>, reason = "auto"): string {
    const id = randomUUID();
    const entry: CheckpointData = {
      id,
      moduleId: this.moduleId,
      state,
      timestamp: Date.now(),
      reason,
    };
    this.checkpoints.push(entry);
    if (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints.shift(); // drop oldest
    }
    console.log(
      `[${this.moduleId}/recovery] Checkpoint saved: ${id} (${reason})`
    );
    return id;
  }

  /** Roll back to a specific checkpoint by ID. Returns state or null. */
  rollback(checkpointId: string): Record<string, unknown> | null {
    const entry = this.checkpoints.find((c) => c.id === checkpointId);
    if (!entry) {
      console.error(
        `[${this.moduleId}/recovery] Rollback failed: checkpoint ${checkpointId} not found`
      );
      return null;
    }
    console.warn(
      `[${this.moduleId}/recovery] Rolling back to checkpoint ${checkpointId} (${entry.reason})`
    );
    return entry.state;
  }

  /** Roll back to the most recent checkpoint. */
  rollbackLatest(): Record<string, unknown> | null {
    if (this.checkpoints.length === 0) return null;
    const latest = this.checkpoints[this.checkpoints.length - 1];
    return this.rollback(latest.id);
  }

  listCheckpoints(): Omit<CheckpointData, "state">[] {
    return this.checkpoints.map(({ id, moduleId, timestamp, reason }) => ({
      id,
      moduleId,
      timestamp,
      reason,
      state: {},
    }));
  }

  getLatestId(): string | null {
    return this.checkpoints.length > 0
      ? this.checkpoints[this.checkpoints.length - 1].id
      : null;
  }

  /** Start automatic checkpointing on an interval. */
  startAuto(
    intervalMs: number,
    getState: () => Record<string, unknown>
  ): void {
    this.checkpointTimer = setInterval(() => {
      this.checkpoint(getState(), "auto");
    }, intervalMs);
  }

  stopAuto(): void {
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }
  }
}
