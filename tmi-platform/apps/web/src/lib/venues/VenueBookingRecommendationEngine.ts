/**
 * VenueBookingRecommendationEngine
 * Scoring and recommendation logic for venue talent matching.
 */

import type { VenueTalentSlot } from "./VenueTalentSlotEngine";
import type { VenueTalentCandidate } from "./VenueTalentSearchEngine";

export type VenueBookingRecommendation = {
  slotId: string;
  candidateId: string;
  artistId: string;
  score: number;
  genreFitScore: number;
  availabilityScore: number;
  ticketDrawScore: number;
  localFitScore: number;
  bookingReadinessScore: number;
};

function localFit(slot: VenueTalentSlot, candidate: VenueTalentCandidate): number {
  if (slot.localOnly) return candidate.city ? 100 : 20;
  if (slot.regionalPreferred) return candidate.region ? 90 : 40;
  return 70;
}

export function scoreVenueBookingRecommendation(
  slot: VenueTalentSlot,
  candidate: VenueTalentCandidate
): VenueBookingRecommendation {
  const genreFitScore = slot.genre === candidate.genre ? 100 : 40;
  const localFitScore = localFit(slot, candidate);
  const score = Math.round(
    genreFitScore * 0.25 +
    candidate.availabilityScore * 0.2 +
    candidate.ticketDrawScore * 0.2 +
    localFitScore * 0.15 +
    candidate.bookingReadinessScore * 0.15 +
    candidate.sponsorStrengthScore * 0.05
  );

  return {
    slotId: slot.slotId,
    candidateId: candidate.candidateId,
    artistId: candidate.artistId,
    score,
    genreFitScore,
    availabilityScore: candidate.availabilityScore,
    ticketDrawScore: candidate.ticketDrawScore,
    localFitScore,
    bookingReadinessScore: candidate.bookingReadinessScore,
  };
}
