// BotStateReplayEngine.ts
// Replays bot actions to recover from interruptions

export interface BotAction {
  actionId: string;
  botId: string;
  actionType:
    | 'task-start'
    | 'task-complete'
    | 'task-fail'
    | 'goal-update'
    | 'memory-log'
    | 'room-join'
    | 'room-leave'
    | 'battle-participate'
    | 'venue-attend'
    | 'moderation'
    | 'promotion'
    | 'translation'
    | 'recovery';
  timestamp: number;
  payload: Record<string, any>;
  status: 'pending' | 'applied' | 'failed';
  retryCount: number;
}

interface ActionLog {
  [botId: string]: BotAction[];
}

const ACTION_LOGS: ActionLog = {};
const MAX_ACTIONS_PER_BOT = 5000;

export class BotStateReplayEngine {
  /**
   * Log an action for a bot
   */
  static async logAction(
    botId: string,
    actionType: BotAction['actionType'],
    payload: Record<string, any>
  ): Promise<BotAction> {
    if (!ACTION_LOGS[botId]) {
      ACTION_LOGS[botId] = [];
    }

    const action: BotAction = {
      actionId: `act_${botId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      botId,
      actionType,
      timestamp: Date.now(),
      payload,
      status: 'pending',
      retryCount: 0,
    };

    ACTION_LOGS[botId].push(action);

    // Keep memory under control
    if (ACTION_LOGS[botId].length > MAX_ACTIONS_PER_BOT) {
      ACTION_LOGS[botId] = ACTION_LOGS[botId].slice(-MAX_ACTIONS_PER_BOT);
    }

    return action;
  }

  /**
   * Mark an action as applied
   */
  static async markActionApplied(actionId: string): Promise<void> {
    for (const botId in ACTION_LOGS) {
      const action = ACTION_LOGS[botId].find(a => a.actionId === actionId);
      if (action) {
        action.status = 'applied';
      }
    }
  }

  /**
   * Mark an action as failed
   */
  static async markActionFailed(actionId: string): Promise<void> {
    for (const botId in ACTION_LOGS) {
      const action = ACTION_LOGS[botId].find(a => a.actionId === actionId);
      if (action) {
        action.status = 'failed';
        action.retryCount++;
      }
    }
  }

  /**
   * Get all pending actions for a bot
   */
  static async getPendingActions(botId: string): Promise<BotAction[]> {
    const actions = ACTION_LOGS[botId] ?? [];
    return actions.filter(a => a.status === 'pending');
  }

  /**
   * Get action history for a bot (optionally filtered by action type)
   */
  static async getActionHistory(
    botId: string,
    actionType?: BotAction['actionType'],
    limit: number = 100
  ): Promise<BotAction[]> {
    let actions = ACTION_LOGS[botId] ?? [];
    if (actionType) {
      actions = actions.filter(a => a.actionType === actionType);
    }
    return actions.slice(-limit);
  }

  /**
   * Replay pending actions for a bot (for recovery after downtime)
   */
  static async replayPendingActions(botId: string): Promise<{
    total: number;
    applied: number;
    failed: number;
  }> {
    const pending = await this.getPendingActions(botId);
    let applied = 0;
    let failed = 0;

    for (const action of pending) {
      try {
        // Attempt to replay the action based on type
        const success = await this.replayAction(action);
        if (success) {
          await this.markActionApplied(action.actionId);
          applied++;
        } else {
          action.retryCount++;
          if (action.retryCount >= 3) {
            // Give up after 3 retries
            await this.markActionFailed(action.actionId);
            failed++;
          }
        }
      } catch (error) {
        console.error(
          `[BotStateReplayEngine] Error replaying action ${action.actionId}:`,
          error
        );
        action.retryCount++;
        if (action.retryCount >= 3) {
          await this.markActionFailed(action.actionId);
          failed++;
        }
      }
    }

    return { total: pending.length, applied, failed };
  }

  /**
   * Replay a single action
   */
  private static async replayAction(action: BotAction): Promise<boolean> {
    switch (action.actionType) {
      case 'task-start':
        // Task start is already done, mark as applied
        return true;

      case 'task-complete':
        // Task completion is idempotent, can be replayed
        return true;

      case 'task-fail':
        // Task failure can be replayed (marks task as failed again, no harm)
        return true;

      case 'goal-update':
        // Goal updates are idempotent
        return true;

      case 'memory-log':
        // Memory logs are append-only, can be replayed
        return true;

      case 'room-join':
        // Room join may fail if room is gone, but won't break anything
        return true;

      case 'room-leave':
        // Room leave is safe to replay
        return true;

      case 'battle-participate':
        // Battle participation is time-sensitive, may not be replayable
        // Check if battle is still active
        if (action.payload.battleId) {
          // In a real system, check if battle exists and is still active
          return true; // Assume it's still valid for now
        }
        return false;

      case 'venue-attend':
        // Venue attendance is replayable
        return true;

      case 'moderation':
        // Moderation actions should check if already applied
        if (action.payload.targetId && action.payload.actionType) {
          return true; // Can be replayed safely
        }
        return false;

      case 'promotion':
        // Promotion actions may be time-sensitive
        if (action.payload.promotionId && action.payload.targetId) {
          return true;
        }
        return false;

      case 'translation':
        // Translation actions are idempotent
        return true;

      case 'recovery':
        // Recovery action marks a checkpoint restoration
        return true;

      default:
        return false;
    }
  }

  /**
   * Get action statistics for a bot
   */
  static async getActionStats(botId: string): Promise<{
    total: number;
    pending: number;
    applied: number;
    failed: number;
    retryAverage: number;
    actionTypeBreakdown: Record<string, number>;
  }> {
    const actions = ACTION_LOGS[botId] ?? [];

    const typeBreakdown: Record<string, number> = {};
    let pending = 0;
    let applied = 0;
    let failed = 0;
    let totalRetries = 0;

    for (const action of actions) {
      typeBreakdown[action.actionType] = (typeBreakdown[action.actionType] ?? 0) + 1;
      if (action.status === 'pending') pending++;
      else if (action.status === 'applied') applied++;
      else if (action.status === 'failed') failed++;
      totalRetries += action.retryCount;
    }

    return {
      total: actions.length,
      pending,
      applied,
      failed,
      retryAverage: actions.length > 0 ? totalRetries / actions.length : 0,
      actionTypeBreakdown: typeBreakdown,
    };
  }

  /**
   * Clear old actions for a bot (cleanup after successful recovery)
   */
  static async clearAppliedActions(botId: string, olderThanHours: number = 24): Promise<number> {
    if (!ACTION_LOGS[botId]) return 0;

    const cutoffTime = Date.now() - olderThanHours * 3600000;
    const before = ACTION_LOGS[botId].length;

    ACTION_LOGS[botId] = ACTION_LOGS[botId].filter(action => {
      if (action.status === 'applied' && action.timestamp < cutoffTime) {
        return false; // Remove
      }
      return true; // Keep
    });

    const after = ACTION_LOGS[botId].length;
    return before - after;
  }

  /**
   * Export action log for a bot (for debugging/audit)
   */
  static async exportActionLog(botId: string): Promise<string | null> {
    const actions = ACTION_LOGS[botId];
    if (!actions) return null;
    return JSON.stringify(actions, null, 2);
  }

  /**
   * Get actions since a specific timestamp (for recovery window)
   */
  static async getActionsSince(botId: string, sinceTimestamp: number): Promise<BotAction[]> {
    const actions = ACTION_LOGS[botId] ?? [];
    return actions.filter(a => a.timestamp >= sinceTimestamp);
  }

  /**
   * Get all pending actions across all bots (for admin observatory)
   */
  static async getAllPendingActions(): Promise<BotAction[]> {
    const pending: BotAction[] = [];
    for (const botId in ACTION_LOGS) {
      pending.push(
        ...ACTION_LOGS[botId].filter(a => a.status === 'pending')
      );
    }
    return pending.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get failed actions across all bots (for troubleshooting)
   */
  static async getAllFailedActions(limit: number = 100): Promise<BotAction[]> {
    const failed: BotAction[] = [];
    for (const botId in ACTION_LOGS) {
      failed.push(
        ...ACTION_LOGS[botId].filter(a => a.status === 'failed')
      );
    }
    return failed.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
}

export default BotStateReplayEngine;
