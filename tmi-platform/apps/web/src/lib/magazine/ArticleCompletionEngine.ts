// ARTICLE COMPLETION ENGINE — Read State & Lifecycle Tracking
// Purpose: Track user read progress, completion state, and article lifecycle
// Prevents double-counting and ensures minimum read time for rewards

import { randomUUID } from 'crypto';

export interface ReadSession {
  id: string;
  userId: string;
  articleSlug: string;
  startedAt: string;
  completedAt?: string;
  readTimeSeconds: number;
  scrollPercentage: number; // 0-100
  isCompleted: boolean;
  rewardClaimed: boolean;
}

export interface ArticleCompletionState {
  articleSlug: string;
  totalReads: number;
  totalCompletions: number;
  completionRate: number; // percentage
  avgReadTime: number; // seconds
}

export type CompletionCheckResult = {
  isCompleted: boolean;
  reason: string;
  readTimeSeconds: number;
  scrollPercentage: number;
};

// Read session log (slug → array of sessions)
const READ_SESSIONS = new Map<string, ReadSession[]>();

// Article completion metrics
const COMPLETION_METRICS = new Map<string, ArticleCompletionState>();

// Anti-cheat: user → article → last read timestamp (prevent rapid re-reads)
const READ_COOLDOWN = new Map<string, Map<string, number>>();
const COOLDOWN_MINUTES = 24 * 60; // Must wait 24 hours before re-earning same article

export class ArticleCompletionEngine {
  /**
   * Start a new read session
   */
  static async startReadSession(userId: string, articleSlug: string): Promise<ReadSession> {
    const session: ReadSession = {
      id: randomUUID(),
      userId,
      articleSlug,
      startedAt: new Date().toISOString(),
      readTimeSeconds: 0,
      scrollPercentage: 0,
      isCompleted: false,
      rewardClaimed: false,
    };

    if (!READ_SESSIONS.has(articleSlug)) {
      READ_SESSIONS.set(articleSlug, []);
    }
    READ_SESSIONS.get(articleSlug)!.push(session);

    return session;
  }

  /**
   * Update read session progress
   */
  static async updateReadProgress(
    sessionId: string,
    articleSlug: string,
    scrollPercentage: number,
    readTimeSeconds: number
  ): Promise<void> {
    const sessions = READ_SESSIONS.get(articleSlug);
    if (!sessions) return;

    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      session.scrollPercentage = Math.max(session.scrollPercentage, scrollPercentage);
      session.readTimeSeconds = readTimeSeconds;
    }
  }

  /**
   * Complete read session (user navigated away or explicitly closed)
   */
  static async completeReadSession(sessionId: string, articleSlug: string): Promise<ReadSession | null> {
    const sessions = READ_SESSIONS.get(articleSlug);
    if (!sessions) return null;

    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      session.completedAt = new Date().toISOString();
      return session;
    }

    return null;
  }

  /**
   * Check if read meets completion criteria
   * Returns: { isCompleted, reason, readTimeSeconds, scrollPercentage }
   */
  static async checkCompletion(
    sessionId: string,
    articleSlug: string,
    minReadTimeSeconds: number
  ): Promise<CompletionCheckResult> {
    const sessions = READ_SESSIONS.get(articleSlug);
    if (!sessions) {
      return { isCompleted: false, reason: 'NO_SESSION', readTimeSeconds: 0, scrollPercentage: 0 };
    }

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { isCompleted: false, reason: 'SESSION_NOT_FOUND', readTimeSeconds: 0, scrollPercentage: 0 };
    }

    const reasons: string[] = [];

    // Minimum read time check (anti-cheat)
    if (session.readTimeSeconds < minReadTimeSeconds) {
      reasons.push(`INSUFFICIENT_READ_TIME: ${session.readTimeSeconds}s < ${minReadTimeSeconds}s`);
    }

    // Minimum scroll percentage check (must scroll through article)
    if (session.scrollPercentage < 60) {
      reasons.push(`INSUFFICIENT_SCROLL: ${session.scrollPercentage}% < 60%`);
    }

    const isCompleted = reasons.length === 0;

    if (isCompleted) {
      session.isCompleted = true;
    }

    return {
      isCompleted,
      reason: isCompleted ? 'COMPLETED' : reasons.join(' | '),
      readTimeSeconds: session.readTimeSeconds,
      scrollPercentage: session.scrollPercentage,
    };
  }

  /**
   * Claim reward for article completion
   * Includes anti-fraud checks (one reward per user per article per 24h)
   */
  static async claimReward(
    userId: string,
    articleSlug: string,
    sessionId: string
  ): Promise<{ success: boolean; reason: string }> {
    const sessions = READ_SESSIONS.get(articleSlug);
    if (!sessions) {
      return { success: false, reason: 'ARTICLE_NOT_FOUND' };
    }

    const session = sessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, reason: 'SESSION_NOT_FOUND' };
    }

    // Check if already claimed
    if (session.rewardClaimed) {
      return { success: false, reason: 'REWARD_ALREADY_CLAIMED' };
    }

    // Check cooldown (24 hour window)
    const userCooldowns = READ_COOLDOWN.get(userId) || new Map();
    const lastClaimTime = userCooldowns.get(articleSlug);

    if (lastClaimTime) {
      const hoursSinceLastClaim = (Date.now() - lastClaimTime) / (1000 * 60 * 60);
      if (hoursSinceLastClaim < COOLDOWN_MINUTES / 60) {
        return {
          success: false,
          reason: `COOLDOWN_ACTIVE: ${Math.round(COOLDOWN_MINUTES / 60 - hoursSinceLastClaim)}h remaining`,
        };
      }
    }

    // Claim reward
    session.rewardClaimed = true;
    userCooldowns.set(articleSlug, Date.now());
    READ_COOLDOWN.set(userId, userCooldowns);

    // Update metrics
    this.updateMetrics(articleSlug, session);

    return { success: true, reason: 'REWARD_CLAIMED' };
  }

  /**
   * Update completion metrics for article
   */
  private static updateMetrics(articleSlug: string, session: ReadSession): void {
    let metrics = COMPLETION_METRICS.get(articleSlug);

    if (!metrics) {
      metrics = {
        articleSlug,
        totalReads: 0,
        totalCompletions: 0,
        completionRate: 0,
        avgReadTime: 0,
      };
      COMPLETION_METRICS.set(articleSlug, metrics);
    }

    metrics.totalReads += 1;

    if (session.isCompleted) {
      metrics.totalCompletions += 1;
    }

    metrics.completionRate = (metrics.totalCompletions / metrics.totalReads) * 100;

    // Update average read time
    const allSessions = READ_SESSIONS.get(articleSlug) || [];
    const completedSessions = allSessions.filter((s) => s.isCompleted);
    if (completedSessions.length > 0) {
      const totalTime = completedSessions.reduce((sum, s) => sum + s.readTimeSeconds, 0);
      metrics.avgReadTime = Math.round(totalTime / completedSessions.length);
    }
  }

  /**
   * Get completion metrics for article
   */
  static async getMetrics(articleSlug: string): Promise<ArticleCompletionState | null> {
    return COMPLETION_METRICS.get(articleSlug) || null;
  }

  /**
   * Get user's read history for article
   */
  static async getUserReadHistory(userId: string, articleSlug: string): Promise<ReadSession[]> {
    const sessions = READ_SESSIONS.get(articleSlug) || [];
    return sessions.filter((s) => s.userId === userId);
  }

  /**
   * Has user already earned reward for this article in current window?
   */
  static async hasRewardBeenClaimed(userId: string, articleSlug: string): Promise<boolean> {
    const userCooldowns = READ_COOLDOWN.get(userId);
    if (!userCooldowns) return false;

    const lastClaimTime = userCooldowns.get(articleSlug);
    if (!lastClaimTime) return false;

    const hoursSinceLastClaim = (Date.now() - lastClaimTime) / (1000 * 60 * 60);
    return hoursSinceLastClaim < COOLDOWN_MINUTES / 60;
  }

  /**
   * Get time until user can claim reward again
   */
  static async getRewardCooldownRemaining(userId: string, articleSlug: string): Promise<number> {
    const userCooldowns = READ_COOLDOWN.get(userId);
    if (!userCooldowns) return 0;

    const lastClaimTime = userCooldowns.get(articleSlug);
    if (!lastClaimTime) return 0;

    const hoursSinceLastClaim = (Date.now() - lastClaimTime) / (1000 * 60 * 60);
    const remaining = Math.max(0, COOLDOWN_MINUTES / 60 - hoursSinceLastClaim);

    return Math.round(remaining * 60); // Return minutes
  }

  /**
   * Archive old read sessions (cleanup, optional)
   */
  static async archiveOldSessions(articleSlug: string, daysOld: number = 90): Promise<number> {
    const sessions = READ_SESSIONS.get(articleSlug);
    if (!sessions) return 0;

    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const oldCount = sessions.filter((s) => new Date(s.completedAt || s.startedAt).getTime() < cutoffTime).length;

    // In production, would move to archive storage
    // For now, just count for metrics

    return oldCount;
  }
}

export default ArticleCompletionEngine;
