/**
 * Show Analytics Engine
 * Event tracking and summary generation for all TMI shows.
 */

export interface ShowAnalyticsEvent {
  showId: string;
  eventType: string;
  timestamp: number;
  data: Record<string, string | number>;
}

export interface ShowAnalyticsSummary {
  showId: string;
  totalViewers: number;
  peakViewers: number;
  avgEngagementPct: number;
  crowdYayTotal: number;
  crowdBooTotal: number;
  sponsorImpressions: number;
  winnerName: string | null;
}

export class ShowAnalyticsEngine {
  private events: ShowAnalyticsEvent[];

  constructor() {
    this.events = [];
  }

  track(
    showId: string,
    eventType: string,
    data: Record<string, string | number> = {},
  ): void {
    this.events.push({
      showId,
      eventType,
      timestamp: Date.now(),
      data,
    });
  }

  getSummary(showId: string): ShowAnalyticsSummary {
    const showEvents = this.events.filter((e) => e.showId === showId);

    // Total viewers: unique viewer_join events
    const viewerIds = new Set<string>();
    for (const e of showEvents) {
      if (e.eventType === 'viewer_join' && typeof e.data['userId'] === 'string') {
        viewerIds.add(e.data['userId']);
      }
    }

    // Peak viewers: max concurrent_viewers value recorded
    let peakViewers = 0;
    for (const e of showEvents) {
      if (e.eventType === 'concurrent_viewers' && typeof e.data['count'] === 'number') {
        peakViewers = Math.max(peakViewers, e.data['count']);
      }
    }

    // Engagement: sum engagement_score / count engagement events
    const engagementEvents = showEvents.filter((e) => e.eventType === 'engagement');
    const avgEngagementPct =
      engagementEvents.length > 0
        ? engagementEvents.reduce((sum, e) => sum + (typeof e.data['score'] === 'number' ? e.data['score'] : 0), 0) /
          engagementEvents.length
        : 0;

    // Crowd yay / boo
    const crowdYayTotal = showEvents.filter((e) => e.eventType === 'crowd_vote' && e.data['type'] === 'yay').length;
    const crowdBooTotal = showEvents.filter((e) => e.eventType === 'crowd_vote' && e.data['type'] === 'boo').length;

    // Sponsor impressions
    const sponsorImpressions = showEvents
      .filter((e) => e.eventType === 'sponsor_impression')
      .reduce((sum, e) => sum + (typeof e.data['count'] === 'number' ? e.data['count'] : 1), 0);

    // Winner
    const winnerEvent = showEvents.find((e) => e.eventType === 'winner_announced');
    const winnerName =
      winnerEvent && typeof winnerEvent.data['winnerName'] === 'string'
        ? winnerEvent.data['winnerName']
        : null;

    return {
      showId,
      totalViewers: viewerIds.size,
      peakViewers,
      avgEngagementPct,
      crowdYayTotal,
      crowdBooTotal,
      sponsorImpressions,
      winnerName,
    };
  }

  getEvents(showId: string): ShowAnalyticsEvent[] {
    return this.events.filter((e) => e.showId === showId).map((e) => ({ ...e }));
  }

  exportForAdmin(showId: string): ShowAnalyticsSummary {
    return this.getSummary(showId);
  }
}
