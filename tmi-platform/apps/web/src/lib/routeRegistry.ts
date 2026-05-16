/**
 * TMI Master Route Registry
 * The absolute truth source ensuring ZERO dead ends.
 * Every visible card, panel, and zone must map to an entry here.
 */

export type RouteContract = {
  id: string;
  path: string;
  pageType: "hub" | "action" | "entity" | "admin" | "fallback";
  allowedRoles: string[];
  sourceZones: string[];
  destinations: string[];
  fallback: string;
  backLink: string;
  emptyStateRoute: string;
  authRequired: boolean;
};

export const routeRegistry: Record<string, RouteContract> = {
  "join-random-room": {
    id: "join-random-room",
    path: "/rooms/random",
    pageType: "action",
    allowedRoles: ["fan", "artist", "admin", "host"],
    sourceZones: ["liveHero", "floatingJoinCTA", "home3Center"],
    destinations: ["/room/[id]"],
    fallback: "/live",
    backLink: "/home/3",
    emptyStateRoute: "/empty/rooms",
    authRequired: true,
  },
  "claim-reward": {
    id: "claim-reward",
    path: "/claim/[rewardId]",
    pageType: "action",
    allowedRoles: ["fan", "artist"],
    sourceZones: ["rewardsLedger", "dropCountdown", "seasonPass"],
    destinations: ["/rewards/success"],
    fallback: "/rewards",
    backLink: "/home/13",
    emptyStateRoute: "/empty/rewards",
    authRequired: true,
  },
  "venue-booking": {
    id: "venue-booking",
    path: "/book/[venueId]",
    pageType: "action",
    allowedRoles: ["artist", "producer", "sponsor", "admin"],
    sourceZones: ["discovery", "gameSelector"],
    destinations: ["/booking/confirmation"],
    fallback: "/venues",
    backLink: "/home/4",
    emptyStateRoute: "/empty/events",
    authRequired: true,
  },

  // ── Homepage hubs (Home 1–15) ──────────────────────────────────────────────
  "home-1": { id: "home-1", path: "/home/1", pageType: "hub", allowedRoles: ["*"], sourceZones: ["cover","crown","billboard"], destinations: ["/home/2","/home/3","/home/6"], fallback: "/home/1", backLink: "/", emptyStateRoute: "/home/1", authRequired: false },
  "home-1-2": { id: "home-1-2", path: "/home/1-2", pageType: "hub", allowedRoles: ["*"], sourceZones: ["topTenLoop","verticalGenreConveyor"], destinations: ["/home/1","/home/2","/home/loop"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1-2", authRequired: false },
  "home-2": { id: "home-2", path: "/home/2", pageType: "hub", allowedRoles: ["*"], sourceZones: ["discovery","top10","playlist","directory"], destinations: ["/home/3","/home/6","/artist/[slug]"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/2", authRequired: false },
  "home-3": { id: "home-3", path: "/home/3", pageType: "hub", allowedRoles: ["*"], sourceZones: ["liveRooms","liveHero","liveGrid"], destinations: ["/rooms/random","/room/[id]","/live/cypher"], fallback: "/empty/rooms", backLink: "/home/2", emptyStateRoute: "/empty/rooms", authRequired: false },
  "home-4": { id: "home-4", path: "/home/4", pageType: "hub", allowedRoles: ["*"], sourceZones: ["featuredGame","gameSelector","gameShowGrid"], destinations: ["/game/[id]","/shows/[id]","/book/[venueId]"], fallback: "/empty/events", backLink: "/home/3", emptyStateRoute: "/empty/events", authRequired: false },
  "home-5": { id: "home-5", path: "/home/5", pageType: "hub", allowedRoles: ["sponsor","advertiser","artist","admin"], sourceZones: ["sponsorSpotlight","adMarketplace","analyticsDash"], destinations: ["/marketplace","/campaigns","/analytics"], fallback: "/auth-required", backLink: "/home/4", emptyStateRoute: "/empty/campaigns", authRequired: true },
  "home-loop": { id: "home-loop", path: "/home/loop", pageType: "hub", allowedRoles: ["*"], sourceZones: ["cover","discovery","liveRooms","featuredGame","sponsorSpotlight"], destinations: ["/home/1","/home/2","/home/3","/home/4","/home/5"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
  "home-6": { id: "home-6", path: "/home/6", pageType: "hub", allowedRoles: ["*"], sourceZones: ["chartsZone","playlistBrowser","countdownClock"], destinations: ["/artist/[slug]","/charts","/playlist/[id]"], fallback: "/home/2", backLink: "/home/5", emptyStateRoute: "/home/6", authRequired: false },
  "home-7": { id: "home-7", path: "/home/7", pageType: "hub", allowedRoles: ["*"], sourceZones: ["idolZone","votePanel","idolLeaderboard"], destinations: ["/vote/idol","/artist/[slug]","/shows/monthly-idol"], fallback: "/empty/events", backLink: "/home/6", emptyStateRoute: "/empty/events", authRequired: false },
  "home-8": { id: "home-8", path: "/home/8", pageType: "hub", allowedRoles: ["*"], sourceZones: ["danceZone","crewBattle","danceCypher"], destinations: ["/dance/crew/[id]","/rooms/random","/shows/world-dance-party"], fallback: "/empty/events", backLink: "/home/7", emptyStateRoute: "/empty/events", authRequired: false },
  "home-9": { id: "home-9", path: "/home/9", pageType: "hub", allowedRoles: ["*"], sourceZones: ["cypherArena","battleBracket","entryQueue"], destinations: ["/live/cypher","/battle/[id]","/cypher/random"], fallback: "/empty/rooms", backLink: "/home/8", emptyStateRoute: "/empty/rooms", authRequired: false },
  "home-10": { id: "home-10", path: "/home/10", pageType: "hub", allowedRoles: ["*"], sourceZones: ["dealZone","feudBoard","roundHistory"], destinations: ["/shows/deal-or-feud","/game/deal/[id]"], fallback: "/empty/events", backLink: "/home/9", emptyStateRoute: "/empty/events", authRequired: false },
  "home-11": { id: "home-11", path: "/home/11", pageType: "hub", allowedRoles: ["*"], sourceZones: ["squaresBoard","circlesDraw","contestEntry"], destinations: ["/shows/circles-squares","/game/squares/[id]"], fallback: "/empty/events", backLink: "/home/10", emptyStateRoute: "/empty/events", authRequired: false },
  "home-12": { id: "home-12", path: "/home/12", pageType: "hub", allowedRoles: ["*"], sourceZones: ["dozenBoard","rankChallenges","dozenHistory"], destinations: ["/shows/dirty-dozens","/game/dozens/[id]","/artist/[slug]"], fallback: "/empty/events", backLink: "/home/11", emptyStateRoute: "/empty/events", authRequired: false },
  "home-13": { id: "home-13", path: "/home/13", pageType: "hub", allowedRoles: ["fan","artist","performer","admin"], sourceZones: ["rewardsLedger","storeShowcase","seasonPass"], destinations: ["/rewards","/store","/season-pass"], fallback: "/auth-required", backLink: "/home/12", emptyStateRoute: "/empty/rewards", authRequired: true },
  "home-14": { id: "home-14", path: "/home/14", pageType: "hub", allowedRoles: ["fan","artist","sponsor","admin"], sourceZones: ["sponsorGiveaways","sponsorLeaderboard","dropCountdown"], destinations: ["/drops","/giveaway/[id]","/claim/[rewardId]"], fallback: "/auth-required", backLink: "/home/13", emptyStateRoute: "/empty/rewards", authRequired: true },
  "home-15": { id: "home-15", path: "/home/15", pageType: "hub", allowedRoles: ["*"], sourceZones: ["hallOfFame","classicReplays","vaultArchive"], destinations: ["/archive","/replay/[id]","/hall-of-fame"], fallback: "/home/1", backLink: "/home/14", emptyStateRoute: "/home/15", authRequired: false },

  // ── Entity pages ───────────────────────────────────────────────────────────
  "artist-profile": { id: "artist-profile", path: "/artist/[slug]", pageType: "entity", allowedRoles: ["*"], sourceZones: ["top10","discovery","chartsZone","dozenBoard"], destinations: ["/artist/[slug]/tracks","/vote/idol","/rooms/random"], fallback: "/home/6", backLink: "/home/2", emptyStateRoute: "/home/6", authRequired: false },
  "venue-profile":  { id: "venue-profile",  path: "/venue/[slug]", pageType: "entity", allowedRoles: ["*"], sourceZones: ["discovery","gameSelector"], destinations: ["/book/[venueId]","/rooms/random"], fallback: "/home/4", backLink: "/home/4", emptyStateRoute: "/empty/events", authRequired: false },
  "performer-profile": { id: "performer-profile", path: "/performer/[slug]", pageType: "entity", allowedRoles: ["*"], sourceZones: ["cypherArena","danceZone","battleBracket"], destinations: ["/performer/[slug]/book","/rooms/random"], fallback: "/home/9", backLink: "/home/9", emptyStateRoute: "/empty/events", authRequired: false },
  "room-view":      { id: "room-view",      path: "/room/[id]",    pageType: "entity", allowedRoles: ["*"], sourceZones: ["liveRooms","liveHero","lobbyWall"], destinations: ["/room/[id]/chat","/vote/idol","/home/3"], fallback: "/empty/rooms", backLink: "/home/3", emptyStateRoute: "/empty/rooms", authRequired: false },
  "show-view":      { id: "show-view",      path: "/shows/[id]",   pageType: "entity", allowedRoles: ["*"], sourceZones: ["featuredGame","gameSelector","idolZone"], destinations: ["/shows/[id]/watch","/rooms/random"], fallback: "/empty/events", backLink: "/home/4", emptyStateRoute: "/empty/events", authRequired: false },
  "artist-article": { id: "artist-article", path: "/artist/[slug]/article", pageType: "entity", allowedRoles: ["*"], sourceZones: ["topTenLoop","top10Faces"], destinations: ["/artist/[slug]","/home/1"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
  "artist-live-room": { id: "artist-live-room", path: "/live/room/[slug]", pageType: "entity", allowedRoles: ["fan","artist","performer","admin"], sourceZones: ["topTenLoop","liveRooms"], destinations: ["/room/[id]","/home/3"], fallback: "/empty/rooms", backLink: "/home/3", emptyStateRoute: "/empty/rooms", authRequired: true },
  "artist-booking": { id: "artist-booking", path: "/booking/[artistId]", pageType: "action", allowedRoles: ["artist","producer","sponsor","admin"], sourceZones: ["topTenLoop","featuredGame","discovery"], destinations: ["/booking/confirmation","/artist/[slug]"], fallback: "/auth-required", backLink: "/home/4", emptyStateRoute: "/empty/events", authRequired: true },

  // ── Action routes ──────────────────────────────────────────────────────────
  "cypher-random":    { id: "cypher-random",    path: "/cypher/random",    pageType: "action", allowedRoles: ["fan","artist","performer","admin"], sourceZones: ["cypherArena","entryQueue"], destinations: ["/room/[id]"], fallback: "/empty/rooms", backLink: "/home/9", emptyStateRoute: "/empty/rooms", authRequired: true },
  "battle-join":      { id: "battle-join",      path: "/battle/[id]/join", pageType: "action", allowedRoles: ["artist","performer","admin"],        sourceZones: ["battleBracket"],             destinations: ["/room/[id]"], fallback: "/empty/rooms", backLink: "/home/9", emptyStateRoute: "/empty/rooms", authRequired: true },
  "vote-idol":        { id: "vote-idol",         path: "/vote/idol",        pageType: "action", allowedRoles: ["fan","admin"],                       sourceZones: ["idolZone","votePanel"],      destinations: ["/vote/success"], fallback: "/auth-required", backLink: "/home/7", emptyStateRoute: "/empty/events", authRequired: true },
  "season-pass":      { id: "season-pass",       path: "/season-pass",      pageType: "action", allowedRoles: ["fan","artist","admin"],              sourceZones: ["seasonPass"],               destinations: ["/checkout/season-pass"], fallback: "/auth-required", backLink: "/home/13", emptyStateRoute: "/empty/rewards", authRequired: true },
  "claim-giveaway":   { id: "claim-giveaway",    path: "/giveaway/[id]",    pageType: "action", allowedRoles: ["fan","artist","admin"],              sourceZones: ["sponsorGiveaways","dropCountdown"], destinations: ["/claim/success"], fallback: "/auth-required", backLink: "/home/14", emptyStateRoute: "/empty/rewards", authRequired: true },
  "store-checkout":   { id: "store-checkout",    path: "/store/checkout",   pageType: "action", allowedRoles: ["fan","artist","admin"],              sourceZones: ["storeShowcase"],            destinations: ["/checkout/success","/checkout/failed"], fallback: "/auth-required", backLink: "/home/13", emptyStateRoute: "/empty/rewards", authRequired: true },
  "campaign-create":  { id: "campaign-create",   path: "/campaigns/create", pageType: "action", allowedRoles: ["sponsor","advertiser","admin"],     sourceZones: ["adMarketplace"],            destinations: ["/campaigns/[id]"], fallback: "/auth-required", backLink: "/home/5", emptyStateRoute: "/empty/campaigns", authRequired: true },

  // ── Auth routes ────────────────────────────────────────────────────────────
  "auth-signin":  { id: "auth-signin",  path: "/auth/signin",  pageType: "action", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/2"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
  "auth-signup":  { id: "auth-signup",  path: "/auth/signup",  pageType: "action", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/auth/signup/complete"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
  "auth-signout": { id: "auth-signout", path: "/auth/signout", pageType: "action", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/1"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: true  },

  // ── Admin routes ───────────────────────────────────────────────────────────
  "admin-home":        { id: "admin-home",        path: "/admin",                  pageType: "admin", allowedRoles: ["admin","mod"], sourceZones: ["adminNav"],       destinations: ["/admin/observatory","/admin/users","/admin/rooms"], fallback: "/auth-required", backLink: "/home/1", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-observatory": { id: "admin-observatory", path: "/admin/observatory",      pageType: "admin", allowedRoles: ["admin","mod"], sourceZones: ["adminNav"],       destinations: ["/admin/rankings","/admin/rooms","/admin/sponsors"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-users":       { id: "admin-users",       path: "/admin/users",            pageType: "admin", allowedRoles: ["admin"],       sourceZones: ["adminNav"],       destinations: ["/admin/users/[id]"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-rankings":    { id: "admin-rankings",    path: "/admin/rankings",         pageType: "admin", allowedRoles: ["admin","mod"], sourceZones: ["adminNav"],       destinations: ["/artist/[slug]"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-rooms":       { id: "admin-rooms",       path: "/admin/rooms",            pageType: "admin", allowedRoles: ["admin","mod"], sourceZones: ["adminNav"],       destinations: ["/room/[id]"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-moderation":  { id: "admin-moderation",  path: "/admin/moderation",       pageType: "admin", allowedRoles: ["admin","mod"], sourceZones: ["adminNav"],       destinations: ["/admin/users/[id]"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-sponsors":    { id: "admin-sponsors",    path: "/admin/sponsors",         pageType: "admin", allowedRoles: ["admin"],       sourceZones: ["adminNav"],       destinations: ["/admin/sponsors/[id]"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },
  "admin-simulation":  { id: "admin-simulation",  path: "/admin/simulation",       pageType: "admin", allowedRoles: ["admin"],       sourceZones: ["adminNav"],       destinations: ["/admin/observatory"], fallback: "/auth-required", backLink: "/admin", emptyStateRoute: "/auth-required", authRequired: true },

  // ── Fallback / safety routes ────────────────────────────────────────────────
  "empty-rooms":     { id: "empty-rooms",     path: "/empty/rooms",     pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/3"], fallback: "/home/1", backLink: "/home/3", emptyStateRoute: "/empty/rooms",    authRequired: false },
  "empty-rewards":   { id: "empty-rewards",   path: "/empty/rewards",   pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/13","/home/14"], fallback: "/home/1", backLink: "/home/13", emptyStateRoute: "/empty/rewards", authRequired: false },
  "empty-events":    { id: "empty-events",    path: "/empty/events",    pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/3","/home/7"], fallback: "/home/1", backLink: "/home/4", emptyStateRoute: "/empty/events",  authRequired: false },
  "empty-campaigns": { id: "empty-campaigns", path: "/empty/campaigns", pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/5"], fallback: "/home/1", backLink: "/home/5", emptyStateRoute: "/empty/campaigns",authRequired: false },
  "auth-required":   { id: "auth-required",   path: "/auth-required",   pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/auth/signin","/auth/signup"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
  "coming-soon":     { id: "coming-soon",     path: "/coming-soon/[feature]", pageType: "fallback", allowedRoles: ["*"], sourceZones: ["*"], destinations: ["/home/1"], fallback: "/home/1", backLink: "/home/1", emptyStateRoute: "/home/1", authRequired: false },
};

export function getRouteFallback(routeId: string): string {
  return routeRegistry[routeId]?.fallback || "/404-smart";
}

export function validateRouteContract(routeId: string): boolean {
  const route = routeRegistry[routeId];
  if (!route) return false;
  if (!route.destinations.length && !route.fallback) return false;
  return true;
}