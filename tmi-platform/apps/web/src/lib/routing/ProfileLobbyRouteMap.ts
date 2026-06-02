/**
 * ProfileLobbyRouteMap — canonical source of truth for all profile→lobby→venue→live routing
 * Every CTA that navigates anywhere on the platform should reference this map.
 */

export type TMIRole = "fan" | "performer" | "artist" | "venue" | "sponsor" | "advertiser" | "promoter" | "writer" | "admin";

export interface RouteMap {
  hub: string;
  profile: string;
  profileSlug: (slug: string) => string;
  lobby: string;
  lobbyWall: string;
  studio?: string;
  dashboard?: string;
  analytics?: string;
  settings: string;
  billing?: string;
  newContent?: string;
}

export const PROFILE_LOBBY_ROUTE_MAP: Record<TMIRole, RouteMap> = {
  fan: {
    hub:          "/hub/fan",
    profile:      "/fan/profile",
    profileSlug:  (slug) => `/fan/${slug}`,
    lobby:        "/lobbies",
    lobbyWall:    "/lobbies",
    settings:     "/settings",
    dashboard:    "/fan/dashboard",
    analytics:    "/fan/stats",
  },
  performer: {
    hub:          "/hub/performer",
    profile:      "/performer/profile",
    profileSlug:  (slug) => `/performer/${slug}`,
    lobby:        "/performer/lobby",
    lobbyWall:    "/battles/lobby-wall",
    studio:       "/performer/studio",
    dashboard:    "/performer/dashboard",
    analytics:    "/performer/analytics",
    settings:     "/settings",
    newContent:   "/go-live",
  },
  artist: {
    hub:          "/hub/artist",
    profile:      "/artist/profile",
    profileSlug:  (slug) => `/artist/${slug}`,
    lobby:        "/artist/lobby",
    lobbyWall:    "/battles/lobby-wall",
    studio:       "/beat-lab",
    dashboard:    "/dashboard/artist",
    analytics:    "/artist/analytics",
    settings:     "/settings",
    newContent:   "/beat-lab",
  },
  venue: {
    hub:          "/hub/venue",
    profile:      "/venue/profile",
    profileSlug:  (slug) => `/venues/${slug}`,
    lobby:        "/venues",
    lobbyWall:    "/venues",
    dashboard:    "/venue/dashboard",
    analytics:    "/venue/analytics",
    settings:     "/settings",
    billing:      "/settings/billing",
    newContent:   "/venue/events/new",
  },
  sponsor: {
    hub:          "/hub/sponsor",
    profile:      "/sponsor/profile",
    profileSlug:  (slug) => `/sponsor/${slug}`,
    lobby:        "/sponsors",
    lobbyWall:    "/sponsors",
    dashboard:    "/sponsor/dashboard",
    analytics:    "/advertiser/analytics",
    settings:     "/settings",
    billing:      "/settings/billing",
    newContent:   "/sponsor/campaigns/new",
  },
  advertiser: {
    hub:          "/hub/advertiser",
    profile:      "/advertiser/profile",
    profileSlug:  (slug) => `/advertiser/${slug}`,
    lobby:        "/advertisers",
    lobbyWall:    "/advertisers",
    dashboard:    "/dashboard/advertiser",
    analytics:    "/advertiser/analytics",
    settings:     "/settings",
    billing:      "/settings/billing",
    newContent:   "/advertiser/campaigns",
  },
  promoter: {
    hub:          "/hub/promoter",
    profile:      "/promoter/profile",
    profileSlug:  (slug) => `/promoter/${slug}`,
    lobby:        "/promoter/lobby",
    lobbyWall:    "/events",
    dashboard:    "/promoter/dashboard",
    analytics:    "/promoter/analytics",
    settings:     "/settings",
    billing:      "/settings/billing",
    newContent:   "/events/new",
  },
  writer: {
    hub:          "/hub/writer",
    profile:      "/writer/profile",
    profileSlug:  (slug) => `/writer/${slug}`,
    lobby:        "/magazine",
    lobbyWall:    "/magazine",
    dashboard:    "/hub/writer/pitches",
    settings:     "/settings",
    newContent:   "/writer/submit",
  },
  admin: {
    hub:          "/admin",
    profile:      "/admin/overview",
    profileSlug:  () => "/admin",
    lobby:        "/admin",
    lobbyWall:    "/admin/observatory",
    dashboard:    "/admin/big-ace",
    analytics:    "/admin/analytics",
    settings:     "/admin/system",
  },
};

export function getRouteMap(role: TMIRole): RouteMap {
  return PROFILE_LOBBY_ROUTE_MAP[role] ?? PROFILE_LOBBY_ROUTE_MAP.fan;
}

export function getHubRoute(role: TMIRole): string {
  return PROFILE_LOBBY_ROUTE_MAP[role]?.hub ?? "/hub/fan";
}

export function getProfileRoute(role: TMIRole, slug?: string): string {
  const map = PROFILE_LOBBY_ROUTE_MAP[role];
  if (!map) return "/fan/profile";
  return slug ? map.profileSlug(slug) : map.profile;
}
