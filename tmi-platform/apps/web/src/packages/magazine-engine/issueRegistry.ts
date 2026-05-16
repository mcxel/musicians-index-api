export type IssueRegistryEntry = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  pageKey: string;
  route: string;
  theme: "live" | "editorial" | "dark" | "neon" | "stage" | "cinema";
  zoneMap: string;
};

export const issueRegistry: IssueRegistryEntry[] = [
  {
    id: 1, slug: "cover", title: "The Crown", subtitle: "Who took it this week?", pageKey: "home", route: "/home/1", theme: "dark", zoneMap: "home1"
  },
  {
    id: 2, slug: "editorial", title: "Culture & Discovery", subtitle: "The latest drops", pageKey: "editorial", route: "/home/2", theme: "editorial", zoneMap: "home2"
  },
  {
    id: 3, slug: "live", title: "Live World", subtitle: "Happening right now", pageKey: "live", route: "/home/3", theme: "live", zoneMap: "home3"
  },
  {
    id: 4, slug: "games", title: "Game Engine", subtitle: "Play, compete, win", pageKey: "games", route: "/home/4", theme: "live", zoneMap: "home4"
  },
  {
    id: 5, slug: "marketplace", title: "Marketplace", subtitle: "Analytics and Sponsors", pageKey: "market", route: "/home/5", theme: "dark", zoneMap: "home5"
  },
  // --- SUPERCHARGED 100% COMPLETION HUB ADDITIONS ---
  {
    id: 6, slug: "charts", title: "TMI Billboard", subtitle: "Top Overall & Rising Stars", pageKey: "charts", route: "/home/6", theme: "neon", zoneMap: "home6"
  },
  {
    id: 7, slug: "monthly-idol", title: "Monthly Idol", subtitle: "The Ultimate Talent Stage", pageKey: "idol", route: "/home/7", theme: "stage", zoneMap: "home7"
  },
  {
    id: 8, slug: "world-dance-party", title: "World Dance Party", subtitle: "Friday Night Pulse & DJ Sets", pageKey: "dance", route: "/home/8", theme: "live", zoneMap: "home8"
  },
  {
    id: 9, slug: "cyphers-battles", title: "Cypher Arena", subtitle: "Marcel's Monday Night Stage", pageKey: "cypher", route: "/home/9", theme: "stage", zoneMap: "home9"
  },
  {
    id: 10, slug: "dealer-feud", title: "Deal or Feud 100", subtitle: "Survey the Crowd", pageKey: "gameshow", route: "/home/10", theme: "neon", zoneMap: "home10"
  },
  {
    id: 11, slug: "circles-squares", title: "Circles & Squares", subtitle: "Creator Answer Grid", pageKey: "gameshow", route: "/home/11", theme: "live", zoneMap: "home11"
  },
  {
    id: 12, slug: "dirty-dozens", title: "Dirty Dozens", subtitle: "Comedy Roast Arena", pageKey: "comedy", route: "/home/12", theme: "dark", zoneMap: "home12"
  },
  {
    id: 13, slug: "rewards-store", title: "TMI Rewards & Store", subtitle: "Points, Emotes & Cosmetics", pageKey: "rewards", route: "/home/13", theme: "editorial", zoneMap: "home13"
  },
  {
    id: 14, slug: "sponsor-drops", title: "Sponsor Drops", subtitle: "Gifted Surprise Giveaways", pageKey: "sponsors", route: "/home/14", theme: "neon", zoneMap: "home14"
  },
  {
    id: 15, slug: "archive-vault", title: "The Heritage Vault", subtitle: "Legendary Replays & Hall of Fame", pageKey: "archive", route: "/home/15", theme: "cinema", zoneMap: "home15"
  }
];

export function getIssueById(id: number): IssueRegistryEntry | undefined {
  return issueRegistry.find(issue => issue.id === id);
}

export function getIssueByRoute(route: string): IssueRegistryEntry | undefined {
  return issueRegistry.find(issue => issue.route === route);
}