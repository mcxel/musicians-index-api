// Editorial routing resolver — bidirectional article ↔ profile routing authority.
// All article-to-profile and profile-to-article routes go through this file.

export type EditorialRouteCategory =
  | "artist"
  | "performer"
  | "news"
  | "sponsor"
  | "advertiser"
  | "interview";

export function articleToProfileRoute(
  category: EditorialRouteCategory,
  relatedSlug?: string
): string | null {
  if (!relatedSlug) return null;
  switch (category) {
    case "artist":     return `/profile/artist/${relatedSlug}`;
    case "performer":  return `/profile/performer/${relatedSlug}`;
    case "sponsor":    return `/profile/sponsor/${relatedSlug}`;
    case "advertiser": return `/profile/advertiser/${relatedSlug}`;
    default:           return null;
  }
}

export function profileToArticleRoute(
  profileType: EditorialRouteCategory,
  slug: string
): string {
  return `/articles/${profileType}/${slug}`;
}

export function profileToArticlesIndex(profileType: EditorialRouteCategory): string {
  return `/articles/${profileType}`;
}

export function categoryToAccentColor(category: EditorialRouteCategory | string): string {
  switch (category) {
    case "artist":     return "#00FFFF";
    case "performer":  return "#FF2DAA";
    case "news":       return "#FFD700";
    case "sponsor":    return "#AA2DFF";
    case "advertiser": return "#00E5FF";
    case "interview":  return "#FF8C00";
    default:           return "#00FFFF";
  }
}

export function categoryToSectionLabel(category: EditorialRouteCategory | string): string {
  switch (category) {
    case "artist":     return "Artist Spotlight";
    case "performer":  return "Performer Feature";
    case "news":       return "TMI News";
    case "sponsor":    return "Partner Feature";
    case "advertiser": return "Advertiser Spotlight";
    case "interview":  return "TMI Interview";
    default:           return "TMI Editorial";
  }
}

export function categoryToBackRoute(category: EditorialRouteCategory | string): string {
  switch (category) {
    case "artist":     return "/artists";
    case "performer":  return "/performers";
    case "news":       return "/articles";
    case "sponsor":    return "/sponsors";
    case "advertiser": return "/advertisers";
    default:           return "/articles";
  }
}
