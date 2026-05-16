// BotCheckpointEngine.ts
// Manages bot state snapshots for recovery and replay

export interface BotCheckpoint {
  checkpointId: string;
  botId: string;
  timestamp: number;
  label: string; // e.g., "pre-battle-001", "hourly-snapshot", "error-recovery"
  taskQueueLength: number;
  completedTasks: number;
  failedTasks: number;
  goalProgressSnapshot: Record<string, number>; // goalId → progress percentage
  lastMemoryLogId: string;
  lastRoomId?: string;
  lastVenueId?: string;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  metadata: Record<string, any>;
}

interface CheckpointStorage {
  [botId: string]: BotCheckpoint[];
}

const CHECKPOINT_STORE: CheckpointStorage = {};
const MAX_CHECKPOINTS_PER_BOT = 50;

export class BotCheckpointEngine {
  /**
   * Create a snapshot checkpoint
   */
  static async createCheckpoint(
    botId: string,
    label: string,
    state: {
      taskQueueLength: number;
      completedTasks: number;
      failedTasks: number;
      goalProgressSnapshot: Record<string, number>;
      lastMemoryLogId: string;
      lastRoomId?: string;
      lastVenueId?: string;
      systemHealth: 'healthy' | 'degraded' | 'critical';
      metadata?: Record<string, any>;
    }
  ): Promise<BotCheckpoint> {
    const checkpoint: BotCheckpoint = {
      checkpointId: `ckpt_${botId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      botId,
      timestamp: Date.now(),
      label,
      ...state,
      metadata: state.metadata ?? {},
    };

    if (!CHECKPOINT_STORE[botId]) {
      CHECKPOINT_STORE[botId] = [];
    }

    CHECKPOINT_STORE[botId].push(checkpoint);

    // Keep only recent checkpoints
    if (CHECKPOINT_STORE[botId].length > MAX_CHECKPOINTS_PER_BOT) {
      CHECKPOINT_STORE[botId] = CHECKPOINT_STORE[botId].slice(-MAX_CHECKPOINTS_PER_BOT);
    }

    return checkpoint;
  }

  /**
   * Get checkpoint by ID
   */
  static async getCheckpoint(checkpointId: string): Promise<BotCheckpoint | null> {
    for (const botCheckpoints of Object.values(CHECKPOINT_STORE)) {
      const checkpoint = botCheckpoints.find(c => c.checkpointId === checkpointId);
      if (checkpoint) return checkpoint;
    }
    return null;
  }

  /**
   * Get latest checkpoint for a bot
   */
  static async getLatestCheckpoint(botId: string): Promise<BotCheckpoint | null> {
    const checkpoints = CHECKPOINT_STORE[botId];
    if (!checkpoints || checkpoints.length === 0) return null;
    return checkpoints[checkpoints.length - 1];
  }

  /**
   * Get all checkpoints for a bot
   */
  static async getCheckpointsByBot(botId: string): Promise<BotCheckpoint[]> {
    return CHECKPOINT_STORE[botId] ?? [];
  }

  /**
   * List recent checkpoints across all bots (for admin observatory)
   */
  static async listRecentCheckpoints(limit: number = 100): Promise<BotCheckpoint[]> {
    const all: BotCheckpoint[] = [];
    for (const checkpoints of Object.values(CHECKPOINT_STORE)) {
      all.push(...checkpoints);
    }
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Restore a bot to a specific checkpoint
   */
  static async restoreFromCheckpoint(checkpointId: string): Promise<BotCheckpoint | null> {
    const checkpoint = await this.getCheckpoint(checkpointId);
    if (!checkpoint) return null;

    // Log restoration attempt
    console.log(`[BotCheckpointEngine] Restoring bot ${checkpoint.botId} from checkpoint ${checkpointId} (label: ${checkpoint.label})`);

    return checkpoint;
  }

  /**
   * Compare two checkpoints to see state changes
   */
  static async compareCheckpoints(
    checkpointId1: string,
    checkpointId2: string
  ): Promise<{
    taskQueueDelta: number;
    completedTasksDelta: number;
    failedTasksDelta: number;
    goalProgressDeltas: Record<string, number>;
    healthChange: string;
  } | null> {
    const cp1 = await this.getCheckpoint(checkpointId1);
    const cp2 = await this.getCheckpoint(checkpointId2);

    if (!cp1 || !cp2) return null;

    const goalDeltas: Record<string, number> = {};
    for (const goalId in cp2.goalProgressSnapshot) {
      const prev = cp1.goalProgressSnapshot[goalId] ?? 0;
      const curr = cp2.goalProgressSnapshot[goalId] ?? 0;
      goalDeltas[goalId] = curr - prev;
    }

    return {
      taskQueueDelta: cp2.taskQueueLength - cp1.taskQueueLength,
      completedTasksDelta: cp2.completedTasks - cp1.completedTasks,
      failedTasksDelta: cp2.failedTasks - cp1.failedTasks,
      goalProgressDeltas: goalDeltas,
      healthChange: `${cp1.systemHealth} → ${cp2.systemHealth}`,
    };
  }

  /**
   * Clean up old checkpoints for a bot (keep only recent N)
   */
  static async pruneCheckpoints(botId: string, keepCount: number = 20): Promise<void> {
    if (!CHECKPOINT_STORE[botId]) return;
    if (CHECKPOINT_STORE[botId].length > keepCount) {
      CHECKPOINT_STORE[botId] = CHECKPOINT_STORE[botId].slice(-keepCount);
    }
  }

  /**
   * Export checkpoint as JSON for backup
   */
  static async exportCheckpoint(checkpointId: string): Promise<string | null> {
    const checkpoint = await this.getCheckpoint(checkpointId);
    if (!checkpoint) return null;
    return JSON.stringify(checkpoint, null, 2);
  }

  /**
   * Delete a checkpoint
   */
  static async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    for (const botId in CHECKPOINT_STORE) {
      const idx = CHECKPOINT_STORE[botId].findIndex(c => c.checkpointId === checkpointId);
      if (idx !== -1) {
        CHECKPOINT_STORE[botId].splice(idx, 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Get health summary across all bot checkpoints
   */
  static async getHealthSummary(): Promise<{
    totalCheckpoints: number;
    healthyBots: number;
    degradedBots: number;
    criticalBots: number;
  }> {
    const bots = new Map<string, 'healthy' | 'degraded' | 'critical'>();

    for (const botId in CHECKPOINT_STORE) {
      const latest = CHECKPOINT_STORE[botId][CHECKPOINT_STORE[botId].length - 1];
      if (latest) {
        bots.set(botId, latest.systemHealth);
      }
    }

    let healthy = 0,
      degraded = 0,
      critical = 0;
    for (const health of bots.values()) {
      if (health === 'healthy') healthy++;
      else if (health === 'degraded') degraded++;
      else if (health === 'critical') critical++;
    }

    return {
      totalCheckpoints: Object.values(CHECKPOINT_STORE).reduce((sum, arr) => sum + arr.length, 0),
      healthyBots: healthy,
      degradedBots: degraded,
      criticalBots: critical,
    };
  }
}

export default BotCheckpointEngine;

export type BotGovernanceCheckpointPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type BotGovernanceCheckpoint = {
  checkpointId: string;
  botId: string;
  period: BotGovernanceCheckpointPeriod;
  expectedProgress: number;
  actualProgress: number;
  status: "passed" | "missed" | "blocked";
  notes: string;
  createdAt: number;
};

const governanceCheckpointMap = new Map<string, BotGovernanceCheckpoint[]>();

export function createGovernanceCheckpoint(input: {
  botId: string;
  period: BotGovernanceCheckpointPeriod;
  expectedProgress: number;
  actualProgress: number;
  notes?: string;
}): BotGovernanceCheckpoint {
  const status: BotGovernanceCheckpoint["status"] =
    input.actualProgress >= input.expectedProgress
      ? "passed"
      : input.actualProgress === 0
        ? "blocked"
        : "missed";

  const checkpoint: BotGovernanceCheckpoint = {
    checkpointId: `gov-checkpoint-${input.botId}-${input.period}-${Date.now()}`,
    botId: input.botId,
    period: input.period,
    expectedProgress: input.expectedProgress,
    actualProgress: input.actualProgress,
    status,
    notes: input.notes ?? "auto-generated governance checkpoint",
    createdAt: Date.now(),
  };

  const list = governanceCheckpointMap.get(input.botId) ?? [];
  governanceCheckpointMap.set(input.botId, [...list, checkpoint]);
  return checkpoint;
}

export function listGovernanceCheckpoints(botId?: string): BotGovernanceCheckpoint[] {
  if (botId) return governanceCheckpointMap.get(botId) ?? [];
  return [...governanceCheckpointMap.values()].flat();
}

export function ensureGovernanceCheckpoints(botId: string): BotGovernanceCheckpoint[] {
  const existing = listGovernanceCheckpoints(botId);
  if (existing.length > 0) return existing;
  return [
    createGovernanceCheckpoint({ botId, period: "daily", expectedProgress: 20, actualProgress: 18 }),
    createGovernanceCheckpoint({ botId, period: "weekly", expectedProgress: 100, actualProgress: 74 }),
    createGovernanceCheckpoint({ botId, period: "monthly", expectedProgress: 100, actualProgress: 90 }),
    createGovernanceCheckpoint({ botId, period: "yearly", expectedProgress: 100, actualProgress: 100 }),
  ];
}
