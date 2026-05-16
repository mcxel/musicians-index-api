/**
 * VenueTalentSearchEngine
 * Search index for artists and performers from the venue's perspective.
 */

import type { VenuePerformanceType } from "./VenueTalentSlotEngine";

export type VenueTalentCandidate = {
  candidateId: string;
  artistId: string;
  performerId?: string;
  displayName: string;
  genre: string;
  performanceType: VenuePerformanceType;
  city?: string;
  region?: string;
  availabilityScore: number;
  bookingReadinessScore: number;
  ticketDrawScore: number;
  sponsorStrengthScore: number;
};

const candidates: VenueTalentCandidate[] = [];
let candidateCounter = 0;

export function registerVenueTalentCandidate(input: Omit<VenueTalentCandidate, "candidateId">): VenueTalentCandidate {
  const candidate: VenueTalentCandidate = {
    ...input,
    candidateId: `venue-candidate-${++candidateCounter}`,
  };
  candidates.unshift(candidate);
  return candidate;
}

export function listVenueTalentCandidates(filters?: {
  genre?: string;
  performanceType?: VenuePerformanceType;
  city?: string;
  region?: string;
}): VenueTalentCandidate[] {
  return candidates.filter((candidate) => {
    if (filters?.genre && candidate.genre !== filters.genre) return false;
    if (filters?.performanceType && candidate.performanceType !== filters.performanceType) return false;
    if (filters?.city && candidate.city?.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters?.region && candidate.region?.toLowerCase() !== filters.region.toLowerCase()) return false;
    return true;
  });
}
