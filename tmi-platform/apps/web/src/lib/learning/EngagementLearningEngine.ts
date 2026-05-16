import { platformLearningCore, type LearningEventType, type LearningSnapshot } from './PlatformLearningCore';

export interface EngagementPulse {
  snapshot: LearningSnapshot;
  engagementRate: number;
  shareRate: number;
  joinToLeaveRatio: number;
}

export class EngagementLearningEngine {
  track(
    type: LearningEventType,
    payload: {
      userId?: string;
      route?: string;
      targetId?: string;
      value?: number;
      durationMs?: number;
      context?: Record<string, string | number | boolean | null | undefined>;
    }
  ) {
    return platformLearningCore.ingestEvent({ type, ...payload });
  }

  getPulse(): EngagementPulse {
    const snapshot = platformLearningCore.buildSnapshot();
    const clicks = snapshot.byType.click ?? 0;
    const watches = snapshot.byType.watch ?? 0;
    const shares = snapshot.byType.share ?? 0;
    const joins = snapshot.byType.join ?? 0;
    const leaves = snapshot.byType.leave ?? 0;
    const base = Math.max(snapshot.totalEvents, 1);

    return {
      snapshot,
      engagementRate: Number((((clicks + watches + joins) / base) * 100).toFixed(2)),
      shareRate: Number(((shares / Math.max(clicks, 1)) * 100).toFixed(2)),
      joinToLeaveRatio: Number((joins / Math.max(leaves, 1)).toFixed(2)),
    };
  }
}

export const engagementLearningEngine = new EngagementLearningEngine();
