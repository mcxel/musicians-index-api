import type { MetadataRoute } from "next";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { listMagazineArticles } from "@/lib/magazine/MagazineArticleResolver";
import { getHubCountries } from "@/lib/global/GlobalCountryRegistry";
import { SOFT_LAUNCH_SEED_DATA } from "@/lib/seed/tmiSoftLaunchSeedData";
import { listBillboardSlugs } from "@/lib/billboards/BillboardRegistry";
import { listPromotionSlugs } from "@/lib/seo/PromotionSeoEngine";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";
import {
  INDEXABLE_STATIC_ROUTES,
  isRouteIndexable,
  toCanonicalUrl,
} from "@/lib/seo/SeoIndexingRules";
import { getAllStatePages } from "@/lib/seo/TrendingSEOEngine";
import { getAllCityScenes } from "@/lib/seo/GeoSEOEngine";

export type SitemapEntry = MetadataRoute.Sitemap[number];

const KNOWN_VENUE_SLUGS = ["neon-palace", "beat-lab", "cypher-stage"] as const;

function priorityForRoute(route: string): number {
  if (route === "/") return 1.0;
  if (route.startsWith("/home/")) return 0.95;
  if (route === "/magazine") return 0.9;
  if (route.startsWith("/magazine/article/")) return 0.86;
  if (route.startsWith("/articles/")) return 0.84;
  if (route.startsWith("/artists/") || route.startsWith("/performers/") || route.startsWith("/venues/")) return 0.83;
  if (route === "/tickets" || route === "/song-battle/live" || route === "/dance-party/live" || route === "/cypher/stage") return 0.82;
  if (route === "/billboards" || route.startsWith("/billboards/")) return 0.84;
  if (route.startsWith("/promotions/")) return 0.82;
  if (route.startsWith("/genres/")) return 0.8;
  if (route === "/trending" || route === "/genres" || route === "/cities") return 0.88;
  if (route.startsWith("/trending/")) return 0.84;
  if (route.startsWith("/cities/")) return 0.82;
  if (route === "/winners" || route === "/winners/this-week") return 0.88;
  if (route.startsWith("/winners/")) return 0.82;
  if (route === "/events/today" || route === "/events/live") return 0.9;
  if (route === "/events" || route.startsWith("/events/")) return 0.86;
  if (route === "/global" || route.startsWith("/global/")) return 0.8;
  return 0.75;
}

function changeFrequencyForRoute(route: string): SitemapEntry["changeFrequency"] {
  if (route === "/" || route.startsWith("/home/")) return "daily";
  if (route === "/magazine" || route.startsWith("/magazine/article/") || route.startsWith("/articles/")) return "daily";
  if (route.startsWith("/artists/") || route.startsWith("/performers/") || route.startsWith("/venues/")) return "weekly";
  if (route === "/tickets" || route === "/song-battle/live" || route === "/dance-party/live" || route === "/cypher/stage") return "hourly";
  if (route === "/billboards" || route.startsWith("/billboards/")) return "daily";
  if (route.startsWith("/promotions/")) return "daily";
  if (route.startsWith("/genres/")) return "weekly";
  if (route === "/trending" || route === "/winners/this-week") return "daily";
  if (route.startsWith("/trending/")) return "daily";
  if (route === "/cities" || route.startsWith("/cities/")) return "weekly";
  if (route === "/winners" || route.startsWith("/winners/")) return "daily";
  if (route === "/events/live") return "hourly";
  if (route === "/events/today") return "hourly";
  if (route === "/events" || route.startsWith("/events/")) return "daily";
  if (route === "/global" || route.startsWith("/global/")) return "daily";
  return "weekly";
}

function buildEntry(route: string, lastModified: Date): SitemapEntry | null {
  if (!isRouteIndexable(route)) return null;
  return {
    url: toCanonicalUrl(route),
    lastModified,
    changeFrequency: changeFrequencyForRoute(route),
    priority: priorityForRoute(route),
  };
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function normalizeSeedSlug(seedId: string): string {
  return seedId.trim().toLowerCase();
}

function getDynamicArticleRoutes(): string[] {
  const magazineRoutes = listMagazineArticles().map((article) => `/magazine/article/${article.slug}`);

  const editorialRoutes = EDITORIAL_ARTICLES.flatMap((article) => {
    if (article.category === "news") return [`/articles/news/${article.slug}`];
    if (article.category === "artist") return [`/articles/artist/${article.slug}`];
    if (article.category === "performer") return [`/articles/performer/${article.slug}`];
    return [];
  });

  return unique([...magazineRoutes, ...editorialRoutes]);
}

function getDynamicArtistRoutes(): string[] {
  return unique(ARTIST_SEED.map((artist) => `/artists/${artist.id}`));
}

function getDynamicPerformerRoutes(): string[] {
  const fromSeed = SOFT_LAUNCH_SEED_DATA.performers.map((performer) => `/performers/${normalizeSeedSlug(performer.id)}`);
  const fromEditorial = EDITORIAL_ARTICLES
    .map((article) => article.relatedPerformerSlug)
    .filter(Boolean)
    .map((slug) => `/performers/${slug}`);

  return unique([...fromSeed, ...fromEditorial]);
}

function getDynamicVenueRoutes(): string[] {
  const fromSeed = SOFT_LAUNCH_SEED_DATA.venues.map((venue) => `/venues/${normalizeSeedSlug(venue.id)}`);
  const fromKnown = KNOWN_VENUE_SLUGS.map((slug) => `/venues/${slug}`);
  const fromEditorial = EDITORIAL_ARTICLES
    .map((article) => article.relatedVenueSlug)
    .filter(Boolean)
    .map((slug) => `/venues/${slug}`);

  return unique([...fromKnown, ...fromSeed, ...fromEditorial]);
}

function getDynamicGlobalHubRoutes(): string[] {
  const countryCodes = getHubCountries().map((country) => country.countryCode.toLowerCase());

  const routes = countryCodes.flatMap((country) => [
    `/global/${country}`,
    `/global/${country}/artists`,
    `/global/${country}/venues`,
    `/global/${country}/battles`,
  ]);

  return unique(routes);
}

function getDynamicBillboardRoutes(): string[] {
  const billboardRoutes = listBillboardSlugs().map((slug) => `/billboards/${slug}`);
  const artistBillboardRoutes = unique(ARTIST_SEED.map((artist) => `/artists/${artist.id}/billboards`));
  return unique([...billboardRoutes, ...artistBillboardRoutes]);
}

function getDynamicPromotionRoutes(): string[] {
  return listPromotionSlugs().map((slug) => `/promotions/${slug}`);
}

function getDynamicGenreRoutes(): string[] {
  const genres = unique(
    ARTIST_SEED.map((artist) => artist.genre.toLowerCase().replace(/\s+/g, "-")),
  );
  return genres.map((genre) => `/genres/${genre}`);
}

function getDynamicEventRoutes(): string[] {
  return WhatsHappeningTodayEngine.listAll().map((event) => `/events/${event.slug}`);
}

function getDynamicTrendingRoutes(): string[] {
  return getAllStatePages().map(s => `/trending/${s.stateCode.toLowerCase()}`);
}

function getDynamicCityRoutes(): string[] {
  return getAllCityScenes().map(c => `/cities/${c.slug}`);
}

export class SitemapAuthorityEngine {
  static generateStaticRoutes(): string[] {
    return [...INDEXABLE_STATIC_ROUTES];
  }

  static generateDynamicRoutes(): string[] {
    return unique([
      ...getDynamicArticleRoutes(),
      ...getDynamicArtistRoutes(),
      ...getDynamicPerformerRoutes(),
      ...getDynamicVenueRoutes(),
      ...getDynamicGlobalHubRoutes(),
      ...getDynamicBillboardRoutes(),
      ...getDynamicPromotionRoutes(),
      ...getDynamicGenreRoutes(),
      ...getDynamicEventRoutes(),
      ...getDynamicTrendingRoutes(),
      ...getDynamicCityRoutes(),
    ]);
  }

  static generateSitemap(lastModified: Date = new Date()): MetadataRoute.Sitemap {
    const routes = unique([
      ...this.generateStaticRoutes(),
      ...this.generateDynamicRoutes(),
    ]);

    return routes
      .map((route) => buildEntry(route, lastModified))
      .filter(Boolean) as MetadataRoute.Sitemap;
  }
}

export default SitemapAuthorityEngine;
