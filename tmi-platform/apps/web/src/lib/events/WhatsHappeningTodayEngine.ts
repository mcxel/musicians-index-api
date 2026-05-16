export type LiveEventType = "battle" | "cypher" | "show" | "contest" | "concert";

export interface LiveEventRecord {
  slug: string;
  title: string;
  type: LiveEventType;
  venueSlug: string;
  venueName: string;
  city: string;
  country: string;
  timezone: string;
  startTime: string;
  endTime: string;
  performers: string[];
  ticketLink: string;
  streamLink: string;
  posterImage: string;
  host: string;
  genre: string;
  price: string;
  liveNow: boolean;
  tags?: string[];
  popularityScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

const TODAY_EVENTS: LiveEventRecord[] = [
  {
    slug: "atl-night-cypher",
    title: "Atlanta Night Cypher",
    type: "cypher",
    venueSlug: "neon-palace",
    venueName: "Neon Palace",
    city: "Atlanta",
    country: "US",
    timezone: "America/New_York",
    startTime: "2026-05-09T19:00:00-04:00",
    endTime: "2026-05-09T22:00:00-04:00",
    performers: ["big-a", "ray-journey"],
    ticketLink: "/tickets",
    streamLink: "/events/live",
    posterImage: "/events/atl-night-cypher.jpg",
    host: "MC Blaze",
    genre: "hip-hop",
    price: "$15",
    liveNow: true,
    tags: ["cypher", "night", "atlanta"],
    popularityScore: 92,
    createdAt: "2026-05-01T10:00:00-04:00",
    updatedAt: "2026-05-09T16:45:00-04:00",
  },
  {
    slug: "lagos-battle-arena",
    title: "Lagos Battle Arena",
    type: "battle",
    venueSlug: "beat-lab",
    venueName: "Beat Lab",
    city: "Lagos",
    country: "NG",
    timezone: "Africa/Lagos",
    startTime: "2026-05-09T20:00:00+01:00",
    endTime: "2026-05-09T23:00:00+01:00",
    performers: ["afro-reign", "city-local"],
    ticketLink: "/tickets",
    streamLink: "/events/live",
    posterImage: "/events/lagos-battle-arena.jpg",
    host: "DJ Unity",
    genre: "afrobeats",
    price: "$10",
    liveNow: true,
    tags: ["battle", "lagos", "live"],
    popularityScore: 88,
    createdAt: "2026-05-02T11:00:00+01:00",
    updatedAt: "2026-05-09T17:50:00+01:00",
  },
  {
    slug: "london-showcase-tonight",
    title: "London Showcase Tonight",
    type: "show",
    venueSlug: "cypher-stage",
    venueName: "Cypher Stage",
    city: "London",
    country: "GB",
    timezone: "Europe/London",
    startTime: "2026-05-09T20:30:00+01:00",
    endTime: "2026-05-10T00:00:00+01:00",
    performers: ["velvet-lane", "circuit-halo"],
    ticketLink: "/tickets",
    streamLink: "/events/live",
    posterImage: "/events/london-showcase-tonight.jpg",
    host: "Nova Host",
    genre: "r&b",
    price: "$18",
    liveNow: false,
    tags: ["showcase", "london", "tonight"],
    popularityScore: 79,
    createdAt: "2026-05-03T08:30:00+01:00",
    updatedAt: "2026-05-09T18:10:00+01:00",
  },
];

function toDate(value: string): Date {
  return new Date(value);
}

function isSameCalendarDate(isoTime: string, target: Date): boolean {
  const eventDate = toDate(isoTime);
  return (
    eventDate.getUTCFullYear() === target.getUTCFullYear() &&
    eventDate.getUTCMonth() === target.getUTCMonth() &&
    eventDate.getUTCDate() === target.getUTCDate()
  );
}

function isWeekend(isoTime: string): boolean {
  const day = toDate(isoTime).getUTCDay();
  return day === 0 || day === 6;
}

function isTonight(isoTime: string): boolean {
  const hour = toDate(isoTime).getUTCHours();
  return hour >= 18 || hour <= 3;
}

export class WhatsHappeningTodayEngine {
  static listAll(): LiveEventRecord[] {
    return [...TODAY_EVENTS];
  }

  static listLiveNow(): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => event.liveNow);
  }

  static listByType(type: LiveEventType): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => event.type === type);
  }

  static getBySlug(slug: string): LiveEventRecord | null {
    return TODAY_EVENTS.find((event) => event.slug === slug) ?? null;
  }

  static listByCountry(countryCode: string): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => event.country.toLowerCase() === countryCode.toLowerCase());
  }

  static listByCity(city: string): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => event.city.toLowerCase() === city.toLowerCase());
  }

  static listTonight(): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => isTonight(event.startTime));
  }

  static listWeekend(): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => isWeekend(event.startTime));
  }

  static listByDate(date: Date): LiveEventRecord[] {
    return TODAY_EVENTS.filter((event) => isSameCalendarDate(event.startTime, date));
  }

  static upsertEvent(record: LiveEventRecord): void {
    const existingIndex = TODAY_EVENTS.findIndex((event) => event.slug === record.slug);
    if (existingIndex >= 0) {
      TODAY_EVENTS[existingIndex] = {
        ...TODAY_EVENTS[existingIndex],
        ...record,
        updatedAt: new Date().toISOString(),
      };
      return;
    }

    TODAY_EVENTS.push({
      ...record,
      createdAt: record.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

export default WhatsHappeningTodayEngine;
