import type { HomeDataEnvelope } from './types';

export interface HomeCrownFeedRow {
  id: string;
  artistName: string;
  genre: string;
  rank: number;
  score: number;
  eligible: boolean;
  inCooldown: boolean;
}

export interface HomeCrownFeedGenre {
  genre: string;
  winner: HomeCrownFeedRow | null;
  ranked: HomeCrownFeedRow[];
  term: {
    daysHeld: number;
    remainingTenureDays: number;
    warningActive: boolean;
  };
}

export interface HomeCrownFeedData {
  genres: HomeCrownFeedGenre[];
  rules: {
    maxTenureDays: number;
    warningStartDays: number;
    cooldownDays: number;
  };
}

const FALLBACK_DATA: HomeCrownFeedData = {
  genres: [
    {
      genre: 'Hip-Hop',
      winner: {
        id: 'fallback-1',
        artistName: 'CYPHER KINGS',
        genre: 'Hip-Hop',
        rank: 1,
        score: 84,
        eligible: true,
        inCooldown: false,
      },
      ranked: [
        {
          id: 'fallback-1',
          artistName: 'CYPHER KINGS',
          genre: 'Hip-Hop',
          rank: 1,
          score: 84,
          eligible: true,
          inCooldown: false,
        },
        {
          id: 'fallback-1b',
          artistName: 'JAYLEN CROSS',
          genre: 'Hip-Hop',
          rank: 2,
          score: 79,
          eligible: true,
          inCooldown: false,
        },
      ],
      term: {
        daysHeld: 0,
        remainingTenureDays: 60,
        warningActive: false,
      },
    },
    {
      genre: 'R&B',
      winner: {
        id: 'fallback-2',
        artistName: 'LUNA VIBE',
        genre: 'R&B',
        rank: 1,
        score: 82,
        eligible: true,
        inCooldown: false,
      },
      ranked: [
        {
          id: 'fallback-2',
          artistName: 'LUNA VIBE',
          genre: 'R&B',
          rank: 1,
          score: 82,
          eligible: true,
          inCooldown: false,
        },
      ],
      term: {
        daysHeld: 0,
        remainingTenureDays: 60,
        warningActive: false,
      },
    },
  ],
  rules: {
    maxTenureDays: 60,
    warningStartDays: 45,
    cooldownDays: 21,
  },
};

export async function getHomeCrownFeed(): Promise<HomeDataEnvelope<HomeCrownFeedData>> {
  const timestamp = new Date().toISOString();
  try {
    const response = await fetch('/api/homepage/crown-feed?all=1', { cache: 'no-store' });
    if (!response.ok) {
      return {
        data: FALLBACK_DATA,
        source: 'fallback',
        timestamp,
        error: `HTTP ${response.status}`,
      };
    }

    const payload = (await response.json()) as Partial<HomeCrownFeedData>;
    const liveGenres = Array.isArray(payload.genres) ? payload.genres : [];
    const hasUsableLiveData = liveGenres.some((genre) => Array.isArray(genre?.ranked) && genre.ranked.length > 0);

    return {
      data: {
        genres: hasUsableLiveData ? liveGenres : FALLBACK_DATA.genres,
        rules: hasUsableLiveData ? (payload.rules ?? FALLBACK_DATA.rules) : FALLBACK_DATA.rules,
      },
      source: hasUsableLiveData ? 'live' : 'fallback',
      timestamp,
      error: hasUsableLiveData ? undefined : 'Empty crown feed payload',
    };
  } catch {
    return {
      data: FALLBACK_DATA,
      source: 'fallback',
      timestamp,
      error: 'crown feed fetch failed',
    };
  }
}
