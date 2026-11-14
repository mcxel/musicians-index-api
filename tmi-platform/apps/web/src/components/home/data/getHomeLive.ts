export interface HomeLiveRoom {
  id: string;
  name: string;
  host: string;
  viewers: number;
  genre: string;
  type: string;
}

export interface HomeLiveShow {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  ticketsLeft: number;
}

export interface HomeLiveData {
  rooms: HomeLiveRoom[];
  shows: HomeLiveShow[];
}

import type { HomeDataEnvelope } from './types';
import { getHomepageRuntimeOverrides } from '@/lib/homepageAdmin/runtimeOverrides';
import type { HomepageRuntimeOverrides } from '@/lib/homepageAdmin/types';

interface HomeLiveOptions {
  overrides?: HomepageRuntimeOverrides;
}

/** Rule 20: no fake live rooms/shows. Empty until real data exists — consumers render an honest empty state. */
const FALLBACK_LIVE_DATA: HomeLiveData = {
  rooms: [],
  shows: [],
};

function formatDate(raw: string | undefined): string {
  if (!raw) return 'TBA';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return 'TBA';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function getHomeLive(
  roomLimit = 4,
  showLimit = 3,
  options: HomeLiveOptions = {}
): Promise<HomeDataEnvelope<HomeLiveData>> {
  const timestamp = new Date().toISOString();
  const runtimeOverrides = options.overrides ?? getHomepageRuntimeOverrides();
  const eventIds = runtimeOverrides.eventItemIds ?? [];

  function applyEventOverrides(events: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
    if (eventIds.length === 0) return events;
    const byId = new Map(
      events
        .map((item) => {
          const id = typeof item.id === 'string' ? item.id : undefined;
          return id ? ([id, item] as const) : null;
        })
        .filter((entry): entry is readonly [string, Record<string, unknown>] => Boolean(entry))
    );

    const selected = eventIds.map((id) => byId.get(id)).filter((item): item is Record<string, unknown> => Boolean(item));
    const remainder = events.filter((item) => {
      const id = typeof item.id === 'string' ? item.id : '';
      return id.length === 0 || !eventIds.includes(id);
    });
    return [...selected, ...remainder];
  }

  try {
    const response = await fetch(`/api/homepage/live?limit=${Math.max(roomLimit, showLimit)}`, { cache: 'no-store' });
    if (!response.ok) {
      return {
        data: FALLBACK_LIVE_DATA,
        source: 'fallback',
        timestamp,
        error: `HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as {
      rooms?: Array<Record<string, unknown>>;
      events?: Array<Record<string, unknown>>;
      streams?: Array<Record<string, unknown>>;
    };

    const events = Array.isArray(payload.events)
      ? payload.events
      : Array.isArray(payload.rooms)
        ? payload.rooms
        : [];
    if (events.length === 0) {
      return {
        data: FALLBACK_LIVE_DATA,
        source: 'fallback',
        timestamp,
        error: 'Empty live payload',
      };
    }

    const prioritizedEvents = applyEventOverrides(events);

    const rooms = prioritizedEvents.slice(0, roomLimit).map((event, index) => ({
      id: typeof event.id === 'string' ? event.id : `${index + 1}`,
      name: typeof event.title === 'string' ? event.title : `Live Room ${index + 1}`,
      host: typeof event.hostName === 'string' ? event.hostName : typeof event.artistName === 'string' ? event.artistName : 'TMI Host',
      viewers: typeof event.viewers === 'number' ? event.viewers : 0,
      genre: typeof event.eventType === 'string' ? event.eventType : typeof event.description === 'string' ? event.description.slice(0, 20) : 'Live Event',
      type: typeof event.eventType === 'string' ? event.eventType.toUpperCase() : 'LIVE',
    }));

    const shows = prioritizedEvents.slice(0, showLimit).map((event, index) => ({
      id: typeof event.id === 'string' ? event.id : `${index + 1}`,
      title: typeof event.title === 'string' ? event.title : `Show ${index + 1}`,
      artist: typeof event.artistName === 'string' ? event.artistName : typeof event.hostName === 'string' ? event.hostName : 'TBA',
      date: formatDate(typeof event.date === 'string' ? event.date : undefined),
      venue: typeof event.venue === 'string' ? event.venue : 'TMI Arena',
      ticketsLeft: typeof event.ticketsAvailable === 'number' ? event.ticketsAvailable : 0,
    }));

    return {
      data: {
        rooms: rooms.length > 0 ? rooms : FALLBACK_LIVE_DATA.rooms,
        shows: shows.length > 0 ? shows : FALLBACK_LIVE_DATA.shows,
      },
      source: 'live',
      timestamp,
    };
  } catch {
    return {
      data: FALLBACK_LIVE_DATA,
      source: 'fallback',
      timestamp,
      error: 'Live fetch failed',
    };
  }
}