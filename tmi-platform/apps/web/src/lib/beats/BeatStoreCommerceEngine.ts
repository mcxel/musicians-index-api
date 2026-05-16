import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { calculateTax, getTaxRate } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { generateReceipt, type Receipt } from "@/lib/commerce/ReceiptEngine";
import { calculateRevenueSplitByPreset, type RevenueSplitResult } from "@/lib/commerce/RevenueSplitEngine";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BeatLicenseType = "non_exclusive" | "exclusive" | "stems" | "unlimited";

export type Beat = {
  id: string;
  title: string;
  producerId: string;
  producerName: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  previewUrl: string;
  coverImageUrl?: string;
  durationSec: number;
  plays: number;
  licenses: Record<BeatLicenseType, number>;  // price in cents per license
  uploadedAtMs: number;
};

export type BeatPurchaseOrder = {
  id: string;
  userId: string;
  beatId: string;
  licenseType: BeatLicenseType;
  priceCents: number;
  region: TaxRegion;
  receipt: Receipt;
  split: RevenueSplitResult;
  downloadToken: string;
  purchasedAtMs: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const beatRegistry = new Map<string, Beat>();
const purchaseOrders: BeatPurchaseOrder[] = [];
let _counter = 0;

export const LICENSE_LABELS: Record<BeatLicenseType, string> = {
  non_exclusive: "Non-Exclusive License",
  exclusive:     "Exclusive License",
  stems:         "Stems + Track-Out",
  unlimited:     "Unlimited License",
};

export const DEFAULT_LICENSE_PRICES: Record<BeatLicenseType, number> = {
  non_exclusive: 2999,   // $29.99
  exclusive:     19999,  // $199.99
  stems:         7999,   // $79.99
  unlimited:     49999,  // $499.99
};

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerBeat(beat: Beat): Beat {
  beatRegistry.set(beat.id, beat);
  return beat;
}

export function getBeat(beatId: string): Beat | undefined {
  return beatRegistry.get(beatId);
}

export function getAllBeats(): Beat[] {
  return Array.from(beatRegistry.values());
}

export function purchaseBeat(
  userId: string,
  beatId: string,
  licenseType: BeatLicenseType,
  region: TaxRegion,
): BeatPurchaseOrder | { error: string } {
  const beat = beatRegistry.get(beatId);
  if (!beat) return { error: "Beat not found" };

  const priceCents = beat.licenses[licenseType];
  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(priceCents, taxRateBps);
  const label = `Beat — "${beat.title}" · ${LICENSE_LABELS[licenseType]}`;

  const receipt = generateReceipt(userId, "beat", label, priceCents, region, {
    beatId, producerId: beat.producerId, licenseType,
  });

  const split = calculateRevenueSplitByPreset("beat", receipt.totalCents, taxCents);
  const downloadToken = `dl-${beatId}-${userId}-${Date.now()}`;

  const order: BeatPurchaseOrder = {
    id: `beatord-${++_counter}`,
    userId,
    beatId,
    licenseType,
    priceCents,
    region,
    receipt,
    split,
    downloadToken,
    purchasedAtMs: Date.now(),
  };

  purchaseOrders.push(order);
  Analytics.revenue({ userId, amount: order.receipt.totalCents / 100, currency: 'usd', product: `beat-${licenseType}`, activePersona: 'fan' });
  Analytics.storefrontView({ userId, assetId: beatId, assetType: 'beat-purchase' });
  return order;
}

export function getBeatPriceDisplay(beat: Beat, licenseType: BeatLicenseType): string {
  return centsToDollarStr(beat.licenses[licenseType]);
}

export function getBeatOrdersForUser(userId: string): BeatPurchaseOrder[] {
  return purchaseOrders.filter(o => o.userId === userId);
}

export function getBeatOrdersForProducer(producerId: string): BeatPurchaseOrder[] {
  return purchaseOrders.filter(o => {
    const beat = beatRegistry.get(o.beatId);
    return beat?.producerId === producerId;
  });
}

export function getProducerRevenue(producerId: string): { grossCents: number; payoutCents: number } {
  const orders = getBeatOrdersForProducer(producerId);
  return orders.reduce((acc, o) => ({
    grossCents:  acc.grossCents  + o.receipt.totalCents,
    payoutCents: acc.payoutCents + o.split.splits.artist.cents,
  }), { grossCents: 0, payoutCents: 0 });
}
