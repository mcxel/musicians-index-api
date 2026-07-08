export type VenueRealityMetric =
  | 'lighting'
  | 'materials'
  | 'avatarRealism'
  | 'audienceRealism'
  | 'stageRealism'
  | 'cameraRealism'
  | 'atmosphere'
  | 'performance'
  | 'lod'
  | 'shadowQuality'
  | 'audioAmbience';

export interface VenueRealityScorecard {
  venueId: string;
  venueLabel: string;
  scoredAt: number;
  scorer: 'blackbox' | 'copilot' | 'claude' | 'gemini' | 'manual';
  metrics: Record<VenueRealityMetric, number>;
  overall: number;
}

import {
  getRealityCertificationSummary,
  getRealityScorecard,
  listRealityScorecards,
  upsertRealityScorecard,
} from '@/lib/reality/RealityCertificationEngine';

export function upsertVenueRealityScorecard(input: Omit<VenueRealityScorecard, 'overall' | 'scoredAt'>): VenueRealityScorecard {
  const next = upsertRealityScorecard({
    module: 'venue',
    targetId: input.venueId,
    targetLabel: input.venueLabel,
    scorer: input.scorer,
    metrics: input.metrics,
  });

  return {
    venueId: next.targetId,
    venueLabel: next.targetLabel,
    scoredAt: next.scoredAt,
    scorer: next.scorer,
    metrics: next.metrics as Record<VenueRealityMetric, number>,
    overall: next.overall,
  };
}

export function listVenueRealityScorecards(): VenueRealityScorecard[] {
  return listRealityScorecards('venue').map((scorecard) => ({
    venueId: scorecard.targetId,
    venueLabel: scorecard.targetLabel,
    scoredAt: scorecard.scoredAt,
    scorer: scorecard.scorer,
    metrics: scorecard.metrics as Record<VenueRealityMetric, number>,
    overall: scorecard.overall,
  }));
}

export function getVenueRealityScorecard(venueId: string): VenueRealityScorecard | null {
  const scorecard = getRealityScorecard('venue', venueId);
  if (!scorecard) return null;
  return {
    venueId: scorecard.targetId,
    venueLabel: scorecard.targetLabel,
    scoredAt: scorecard.scoredAt,
    scorer: scorecard.scorer,
    metrics: scorecard.metrics as Record<VenueRealityMetric, number>,
    overall: scorecard.overall,
  };
}

export function getVenueRealitySummary(): {
  totalVenues: number;
  topVenue: VenueRealityScorecard | null;
  averageOverall: number;
  lastUpdatedTs: number;
} {
  const suiteSummary = getRealityCertificationSummary();
  const cards = listVenueRealityScorecards();
  if (cards.length === 0) {
    return {
      totalVenues: 0,
      topVenue: null,
      averageOverall: 0,
      lastUpdatedTs: suiteSummary.updatedAtMs,
    };
  }

  const averageOverall = Math.round(cards.reduce((sum, card) => sum + card.overall, 0) / cards.length);
  return {
    totalVenues: cards.length,
    topVenue: cards[0] ?? null,
    averageOverall,
    lastUpdatedTs: suiteSummary.updatedAtMs,
  };
}