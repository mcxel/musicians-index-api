export interface HomeChartRow {
  id: string;
  rank: number;
  title: string;
  artist: string;
  genre: string;
  change: 'up' | 'down' | 'same' | 'new';
  plays: string;
  slug: string | null;
  followers: number;
}

import type { HomeDataEnvelope } from './types';
import { getHomepageRuntimeOverrides } from '@/lib/homepageAdmin/runtimeOverrides';
import type { HomepageRuntimeOverrides } from '@/lib/homepageAdmin/types';

interface HomeChartsOptions {
  overrides?: HomepageRuntimeOverrides;
}

const FALLBACK_CHARTS: HomeChartRow[] = [
  { id: 'fallback-1', rank: 1, title: 'Crown Season Vol. 3', artist: 'Jaylen Cross', genre: 'Hip-Hop', change: 'up', plays: '1.2M', slug: null, followers: 1200000 },
  { id: 'fallback-2', rank: 2, title: 'Midnight Frequencies', artist: 'Amirah Wells', genre: 'R&B', change: 'up', plays: '980K', slug: null, followers: 980000 },
  { id: 'fallback-3', rank: 3, title: 'Neon Cathedral', artist: 'DESTINED', genre: 'Neo-Soul', change: 'same', plays: '876K', slug: null, followers: 876000 },
  { id: 'fallback-4', rank: 4, title: 'Velocity', artist: 'Traxx Monroe', genre: 'Trap', change: 'up', plays: '742K', slug: null, followers: 742000 },
  { id: 'fallback-5', rank: 5, title: 'Golden Years', artist: 'Savannah J.', genre: 'Soul', change: 'down', plays: '690K', slug: null, followers: 690000 },
  { id: 'fallback-6', rank: 6, title: 'Unwritten Maps', artist: 'Nova Reign', genre: 'Afrobeats', change: 'up', plays: '644K', slug: null, followers: 644000 },
  { id: 'fallback-7', rank: 7, title: 'Mirror Language', artist: 'Diana Cross', genre: 'Pop', change: 'down', plays: '590K', slug: null, followers: 590000 },
  { id: 'fallback-8', rank: 8, title: 'Deep Cuts', artist: 'The Cyphers', genre: 'Rap', change: 'same', plays: '541K', slug: null, followers: 541000 },
  { id: 'fallback-9', rank: 9, title: 'Late Night Studio', artist: 'Khalil B.', genre: 'Lo-Fi', change: 'up', plays: '488K', slug: null, followers: 488000 },
  { id: 'fallback-10', rank: 10, title: 'Frequency Wars', artist: 'Static & Bloom', genre: 'Electronic', change: 'new', plays: '412K', slug: null, followers: 412000 },
];

function formatCount(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

export async function getHomeCharts(limit = 10, options: HomeChartsOptions = {}): Promise<HomeDataEnvelope<HomeChartRow[]>> {
  const timestamp = new Date().toISOString();
  const runtimeOverrides = options.overrides ?? getHomepageRuntimeOverrides();
  const overrideIds = runtimeOverrides.chartItemIds ?? runtimeOverrides.trendingItemIds ?? [];
  const featuredArtistId = runtimeOverrides.featuredArtistId;

  function applyOverrideOrder(rows: HomeChartRow[]): HomeChartRow[] {
    const byId = new Map(rows.map((row) => [row.id, row]));
    const orderedFromOverride = overrideIds.map((id) => byId.get(id)).filter((row): row is HomeChartRow => Boolean(row));
    const remainder = rows.filter((row) => !overrideIds.includes(row.id));
    const combined = [...orderedFromOverride, ...remainder];

    if (!featuredArtistId) {
      return combined.slice(0, limit).map((row, index) => ({ ...row, rank: index + 1 }));
    }

    const featured = combined.find((row) => row.id === featuredArtistId);
    if (!featured) {
      return combined.slice(0, limit).map((row, index) => ({ ...row, rank: index + 1 }));
    }

    const prioritized = [featured, ...combined.filter((row) => row.id !== featuredArtistId)];
    return prioritized.slice(0, limit).map((row, index) => ({ ...row, rank: index + 1 }));
  }

  try {
    const response = await fetch(`/api/homepage/charts?limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) {
      return {
        data: applyOverrideOrder(FALLBACK_CHARTS),
        source: 'fallback',
        timestamp,
        error: `HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      return {
        data: applyOverrideOrder(FALLBACK_CHARTS),
        source: 'fallback',
        timestamp,
        error: 'Empty charts payload',
      };
    }

    const mapped: HomeChartRow[] = data.slice(0, limit).map((entry, index) => {
      const followers = typeof entry.followers === 'number' ? entry.followers : 0;
      const stageName = typeof entry.stageName === 'string' ? entry.stageName : `Artist ${index + 1}`;
      const genres = Array.isArray(entry.genres) ? entry.genres : [];
      const change = entry.change;
      const resolvedChange: HomeChartRow['change'] =
        change === 'up' || change === 'down' || change === 'same' || change === 'new' ? change : 'up';

      return {
        id: typeof entry.id === 'string' ? entry.id : typeof entry.slug === 'string' ? entry.slug : `chart-${index + 1}`,
        rank: typeof entry.rank === 'number' ? entry.rank : index + 1,
        title: stageName,
        artist: stageName,
        genre: typeof genres[0] === 'string' ? genres[0] : 'Music',
        change: resolvedChange,
        plays: formatCount(followers),
        slug: typeof entry.slug === 'string' ? entry.slug : null,
        followers,
      };
    });

    return {
      data: applyOverrideOrder(mapped),
      source: 'live',
      timestamp,
    };
  } catch {
    return {
      data: applyOverrideOrder(FALLBACK_CHARTS),
      source: 'fallback',
      timestamp,
      error: 'Charts fetch failed',
    };
  }
}