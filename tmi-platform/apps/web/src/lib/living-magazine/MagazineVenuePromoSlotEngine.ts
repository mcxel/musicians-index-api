// MagazineVenuePromoSlotEngine
// Venue promo slots — events, shows, openings, venue spotlights.
// Unlocks ticket embed in same spread.

export interface VenuePromoSlot {
  id: string;
  venueId: string;
  venueName: string;
  eventName: string;
  eventDate: string;
  issueId?: string;
  spreadIndex?: number;
  imageUrl?: string;
  ticketUrl?: string;
  ticketEmbedEnabled: boolean;
  impressions: number;
  ticketClicks: number;
  revenue: number;
  flatFee: number;
  accentColor: string;
}

const _slots = new Map<string, VenuePromoSlot>();

export function createVenuePromoSlot(
  id: string,
  venueId: string,
  venueName: string,
  eventName: string,
  eventDate: string,
  flatFee: number,
  options: Partial<VenuePromoSlot> = {},
): VenuePromoSlot {
  const slot: VenuePromoSlot = {
    id,
    venueId,
    venueName,
    eventName,
    eventDate,
    ticketEmbedEnabled: true,
    impressions: 0,
    ticketClicks: 0,
    revenue: flatFee,
    flatFee,
    accentColor: "#AA2DFF",
    ...options,
  };
  _slots.set(id, slot);
  return slot;
}

export function recordVenueImpression(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  _slots.set(slotId, { ...slot, impressions: slot.impressions + 1 });
}

export function recordTicketClick(slotId: string): void {
  const slot = _slots.get(slotId);
  if (!slot) return;
  _slots.set(slotId, { ...slot, ticketClicks: slot.ticketClicks + 1 });
}

export function getVenuePromoSlot(id: string): VenuePromoSlot | null {
  return _slots.get(id) ?? null;
}

export function getSlotsByVenue(venueId: string): VenuePromoSlot[] {
  return Array.from(_slots.values()).filter(s => s.venueId === venueId);
}
