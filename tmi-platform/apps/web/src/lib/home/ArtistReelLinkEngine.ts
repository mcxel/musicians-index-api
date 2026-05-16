import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";

export type HomepageArticleLink = {
  entityId: string;
  entityType: "artist" | "sponsor" | "advertiser";
  targetRoute: string;
  previewRoute: string;
  preloadRoute: string;
  fallbackRoute: string;
  status: "editorial" | "profile-fallback";
  hoverPausesMotion: boolean;
  resumeOnExit: boolean;
};

function normalizeRoute(route: string | null | undefined, fallbackRoute: string): string {
  return route && route.trim().length > 0 ? route : fallbackRoute;
}

export function resolveArtistReelLink(input: {
  artistId: string;
  articleRoute?: string;
  fallbackRoute: string;
}): HomepageArticleLink {
  const article = EDITORIAL_ARTICLES.find((entry) => entry.relatedArtistSlug === input.artistId);
  const editorialRoute = article ? `/articles/artist/${article.slug}` : undefined;
  const targetRoute = normalizeRoute(input.articleRoute ?? editorialRoute, input.fallbackRoute);

  return {
    entityId: input.artistId,
    entityType: "artist",
    targetRoute,
    previewRoute: targetRoute,
    preloadRoute: targetRoute,
    fallbackRoute: input.fallbackRoute,
    status: article ? "editorial" : "profile-fallback",
    hoverPausesMotion: true,
    resumeOnExit: true,
  };
}

export function resolveSponsorReelLink(slug: string, fallbackRoute = "/magazine"): HomepageArticleLink {
  const article = EDITORIAL_ARTICLES.find((entry) => entry.relatedSponsorSlug === slug);
  const targetRoute = article ? `/articles/sponsor/${article.slug}` : fallbackRoute;
  return {
    entityId: slug,
    entityType: "sponsor",
    targetRoute,
    previewRoute: targetRoute,
    preloadRoute: targetRoute,
    fallbackRoute,
    status: article ? "editorial" : "profile-fallback",
    hoverPausesMotion: true,
    resumeOnExit: true,
  };
}

export function resolveAdvertiserReelLink(slug: string, fallbackRoute = "/magazine"): HomepageArticleLink {
  const article = EDITORIAL_ARTICLES.find((entry) => entry.relatedAdvertiserSlug === slug);
  const targetRoute = article ? `/articles/advertiser/${article.slug}` : fallbackRoute;
  return {
    entityId: slug,
    entityType: "advertiser",
    targetRoute,
    previewRoute: targetRoute,
    preloadRoute: targetRoute,
    fallbackRoute,
    status: article ? "editorial" : "profile-fallback",
    hoverPausesMotion: true,
    resumeOnExit: true,
  };
}