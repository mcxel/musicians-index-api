import type { AccountType, SubscriptionTier } from "./SubscriptionPricingEngine";
import { getTierPrice } from "./SubscriptionPricingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommerceItemType =
  | "subscription"
  | "ticket"
  | "meet_greet"
  | "season_pass"
  | "contest_entry"
  | "nft"
  | "beat"
  | "booking"
  | "ad";

export type TaxRegion =
  | "US_CA" | "US_NY" | "US_TX" | "US_FL" | "US_WA"
  | "US_DEFAULT"
  | "CA"    // Canada
  | "UK"
  | "EU"
  | "AU"
  | "INTL"; // catch-all zero-tax international

export type TaxBreakdown = {
  subtotalCents: number;
  taxRateBps: number;       // basis points (825 = 8.25%)
  taxCents: number;
  totalCents: number;
  region: TaxRegion;
  subtotalDisplay: string;
  taxDisplay: string;
  totalDisplay: string;
};

export type ReceiptBreakdown = TaxBreakdown & {
  itemType: CommerceItemType;
  label: string;
  accountType?: AccountType;
  tier?: SubscriptionTier;
};

// ─── Tax rate table (basis points) ───────────────────────────────────────────

const TAX_RATES_BPS: Record<TaxRegion, number> = {
  US_CA:      975,   // 9.75%
  US_NY:      890,   // 8.90%
  US_TX:      825,   // 8.25%
  US_FL:      700,   // 7.00%
  US_WA:      1025,  // 10.25%
  US_DEFAULT: 800,   // 8.00% fallback
  CA:         500,   // 5.00% GST
  UK:         2000,  // 20.00% VAT
  EU:         2000,  // 20.00% VAT
  AU:         1000,  // 10.00% GST
  INTL:       0,
};

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTaxRate(region: TaxRegion): number {
  return TAX_RATES_BPS[region] ?? TAX_RATES_BPS.INTL;
}

export function getBasePrice(accountType: AccountType, tier: SubscriptionTier): number {
  return getTierPrice(accountType, tier).usdCents;
}

export function calculateTax(subtotalCents: number, taxRateBps: number): number {
  return Math.round((subtotalCents * taxRateBps) / 10_000);
}

export function calculateFinalPrice(
  accountType: AccountType,
  tier: SubscriptionTier,
  region: TaxRegion,
): TaxBreakdown {
  const subtotalCents = getBasePrice(accountType, tier);
  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(subtotalCents, taxRateBps);
  const totalCents = subtotalCents + taxCents;

  return {
    subtotalCents,
    taxRateBps,
    taxCents,
    totalCents,
    region,
    subtotalDisplay: centsToDollarStr(subtotalCents),
    taxDisplay:      centsToDollarStr(taxCents),
    totalDisplay:    centsToDollarStr(totalCents),
  };
}

export function getReceiptBreakdown(
  itemType: CommerceItemType,
  label: string,
  subtotalCents: number,
  region: TaxRegion,
  meta?: { accountType?: AccountType; tier?: SubscriptionTier },
): ReceiptBreakdown {
  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(subtotalCents, taxRateBps);
  const totalCents = subtotalCents + taxCents;

  return {
    itemType,
    label,
    subtotalCents,
    taxRateBps,
    taxCents,
    totalCents,
    region,
    subtotalDisplay: centsToDollarStr(subtotalCents),
    taxDisplay:      centsToDollarStr(taxCents),
    totalDisplay:    centsToDollarStr(totalCents),
    accountType:     meta?.accountType,
    tier:            meta?.tier,
  };
}
