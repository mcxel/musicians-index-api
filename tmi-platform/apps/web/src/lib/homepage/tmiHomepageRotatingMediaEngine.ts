export type TmiHomepageMediaPanel = {
  id: string;
  type: "artist" | "performer" | "venue" | "sponsor" | "game";
  title: string;
  route: string;
  backRoute: string;
};

const PANELS: TmiHomepageMediaPanel[] = [
  { id: "media-artist-1", type: "artist", title: "Rising Artist · Nova Ray", route: "/artist/nova-ray", backRoute: "/home/1-2" },
  { id: "media-performer-1", type: "performer", title: "Performer Spotlight · JXL", route: "/performer/jxl", backRoute: "/home/1-2" },
  { id: "media-venue-1", type: "venue", title: "Venue Scan · Neon Arena", route: "/venues/neon-arena", backRoute: "/home/2" },
  { id: "media-sponsor-1", type: "sponsor", title: "Sponsor Activation · Pulse", route: "/sponsors/pulse", backRoute: "/home/3" },
  { id: "media-game-1", type: "game", title: "Game Prompt · Daily Spin", route: "/games/daily-spin", backRoute: "/home/4" },
];

export function getRotatingMediaPanel(step: number): TmiHomepageMediaPanel {
  return PANELS[((step % PANELS.length) + PANELS.length) % PANELS.length];
}
