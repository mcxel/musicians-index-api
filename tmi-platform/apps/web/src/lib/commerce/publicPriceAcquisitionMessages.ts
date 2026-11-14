/**
 * Public price-led acquisition messages — canonical sources only.
 * Ticket $0.75–$9.99 = TMI per-ticket service fee (TicketFeeResolver), NOT face price.
 * Ad "from" = lowest day price in AdPricingEngine (currently free-member-profile).
 * Do not invent competitor comparisons.
 */

import {
  CANONICAL_TICKET_FEE_POLICY,
  TICKET_FEE_POLICY_ID,
} from "@/lib/tickets/TicketFeeResolver";
import { listAdDayPricesLowestFirst } from "@/lib/ads/AdPricingEngine";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";

function centsToUsd(cents: number): string {
  const n = cents / 100;
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

export const PUBLIC_TICKET_FEE_ACQUISITION = {
  policyId: TICKET_FEE_POLICY_ID,
  semantics:
    "TMI platform service fee per ticket sold (buyer-facing service fee). Not the event ticket face price.",
  minimumFeeCents: CANONICAL_TICKET_FEE_POLICY.minimumFeeCents,
  maximumFeeCents: CANONICAL_TICKET_FEE_POLICY.maximumFeeCents,
  minimumDisplay: centsToUsd(CANONICAL_TICKET_FEE_POLICY.minimumFeeCents),
  maximumDisplay: centsToUsd(CANONICAL_TICKET_FEE_POLICY.maximumFeeCents),
  href: "/home/4",
  sellTicketsHref: "/venue/dashboard",
} as const;

export function getPublicAdStartFrom(): {
  placementId: string;
  duration: "day";
  priceCents: number;
  display: string;
  href: string;
} {
  const lowest = listAdDayPricesLowestFirst()[0];
  const entry = STRIPE_PRODUCTS.AD_ENTRY_DAY_099;
  const priceCents = entry?.price ?? lowest?.priceCents ?? 99;
  return {
    placementId: String(lowest?.id ?? "ad_entry_day_099"),
    duration: "day",
    priceCents,
    display: centsToUsd(priceCents),
    href: "/advertising",
  };
}

export function getPublicPlatformAdMicroSpot(): {
  name: string;
  priceCents: number;
  display: string;
  href: string;
} {
  const entry = STRIPE_PRODUCTS.AD_ENTRY_DAY_099;
  return {
    name: entry.name,
    priceCents: entry.price,
    display: centsToUsd(entry.price),
    href: "/advertising",
  };
}

/** Ordered for ticker: ticket fee first (lowest headline), then ads. */
export function getPublicPriceAcquisitionTickerItems(): string[] {
  const fee = PUBLIC_TICKET_FEE_ACQUISITION;
  const ad = getPublicAdStartFrom();
  const micro = getPublicPlatformAdMicroSpot();
  return [
    `SELL TICKETS ON TMI — PLATFORM FEE FROM ${fee.minimumDisplay} (UP TO ${fee.maximumDisplay})`,
    `TICKETING FROM ${fee.minimumDisplay} — KEEP EVENT TICKETING AFFORDABLE`,
    `ADVERTISE ON TMI — FROM ${ad.display}/DAY`,
    `PLATFORM ADS FROM ${micro.display} — SEE AD PRICES`,
  ];
}

export function getHome4PriceVoiceMessages(): string[] {
  const fee = PUBLIC_TICKET_FEE_ACQUISITION;
  const ad = getPublicAdStartFrom();
  const micro = getPublicPlatformAdMicroSpot();
  return [
    `SELL YOUR TICKETS ON TMI — FEE FROM ${fee.minimumDisplay} TO ${fee.maximumDisplay}`,
    `AFFORDABLE TICKETING — PLATFORM FEE STARTS AT ${fee.minimumDisplay}`,
    `ADVERTISE ON TMI — FROM ${ad.display}/DAY`,
    `PLATFORM AD MICRO SPOT — ${micro.display}`,
    `SEE TICKET + AD PRICES — HOME 4 MARKETPLACE`,
  ];
}

/** @deprecated display helper for inline copy */
export function formatTicketFeeRangePublic(): string {
  const f = PUBLIC_TICKET_FEE_ACQUISITION;
  return `${f.minimumDisplay}–${f.maximumDisplay}`;
}

export function formatCheapestAdDayPublic(): string {
  return `${getPublicAdStartFrom().display}/day`;
}
