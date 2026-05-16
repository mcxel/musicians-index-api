export type HomepageFeedItemStatus = "ACTIVE" | "LOCKED" | "NEEDS_SETUP";

export type HomepageFeedItem = {
  id: string;
  title: string;
  image: string;
  route: string;
  backRoute: string;
  type:
    | "artist"
    | "article"
    | "venue"
    | "booking"
    | "game"
    | "cypher"
    | "sponsor"
    | "advertiser"
    | "store"
    | "profile";
  status?: HomepageFeedItemStatus;
  reason?: string;
};

const FEED: HomepageFeedItem[] = [
  {
    id: "f1",
    title: "Artist Spotlight",
    image: "/ui/home/artist-1.jpg",
    route: "/artist/ray-journey",
    backRoute: "/home/1",
    type: "artist",
  },
  {
    id: "f2",
    title: "Magazine Feature",
    image: "/ui/home/article-1.jpg",
    route: "/articles/cinematic-drop",
    backRoute: "/home/2",
    type: "article",
  },
  {
    id: "f3",
    title: "Venue Night",
    image: "/ui/home/venue-1.jpg",
    route: "/venues/neon-dome",
    backRoute: "/home/3",
    type: "venue",
  },
  {
    id: "f4",
    title: "Book Performer",
    image: "/ui/home/booking-1.jpg",
    route: "/booking",
    backRoute: "/home/4",
    type: "booking",
  },
  {
    id: "f5",
    title: "Cypher Battle",
    image: "/ui/home/cypher-1.jpg",
    route: "/cypher",
    backRoute: "/home/5",
    type: "cypher",
  },
  {
    id: "f6",
    title: "Sponsor Wall",
    image: "/ui/home/sponsor-1.jpg",
    route: "/sponsors",
    backRoute: "/home/1-2",
    type: "sponsor",
    status: "LOCKED",
    reason: "Sponsor campaign runtime not enabled",
  },
  {
    id: "f7",
    title: "Advertiser Deck",
    image: "/ui/home/ad-1.jpg",
    route: "/advertisers",
    backRoute: "/home/2",
    type: "advertiser",
  },
  {
    id: "f8",
    title: "Overlay Store",
    image: "/ui/home/store-1.jpg",
    route: "/store",
    backRoute: "/home/3",
    type: "store",
  },
  {
    id: "f9",
    title: "Game Grid",
    image: "/ui/home/game-1.jpg",
    route: "/games",
    backRoute: "/home/4",
    type: "game",
    status: "NEEDS_SETUP",
    reason: "Game loop hooks pending",
  },
  {
    id: "f10",
    title: "Profile Hub",
    image: "/ui/home/profile-1.jpg",
    route: "/profile",
    backRoute: "/home/5",
    type: "profile",
  },
];

const KNOWN_ENABLED_ROUTES = new Set([
  "/home/1",
  "/home/1-2",
  "/home/2",
  "/home/3",
  "/home/4",
  "/home/5",
  "/artist/ray-journey",
  "/articles/cinematic-drop",
  "/venues/neon-dome",
  "/booking",
  "/cypher",
  "/advertisers",
  "/store",
  "/profile",
]);

export function resolveHomepageFeedStatus(item: HomepageFeedItem): HomepageFeedItemStatus {
  if (item.status) return item.status;
  if (!KNOWN_ENABLED_ROUTES.has(item.route)) return "NEEDS_SETUP";
  if (!KNOWN_ENABLED_ROUTES.has(item.backRoute)) return "NEEDS_SETUP";
  return "ACTIVE";
}

export function listHomepageOverlayFeed() {
  return FEED.map((item) => ({
    ...item,
    status: resolveHomepageFeedStatus(item),
  }));
}
