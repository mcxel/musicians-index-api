import type { TaxRegion } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { calculateTax, getTaxRate } from "@/lib/subscriptions/SubscriptionTaxEngine";
import { generateReceipt, type Receipt } from "@/lib/commerce/ReceiptEngine";
import { calculateRevenueSplitByPreset, type RevenueSplitResult } from "@/lib/commerce/RevenueSplitEngine";
import { Analytics } from "@/lib/analytics/PersonaAnalyticsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NFTMetadataTraits = Record<string, string | number>;

export type NFTAsset = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  animationUrl?: string;
  traits: NFTMetadataTraits;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  rarityScore: number;    // 0–100
  collectionId: string;
  artistId: string;
  editionSize: number;
  editionNumber: number;
  mintedAtMs?: number;
  ownerId?: string;
};

export type NFTPurchaseOrder = {
  id: string;
  userId: string;
  nftId: string;
  priceCents: number;
  region: TaxRegion;
  receipt: Receipt;
  split: RevenueSplitResult;
  purchasedAtMs: number;
};

export type NFTListingStatus = "available" | "sold" | "reserved" | "pending_mint";

export type NFTListing = {
  nft: NFTAsset;
  status: NFTListingStatus;
  priceCents: number;
  priceDisplay: string;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const nftListings = new Map<string, NFTListing>();
const purchaseOrders: NFTPurchaseOrder[] = [];
let _counter = 0;

function centsToDollarStr(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerNFTListing(nft: NFTAsset, priceCents: number): NFTListing {
  const listing: NFTListing = {
    nft,
    status: "available",
    priceCents,
    priceDisplay: centsToDollarStr(priceCents),
  };
  nftListings.set(nft.id, listing);
  return listing;
}

export function getNFTListing(nftId: string): NFTListing | undefined {
  return nftListings.get(nftId);
}

export function purchaseNFT(
  userId: string,
  nftId: string,
  region: TaxRegion,
): NFTPurchaseOrder | { error: string } {
  const listing = nftListings.get(nftId);
  if (!listing) return { error: "NFT not found" };
  if (listing.status !== "available") return { error: `NFT is ${listing.status}` };

  const taxRateBps = getTaxRate(region);
  const taxCents = calculateTax(listing.priceCents, taxRateBps);
  const label = `NFT — ${listing.nft.name} (${listing.nft.rarity})`;

  const receipt = generateReceipt(userId, "nft", label, listing.priceCents, region, {
    nftId, artistId: listing.nft.artistId, collectionId: listing.nft.collectionId,
  });

  const split = calculateRevenueSplitByPreset("nft", receipt.totalCents, taxCents);

  listing.status = "sold";
  listing.nft.ownerId = userId;
  listing.nft.mintedAtMs = Date.now();

  const order: NFTPurchaseOrder = {
    id: `nftord-${++_counter}`,
    userId,
    nftId,
    priceCents: listing.priceCents,
    region,
    receipt,
    split,
    purchasedAtMs: Date.now(),
  };

  purchaseOrders.push(order);
  Analytics.revenue({ userId, amount: order.receipt.totalCents / 100, currency: 'usd', product: 'nft-primary', activePersona: 'fan' });
  Analytics.storefrontView({ userId, assetId: nftId, assetType: 'nft-purchase' });
  return order;
}

// ─── NFT Asset Breakdown ──────────────────────────────────────────────────────

export type NFTAssetBreakdown = {
  nft: NFTAsset;
  imageUrl: string;
  traits: NFTMetadataTraits;
  rarity: NFTAsset["rarity"];
  rarityScore: number;
  ownershipDisplay: string;
  editionDisplay: string;
  mintStatus: "minted" | "pending";
  platformFeeDisplay: string;
  artistPayoutDisplay: string;
};

export function getNFTAssetBreakdown(nftId: string): NFTAssetBreakdown | null {
  const listing = nftListings.get(nftId);
  if (!listing) return null;
  const { nft } = listing;

  const grossCents = listing.priceCents;
  const taxCents = calculateTax(grossCents, 825);
  const split = calculateRevenueSplitByPreset("nft", grossCents, taxCents);

  return {
    nft,
    imageUrl:          nft.imageUrl,
    traits:            nft.traits,
    rarity:            nft.rarity,
    rarityScore:       nft.rarityScore,
    ownershipDisplay:  nft.ownerId ?? "Unminted",
    editionDisplay:    `${nft.editionNumber} of ${nft.editionSize}`,
    mintStatus:        nft.mintedAtMs ? "minted" : "pending",
    platformFeeDisplay: split.splits.platform.display,
    artistPayoutDisplay: split.splits.artist.display,
  };
}
