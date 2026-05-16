// BotMemoryStorageEngine.ts
// Abstracts bot state storage for Redis, Postgres, or in-memory fallback

export interface BotMemoryRecord {
  botId: string;
  botName: string;
  botRole: string;
  taskHistory: BotTask[];
  goalProgress: BotGoal[];
  memoryLogs: BotMemoryEntry[];
  roomParticipation: RoomParticipationRecord[];
  battleHistory: BattleRecord[];
  venueAttendance: VenueAttendanceRecord[];
  moderationActions: ModerationActionRecord[];
  promotionActions: PromotionActionRecord[];
  translationActions: TranslationActionRecord[];
  lastUpdated: number;
  createdAt: number;
}

export interface BotTask {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  assignedAt: number;
  completedAt?: number;
  metadata: Record<string, any>;
}

export interface BotGoal {
  id: string;
  goal: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number; // 0–100
  targetMetric?: string;
  targetValue?: number;
  createdAt: number;
  updatedAt: number;
}

export interface BotMemoryEntry {
  id: string;
  timestamp: number;
  type: 'observation' | 'interaction' | 'learning' | 'event';
  content: string;
  context?: Record<string, any>;
  confidence?: number; // 0–1
}

export interface RoomParticipationRecord {
  roomId: string;
  roomName: string;
  roomType: string;
  joinedAt: number;
  leftAt?: number;
  duration: number; // milliseconds
  actions: number;
  participantCount?: number;
}

export interface BattleRecord {
  battleId: string;
  battleType: string;
  participatedAt: number;
  endedAt?: number;
  result?: 'won' | 'lost' | 'draw' | 'participated';
  score?: number;
  opponents?: string[];
}

export interface VenueAttendanceRecord {
  venueId: string;
  venueName: string;
  visitedAt: number;
  leftAt?: number;
  duration: number;
  eventId?: string;
  actions?: number;
}

export interface ModerationActionRecord {
  id: string;
  actionType: string;
  target: string;
  reason: string;
  takenAt: number;
  status: 'pending' | 'confirmed' | 'appealed' | 'resolved';
  authorizedBy?: string;
}

export interface PromotionActionRecord {
  id: string;
  promotionType: string;
  target: string; // artist/billboard/event/venue slug
  startedAt: number;
  endedAt?: number;
  result?: 'success' | 'partial' | 'failed';
  engagement?: number;
}

export interface TranslationActionRecord {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  content: string;
  translatedContent?: string;
  translatedAt: number;
  context?: string;
}

export interface BotMemoryStorageConfig {
  adapter: 'redis' | 'postgres' | 'memory';
  redisUrl?: string;
  postgresUrl?: string;
  ttlSeconds?: number; // For Redis expiration
}

// In-memory store for bot memory records
const IN_MEMORY_STORAGE = new Map<string, BotMemoryRecord>();

export class BotMemoryStorageEngine {
  private adapter: 'redis' | 'postgres' | 'memory';
  private ttlSeconds: number;

  constructor(config: BotMemoryStorageConfig = { adapter: 'memory' }) {
    this.adapter = config.adapter;
    this.ttlSeconds = config.ttlSeconds ?? 86400 * 30; // 30 days default
  }

  /**
   * Create or initialize a new bot memory record
   */
  async initializeBotMemory(
    botId: string,
    botName: string,
    botRole: string
  ): Promise<BotMemoryRecord> {
    const record: BotMemoryRecord = {
      botId,
      botName,
      botRole,
      taskHistory: [],
      goalProgress: [],
      memoryLogs: [],
      roomParticipation: [],
      battleHistory: [],
      venueAttendance: [],
      moderationActions: [],
      promotionActions: [],
      translationActions: [],
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    };
    await this.saveRecord(botId, record);
    return record;
  }

  /**
   * Get bot memory record by ID
   */
  async getRecord(botId: string): Promise<BotMemoryRecord | null> {
    try {
      if (this.adapter === 'memory') {
        return IN_MEMORY_STORAGE.get(botId) ?? null;
      }
      // Redis/Postgres would be fetched here
      return null;
    } catch (error) {
      console.error(`[BotMemoryStorageEngine] Error fetching record for ${botId}:`, error);
      return null;
    }
  }

  /**
   * Save bot memory record
   */
  async saveRecord(botId: string, record: BotMemoryRecord): Promise<void> {
    try {
      record.lastUpdated = Date.now();
      if (this.adapter === 'memory') {
        IN_MEMORY_STORAGE.set(botId, record);
      }
      // Redis/Postgres writes would happen here
    } catch (error) {
      console.error(`[BotMemoryStorageEngine] Error saving record for ${botId}:`, error);
    }
  }

  /**
   * Append task to bot history
   */
  async appendTask(botId: string, task: BotTask): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.taskHistory.push(task);
    await this.saveRecord(botId, record);
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(botId: string, goalId: string, progress: number): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    const goal = record.goalProgress.find(g => g.id === goalId);
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress));
      goal.updatedAt = Date.now();
      await this.saveRecord(botId, record);
    }
  }

  /**
   * Append memory entry
   */
  async appendMemoryEntry(botId: string, entry: BotMemoryEntry): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.memoryLogs.push(entry);
    // Keep only last 1000 memory entries to avoid bloat
    if (record.memoryLogs.length > 1000) {
      record.memoryLogs = record.memoryLogs.slice(-1000);
    }
    await this.saveRecord(botId, record);
  }

  /**
   * Record room participation
   */
  async recordRoomParticipation(
    botId: string,
    record: RoomParticipationRecord
  ): Promise<void> {
    const botRecord = await this.getRecord(botId);
    if (!botRecord) return;
    botRecord.roomParticipation.push(record);
    // Keep last 500 room records
    if (botRecord.roomParticipation.length > 500) {
      botRecord.roomParticipation = botRecord.roomParticipation.slice(-500);
    }
    await this.saveRecord(botId, botRecord);
  }

  /**
   * Record battle participation
   */
  async recordBattle(botId: string, battle: BattleRecord): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.battleHistory.push(battle);
    // Keep last 200 battle records
    if (record.battleHistory.length > 200) {
      record.battleHistory = record.battleHistory.slice(-200);
    }
    await this.saveRecord(botId, record);
  }

  /**
   * Record venue attendance
   */
  async recordVenueAttendance(botId: string, venue: VenueAttendanceRecord): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.venueAttendance.push(venue);
    // Keep last 200 venue records
    if (record.venueAttendance.length > 200) {
      record.venueAttendance = record.venueAttendance.slice(-200);
    }
    await this.saveRecord(botId, record);
  }

  /**
   * Record moderation action
   */
  async recordModerationAction(
    botId: string,
    action: ModerationActionRecord
  ): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.moderationActions.push(action);
    // Keep all moderation actions (critical for audit)
    await this.saveRecord(botId, record);
  }

  /**
   * Record promotion action
   */
  async recordPromotionAction(botId: string, action: PromotionActionRecord): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.promotionActions.push(action);
    // Keep last 500 promotion actions
    if (record.promotionActions.length > 500) {
      record.promotionActions = record.promotionActions.slice(-500);
    }
    await this.saveRecord(botId, record);
  }

  /**
   * Record translation action
   */
  async recordTranslationAction(botId: string, action: TranslationActionRecord): Promise<void> {
    const record = await this.getRecord(botId);
    if (!record) return;
    record.translationActions.push(action);
    // Keep last 1000 translation actions
    if (record.translationActions.length > 1000) {
      record.translationActions = record.translationActions.slice(-1000);
    }
    await this.saveRecord(botId, record);
  }

  /**
   * Get all bots in storage (for admin observatories)
   */
  async getAllBots(): Promise<BotMemoryRecord[]> {
    if (this.adapter === 'memory') {
      return Array.from(IN_MEMORY_STORAGE.values());
    }
    // Redis/Postgres would scan all bot records here
    return [];
  }

  /**
   * Clear bot memory (archive + delete)
   */
  async deleteBotRecord(botId: string): Promise<void> {
    if (this.adapter === 'memory') {
      IN_MEMORY_STORAGE.delete(botId);
    }
    // Redis/Postgres would delete the key here
  }

  /**
   * Export bot memory as JSON
   */
  async exportBotMemory(botId: string): Promise<string | null> {
    const record = await this.getRecord(botId);
    if (!record) return null;
    return JSON.stringify(record, null, 2);
  }

  /**
   * Import bot memory from JSON
   */
  async importBotMemory(botId: string, json: string): Promise<boolean> {
    try {
      const record = JSON.parse(json) as BotMemoryRecord;
      record.botId = botId; // Ensure ID matches
      await this.saveRecord(botId, record);
      return true;
    } catch (error) {
      console.error(`[BotMemoryStorageEngine] Error importing memory for ${botId}:`, error);
      return false;
    }
  }
}

export default BotMemoryStorageEngine;
