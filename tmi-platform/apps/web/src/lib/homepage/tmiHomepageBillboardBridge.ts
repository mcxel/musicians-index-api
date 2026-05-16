import { listHomepageOverlayFeed } from "./tmiHomepageOverlayFeedEngine";

export type BillboardLane = "artist-rankings" | "track-rankings" | "participation" | "live-winners" | "contest-winners" | "sponsor-walls";

export type BillboardFrame = {
  lane: BillboardLane;
  title: string;
  route: string;
  backRoute: string;
  image: string;
};

const BILLBOARD_ROTATION_MS = 120000;

export function getBillboardRotationMs() {
  return BILLBOARD_ROTATION_MS;
}

export function buildBillboardFrames(): BillboardFrame[] {
  const feed = listHomepageOverlayFeed();
  return [
    { lane: "artist-rankings", title: "Top Artist Rankings", route: "/leaderboard", backRoute: "/billboards", image: feed[0]?.image ?? "/ui/home/artist-1.jpg" },
    { lane: "track-rankings", title: "Track Rankings", route: "/charts", backRoute: "/billboards", image: feed[1]?.image ?? "/ui/home/article-1.jpg" },
    { lane: "participation", title: "Participation Standings", route: "/rewards", backRoute: "/billboards", image: feed[2]?.image ?? "/ui/home/venue-1.jpg" },
    { lane: "live-winners", title: "Live Winners", route: "/winners", backRoute: "/billboards", image: feed[3]?.image ?? "/ui/home/booking-1.jpg" },
    { lane: "contest-winners", title: "Contest Winners", route: "/contest", backRoute: "/billboards", image: feed[4]?.image ?? "/ui/home/cypher-1.jpg" },
    { lane: "sponsor-walls", title: "Sponsor Walls", route: "/sponsors", backRoute: "/billboards", image: feed[5]?.image ?? "/ui/home/sponsor-1.jpg" },
  ];
}
