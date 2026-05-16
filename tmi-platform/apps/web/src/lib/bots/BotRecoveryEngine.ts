// BotRecoveryEngine.ts
// Handles bot recovery after interruptions/failures

import BotCheckpointEngine, { BotCheckpoint } from './BotCheckpointEngine';
import BotStateReplayEngine from './BotStateReplayEngine';
import BotMemoryStorageEngine, { BotMemoryRecord } from './BotMemoryStorageEngine';

export interface RecoveryAttempt {
  attemptId: string;
  botId: string;
  initiatedAt: number;
  recoveryMethod: 'checkpoint' | 'replay' | 'manual' | 'hybrid';
  checkpointId?: string;
  actionReplayed: number;
  tasksRestored: number;
  status: 'in-progress' | 'success' | 'partial' | 'failed';
  completedAt?: number;
  notes: string;
}

interface RecoveryAttemptLog {
  [botId: string]: RecoveryAttempt[];
}

const RECOVERY_ATTEMPTS: RecoveryAttemptLog = {};

export class BotRecoveryEngine {
  private static storageEngine = new BotMemoryStorageEngine({ adapter: 'memory' });

  /**
   * Attempt to recover a bot to its last known good state
   */
  static async recoverBot(botId: string): Promise<RecoveryAttempt> {
    const attemptId = `rec_${botId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const attempt: RecoveryAttempt = {
      attemptId,
      botId,
      initiatedAt: Date.now(),
      recoveryMethod: 'hybrid',
      actionReplayed: 0,
      tasksRestored: 0,
      status: 'in-progress',
      notes: 'Starting recovery...',
    };

    if (!RECOVERY_ATTEMPTS[botId]) {
      RECOVERY_ATTEMPTS[botId] = [];
    }
    RECOVERY_ATTEMPTS[botId].push(attempt);

    try {
      // Step 1: Get latest checkpoint
      const checkpoint = await BotCheckpointEngine.getLatestCheckpoint(botId);

      if (checkpoint) {
        attempt.recoveryMethod = 'checkpoint';
        attempt.checkpointId = checkpoint.checkpointId;
        attempt.notes = `Recovering from checkpoint: ${checkpoint.label}`;

        // Step 2: Restore memory from checkpoint
        const memory = await this.storageEngine.getRecord(botId);
        if (memory) {
          // Update goal progress from checkpoint
          for (const [goalId, progress] of Object.entries(
            checkpoint.goalProgressSnapshot
          )) {
            await this.storageEngine.updateGoalProgress(botId, goalId, progress);
          }
        }
      }

      // Step 3: Replay pending actions
      const replayResult = await BotStateReplayEngine.replayPendingActions(botId);
      attempt.actionReplayed = replayResult.applied;
      attempt.status = replayResult.failed === 0 ? 'success' : 'partial';

      // Step 4: Get task count from memory
      const updatedMemory = await this.storageEngine.getRecord(botId);
      if (updatedMemory) {
        attempt.tasksRestored = updatedMemory.taskHistory.filter(
          t => t.status === 'in-progress'
        ).length;
      }

      attempt.completedAt = Date.now();
      attempt.notes =
        `Recovery complete. Replayed ${replayResult.applied} actions, ${replayResult.failed} failed, ${attempt.tasksRestored} tasks restored.`;

      return attempt;
    } catch (error) {
      attempt.status = 'failed';
      attempt.completedAt = Date.now();
      attempt.notes = `Recovery failed: ${error instanceof Error ? error.message : String(error)}`;
      return attempt;
    }
  }

  /**
   * Recover bot to a specific checkpoint
   */
  static async recoverToCheckpoint(botId: string, checkpointId: string): Promise<RecoveryAttempt> {
    const attemptId = `rec_${botId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const attempt: RecoveryAttempt = {
      attemptId,
      botId,
      initiatedAt: Date.now(),
      recoveryMethod: 'checkpoint',
      checkpointId,
      actionReplayed: 0,
      tasksRestored: 0,
      status: 'in-progress',
      notes: 'Restoring to specific checkpoint...',
    };

    if (!RECOVERY_ATTEMPTS[botId]) {
      RECOVERY_ATTEMPTS[botId] = [];
    }
    RECOVERY_ATTEMPTS[botId].push(attempt);

    try {
      const checkpoint = await BotCheckpointEngine.restoreFromCheckpoint(checkpointId);
      if (!checkpoint) {
        throw new Error(`Checkpoint ${checkpointId} not found`);
      }

      // Restore goal progress from checkpoint
      const memory = await this.storageEngine.getRecord(botId);
      if (memory) {
        for (const [goalId, progress] of Object.entries(
          checkpoint.goalProgressSnapshot
        )) {
          await this.storageEngine.updateGoalProgress(botId, goalId, progress);
        }
        attempt.tasksRestored = memory.taskHistory.filter(
          t => t.status === 'completed'
        ).length;
      }

      attempt.status = 'success';
      attempt.completedAt = Date.now();
      attempt.notes = `Successfully restored to checkpoint: ${checkpoint.label}`;

      return attempt;
    } catch (error) {
      attempt.status = 'failed';
      attempt.completedAt = Date.now();
      attempt.notes = `Failed to restore checkpoint: ${error instanceof Error ? error.message : String(error)}`;
      return attempt;
    }
  }

  /**
   * Manual recovery: mark specific tasks as recovered
   */
  static async manualRecover(
    botId: string,
    taskIds: string[],
    notes: string = ''
  ): Promise<RecoveryAttempt> {
    const attemptId = `rec_${botId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const attempt: RecoveryAttempt = {
      attemptId,
      botId,
      initiatedAt: Date.now(),
      recoveryMethod: 'manual',
      actionReplayed: taskIds.length,
      tasksRestored: taskIds.length,
      status: 'success',
      completedAt: Date.now(),
      notes: notes || `Manually recovered ${taskIds.length} tasks`,
    };

    if (!RECOVERY_ATTEMPTS[botId]) {
      RECOVERY_ATTEMPTS[botId] = [];
    }
    RECOVERY_ATTEMPTS[botId].push(attempt);

    return attempt;
  }

  /**
   * Get recovery attempt history for a bot
   */
  static async getRecoveryHistory(botId: string, limit: number = 50): Promise<RecoveryAttempt[]> {
    const history = RECOVERY_ATTEMPTS[botId] ?? [];
    return history.slice(-limit);
  }

  /**
   * Get latest successful recovery for a bot
   */
  static async getLastSuccessfulRecovery(botId: string): Promise<RecoveryAttempt | null> {
    const attempts = RECOVERY_ATTEMPTS[botId] ?? [];
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].status === 'success') {
        return attempts[i];
      }
    }
    return null;
  }

  /**
   * Check if a bot needs recovery (after downtime)
   */
  static async checkRecoveryNeeded(botId: string, maxIdleMs: number = 300000): Promise<boolean> {
    const memory = await this.storageEngine.getRecord(botId);
    if (!memory) return false;

    const timeSinceLastUpdate = Date.now() - memory.lastUpdated;
    const hasUncompletedTasks = memory.taskHistory.some(t => t.status === 'in-progress');
    const hasPendingActions = (await BotStateReplayEngine.getPendingActions(botId)).length;

    return (timeSinceLastUpdate > maxIdleMs && hasUncompletedTasks) || hasPendingActions > 0;
  }

  /**
   * Get recovery stats for a bot
   */
  static async getRecoveryStats(botId: string): Promise<{
    totalAttempts: number;
    successfulAttempts: number;
    failedAttempts: number;
    successRate: number;
    lastAttemptTime?: number;
    totalActionsRecovered: number;
  }> {
    const attempts = RECOVERY_ATTEMPTS[botId] ?? [];

    let successful = 0;
    let failed = 0;
    let totalActions = 0;

    for (const attempt of attempts) {
      if (attempt.status === 'success' || attempt.status === 'partial') {
        successful++;
      } else if (attempt.status === 'failed') {
        failed++;
      }
      totalActions += attempt.actionReplayed;
    }

    const lastAttempt = attempts[attempts.length - 1];

    return {
      totalAttempts: attempts.length,
      successfulAttempts: successful,
      failedAttempts: failed,
      successRate: attempts.length > 0 ? (successful / attempts.length) * 100 : 0,
      lastAttemptTime: lastAttempt?.completedAt,
      totalActionsRecovered: totalActions,
    };
  }

  /**
   * Get cross-bot recovery statistics (for admin observatory)
   */
  static async getGlobalRecoveryStats(): Promise<{
    totalBots: number;
    totalRecoveryAttempts: number;
    globalSuccessRate: number;
    recentFailures: RecoveryAttempt[];
  }> {
    let totalAttempts = 0;
    let successful = 0;
    const recentFailures: RecoveryAttempt[] = [];

    for (const botId in RECOVERY_ATTEMPTS) {
      for (const attempt of RECOVERY_ATTEMPTS[botId]) {
        totalAttempts++;
        if (attempt.status === 'success' || attempt.status === 'partial') {
          successful++;
        } else if (attempt.status === 'failed') {
          recentFailures.push(attempt);
        }
      }
    }

    return {
      totalBots: Object.keys(RECOVERY_ATTEMPTS).length,
      totalRecoveryAttempts: totalAttempts,
      globalSuccessRate: totalAttempts > 0 ? (successful / totalAttempts) * 100 : 0,
      recentFailures: recentFailures.sort((a, b) => b.initiatedAt - a.initiatedAt).slice(0, 20),
    };
  }

  /**
   * Archive bot memory after successful recovery
   */
  static async archiveBotMemory(botId: string): Promise<string | null> {
    return await this.storageEngine.exportBotMemory(botId);
  }
}

export default BotRecoveryEngine;
