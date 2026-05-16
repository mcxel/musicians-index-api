/**
 * VenueTalentSlotEngine
 * Venue event slot requirements and availability windows.
 */

export type VenuePerformanceType =
  | "live-performance"
  | "dj-set"
  | "battle"
  | "cypher"
  | "comedy"
  | "sports-card"
  | "speaker-session"
  | "custom";

export type VenueTalentSlot = {
  slotId: string;
  venueId: string;
  eventId?: string;
  slotLabel: string;
  genre: string;
  performanceType: VenuePerformanceType;
  localOnly: boolean;
  regionalPreferred: boolean;
  availableFromIso: string;
  availableToIso: string;
  minReadinessScore: number;
};

const venueTalentSlots: VenueTalentSlot[] = [];
let slotCounter = 0;

export function createVenueTalentSlot(input: Omit<VenueTalentSlot, "slotId">): VenueTalentSlot {
  const slot: VenueTalentSlot = {
    ...input,
    slotId: `venue-slot-${++slotCounter}`,
  };
  venueTalentSlots.unshift(slot);
  return slot;
}

export function listVenueTalentSlots(venueId?: string): VenueTalentSlot[] {
  if (!venueId) return [...venueTalentSlots];
  return venueTalentSlots.filter((slot) => slot.venueId === venueId);
}
