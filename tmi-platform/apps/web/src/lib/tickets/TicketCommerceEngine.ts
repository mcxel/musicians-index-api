import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { getReceiptBreakdown, calculateTax, getTaxRate } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { generateReceipt, type Receipt } from "@/lib/commerce/ReceiptEngine";
import { calculateRevenueSplitByPreset, type RevenueSplitResult } from "@/lib/commerce/RevenueSplitEngine";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketTier = "general" | "vip" | "backstage" | "meet_greet" | "season_pass" | "contest";

export type TicketOrder = {
  id: string;
  userId: string;
  eventId: string;
  venueId: string;
  artistId: string;
  tier: TicketTier;
  seatLabel?: string;
  quantity: number;
  unitPriceCents: number;
  region: TaxRegion;
  receipt: Receipt;
  split: RevenueSplitResult;
  purchasedAtMs: number;
};

// ─── Default ticket prices (cents) ───────────────────────────────────────────

export const TICKET_BASE_PRICES: Record<TicketTier, number> = {
  general:     1500,   // $15.00
  vip:         4500,   // $45.00
  backstage:   9900,   // $99.00
  meet_greet:  14900,  // $149.00
  season_pass: 7900,   // $79.00
  contest:     500,    // $5.00
};

const ticketOrders: TicketOrder[] = [];
let _counter = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

export function purchaseTicket(
  userId: string,
  eventId: string,
  venueId: string,
  artistId: string,
  tier: TicketTier,
  region: TaxRegion,
  options?: { seatLabel?: string; quantity?: number; customPriceCents?: number },
): TicketOrder {
  const quantity = options?.quantity ?? 1;
  const unitPrice = options?.customPriceCents ?? TICKET_BASE_PRICES[tier];
  const subtotalCents = unitPrice * quantity;
  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(subtotalCents, taxRateBps);

  const label = `Ticket — ${tier} × ${quantity} @ ${eventId}`;
  const receipt = generateReceipt(userId, "ticket", label, subtotalCents, region, {
    eventId, venueId, artistId, tier, quantity,
  });

  const split = calculateRevenueSplitByPreset("ticket", receipt.totalCents, taxCents);

  const order: TicketOrder = {
    id: `tord-${++_counter}`,
    userId,
    eventId,
    venueId,
    artistId,
    tier,
    seatLabel: options?.seatLabel,
    quantity,
    unitPriceCents: unitPrice,
    region,
    receipt,
    split,
    purchasedAtMs: Date.now(),
  };

  ticketOrders.push(order);
  Analytics.revenue({ userId, amount: order.receipt.totalCents / 100, currency: 'usd', product: `ticket-${tier}`, activePersona: 'fan' });
  return order;
}

export function getTicketOrdersForUser(userId: string): TicketOrder[] {
  return ticketOrders.filter(o => o.userId === userId);
}

export function getTicketOrdersForEvent(eventId: string): TicketOrder[] {
  return ticketOrders.filter(o => o.eventId === eventId);
}

export function getTotalTicketRevenue(eventId: string): { grossCents: number; platformCents: number; venueCents: number; artistCents: number } {
  const orders = getTicketOrdersForEvent(eventId);
  return orders.reduce((acc, o) => ({
    grossCents:    acc.grossCents    + o.receipt.totalCents,
    platformCents: acc.platformCents + o.split.splits.platform.cents,
    venueCents:    acc.venueCents    + o.split.splits.venue.cents,
    artistCents:   acc.artistCents   + o.split.splits.artist.cents,
  }), { grossCents: 0, platformCents: 0, venueCents: 0, artistCents: 0 });
}
