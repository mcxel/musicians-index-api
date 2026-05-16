// MagazineTicketSlotEngine
// Ticket card slots embedded inline in magazine spreads.
// Shows upcoming event, artist, venue, price, CTA.

export type TicketTier = "general" | "vip" | "backstage" | "meet-and-greet" | "stream";

export interface TicketCard {
  id: string;
  eventId: string;
  eventName: string;
  artistId?: string;
  venueId?: string;
  venueName?: string;
  eventDate: string;
  tier: TicketTier;
  price: number;
  currency: string;
  available: number;
  total: number;
  imageUrl?: string;
  purchaseUrl: string;
  issueId?: string;
  spreadIndex?: number;
  impressions: number;
  conversions: number;
  accentColor: string;
}

const _tickets = new Map<string, TicketCard>();

export function createTicketCard(
  id: string,
  eventId: string,
  eventName: string,
  eventDate: string,
  tier: TicketTier,
  price: number,
  total: number,
  purchaseUrl: string,
  options: Partial<TicketCard> = {},
): TicketCard {
  const card: TicketCard = {
    id,
    eventId,
    eventName,
    eventDate,
    tier,
    price,
    total,
    available: total,
    currency: "USD",
    purchaseUrl,
    impressions: 0,
    conversions: 0,
    accentColor: "#FFD700",
    ...options,
  };
  _tickets.set(id, card);
  return card;
}

export function recordTicketImpression(id: string): void {
  const t = _tickets.get(id);
  if (!t) return;
  _tickets.set(id, { ...t, impressions: t.impressions + 1 });
}

export function recordTicketConversion(id: string): void {
  const t = _tickets.get(id);
  if (!t || t.available <= 0) return;
  _tickets.set(id, {
    ...t,
    conversions: t.conversions + 1,
    available: t.available - 1,
  });
}

export function isSoldOut(id: string): boolean {
  const t = _tickets.get(id);
  return !t || t.available === 0;
}

export function getTicketCard(id: string): TicketCard | null {
  return _tickets.get(id) ?? null;
}

export function getTicketsByEvent(eventId: string): TicketCard[] {
  return Array.from(_tickets.values()).filter(t => t.eventId === eventId);
}
