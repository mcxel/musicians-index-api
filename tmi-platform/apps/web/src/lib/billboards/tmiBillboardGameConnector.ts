import { registerBillboardRoute, type TmiBillboardRouteRecord } from "@/lib/billboards/tmiBillboardRouteRegistry";

export function seedBillboardGameRoutes(): void {
  const rows: TmiBillboardRouteRecord[] = [
    { id: "bb-daily-spin", title: "Daily Spin", route: "/games/daily-spin", backRoute: "/games", state: "live", category: "game" },
    { id: "bb-name-that-tune", title: "Name That Tune", route: "/games/name-that-tune", backRoute: "/games", state: "live", category: "game" },
    { id: "bb-deal-or-feud", title: "Deal or Feud", route: "/games/deal-or-feud", backRoute: "/games", state: "simulated", category: "game" },
    { id: "bb-cypher-arena", title: "Cypher Arena", route: "/games/cypher-arena", backRoute: "/games", state: "live", category: "cypher" },
    { id: "bb-dj-battle", title: "DJ Battle", route: "/games/dj-battle", backRoute: "/games", state: "simulated", category: "game" },
    { id: "bb-producer-battle", title: "Producer Battle", route: "/games/producer-battle", backRoute: "/games", state: "simulated", category: "game" },
    { id: "bb-trivia", title: "Trivia", route: "/games/trivia", backRoute: "/games", state: "live", category: "game" },
    { id: "bb-watch-party", title: "Watch Party", route: "/watch-party", backRoute: "/live-world", state: "live", category: "watch-party" }
  ];

  rows.forEach((row) => registerBillboardRoute(row));
}
