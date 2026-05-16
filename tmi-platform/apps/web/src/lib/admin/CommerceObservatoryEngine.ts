import { getAllTierPrices } from "@/lib/subscriptions/SubscriptionPricingEngine";
import type { AccountType, SubscriptionTier } from "@/lib/subscriptions/SubscriptionPricingEngine";
import { calculateFinalPrice } from "@/lib/subscriptions/SubscriptionTaxEngine";
import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { getReceiptsForUser, type Receipt } from "@/lib/commerce/ReceiptEngine";
import { calculateRevenueSplitByPreset } from "@/lib/commerce/RevenueSplitEngine";
import { getActiveSponsorGifts } from "@/lib/commerce/SponsorGiftCommerceEngine";
import { getActivePrizes } from "@/lib/live/PrizeDropEngine";
import type { ChatRoomId } from "@/lib/chat/RoomChatEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CommerceObservatoryPanel =
  | "subscriptions"
  | "tickets"
  | "nfts"
  | "beats"
  | "booking"
  | "sponsor_gifts"
  | "refunds"
  | "payouts";

export type RevenueSummary = {
  panel: CommerceObservatoryPanel;
  grossCents: number;
  taxCents: number;
  netCents: number;
  platformCents: number;
  bigAceCents: number;
  transactionCount: number;
  grossDisplay: string;
  netDisplay: string;
};

export type CommerceObservatorySnapshot = {
  capturedAt: number;
  panels: Partial<Record<CommerceObservatoryPanel, RevenueSummary>>;
  totalGrossCents: number;
  totalNetCents: number;
  totalTaxCents: number;
  totalPlatformCents: number;
  totalBigAceCents: number;
  activeSponsorGiftCount: number;
  activePrizeCount: number;
  grossDisplay: string;
  netDisplay: string;
};

export type SubscriptionPricingPanel = {
  accountType: AccountType;
  tiers: Array<{
    tier: SubscriptionTier;
    baseDisplay: string;
    withTaxDisplay: string;
    region: TaxRegion;
  }>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function summarizeReceipts(
  receipts: Receipt[],
  panel: CommerceObservatoryPanel,
  presetKey: string,
): RevenueSummary {
  let grossCents = 0;
  let taxCents = 0;
  let platformCents = 0;
  let bigAceCents = 0;

  for (const r of receipts) {
    grossCents += r.totalCents;
    taxCents += r.taxCents;
    const split = calculateRevenueSplitByPreset(presetKey, r.totalCents, r.taxCents);
    platformCents += split.splits.platform.cents;
    bigAceCents += split.splits.big_ace.cents;
  }

  const netCents = grossCents - taxCents;

  return {
    panel,
    grossCents,
    taxCents,
    netCents,
    platformCents,
    bigAceCents,
    transactionCount: receipts.length,
    grossDisplay: centsToDollarStr(grossCents),
    netDisplay: centsToDollarStr(netCents),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSubscriptionPricingPanel(region: TaxRegion = "US_TX"): SubscriptionPricingPanel[] {
  const accountTypes: AccountType[] = ["artist", "performer", "fan"];
  return accountTypes.map(accountType => ({
    accountType,
    tiers: getAllTierPrices(accountType).map(tp => ({
      tier: tp.tier,
      baseDisplay: tp.usdDisplay,
      withTaxDisplay: centsToDollarStr(calculateFinalPrice(accountType, tp.tier, region).totalCents),
      region,
    })),
  }));
}

export function getCommerceObservatorySnapshot(
  userReceipts: Receipt[],
  roomIds: ChatRoomId[] = [],
): CommerceObservatorySnapshot {
  const now = Date.now();

  const subReceipts        = userReceipts.filter(r => r.itemType === "subscription");
  const ticketReceipts     = userReceipts.filter(r => r.itemType === "ticket");
  const nftReceipts        = userReceipts.filter(r => r.itemType === "nft");
  const beatReceipts       = userReceipts.filter(r => r.itemType === "beat");
  const bookingReceipts    = userReceipts.filter(r => r.itemType === "booking");
  const adReceipts         = userReceipts.filter(r => r.itemType === "ad");

  const panels: Partial<Record<CommerceObservatoryPanel, RevenueSummary>> = {
    subscriptions:  summarizeReceipts(subReceipts,     "subscriptions", "subscription"),
    tickets:        summarizeReceipts(ticketReceipts,  "tickets",       "ticket"),
    nfts:           summarizeReceipts(nftReceipts,     "nfts",          "nft"),
    beats:          summarizeReceipts(beatReceipts,    "beats",         "beat"),
    booking:        summarizeReceipts(bookingReceipts, "booking",       "booking"),
    payouts:        summarizeReceipts(adReceipts,      "payouts",       "ad"),
  };

  let totalGrossCents = 0;
  let totalTaxCents = 0;
  let totalPlatformCents = 0;
  let totalBigAceCents = 0;

  for (const summary of Object.values(panels)) {
    if (!summary) continue;
    totalGrossCents    += summary.grossCents;
    totalTaxCents      += summary.taxCents;
    totalPlatformCents += summary.platformCents;
    totalBigAceCents   += summary.bigAceCents;
  }

  const activePrizeCount = roomIds.reduce((sum, id) => sum + getActivePrizes(id).length, 0);

  return {
    capturedAt: now,
    panels,
    totalGrossCents,
    totalNetCents:      totalGrossCents - totalTaxCents,
    totalTaxCents,
    totalPlatformCents,
    totalBigAceCents,
    activeSponsorGiftCount: getActiveSponsorGifts().length,
    activePrizeCount,
    grossDisplay: centsToDollarStr(totalGrossCents),
    netDisplay:   centsToDollarStr(totalGrossCents - totalTaxCents),
  };
}

export function getRevenueSummaryByPanel(
  panel: CommerceObservatoryPanel,
  receipts: Receipt[],
): RevenueSummary {
  const presetMap: Record<CommerceObservatoryPanel, string> = {
    subscriptions: "subscription",
    tickets:       "ticket",
    nfts:          "nft",
    beats:         "beat",
    booking:       "booking",
    sponsor_gifts: "ad",
    refunds:       "subscription",
    payouts:       "ad",
  };
  const filtered = receipts.filter(r => {
    if (panel === "subscriptions") return r.itemType === "subscription";
    if (panel === "tickets")       return r.itemType === "ticket";
    if (panel === "nfts")          return r.itemType === "nft";
    if (panel === "beats")         return r.itemType === "beat";
    if (panel === "booking")       return r.itemType === "booking";
    return true;
  });
  return summarizeReceipts(filtered, panel, presetMap[panel]);
}
