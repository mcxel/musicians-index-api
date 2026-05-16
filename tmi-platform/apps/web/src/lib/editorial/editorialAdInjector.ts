// Ad injector — resolves sponsor and advertiser placements into article layout zones.
import {
  getSponsorPlacementById,
  type SponsorPlacement,
} from "./SponsorPlacementModel";
import {
  getAdvertiserPlacementById,
  type AdvertiserPlacement,
} from "./AdvertiserPlacementModel";

export interface InjectedAds {
  topBanner: SponsorPlacement | AdvertiserPlacement | null;
  midArticle: SponsorPlacement | null;
  sideRail: SponsorPlacement | null;
  footerStrip: AdvertiserPlacement | null;
  fullPage: SponsorPlacement | null;
}

export function injectAds(
  sponsorPlacementIds: string[],
  advertiserPlacementIds: string[]
): InjectedAds {
  const sponsors = sponsorPlacementIds
    .map(getSponsorPlacementById)
    .filter((p): p is SponsorPlacement => p !== undefined);

  const advertisers = advertiserPlacementIds
    .map(getAdvertiserPlacementById)
    .filter((p): p is AdvertiserPlacement => p !== undefined);

  return {
    topBanner:
      sponsors.find((p) => p.zone === "top-banner") ??
      advertisers.find((p) => p.zone === "top-banner") ??
      null,
    midArticle:  sponsors.find((p) => p.zone === "mid-article") ?? null,
    sideRail:    sponsors.find((p) => p.zone === "side-rail") ?? null,
    footerStrip: advertisers.find((p) => p.zone === "footer-strip") ?? null,
    fullPage:    sponsors.find((p) => p.zone === "full-page") ?? null,
  };
}
