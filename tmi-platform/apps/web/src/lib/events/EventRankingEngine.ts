import { type LiveEventRecord, WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";
import { EventFreshnessEngine } from "@/lib/events/EventFreshnessEngine";

export interface RankedEvent {
  event: LiveEventRecord;
  score: number;
  factors: {
    liveNow: number;
    popularity: number;
    freshness: number;
    startsSoon: number;
  };
}

function hoursUntil(isoDate: string): number {
  const start = new Date(isoDate).getTime();
  const now = Date.now();
  return (start - now) / (1000 * 60 * 60);
}

function startsSoonScore(startTime: string): number {
  const hours = hoursUntil(startTime);
  if (hours <= 0) return 20;
  if (hours <= 2) return 25;
  if (hours <= 6) return 18;
  if (hours <= 12) return 12;
  if (hours <= 24) return 8;
  return 2;
}

export class EventRankingEngine {
  static score(event: LiveEventRecord): RankedEvent {
    const freshness = EventFreshnessEngine.scoreEvent(event).freshnessScore;
    const liveNow = event.liveNow ? 35 : 8;
    const popularity = Math.min(30, Math.max(0, Math.round((event.popularityScore ?? 50) * 0.3)));
    const startsSoon = startsSoonScore(event.startTime);

    return {
      event,
      score: liveNow + popularity + Math.round(freshness * 0.2) + startsSoon,
      factors: {
        liveNow,
        popularity,
        freshness: Math.round(freshness * 0.2),
        startsSoon,
      },
    };
  }

  static rankEvents(events: LiveEventRecord[] = WhatsHappeningTodayEngine.listAll(), limit: number = 20): RankedEvent[] {
    return events
      .map((event) => this.score(event))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  static getTrending(limit: number = 10): LiveEventRecord[] {
    return this.rankEvents(WhatsHappeningTodayEngine.listAll(), limit).map((item) => item.event);
  }

  static getTopByCountry(countryCode: string, limit: number = 5): LiveEventRecord[] {
    const inCountry = WhatsHappeningTodayEngine
      .listAll()
      .filter((event) => event.country.toLowerCase() === countryCode.toLowerCase());
    return this.rankEvents(inCountry, limit).map((item) => item.event);
  }
}

export default EventRankingEngine;
