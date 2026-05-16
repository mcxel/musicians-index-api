export type ContestWinnerCategory =
  | "cypher-winners"
  | "game-winners"
  | "live-battle-winners"
  | "trivia-winners"
  | "season-pass-winners";

export type ContestWinnerEntry = {
  id: string;
  title: string;
  winnerName: string;
  prize: string;
  route: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
};

export type ContestWinnerBoard = Record<ContestWinnerCategory, ContestWinnerEntry[]>;

const WINNERS: ContestWinnerBoard = {
  "cypher-winners": [
    {
      id: "cw1",
      title: "Neon Cypher Finals",
      winnerName: "Ray Journey",
      prize: "50,000 XP + Crown Pass",
      route: "/cypher",
      backRoute: "/billboards",
      status: "ACTIVE",
    },
  ],
  "game-winners": [
    {
      id: "gw1",
      title: "Arena Grid Clash",
      winnerName: "Juno K",
      prize: "Legend Skin Pack",
      route: "/games",
      backRoute: "/billboards",
      status: "NEEDS_SETUP",
      reason: "Game reward handoff pending",
    },
  ],
  "live-battle-winners": [
    {
      id: "lb1",
      title: "Live Battle Prime",
      winnerName: "Neon Vale",
      prize: "Live Venue Headline Slot",
      route: "/live",
      backRoute: "/billboards",
      status: "ACTIVE",
    },
  ],
  "trivia-winners": [
    {
      id: "tw1",
      title: "TMI Trivia Storm",
      winnerName: "DJ Halo",
      prize: "10,000 Credits",
      route: "/games",
      backRoute: "/billboards",
      status: "NEEDS_SETUP",
      reason: "Trivia mode activation pending",
    },
  ],
  "season-pass-winners": [
    {
      id: "sp1",
      title: "Season Apex Draw",
      winnerName: "Luma X",
      prize: "Season Pass Diamond",
      route: "/season-pass",
      backRoute: "/billboards",
      status: "ACTIVE",
    },
  ],
};

export function getLobbyContestWinnerBoard(): ContestWinnerBoard {
  return WINNERS;
}
