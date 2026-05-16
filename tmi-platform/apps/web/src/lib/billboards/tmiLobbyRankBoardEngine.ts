export type LobbyRankEntry = {
  id: string;
  title: string;
  score: number;
  route: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
};

export type LobbyRankBoard = {
  artists: LobbyRankEntry[];
  tracks: LobbyRankEntry[];
};

const ARTIST_RANKINGS: LobbyRankEntry[] = [
  { id: "a1", title: "Ray Journey", score: 9980, route: "/artist/ray-journey", backRoute: "/billboards", status: "ACTIVE" },
  { id: "a2", title: "Neon Vale", score: 9750, route: "/artists", backRoute: "/billboards", status: "ACTIVE" },
  { id: "a3", title: "Juno K", score: 9410, route: "/performers", backRoute: "/billboards", status: "ACTIVE" },
];

const TRACK_RANKINGS: LobbyRankEntry[] = [
  { id: "t1", title: "Skyline Drift", score: 120000, route: "/beats", backRoute: "/billboards", status: "NEEDS_SETUP", reason: "Beat center runtime pending" },
  { id: "t2", title: "Neon Crown", score: 112000, route: "/radio", backRoute: "/billboards", status: "ACTIVE" },
  { id: "t3", title: "Cypher Heat", score: 108400, route: "/cypher", backRoute: "/billboards", status: "ACTIVE" },
];

export function getLobbyRankBoard(): LobbyRankBoard {
  return {
    artists: ARTIST_RANKINGS,
    tracks: TRACK_RANKINGS,
  };
}
