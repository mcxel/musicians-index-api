import type { AccountTier } from '@/types/security';

export type EvolutionEvent =
  | 'READ_ARTICLE'
  | 'JOIN_ROOM'
  | 'VOTE_BATTLE'
  | 'SEND_MESSAGE'
  | 'FOLLOW_ARTIST'
  | 'WATCH_LIVE'
  | 'CLAIM_SEASON_REWARD';

export type PrizeCategory = 'INTERNAL_COSMETIC' | 'SPONSOR_FUNDED_PROMO' | 'CAREER_ACCELERATOR';

export interface SponsoredPrize {
  id: string;
  category: PrizeCategory;
  title: string;
  description: string;
  probabilityWeight: number;
  rewardValueCredits: number;
  sponsorName?: string;
  targetTier: AccountTier | 'ALL';
  claimCtaPath?: string;
}

export interface MetricSnapshot {
  slug: string;
  clicks: number;
  averageSessionDurationMs: number;
  conversionProbability: number;
}

export interface PlatformEvolutionState {
  generationCycle: number;
  optimizedGenreFocus: string;
  topPerformingLayoutSlug: string;
  systemAlertsProcessed: number;
}
