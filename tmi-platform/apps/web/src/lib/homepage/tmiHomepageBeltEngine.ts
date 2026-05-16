export type TmiHomepageBeltKey = "home-1" | "home-1-2" | "home-2" | "home-3" | "home-4" | "home-5";

export type TmiHomepageBeltSection = {
  key: TmiHomepageBeltKey;
  route: string;
  backRoute: string;
  durationMs: number;
  label: string;
  feedState: "live" | "simulated" | "locked";
};

export const HOMEPAGE_BELT_SECTIONS: TmiHomepageBeltSection[] = [
  { key: "home-1", route: "/home/1", backRoute: "/home/5", durationMs: 30000, label: "Cover", feedState: "simulated" },
  { key: "home-1-2", route: "/home/1-2", backRoute: "/home/1", durationMs: 30000, label: "Top Ten Spread", feedState: "live" },
  { key: "home-2", route: "/home/2", backRoute: "/home/1-2", durationMs: 60000, label: "Editorial / Discovery / Marketplace", feedState: "live" },
  { key: "home-3", route: "/home/3", backRoute: "/home/2", durationMs: 60000, label: "Live World / Activity", feedState: "live" },
  { key: "home-4", route: "/home/4", backRoute: "/home/3", durationMs: 60000, label: "Sponsor Spotlight", feedState: "simulated" },
  { key: "home-5", route: "/home/5", backRoute: "/home/4", durationMs: 60000, label: "Advertiser & Sponsor World", feedState: "simulated" }
];

export function getHomepageBeltSectionByRoute(route: string): TmiHomepageBeltSection | undefined {
  return HOMEPAGE_BELT_SECTIONS.find((section) => section.route === route);
}
