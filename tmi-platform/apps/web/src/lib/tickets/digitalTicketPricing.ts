/**
 * Digital ticket pricing policy — performer-owned digital TMI tickets.
 * Physical tickets remain Venue/Promoter (Rule 17).
 */

import {
  resolveTicketFee,
  buildTicketSaleSplit,
  TICKET_FEE_POLICY_ID,
  getTicketFeePolicy,
  formatTicketFeeBreakdown,
  type TicketFeeResolution,
  type TicketSaleSplit,
} from "@/lib/tickets/TicketFeeResolver";

export const DIGITAL_TICKET_RECOMMENDED_MIN_CENTS = 199; // $1.99
export const DIGITAL_TICKET_RECOMMENDED_MAX_CENTS = 999; // $9.99
export const DIGITAL_TICKET_POLICY_MIN_CENTS = 99; // $0.99 floor
export const DIGITAL_TICKET_POLICY_MAX_CENTS = 49999; // soft ceiling

export type DigitalTicketClass = "general" | "vip" | "backstage";

export interface DigitalTicketClassQuote {
  classId: DigitalTicketClass;
  label: string;
  priceCents: number;
  recommended: boolean;
  fee: TicketFeeResolution;
  splitPreview: TicketSaleSplit;
  feePolicyId: typeof TICKET_FEE_POLICY_ID;
}

export function clampDigitalTicketPrice(cents: number): number {
  return Math.min(
    DIGITAL_TICKET_POLICY_MAX_CENTS,
    Math.max(DIGITAL_TICKET_POLICY_MIN_CENTS, Math.round(cents)),
  );
}

export function isInRecommendedDigitalRange(cents: number): boolean {
  return (
    cents >= DIGITAL_TICKET_RECOMMENDED_MIN_CENTS &&
    cents <= DIGITAL_TICKET_RECOMMENDED_MAX_CENTS
  );
}

export function quoteDigitalTicketClass(input: {
  classId: DigitalTicketClass;
  priceCents: number;
  expectedVolume?: number;
}): DigitalTicketClassQuote {
  const priceCents = clampDigitalTicketPrice(input.priceCents);
  const fee = resolveTicketFee({
    baseTicketPriceCents: priceCents,
    eventCategory: "digital_live",
  });
  const splitPreview = buildTicketSaleSplit({
    quantity: input.expectedVolume ?? 1,
    baseTicketPriceCents: priceCents,
    eventCategory: "digital_live",
  });
  const labels: Record<DigitalTicketClass, string> = {
    general: "General Admission (Digital)",
    vip: "VIP Digital",
    backstage: "Digital Backstage",
  };
  return {
    classId: input.classId,
    label: labels[input.classId],
    priceCents,
    recommended: isInRecommendedDigitalRange(priceCents),
    fee,
    splitPreview,
    feePolicyId: TICKET_FEE_POLICY_ID,
  };
}

export function defaultDigitalTicketQuotes(): DigitalTicketClassQuote[] {
  return [
    quoteDigitalTicketClass({ classId: "general", priceCents: 299 }),
    quoteDigitalTicketClass({ classId: "vip", priceCents: 699 }),
    quoteDigitalTicketClass({ classId: "backstage", priceCents: 999 }),
  ];
}

export { getTicketFeePolicy, formatTicketFeeBreakdown, TICKET_FEE_POLICY_ID };
