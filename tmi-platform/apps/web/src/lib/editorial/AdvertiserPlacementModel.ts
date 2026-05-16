// Advertiser placement authority — distinct from sponsor placements.
// Advertisers buy placement inventory. Sponsors buy feature editorial.

export type AdvertiserPlacementZone =
  | "top-banner"
  | "mid-article"
  | "side-rail"
  | "footer-strip"
  | "full-page";

export type AdvertiserTier = 1 | 2 | 3;

export interface AdvertiserPlacement {
  id: string;
  advertiserSlug: string;
  advertiserName: string;
  zone: AdvertiserPlacementZone;
  tier: AdvertiserTier;
  headline: string;
  body?: string;
  ctaLabel: string;
  ctaRoute: string; // always → /profile/advertiser/[slug]
  imageUrl?: string;
  accentColor: string;
}

export const ADVERTISER_PLACEMENTS: AdvertiserPlacement[] = [
  {
    id: "ad-beatmarket-001",
    advertiserSlug: "beatmarket",
    advertiserName: "BeatMarket",
    zone: "footer-strip",
    tier: 1,
    headline: "Buy & Sell Beats — BeatMarket",
    body: "The #1 marketplace for TMI producers. 12,000+ beats available.",
    ctaLabel: "Browse Beats",
    ctaRoute: "/profile/advertiser/beatmarket",
    accentColor: "#00FFFF",
  },
];

export function getAdvertiserPlacementById(id: string): AdvertiserPlacement | undefined {
  return ADVERTISER_PLACEMENTS.find((p) => p.id === id);
}

export function getAdvertiserPlacementsByZone(zone: AdvertiserPlacementZone): AdvertiserPlacement[] {
  return ADVERTISER_PLACEMENTS.filter((p) => p.zone === zone);
}
