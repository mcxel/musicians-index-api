import { WhatsHappeningTodayEngine, type LiveEventRecord } from "@/lib/events/WhatsHappeningTodayEngine";

export interface EventDiscoveryFilters {
  today?: boolean;
  tonight?: boolean;
  weekend?: boolean;
  country?: string;
  city?: string;
  genre?: string;
  liveNow?: boolean;
  ticketAvailable?: boolean;
  streamingNow?: boolean;
  tags?: string[];
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

const CITY_GEO_INDEX: Record<string, GeoPoint> = {
  atlanta: { lat: 33.749, lon: -84.388 },
  lagos: { lat: 6.5244, lon: 3.3792 },
  london: { lat: 51.5072, lon: -0.1276 },
  toronto: { lat: 43.6532, lon: -79.3832 },
  kingston: { lat: 17.9712, lon: -76.7936 },
};

const COUNTRY_FALLBACKS: Record<string, string[]> = {
  us: ["ca", "gb"],
  ng: ["gh", "za"],
  gb: ["fr", "de"],
  jm: ["us", "ca"],
};

function toDate(value: string): Date {
  return new Date(value);
}

function isWeekend(isoTime: string): boolean {
  const day = toDate(isoTime).getUTCDay();
  return day === 0 || day === 6;
}

function isTonight(isoTime: string): boolean {
  const hour = toDate(isoTime).getUTCHours();
  return hour >= 18 || hour <= 3;
}

function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const calc = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(calc));
}

function hasTicket(event: LiveEventRecord): boolean {
  return Boolean(event.ticketLink);
}

function isStreaming(event: LiveEventRecord): boolean {
  return Boolean(event.streamLink);
}

export class EventDiscoveryEngine {
  static discover(filters: EventDiscoveryFilters): LiveEventRecord[] {
    return WhatsHappeningTodayEngine.listAll().filter((event) => {
      if (filters.today) {
        const now = new Date();
        const start = toDate(event.startTime);
        if (
          start.getUTCFullYear() !== now.getUTCFullYear() ||
          start.getUTCMonth() !== now.getUTCMonth() ||
          start.getUTCDate() !== now.getUTCDate()
        ) {
          return false;
        }
      }
      if (filters.tonight && !isTonight(event.startTime)) return false;
      if (filters.weekend && !isWeekend(event.startTime)) return false;
      if (filters.country && event.country.toLowerCase() !== filters.country.toLowerCase()) return false;
      if (filters.city && event.city.toLowerCase() !== filters.city.toLowerCase()) return false;
      if (filters.genre && event.genre.toLowerCase() !== filters.genre.toLowerCase()) return false;
      if (filters.liveNow && !event.liveNow) return false;
      if (filters.ticketAvailable && !hasTicket(event)) return false;
      if (filters.streamingNow && !isStreaming(event)) return false;
      if (filters.tags && filters.tags.length > 0) {
        const normalizedTags = (event.tags ?? []).map((tag) => tag.toLowerCase());
        const missing = filters.tags.some((tag) => !normalizedTags.includes(tag.toLowerCase()));
        if (missing) return false;
      }
      return true;
    });
  }

  static discoverNearby(city: string, radiusKm: number = 1200): LiveEventRecord[] {
    const base = CITY_GEO_INDEX[city.toLowerCase()];
    if (!base) return [];

    return WhatsHappeningTodayEngine.listAll().filter((event) => {
      const point = CITY_GEO_INDEX[event.city.toLowerCase()];
      if (!point) return false;
      return haversineDistanceKm(base, point) <= radiusKm;
    });
  }

  static discoverWithFallback(countryCode: string, minimum: number = 3): LiveEventRecord[] {
    const primary = this.discover({ country: countryCode });
    if (primary.length >= minimum) return primary;

    const fallbackCountries = COUNTRY_FALLBACKS[countryCode.toLowerCase()] ?? [];
    const fallbackEvents = fallbackCountries.flatMap((country) => this.discover({ country }));

    return [...primary, ...fallbackEvents].slice(0, Math.max(minimum, 6));
  }

  static listTrendingCandidateEvents(limit: number = 10): LiveEventRecord[] {
    return WhatsHappeningTodayEngine
      .listAll()
      .sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0))
      .slice(0, limit);
  }

  static buildIntentTitles(city: string): string[] {
    return [
      `Live Music Tonight in ${city} | BernoutGlobal`,
      `Battle of the Bands Tonight | BernoutGlobal`,
      `Hip-Hop Cypher Live Today | BernoutGlobal`,
      "Live Shows Happening Today | BernoutGlobal",
    ];
  }
}

export default EventDiscoveryEngine;
