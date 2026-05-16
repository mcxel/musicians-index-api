import { platformLearningCore } from './PlatformLearningCore';

export interface RetentionSignal {
  userId: string;
  sessions: number;
  totalWatchMs: number;
  returned: boolean;
}

export interface RetentionSummary {
  retainedUsers: number;
  churnRiskUsers: number;
  avgSessionsPerUser: number;
  avgWatchMsPerUser: number;
}

export class RetentionPatternEngine {
  getRetentionSignals(): RetentionSignal[] {
    const events = platformLearningCore.listEvents(5000);
    const userMap = new Map<string, RetentionSignal>();

    for (const event of events) {
      if (!event.userId) continue;
      const existing = userMap.get(event.userId) ?? {
        userId: event.userId,
        sessions: 0,
        totalWatchMs: 0,
        returned: false,
      };

      if (event.type === 'join') {
        existing.sessions += 1;
      }
      if (event.type === 'watch') {
        existing.totalWatchMs += event.durationMs ?? 0;
      }
      existing.returned = existing.sessions > 1;
      userMap.set(event.userId, existing);
    }

    return [...userMap.values()].sort((a, b) => b.sessions - a.sessions);
  }

  getSummary(): RetentionSummary {
    const signals = this.getRetentionSignals();
    const retained = signals.filter((signal) => signal.returned).length;
    const churnRisk = signals.filter((signal) => signal.sessions <= 1).length;
    const totalSessions = signals.reduce((sum, signal) => sum + signal.sessions, 0);
    const totalWatchMs = signals.reduce((sum, signal) => sum + signal.totalWatchMs, 0);
    const userCount = Math.max(signals.length, 1);

    return {
      retainedUsers: retained,
      churnRiskUsers: churnRisk,
      avgSessionsPerUser: Number((totalSessions / userCount).toFixed(2)),
      avgWatchMsPerUser: Math.round(totalWatchMs / userCount),
    };
  }
}

export const retentionPatternEngine = new RetentionPatternEngine();
