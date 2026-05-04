export type LobbyLiveFeedType = "live-rooms" | "live-shows" | "live-cyphers" | "live-battles" | "live-venues";

export type LobbyLiveFeedEntry = {
  id: string;
  type: LobbyLiveFeedType;
  title: string;
  viewerCount: number;
  reactionCount: number;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  route: string;
  backRoute: string;
  reason?: string;
};

const LIVE_FEEDS: LobbyLiveFeedEntry[] = [
  {
    id: "lf1",
    type: "live-rooms",
    title: "Room 9 · Fan Jam",
    viewerCount: 3421,
    reactionCount: 18900,
    status: "ACTIVE",
    route: "/rooms",
    backRoute: "/billboards",
  },
  {
    id: "lf2",
    type: "live-shows",
    title: "Neon Showcase",
    viewerCount: 8201,
    reactionCount: 52002,
    status: "ACTIVE",
    route: "/shows",
    backRoute: "/billboards",
  },
  {
    id: "lf3",
    type: "live-cyphers",
    title: "Midnight Cypher Grid",
    viewerCount: 5610,
    reactionCount: 41005,
    status: "ACTIVE",
    route: "/cypher",
    backRoute: "/billboards",
  },
  {
    id: "lf4",
    type: "live-battles",
    title: "Arena Clash Live",
    viewerCount: 4290,
    reactionCount: 28077,
    status: "NEEDS_SETUP",
    route: "/battles",
    backRoute: "/billboards",
    reason: "Live battle moderation bridge pending",
  },
  {
    id: "lf5",
    type: "live-venues",
    title: "Venue Pulse Stream",
    viewerCount: 2900,
    reactionCount: 12220,
    status: "LOCKED",
    route: "/venues",
    backRoute: "/billboards",
    reason: "Venue uplink requires sponsor approval",
  },
  {
    id: "lf6",
    type: "live-shows",
    title: "TMI Magazine · Issue 01",
    viewerCount: 12800,
    reactionCount: 4200,
    status: "ACTIVE",
    route: "/magazine",
    backRoute: "/articles",
  },
  {
    id: "lf7",
    type: "live-rooms",
    title: "Season 1 — Week 16 Standings",
    viewerCount: 3100,
    reactionCount: 847,
    status: "ACTIVE",
    route: "/articles/news/tmi-season-1-standings-week-16",
    backRoute: "/articles",
  },
  {
    id: "lf8",
    type: "live-battles",
    title: "Active Contests · Claim Your Prize",
    viewerCount: 2200,
    reactionCount: 318,
    status: "ACTIVE",
    route: "/contest",
    backRoute: "/billboards",
  },
  {
    id: "lf9",
    type: "live-shows",
    title: "Live Stages",
    viewerCount: 6400,
    reactionCount: 22000,
    status: "ACTIVE",
    route: "/live/stages",
    backRoute: "/billboards",
  },
];

export function listLobbyLiveFeedBoard(): LobbyLiveFeedEntry[] {
  return LIVE_FEEDS;
}
