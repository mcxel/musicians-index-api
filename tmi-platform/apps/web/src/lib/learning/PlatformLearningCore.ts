export type LearningEventType =
  | 'click'
  | 'hover'
  | 'watch'
  | 'scroll'
  | 'share'
  | 'join'
  | 'leave'
  | 'ticket_buy'
  | 'tip'
  | 'battle_join'
  | 'vote'
  | 'season_pass'
  | 'subscription_upgrade'
  | 'trial_conversion'
  | 'reward_claim'
  | 'lobby_move'
  | 'avatar_action'
  | 'chat'
  | 'emote'
  | 'collectible_show'
  | 'friend_invite'
  | 'venue_attend'
  | 'article_read'
  | 'music_listen'
  | 'beat_purchase'
  | 'nft_purchase'
  | 'dropoff'
  | 'win'
  | 'loss'
  | 'exit';

export interface LearningEvent {
  id: string;
  type: LearningEventType;
  userId?: string;
  route?: string;
  targetId?: string;
  context?: Record<string, string | number | boolean | null | undefined>;
  value?: number;
  durationMs?: number;
  timestamp: number;
}

export interface LearningInsight {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface LearningDirective {
  id: string;
  area: 'bots' | 'visuals' | 'retention' | 'conversion' | 'lobbies' | 'content';
  action: string;
  reason: string;
  priority: 'p0' | 'p1' | 'p2';
}

export interface LearningSnapshot {
  totalEvents: number;
  uniqueUsers: number;
  byType: Record<string, number>;
  byRoute: Record<string, number>;
  avgWatchMs: number;
  avgScrollDepth: number;
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export class PlatformLearningCore {
  private events: LearningEvent[] = [];

  ingestEvent(event: Omit<LearningEvent, 'id' | 'timestamp'> & Partial<Pick<LearningEvent, 'id' | 'timestamp'>>): LearningEvent {
    const normalized: LearningEvent = {
      ...event,
      id: event.id ?? makeId('learn'),
      timestamp: event.timestamp ?? Date.now(),
    };
    this.events.push(normalized);
    return normalized;
  }

  ingestBatch(events: Array<Omit<LearningEvent, 'id' | 'timestamp'> & Partial<Pick<LearningEvent, 'id' | 'timestamp'>>>): LearningEvent[] {
    return events.map((event) => this.ingestEvent(event));
  }

  listEvents(limit = 500): LearningEvent[] {
    return [...this.events].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  queryEvents(filter: Partial<Pick<LearningEvent, 'type' | 'userId' | 'route' | 'targetId'>>): LearningEvent[] {
    return this.events.filter((event) => {
      if (filter.type && event.type !== filter.type) return false;
      if (filter.userId && event.userId !== filter.userId) return false;
      if (filter.route && event.route !== filter.route) return false;
      if (filter.targetId && event.targetId !== filter.targetId) return false;
      return true;
    });
  }

  buildSnapshot(): LearningSnapshot {
    const byType = new Map<string, number>();
    const byRoute = new Map<string, number>();
    const userSet = new Set<string>();
    let watchMsTotal = 0;
    let watchCount = 0;
    let scrollDepthTotal = 0;
    let scrollCount = 0;

    for (const event of this.events) {
      byType.set(event.type, (byType.get(event.type) ?? 0) + 1);
      if (event.route) {
        byRoute.set(event.route, (byRoute.get(event.route) ?? 0) + 1);
      }
      if (event.userId) {
        userSet.add(event.userId);
      }
      if (event.type === 'watch' && event.durationMs) {
        watchMsTotal += event.durationMs;
        watchCount += 1;
      }
      if (event.type === 'scroll') {
        const depth = Number(event.value ?? event.context?.depth ?? 0);
        if (Number.isFinite(depth) && depth >= 0) {
          scrollDepthTotal += depth;
          scrollCount += 1;
        }
      }
    }

    return {
      totalEvents: this.events.length,
      uniqueUsers: userSet.size,
      byType: Object.fromEntries(byType.entries()),
      byRoute: Object.fromEntries(byRoute.entries()),
      avgWatchMs: watchCount > 0 ? Math.round(watchMsTotal / watchCount) : 0,
      avgScrollDepth: scrollCount > 0 ? Number((scrollDepthTotal / scrollCount).toFixed(2)) : 0,
    };
  }

  buildTopInsights(limit = 8): LearningInsight[] {
    const snapshot = this.buildSnapshot();
    const insights: LearningInsight[] = [];

    const dropoff = snapshot.byType.dropoff ?? 0;
    const joins = snapshot.byType.join ?? 0;
    if (dropoff > joins * 0.4 && joins > 0) {
      insights.push({
        id: makeId('insight'),
        title: 'Drop-off pressure detected',
        detail: `Drop-off volume (${dropoff}) is high versus joins (${joins}).`,
        confidence: 0.86,
        impact: 'high',
        createdAt: Date.now(),
      });
    }

    const shares = snapshot.byType.share ?? 0;
    if (shares > 0) {
      insights.push({
        id: makeId('insight'),
        title: 'Share amplification active',
        detail: `${shares} shares observed. Promote top shared routes with stronger CTAs.`,
        confidence: 0.78,
        impact: 'medium',
        createdAt: Date.now(),
      });
    }

    if (snapshot.avgWatchMs > 90000) {
      insights.push({
        id: makeId('insight'),
        title: 'Strong watch-time retention',
        detail: `Average watch time is ${snapshot.avgWatchMs}ms. Expand similar format blocks.`,
        confidence: 0.82,
        impact: 'medium',
        createdAt: Date.now(),
      });
    }

    return insights.slice(0, limit);
  }

  buildDirectives(): LearningDirective[] {
    const snapshot = this.buildSnapshot();
    const directives: LearningDirective[] = [];

    if ((snapshot.byType.dropoff ?? 0) > (snapshot.byType.join ?? 0) * 0.35) {
      directives.push({
        id: makeId('directive'),
        area: 'retention',
        action: 'Shorten first-run onboarding and introduce adaptive assist prompts',
        reason: 'Drop-off exceeds expected threshold',
        priority: 'p0',
      });
    }

    if ((snapshot.byType.click ?? 0) > 0 && (snapshot.byType.share ?? 0) < (snapshot.byType.click ?? 0) * 0.04) {
      directives.push({
        id: makeId('directive'),
        area: 'conversion',
        action: 'Increase share CTA visibility and add post-win share prompts',
        reason: 'Clicks are not converting into shares',
        priority: 'p1',
      });
    }

    directives.push({
      id: makeId('directive'),
      area: 'visuals',
      action: 'Rotate weak-performing visual variants out after 24h',
      reason: 'Prevent stale loops and weak visual repetition',
      priority: 'p1',
    });

    return directives;
  }
}

export const platformLearningCore = new PlatformLearningCore();
