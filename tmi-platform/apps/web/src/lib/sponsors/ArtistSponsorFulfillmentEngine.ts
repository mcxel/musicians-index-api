/**
 * ArtistSponsorFulfillmentEngine
 * Auto-creates and activates all sponsor deliverables after a sponsor purchase.
 * No manual handling — fulfillment is automatic on sponsor activation.
 * Placements: banner, video, product card, coupon/deal, prize pool.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type FulfillmentPlacementType =
  | "artist-profile-card"
  | "artist-page-banner"
  | "product-card"
  | "video-sponsor-slot"
  | "coupon-placement"
  | "live-room-overlay"
  | "prize-pool"
  | "magazine-ad";

export type FulfillmentStatus = "pending" | "active" | "paused" | "expired";

export type SponsorPlacement = {
  placementId: string;
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placementType: FulfillmentPlacementType;
  status: FulfillmentStatus;
  assetUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  productId?: string;
  couponCode?: string;
  couponDiscountPercent?: number;
  prizeDescription?: string;
  activatedAtMs: number;
  expiresAtMs: number;
};

export type SponsorFulfillmentResult = {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  placements: SponsorPlacement[];
  fulfilledAtMs: number;
};

// ─── In-memory store ──────────────────────────────────────────────────────────

const placements: SponsorPlacement[] = [];
let placementCounter = 0;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function createPlacement(
  base: Pick<SponsorPlacement, "sponsorId" | "artistId" | "merchantId" | "placementType"> &
    Partial<Pick<SponsorPlacement, "assetUrl" | "ctaLabel" | "ctaUrl" | "productId" | "couponCode" | "couponDiscountPercent" | "prizeDescription">>,
  expiresAtMs: number
): SponsorPlacement {
  const p: SponsorPlacement = {
    placementId: `placement-${++placementCounter}-${base.sponsorId}`,
    status: "active",
    activatedAtMs: Date.now(),
    expiresAtMs,
    ...base,
  };
  placements.unshift(p);
  return p;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Auto-fulfill all placements for a sponsor based on their purchased package placement types.
 */
export function fulfillSponsorPlacements(input: {
  sponsorId: string;
  artistId: string;
  merchantId: string;
  merchantName: string;
  packagePlacementTypes: FulfillmentPlacementType[];
  merchantLogoUrl?: string;
  merchantWebsite?: string;
  productId?: string;
  couponCode?: string;
  couponDiscountPercent?: number;
  prizeDescription?: string;
  durationDays?: number;
}): SponsorFulfillmentResult {
  const durationMs = (input.durationDays ?? 30) * 24 * 60 * 60 * 1000;
  const expiresAtMs = Date.now() + durationMs;
  const base = { sponsorId: input.sponsorId, artistId: input.artistId, merchantId: input.merchantId };

  const created: SponsorPlacement[] = [];

  for (const placementType of input.packagePlacementTypes) {
    switch (placementType) {
      case "artist-profile-card":
        created.push(createPlacement({
          ...base,
          placementType,
          assetUrl: input.merchantLogoUrl,
          ctaLabel: `Visit ${input.merchantName}`,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "artist-page-banner":
        created.push(createPlacement({
          ...base,
          placementType,
          assetUrl: input.merchantLogoUrl,
          ctaLabel: `Sponsored by ${input.merchantName}`,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "product-card":
        created.push(createPlacement({
          ...base,
          placementType,
          productId: input.productId,
          ctaLabel: "Shop Now",
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "video-sponsor-slot":
        created.push(createPlacement({
          ...base,
          placementType,
          ctaLabel: input.merchantName,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "coupon-placement":
        created.push(createPlacement({
          ...base,
          placementType,
          couponCode: input.couponCode,
          couponDiscountPercent: input.couponDiscountPercent,
          ctaLabel: input.couponCode ? `Use code ${input.couponCode}` : "Get Offer",
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "live-room-overlay":
        created.push(createPlacement({
          ...base,
          placementType,
          assetUrl: input.merchantLogoUrl,
          ctaLabel: input.merchantName,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "prize-pool":
        created.push(createPlacement({
          ...base,
          placementType,
          prizeDescription: input.prizeDescription,
          ctaLabel: "Prize from " + input.merchantName,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      case "magazine-ad":
        created.push(createPlacement({
          ...base,
          placementType,
          assetUrl: input.merchantLogoUrl,
          ctaLabel: input.merchantName,
          ctaUrl: input.merchantWebsite,
        }, expiresAtMs));
        break;

      default:
        break;
    }
  }

  return {
    sponsorId: input.sponsorId,
    artistId: input.artistId,
    merchantId: input.merchantId,
    placements: created,
    fulfilledAtMs: Date.now(),
  };
}

export function getSponsorPlacements(sponsorId: string): SponsorPlacement[] {
  return placements.filter((p) => p.sponsorId === sponsorId);
}

export function getArtistActivePlacements(artistId: string): SponsorPlacement[] {
  return placements.filter((p) => p.artistId === artistId && p.status === "active");
}

export function getMerchantActivePlacements(merchantId: string): SponsorPlacement[] {
  return placements.filter((p) => p.merchantId === merchantId && p.status === "active");
}

export function pausePlacement(placementId: string): SponsorPlacement {
  const p = placements.find((x) => x.placementId === placementId);
  if (!p) throw new Error(`Placement ${placementId} not found`);
  p.status = "paused";
  return p;
}

export function expireStalePlacements(): number {
  const now = Date.now();
  let count = 0;
  placements.forEach((p) => {
    if (p.status === "active" && p.expiresAtMs < now) {
      p.status = "expired";
      count++;
    }
  });
  return count;
}
