import { getBeatById } from "@/lib/beats/BeatStoreEngine";
import { resolveLicenseTerms, type BeatLicenseType } from "@/lib/beats/BeatLicenseResolver";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

export type BeatOwnershipRecord = {
  ownershipId: string;
  userId: string;
  beatId: string;
  licenseType: BeatLicenseType;
  acquiredAtMs: number;
};

export type BeatReceiptPayload = {
  receiptId: string;
  itemType: "beat-license";
  beatId: string;
  beatTitle: string;
  producerId: string;
  producerName: string;
  licenseType: BeatLicenseType;
  licenseLabel: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: "USD";
  purchasedAtMs: number;
};

export type ProducerPayoutSplit = {
  producerCents: number;
  platformCents: number;
  producerRate: number;
  platformRate: number;
};

export type BeatPurchaseResult = {
  purchaseId: string;
  beatId: string;
  userId: string;
  licenseType: BeatLicenseType;
  ownership: BeatOwnershipRecord;
  receipt: BeatReceiptPayload;
  payoutSplit: ProducerPayoutSplit;
};

const ownershipRegistry: BeatOwnershipRecord[] = [];
const purchases: BeatPurchaseResult[] = [];
let purchaseCounter = 0;
let ownershipCounter = 0;

const TAX_RATE = 0.0825;
const PRODUCER_RATE = 0.85;

export function selectLicensePrice(beatId: string, licenseType: BeatLicenseType): number {
  const beat = getBeatById(beatId);
  if (!beat) throw new Error("Beat not found");
  const price = beat.licensePricing[licenseType];
  if (!price || price <= 0) throw new Error("License price unavailable");
  return price;
}

export function calculateProducerPayoutSplit(totalCents: number): ProducerPayoutSplit {
  const producerCents = Math.round(totalCents * PRODUCER_RATE);
  const platformCents = totalCents - producerCents;
  return {
    producerCents,
    platformCents,
    producerRate: PRODUCER_RATE,
    platformRate: 1 - PRODUCER_RATE,
  };
}

function createOwnershipRecord(userId: string, beatId: string, licenseType: BeatLicenseType): BeatOwnershipRecord {
  const ownership: BeatOwnershipRecord = {
    ownershipId: `own-${++ownershipCounter}`,
    userId,
    beatId,
    licenseType,
    acquiredAtMs: Date.now(),
  };
  ownershipRegistry.push(ownership);
  return ownership;
}

function createReceiptPayload(
  beatId: string,
  userId: string,
  licenseType: BeatLicenseType,
  subtotalCents: number,
): BeatReceiptPayload {
  const beat = getBeatById(beatId);
  if (!beat) throw new Error("Beat not found");
  const terms = resolveLicenseTerms(licenseType);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;
  return {
    receiptId: `rcpt-beat-${Date.now()}-${userId}`,
    itemType: "beat-license",
    beatId,
    beatTitle: beat.title,
    producerId: beat.producerId,
    producerName: beat.producerName,
    licenseType,
    licenseLabel: terms.label,
    subtotalCents,
    taxCents,
    totalCents,
    currency: "USD",
    purchasedAtMs: Date.now(),
  };
}

export function purchaseBeat(
  userId: string,
  beatId: string,
  licenseType: BeatLicenseType,
): BeatPurchaseResult {
  const beat = getBeatById(beatId);
  if (!beat || !beat.available) throw new Error("Beat unavailable");

  const subtotalCents = selectLicensePrice(beatId, licenseType);
  const receipt = createReceiptPayload(beatId, userId, licenseType, subtotalCents);
  const payoutSplit = calculateProducerPayoutSplit(receipt.totalCents);
  const ownership = createOwnershipRecord(userId, beatId, licenseType);

  const purchase: BeatPurchaseResult = {
    purchaseId: `beat-purchase-${++purchaseCounter}`,
    beatId,
    userId,
    licenseType,
    ownership,
    receipt,
    payoutSplit,
  };

  purchases.push(purchase);
  Analytics.revenue({ userId, amount: purchase.receipt.totalCents / 100, currency: 'usd', product: `beat-license-${licenseType}`, activePersona: 'fan' });
  Analytics.storefrontView({ userId, assetId: beatId, assetType: 'beat-license' });
  return purchase;
}

export function getBeatOwnershipRecords(userId: string): BeatOwnershipRecord[] {
  return ownershipRegistry.filter((entry) => entry.userId === userId);
}

export function getBeatPurchaseHistory(userId: string): BeatPurchaseResult[] {
  return purchases.filter((entry) => entry.userId === userId);
}
