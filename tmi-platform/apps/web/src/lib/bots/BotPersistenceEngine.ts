// BotPersistenceEngine.ts
// Orchestrates bot state persistence, recovery, and replay

import BotMemoryStorageEngine, {
  BotMemoryRecord,
  BotTask,
  BotGoal,
  BotMemoryEntry,
} from './BotMemoryStorageEngine';
import BotCheckpointEngine from './BotCheckpointEngine';
import BotStateReplayEngine, { BotAction } from './BotStateReplayEngine';
import BotRecoveryEngine from './BotRecoveryEngine';

export type BotPersistenceDriver = "memory" | "redis" | "postgres";

export interface BotTaskState {
  id: string;
  title: string;
  status: "queued" | "in-progress" | "completed" | "failed";
  updatedAt: string;
}

export interface BotGoalState {
  id: string;
  description: string;
  progress: number;
  updatedAt: string;
}

export interface BotMemoryState {
  key: string;
  value: string;
  updatedAt: string;
}

export interface BotChatState {
  threadId: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface BotRoomState {
  roomId: string;
  mode: "idle" | "monitoring" | "active";
  occupancy: number;
  updatedAt: string;
}

export interface BotProgressState {
  checkpoint: string;
  completion: number;
  updatedAt: string;
}

export interface BotPersistenceSnapshot {
  botId: string;
  tasks: BotTaskState[];
  goals: BotGoalState[];
  memory: BotMemoryState[];
  chats: BotChatState[];
  rooms: BotRoomState[];
  progress: BotProgressState[];
  persistedAt: string;
  driver: BotPersistenceDriver;
}

interface BotPersistenceAdapter {
  save(botId: string, snapshot: BotPersistenceSnapshot): Promise<void>;
  load(botId: string): Promise<BotPersistenceSnapshot | null>;
}

const IN_MEMORY_STORE = new Map<string, BotPersistenceSnapshot>();

class MemoryAdapter implements BotPersistenceAdapter {
  async save(botId: string, snapshot: BotPersistenceSnapshot): Promise<void> {
    IN_MEMORY_STORE.set(botId, snapshot);
  }

  async load(botId: string): Promise<BotPersistenceSnapshot | null> {
    return IN_MEMORY_STORE.get(botId) ?? null;
  }
}

class RedisRestAdapter implements BotPersistenceAdapter {
  async save(botId: string, snapshot: BotPersistenceSnapshot): Promise<void> {
    const baseUrl = process.env.REDIS_REST_URL;
    const token = process.env.REDIS_REST_TOKEN;
    if (!baseUrl || !token) {
      throw new Error("REDIS_REST_URL or REDIS_REST_TOKEN missing");
    }

    const key = `bot:persistence:${botId}`;
    await fetch(`${baseUrl}/set/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snapshot),
    });
  }

  async load(botId: string): Promise<BotPersistenceSnapshot | null> {
    const baseUrl = process.env.REDIS_REST_URL;
    const token = process.env.REDIS_REST_TOKEN;
    if (!baseUrl || !token) {
      throw new Error("REDIS_REST_URL or REDIS_REST_TOKEN missing");
    }

    const key = `bot:persistence:${botId}`;
    const response = await fetch(`${baseUrl}/get/${encodeURIComponent(key)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { result?: string | null };
    if (!payload?.result) return null;

    return JSON.parse(payload.result) as BotPersistenceSnapshot;
  }
}

class PostgresApiAdapter implements BotPersistenceAdapter {
  async save(botId: string, snapshot: BotPersistenceSnapshot): Promise<void> {
    const endpoint = process.env.BOT_PERSISTENCE_POSTGRES_ENDPOINT;
    const token = process.env.BOT_PERSISTENCE_POSTGRES_TOKEN;
    if (!endpoint) {
      throw new Error("BOT_PERSISTENCE_POSTGRES_ENDPOINT missing");
    }

    await fetch(`${endpoint.replace(/\/$/, "")}/bot-persistence/${encodeURIComponent(botId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(snapshot),
    });
  }

  async load(botId: string): Promise<BotPersistenceSnapshot | null> {
    const endpoint = process.env.BOT_PERSISTENCE_POSTGRES_ENDPOINT;
    const token = process.env.BOT_PERSISTENCE_POSTGRES_TOKEN;
    if (!endpoint) {
      throw new Error("BOT_PERSISTENCE_POSTGRES_ENDPOINT missing");
    }

    const response = await fetch(`${endpoint.replace(/\/$/, "")}/bot-persistence/${encodeURIComponent(botId)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) return null;
    return (await response.json()) as BotPersistenceSnapshot;
  }
}

function resolveDriver(): BotPersistenceDriver {
  const configured = (process.env.BOT_PERSISTENCE_DRIVER || "memory").toLowerCase();
  if (configured === "redis") return "redis";
  if (configured === "postgres") return "postgres";
  return "memory";
}

function resolveAdapter(): BotPersistenceAdapter {
  const driver = resolveDriver();
  if (driver === "redis") return new RedisRestAdapter();
  if (driver === "postgres") return new PostgresApiAdapter();
  return new MemoryAdapter();
}

function createEmptySnapshot(botId: string): BotPersistenceSnapshot {
  return {
    botId,
    tasks: [],
    goals: [],
    memory: [],
    chats: [],
    rooms: [],
    progress: [],
    persistedAt: new Date().toISOString(),
    driver: resolveDriver(),
  };
}

export interface BotPersistenceConfig {
  storageAdapter: 'redis' | 'postgres' | 'memory';
  checkpointIntervalMs: number;
  autoRecoveryEnabled: boolean;
  maxRetries: number;
}

export class BotPersistenceEngine {
  private memoryEngine: BotMemoryStorageEngine;
  private config: BotPersistenceConfig;
  private botIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<BotPersistenceConfig> = {}) {
    this.config = {
      storageAdapter: config.storageAdapter ?? 'memory',
      checkpointIntervalMs: config.checkpointIntervalMs ?? 300000,
      autoRecoveryEnabled: config.autoRecoveryEnabled ?? true,
      maxRetries: config.maxRetries ?? 3,
    };
    this.memoryEngine = new BotMemoryStorageEngine({ adapter: this.config.storageAdapter });
  }

  // ===== Legacy Snapshot Methods (v1) =====
  static async loadSnapshot(botId: string): Promise<BotPersistenceSnapshot> {
    const adapter = resolveAdapter();
    try {
      const snapshot = await adapter.load(botId);
      return snapshot ?? createEmptySnapshot(botId);
    } catch {
      return IN_MEMORY_STORE.get(botId) ?? createEmptySnapshot(botId);
    }
  }

  static async saveSnapshot(snapshot: BotPersistenceSnapshot): Promise<void> {
    const adapter = resolveAdapter();
    const next: BotPersistenceSnapshot = {
      ...snapshot,
      persistedAt: new Date().toISOString(),
      driver: resolveDriver(),
    };
    try {
      await adapter.save(snapshot.botId, next);
      IN_MEMORY_STORE.set(snapshot.botId, next);
    } catch {
      IN_MEMORY_STORE.set(snapshot.botId, next);
    }
  }

  static async upsertTask(botId: string, task: BotTaskState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.tasks.filter((item) => item.id !== task.id);
    snapshot.tasks = [task, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  static async upsertGoal(botId: string, goal: BotGoalState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.goals.filter((item) => item.id !== goal.id);
    snapshot.goals = [goal, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  static async upsertMemory(botId: string, memory: BotMemoryState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.memory.filter((item) => item.key !== memory.key);
    snapshot.memory = [memory, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  static async upsertChat(botId: string, chat: BotChatState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.chats.filter((item) => item.threadId !== chat.threadId);
    snapshot.chats = [chat, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  static async upsertRoom(botId: string, room: BotRoomState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.rooms.filter((item) => item.roomId !== room.roomId);
    snapshot.rooms = [room, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  static async upsertProgress(botId: string, progress: BotProgressState): Promise<BotPersistenceSnapshot> {
    const snapshot = await this.loadSnapshot(botId);
    const rest = snapshot.progress.filter((item) => item.checkpoint !== progress.checkpoint);
    snapshot.progress = [progress, ...rest];
    await this.saveSnapshot(snapshot);
    return snapshot;
  }

  // ===== New Persistence Methods (v2) with Recovery =====
  async initializeBot(botId: string, botName: string, botRole: string): Promise<BotMemoryRecord> {
    const memory = await this.memoryEngine.initializeBotMemory(botId, botName, botRole);
    if (this.config.autoRecoveryEnabled) {
      this.startCheckpointing(botId);
    }
    return memory;
  }

  private startCheckpointing(botId: string): void {
    if (this.botIntervals.has(botId)) return;
    const interval = setInterval(async () => {
      try {
        const memory = await this.memoryEngine.getRecord(botId);
        if (!memory) return;
        const pendingActions = await BotStateReplayEngine.getPendingActions(botId);
        const goalProgressSnapshot: Record<string, number> = {};
        for (const goal of memory.goalProgress) {
          goalProgressSnapshot[goal.id] = goal.progress;
        }
        await BotCheckpointEngine.createCheckpoint(botId, `auto-checkpoint-${Date.now()}`, {
          taskQueueLength: memory.taskHistory.filter(t => t.status === 'pending').length,
          completedTasks: memory.taskHistory.filter(t => t.status === 'completed').length,
          failedTasks: memory.taskHistory.filter(t => t.status === 'failed').length,
          goalProgressSnapshot,
          lastMemoryLogId: memory.memoryLogs[memory.memoryLogs.length - 1]?.id ?? '',
          lastRoomId: memory.roomParticipation[memory.roomParticipation.length - 1]?.roomId,
          lastVenueId: memory.venueAttendance[memory.venueAttendance.length - 1]?.venueId,
          systemHealth: pendingActions.length > 0 ? 'degraded' : 'healthy',
          metadata: { autoCheckpoint: true },
        });
      } catch (error) {
        console.error(`[BotPersistenceEngine] Error checkpointing bot ${botId}:`, error);
      }
    }, this.config.checkpointIntervalMs);
    this.botIntervals.set(botId, interval);
  }

  stopCheckpointing(botId: string): void {
    const interval = this.botIntervals.get(botId);
    if (interval) {
      clearInterval(interval);
      this.botIntervals.delete(botId);
    }
  }

  async recordTask(botId: string, task: BotTask): Promise<void> {
    await this.memoryEngine.appendTask(botId, task);
    await BotStateReplayEngine.logAction(botId, 'task-start', { taskId: task.id, title: task.title });
  }

  async recordBattle(botId: string, battleId: string, battleType: string, result: 'won' | 'lost' | 'draw' | 'participated'): Promise<void> {
    await this.memoryEngine.recordBattle(botId, { battleId, battleType, participatedAt: Date.now(), result });
    await BotStateReplayEngine.logAction(botId, 'battle-participate', { battleId, battleType, result });
  }

  async recordModerationAction(botId: string, target: string, actionType: string, reason: string): Promise<void> {
    await this.memoryEngine.recordModerationAction(botId, {
      id: `mod_${botId}_${Date.now()}`,
      actionType,
      target,
      reason,
      takenAt: Date.now(),
      status: 'pending',
    });
    await BotStateReplayEngine.logAction(botId, 'moderation', { target, actionType, reason });
  }

  async recordPromotionAction(botId: string, promotionType: string, targetSlug: string): Promise<void> {
    await this.memoryEngine.recordPromotionAction(botId, {
      id: `promo_${botId}_${Date.now()}`,
      promotionType,
      target: targetSlug,
      startedAt: Date.now(),
    });
    await BotStateReplayEngine.logAction(botId, 'promotion', { promotionType, targetSlug });
  }

  async recordTranslationAction(botId: string, sourceLanguage: string, targetLanguage: string, content: string, translatedContent: string): Promise<void> {
    await this.memoryEngine.recordTranslationAction(botId, {
      id: `trans_${botId}_${Date.now()}`,
      sourceLanguage,
      targetLanguage,
      content,
      translatedContent,
      translatedAt: Date.now(),
    });
    await BotStateReplayEngine.logAction(botId, 'translation', { sourceLanguage, targetLanguage });
  }

  async saveCheckpoint(botId: string, label: string): Promise<string> {
    const memory = await this.memoryEngine.getRecord(botId);
    if (!memory) throw new Error(`Bot ${botId} not found`);
    const goalProgressSnapshot: Record<string, number> = {};
    for (const goal of memory.goalProgress) {
      goalProgressSnapshot[goal.id] = goal.progress;
    }
    const checkpoint = await BotCheckpointEngine.createCheckpoint(botId, label, {
      taskQueueLength: memory.taskHistory.filter(t => t.status === 'pending').length,
      completedTasks: memory.taskHistory.filter(t => t.status === 'completed').length,
      failedTasks: memory.taskHistory.filter(t => t.status === 'failed').length,
      goalProgressSnapshot,
      lastMemoryLogId: memory.memoryLogs[memory.memoryLogs.length - 1]?.id ?? '',
      systemHealth: 'healthy',
      metadata: { manual: true },
    });
    return checkpoint.checkpointId;
  }

  async resumeCheckpoint(checkpointId: string): Promise<boolean> {
    const checkpoint = await BotCheckpointEngine.getCheckpoint(checkpointId);
    if (!checkpoint) return false;
    const recovery = await BotRecoveryEngine.recoverToCheckpoint(checkpoint.botId, checkpointId);
    return recovery.status === 'success';
  }

  async replayActions(botId: string, sinceTimestamp: number): Promise<number> {
    const result = await BotStateReplayEngine.replayPendingActions(botId);
    return result.applied;
  }

  async recoverBot(botId: string): Promise<boolean> {
    const attempt = await BotRecoveryEngine.recoverBot(botId);
    return attempt.status === 'success';
  }

  async archiveBotMemory(botId: string): Promise<string | null> {
    return await BotRecoveryEngine.archiveBotMemory(botId);
  }

  shutdown(): void {
    for (const [botId, interval] of this.botIntervals) {
      clearInterval(interval);
    }
    this.botIntervals.clear();
  }
}

export default BotPersistenceEngine;
