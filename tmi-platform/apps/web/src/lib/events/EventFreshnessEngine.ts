import { type LiveEventRecord, WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export interface EventFreshnessResult {
  slug: string;
  freshnessScore: number;
  isFresh: boolean;
  reason: string;
}

export interface FreshnessSummary {
  averageScore: number;
  staleEvents: string[];
  freshEvents: string[];
  checkedAt: string;
}

function hoursSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, (now - then) / (1000 * 60 * 60));
}

function resolveUpdateTimestamp(event: LiveEventRecord): string {
  return event.updatedAt ?? event.createdAt ?? event.startTime;
}

export class EventFreshnessEngine {
  static scoreEvent(event: LiveEventRecord): EventFreshnessResult {
    const updatedAt = resolveUpdateTimestamp(event);
    const ageHours = hoursSince(updatedAt);

    // 100 at publish, decays across a 7-day freshness window.
    const freshnessScore = Math.max(0, Math.round(100 - (ageHours / 168) * 100));
    const isFresh = freshnessScore >= 45;

    return {
      slug: event.slug,
      freshnessScore,
      isFresh,
      reason: isFresh ? "recently-updated" : "stale-content",
    };
  }

  static scoreAllEvents(events: LiveEventRecord[] = WhatsHappeningTodayEngine.listAll()): EventFreshnessResult[] {
    return events.map((event) => this.scoreEvent(event));
  }

  static getFreshEvents(minimumScore: number = 45): LiveEventRecord[] {
    return WhatsHappeningTodayEngine.listAll().filter((event) => this.scoreEvent(event).freshnessScore >= minimumScore);
  }

  static getStaleEvents(maximumScore: number = 44): LiveEventRecord[] {
    return WhatsHappeningTodayEngine.listAll().filter((event) => this.scoreEvent(event).freshnessScore <= maximumScore);
  }

  static summarize(events: LiveEventRecord[] = WhatsHappeningTodayEngine.listAll()): FreshnessSummary {
    const scored = events.map((event) => this.scoreEvent(event));
    const averageScore = scored.length === 0
      ? 0
      : Math.round(scored.reduce((total, item) => total + item.freshnessScore, 0) / scored.length);

    return {
      averageScore,
      staleEvents: scored.filter((item) => !item.isFresh).map((item) => item.slug),
      freshEvents: scored.filter((item) => item.isFresh).map((item) => item.slug),
      checkedAt: new Date().toISOString(),
    };
  }
}

export default EventFreshnessEngine;
