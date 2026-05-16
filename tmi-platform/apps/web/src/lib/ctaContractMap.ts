export type CtaContract = {
  id: string;
  routeId: string;
  pathTemplate: string;
  fallback: string;
  backLink: string;
  authRequired: boolean;
  analyticsEvent: string;
};

export const ctaContractMap: Record<string, CtaContract> = {
  "artist-card-profile": {
    id: "artist-card-profile",
    routeId: "artist-profile",
    pathTemplate: "/artist/[slug]",
    fallback: "/home/1",
    backLink: "/home/1",
    authRequired: false,
    analyticsEvent: "artist_card_profile_open",
  },
  "artist-card-article": {
    id: "artist-card-article",
    routeId: "artist-article",
    pathTemplate: "/artist/[slug]/article",
    fallback: "/home/1",
    backLink: "/home/1",
    authRequired: false,
    analyticsEvent: "artist_card_article_open",
  },
  "artist-card-live": {
    id: "artist-card-live",
    routeId: "artist-live-room",
    pathTemplate: "/live/room/[slug]",
    fallback: "/empty/rooms",
    backLink: "/home/3",
    authRequired: true,
    analyticsEvent: "artist_card_live_open",
  },
  "artist-card-booking": {
    id: "artist-card-booking",
    routeId: "artist-booking",
    pathTemplate: "/booking/[artistId]",
    fallback: "/auth-required",
    backLink: "/home/4",
    authRequired: true,
    analyticsEvent: "artist_card_booking_open",
  },
};

export function resolveCtaPath(contractId: string, params: Record<string, string>): string {
  const contract = ctaContractMap[contractId];
  if (!contract) {
    return "/404-smart";
  }

  return Object.entries(params).reduce((path, [key, value]) => {
    return path.replace(`[${key}]`, value);
  }, contract.pathTemplate);
}
