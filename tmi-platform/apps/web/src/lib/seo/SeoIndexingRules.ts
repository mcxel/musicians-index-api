export const CANONICAL_ROOT = "https://bernoutglobal.com";

export const INDEXABLE_STATIC_ROUTES = [
  "/",
  "/home/1",
  "/home/1-2",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
  "/magazine",
  "/tickets",
  "/song-battle/live",
  "/dance-party/live",
  "/cypher/stage",
  "/global",
  "/subscriptions",
  "/about",
  "/support",
  "/billboards",
  "/events",
  "/events/today",
  "/events/live",
  "/battles/today",
  "/cyphers/today",
  "/shows/today",
  "/trending",
  "/genres",
  "/cities",
  "/winners",
  "/winners/this-week",
] as const;

export const INDEXABLE_ROUTE_GROUPS = [
  "/magazine/article/",
  "/articles/news/",
  "/articles/artist/",
  "/articles/performer/",
  "/artists/",
  "/performers/",
  "/venues/",
  "/global/",
  "/billboards/",
  "/promotions/",
  "/genres/",
  "/events/",
  "/trending/",
  "/cities/",
  "/winners/",
] as const;

export const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/auth",
  "/dashboard",
  "/fan/dashboard",
  "/performers/dashboard",
  "/artists/dashboard",
  "/venues/dashboard",
  "/bots",
  "/debug",
  "/tests",
  "/internal",
] as const;

function normalizeRoute(route: string): string {
  if (!route) return "/";
  return route.startsWith("/") ? route : `/${route}`;
}

export function isRouteExcluded(route: string): boolean {
  const normalized = normalizeRoute(route);
  return EXCLUDED_ROUTE_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

export function isRouteIndexable(route: string): boolean {
  const normalized = normalizeRoute(route);
  if (isRouteExcluded(normalized)) return false;

  if (INDEXABLE_STATIC_ROUTES.includes(normalized as (typeof INDEXABLE_STATIC_ROUTES)[number])) {
    return true;
  }

  return INDEXABLE_ROUTE_GROUPS.some((prefix) => normalized.startsWith(prefix));
}

export function toCanonicalUrl(route: string): string {
  const normalized = normalizeRoute(route);
  return `${CANONICAL_ROOT}${normalized}`;
}
