/**
 * RevenueSplitEngine
 * Shared payout split rules across platform revenue sources.
 */

export type RevenueSourceType =
  | "subscription"
  | "ticket"
  | "beat"
  | "sponsor-package"
  | "artist-local-sponsor"
  | "venue-promotion"
  | "merchant-promotion"
  | "booking"
  | "article-ad"
  | "contest-entry"
  | "live-tip"
  | "custom";

export type RevenueSplit = {
  sourceType: RevenueSourceType;
  grossCents: number;
  platformCents: number;
  artistCents: number;
  venueCents: number;
  merchantCents: number;
  promoterCents: number;
  sponsorCents: number;
};

export function calculateRevenueSplit(input: {
  sourceType: RevenueSourceType;
  grossCents: number;
  platformShare?: number;
  artistShare?: number;
  venueShare?: number;
  merchantShare?: number;
  promoterShare?: number;
  sponsorShare?: number;
}): RevenueSplit {
  const platformShare = input.platformShare ?? defaultShare(input.sourceType).platform;
  const artistShare = input.artistShare ?? defaultShare(input.sourceType).artist;
  const venueShare = input.venueShare ?? defaultShare(input.sourceType).venue;
  const merchantShare = input.merchantShare ?? defaultShare(input.sourceType).merchant;
  const promoterShare = input.promoterShare ?? defaultShare(input.sourceType).promoter;
  const sponsorShare = input.sponsorShare ?? defaultShare(input.sourceType).sponsor;

  const artistCents = Math.round(input.grossCents * artistShare);
  const venueCents = Math.round(input.grossCents * venueShare);
  const merchantCents = Math.round(input.grossCents * merchantShare);
  const promoterCents = Math.round(input.grossCents * promoterShare);
  const sponsorCents = Math.round(input.grossCents * sponsorShare);
  const allocated = artistCents + venueCents + merchantCents + promoterCents + sponsorCents;
  const platformCents = input.grossCents - allocated;

  return {
    sourceType: input.sourceType,
    grossCents: input.grossCents,
    platformCents,
    artistCents,
    venueCents,
    merchantCents,
    promoterCents,
    sponsorCents,
  };
}

function defaultShare(sourceType: RevenueSourceType): {
  platform: number;
  artist: number;
  venue: number;
  merchant: number;
  promoter: number;
  sponsor: number;
} {
  switch (sourceType) {
    case "beat":
      return { platform: 0.15, artist: 0.85, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
    case "live-tip":
      return { platform: 0.2, artist: 0.8, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
    case "booking":
      return { platform: 0.3, artist: 0.5, venue: 0.2, merchant: 0, promoter: 0, sponsor: 0 };
    case "ticket":
      return { platform: 0.1, artist: 0, venue: 0.75, merchant: 0, promoter: 0.15, sponsor: 0 };
    case "artist-local-sponsor":
      return { platform: 0.2, artist: 0.8, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
    case "merchant-promotion":
      return { platform: 0.25, artist: 0.15, venue: 0, merchant: 0.6, promoter: 0, sponsor: 0 };
    case "venue-promotion":
      return { platform: 1, artist: 0, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
    case "sponsor-package":
    case "article-ad":
    case "contest-entry":
    case "subscription":
    case "custom":
      return { platform: 1, artist: 0, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
    default:
      return { platform: 1, artist: 0, venue: 0, merchant: 0, promoter: 0, sponsor: 0 };
  }
}
