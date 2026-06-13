export interface HomeSponsorRow {
  name: string;
  tier: string;
}

import type { HomeDataEnvelope } from './types';
import { getHomepageRuntimeOverrides } from '@/lib/homepageAdmin/runtimeOverrides';
import type { HomepageRuntimeOverrides } from '@/lib/homepageAdmin/types';

interface HomeSponsorsOptions {
  sponsorPlacementId?: string;
  overrides?: HomepageRuntimeOverrides;
}

const FALLBACK_SPONSORS: HomeSponsorRow[] = [
  { name: 'AMPLIFY RECORDS', tier: 'PLATINUM' },
  { name: 'BEATLAB STUDIOS', tier: 'GOLD' },
  { name: 'VELOCITY AUDIO', tier: 'GOLD' },
  { name: 'NOVA MEDIA GROUP', tier: 'SILVER' },
  { name: 'CROWN & CO.', tier: 'SILVER' },
  { name: 'FREQUENCY LABS', tier: 'RUBY' },
  { name: 'THE VAULT COLLECTIVE', tier: 'RUBY' },
  { name: 'SONIC AXIS', tier: 'RUBY' },
];

export async function getHomeSponsors(options: HomeSponsorsOptions = {}): Promise<HomeDataEnvelope<HomeSponsorRow[]>> {
  const timestamp = new Date().toISOString();
  const runtimeOverrides = options.overrides ?? getHomepageRuntimeOverrides();
  const preferredId = options.sponsorPlacementId ?? runtimeOverrides.sponsorPlacementId;

  function prioritizeSponsors(rows: HomeSponsorRow[]): HomeSponsorRow[] {
    if (!preferredId) return rows;
    const preferred = rows.find((row) => row.name.toLowerCase() === preferredId.toLowerCase());
    if (!preferred) return rows;
    return [preferred, ...rows.filter((row) => row !== preferred)];
  }

  try {
    const response = await fetch('/api/homepage/sponsors', { cache: 'no-store' });
    if (!response.ok) {
      return {
        data: prioritizeSponsors(FALLBACK_SPONSORS),
        source: 'fallback',
        timestamp,
        error: `HTTP ${response.status}`,
      };
    }

    const data = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) {
      return {
        data: prioritizeSponsors(FALLBACK_SPONSORS),
        source: 'fallback',
        timestamp,
        error: 'Empty sponsors payload',
      };
    }

    const mapped = data.map((sponsor) => ({
      name: typeof sponsor.name === 'string' ? sponsor.name.toUpperCase() : 'SPONSOR',
      tier: typeof sponsor.tier === 'string' ? sponsor.tier.toUpperCase() : 'RUBY',
    }));

    return {
      data: prioritizeSponsors(mapped),
      source: 'live',
      timestamp,
    };
  } catch {
    return {
      data: prioritizeSponsors(FALLBACK_SPONSORS),
      source: 'fallback',
      timestamp,
      error: 'Sponsors fetch failed',
    };
  }
}