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

/** Rule 3/20: no hand-typed chart entries. Empty until real ranked performers exist. */
const FALLBACK_CHARTS: HomeChartRow[] = [];

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