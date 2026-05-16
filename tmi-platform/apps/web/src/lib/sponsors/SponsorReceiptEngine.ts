export type SponsorReceiptPayload = {
  receiptId: string;
  sponsorId: string;
  campaignId: string;
  placementId: string;
  quantity: number;
  subtotalCents: number;
  taxCents: number;
  platformFeeCents: number;
  totalCents: number;
  currency: "USD";
  issuedAtMs: number;
};

const TAX_RATE = 0.0825;
const PLATFORM_FEE_RATE = 0.07;

export function buildSponsorReceiptPayload(args: {
  sponsorId: string;
  campaignId: string;
  placementId: string;
  quantity: number;
  unitPriceCents: number;
}): SponsorReceiptPayload {
  const subtotalCents = args.quantity * args.unitPriceCents;
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const platformFeeCents = Math.round(subtotalCents * PLATFORM_FEE_RATE);
  const totalCents = subtotalCents + taxCents + platformFeeCents;

  return {
    receiptId: `sponsor-rcpt-${Date.now()}-${args.sponsorId}`,
    sponsorId: args.sponsorId,
    campaignId: args.campaignId,
    placementId: args.placementId,
    quantity: args.quantity,
    subtotalCents,
    taxCents,
    platformFeeCents,
    totalCents,
    currency: "USD",
    issuedAtMs: Date.now(),
  };
}
