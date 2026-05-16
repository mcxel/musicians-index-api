// Spread Rank Authority Engine
// Manages the /home/1-2 spread rotation cycles + rank movement state.
// Left column: competitive category (Comedians → Streamers → Dancers → Producers → DJs)
// Right column: prestige category (Freestylers → Fan Champions → Battle Winners → Fan Legends → Community MVPs)

export type RankMovement = "rising" | "falling" | "holding";

export interface SpreadRankEntry {
  id: string;
  name: string;
  rank: number;
  previousRank: number;
  movement: RankMovement;
  score: number;
  streak: number;
  profileImage: string;
}

export interface SpreadCycle {
  index: number;
  left: string;
  right: string;
}

// 5-cycle rotation — no repeated category pairing
export const SPREAD_CYCLES: SpreadCycle[] = [
  { index: 0, left: "Comedians",  right: "Freestylers"    },
  { index: 1, left: "Streamers",  right: "Fan Champions"  },
  { index: 2, left: "Dancers",    right: "Battle Winners" },
  { index: 3, left: "Producers",  right: "Fan Legends"    },
  { index: 4, left: "DJs",        right: "Community MVPs" },
];

function getWeekIndex(): number {
  const now = new Date();
  const epoch = new Date(2024, 0, 1).getTime();
  return Math.floor((now.getTime() - epoch) / (7 * 24 * 60 * 60 * 1000));
}

export function getCurrentCycle(): SpreadCycle {
  return SPREAD_CYCLES[getWeekIndex() % SPREAD_CYCLES.length]!;
}

export function getCycleByIndex(index: number): SpreadCycle {
  return SPREAD_CYCLES[((index % SPREAD_CYCLES.length) + SPREAD_CYCLES.length) % SPREAD_CYCLES.length]!;
}

export function computeMovement(current: number, previous: number): RankMovement {
  if (current < previous) return "rising";
  if (current > previous) return "falling";
  return "holding";
}

export function buildSpreadEntry(
  id: string,
  name: string,
  rank: number,
  previousRank: number,
  score: number,
  streak = 0,
  profileImage = ""
): SpreadRankEntry {
  return {
    id,
    name,
    rank,
    previousRank,
    movement: computeMovement(rank, previousRank),
    score,
    streak,
    profileImage,
  };
}
