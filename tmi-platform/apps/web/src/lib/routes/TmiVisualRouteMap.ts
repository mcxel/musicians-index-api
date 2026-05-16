/**
 * TmiVisualRouteMap
 * Enforces visual route ownership to prevent guessed routes.
 * Locks Home 1-5 to their exact designated surfaces.
 */
import { getPageTag } from "./PageTagRegistry";

export const TmiVisualRouteMap = {
  HOME_1: {
    path: "/home/1",
    owner: "rankings-crown",
    routes: ["/magazine", "/profile/:username", "/rankings", "/crown", "/cypher", "/battles"],
  },
  HOME_2: {
    path: "/home/2",
    owner: "editorial",
    routes: ["/articles/news", "/articles/feature/:slug", "/articles/interview/:slug", "/genres", "/charts", "/playlists"],
  },
  HOME_3: {
    path: "/home/3",
    owner: "live",
    routes: ["/live", "/lobby", "/rooms/:roomId", "/events", "/premieres", "/discover"],
  },
  HOME_4: {
    path: "/home/4",
    owner: "sponsors",
    routes: ["/ads/create", "/ads/inventory", "/ads/analytics", "/ads/contracts", "/sponsors/dashboard"],
  },
  HOME_5: {
    path: "/home/5",
    owner: "battles-cyphers",
    routes: ["/battles/weekly", "/cypher/weekly", "/battles/live", "/cypher/live", "/games", "/prizes", "/xp", "/season-pass"],
  },
} as const;

export function enforceRouteOwnership(path: string): string | null {
  const mapEntry = Object.values(TmiVisualRouteMap).find((map) => path.startsWith(map.path));
  if (mapEntry) return mapEntry.owner;

  const dynamicOwnershipChecks: Array<{ route: string; pageId: string }> = [
    { route: "/fan/[slug]", pageId: "fan-slug" },
    { route: "/artists/[slug]", pageId: "artists-slug" },
    { route: "/performers/[slug]", pageId: "performers-slug" },
    { route: "/live/lobby", pageId: "live-lobby" },
    { route: "/live/rooms/[id]", pageId: "live-room-id" },
    { route: "/venues/[slug]/live", pageId: "venue-live" },
    { route: "/song-battle/live", pageId: "song-battle-live" },
    { route: "/dance-party/live", pageId: "dance-party-live" },
  ];

  for (const check of dynamicOwnershipChecks) {
    const regex = new RegExp(`^${check.route.replace(/\//g, "\\/").replace(/\[[^\]]+\]/g, "[^/]+")}$`);
    if (regex.test(path)) {
      return getPageTag(check.pageId)?.ownerType ?? null;
    }
  }

  return null;
}
