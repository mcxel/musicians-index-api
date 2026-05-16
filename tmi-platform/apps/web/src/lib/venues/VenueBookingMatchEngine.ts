/**
 * VenueBookingMatchEngine
 * Venue-side matching of talent slots to artist/performer candidates.
 */

import { listVenueTalentSlots } from "./VenueTalentSlotEngine";
import { listVenueTalentCandidates } from "./VenueTalentSearchEngine";
import {
  scoreVenueBookingRecommendation,
  type VenueBookingRecommendation,
} from "./VenueBookingRecommendationEngine";

export function buildVenueBookingMatches(input: {
  venueId: string;
  limitPerSlot?: number;
}): Array<{
  slotId: string;
  recommendations: VenueBookingRecommendation[];
}> {
  const limit = input.limitPerSlot ?? 5;
  const slots = listVenueTalentSlots(input.venueId);

  return slots.map((slot) => {
    const candidates = listVenueTalentCandidates({
      genre: slot.genre,
      performanceType: slot.performanceType,
      region: slot.regionalPreferred ? undefined : undefined,
    });

    const recommendations = candidates
      .map((candidate) => scoreVenueBookingRecommendation(slot, candidate))
      .filter((result) => result.bookingReadinessScore >= slot.minReadinessScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      slotId: slot.slotId,
      recommendations,
    };
  });
}

export function listVenueSuggestedArtists(input: {
  venueId: string;
  limit?: number;
}): Array<{ artistId: string; score: number }> {
  const matches = buildVenueBookingMatches({
    venueId: input.venueId,
    limitPerSlot: input.limit ?? 5,
  });

  const scores = new Map<string, number>();
  matches.forEach((match) => {
    match.recommendations.forEach((recommendation) => {
      scores.set(
        recommendation.artistId,
        Math.max(scores.get(recommendation.artistId) ?? 0, recommendation.score)
      );
    });
  });

  return [...scores.entries()]
    .map(([artistId, score]) => ({ artistId, score }))
    .sort((a, b) => b.score - a.score);
}
