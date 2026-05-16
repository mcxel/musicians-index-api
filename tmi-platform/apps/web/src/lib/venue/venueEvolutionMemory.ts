export type VenueHeatSnapshot = {
  venueId: string;
  busiestAreas: string[];
  hottestBattleSpots: string[];
  bestSeats: string[];
  bestMerchZones: string[];
  bestAdZones: string[];
  mostProfitableLocations: string[];
  strongestSocialZones: string[];
  capturedAt: number;
};

const evolutionMemory = new Map<string, VenueHeatSnapshot>();

export function updateVenueEvolutionMemory(snapshot: VenueHeatSnapshot): void {
  evolutionMemory.set(snapshot.venueId, snapshot);
}

export function getVenueEvolutionMemory(venueId: string): VenueHeatSnapshot | null {
  return evolutionMemory.get(venueId) ?? null;
}

export function listVenueEvolutionMemories(): VenueHeatSnapshot[] {
  return Array.from(evolutionMemory.values());
}
