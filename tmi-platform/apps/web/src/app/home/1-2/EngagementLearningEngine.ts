export interface EngagementSignal {
  userId: string;
  entityId: string;
  signalType:
    | 'click'
    | 'hover'
    | 'replay'
    | 'collectible_use'
    | 'gift'
    | 'reaction'
    | 'sponsor_click'
    | 'ticket_conversion';
  metadata: Record<string, any>;
  timestamp: number;
}

const STALE_SIGNAL_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 7; // 7 Day Expiry

export class EngagementLearningEngine {
  private static signals: EngagementSignal[] = [];
  private static lastCleanupTime: number = Date.now();

  static trackSignal(signal: Omit<EngagementSignal, 'timestamp'>) {
    const fullSignal = { ...signal, timestamp: Date.now() };
    this.signals.push(fullSignal);
    
    console.log(`[ENGAGEMENT_LEARNING] Tracked ${signal.signalType} for user ${signal.userId} on entity ${signal.entityId}`);
    
    // Periodic memory constraints: flush stale data without O(N) blocking on every event
    if (Date.now() - this.lastCleanupTime > 1000 * 60 * 5) {
      this.expireStaleSignals();
      this.lastCleanupTime = Date.now();
    }

    // Triggers internal heuristics for evolving presentation or recommending content
    this.evaluateLearningTriggers(fullSignal);
  }

  private static evaluateLearningTriggers(signal: EngagementSignal) {
    if (signal.signalType === 'replay' && signal.metadata?.replayCount > 3) {
      console.log(`[LEARNING_TRIGGER] High replay detected for ${signal.entityId}. Boosting global visibility weighting.`);
    }
  }

  private static expireStaleSignals() {
    const cutoff = Date.now() - STALE_SIGNAL_THRESHOLD_MS;
    this.signals = this.signals.filter(s => s.timestamp >= cutoff);
  }

  static getUserInsights(userId: string) {
    const userSignals = this.signals.filter(s => s.userId === userId);
    return {
      favoriteAnimations: userSignals.filter(s => s.signalType === 'collectible_use'),
      crowdParticipationScore: userSignals.filter(s => s.signalType === 'reaction').length,
      sponsorEngagementScore: userSignals.filter(s => s.signalType === 'sponsor_click').length,
      replays: userSignals.filter(s => s.signalType === 'replay').length,
    };
  }
}

export default EngagementLearningEngine;