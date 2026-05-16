// Freestyle Battle Authority Engine
// Tracks battle wins, losses, crowd votes, streaks.
// Returns Top 10 freestylers and battle winners for /home/1-2 right column.

import { buildSpreadEntry, type SpreadRankEntry } from "@/engines/home/SpreadRankAuthorityEngine";
import { artistImages, imageAt } from "@/components/cards/content-image-bank";

export interface BattleRecord {
  id: string;
  name: string;
  wins: number;
  losses: number;
  crowdVotePct: number; // 0–100
  cipherScore: number;
  audienceVotes: number;
  battleStreak: number;
  rank: number;
  previousRank: number;
}

function battlePrestigeScore(record: BattleRecord): number {
  return (
    record.wins * 10 +
    record.crowdVotePct * 2 +
    record.cipherScore * 3 +
    record.audienceVotes * 1 +
    record.battleStreak * 15
  );
}

const FREESTYLER_POOL: BattleRecord[] = [
  { id: "bf1",  name: "Verse.XL",       wins: 24, losses: 3,  crowdVotePct: 91, cipherScore: 4800, audienceVotes: 18400, battleStreak: 8,  rank: 1,  previousRank: 1 },
  { id: "bf2",  name: "BarGod.T",        wins: 21, losses: 4,  crowdVotePct: 88, cipherScore: 4400, audienceVotes: 16200, battleStreak: 5,  rank: 2,  previousRank: 3 },
  { id: "bf3",  name: "FlowState.J",     wins: 19, losses: 5,  crowdVotePct: 85, cipherScore: 4100, audienceVotes: 14800, battleStreak: 4,  rank: 3,  previousRank: 2 },
  { id: "bf4",  name: "Punchline.K",     wins: 17, losses: 6,  crowdVotePct: 82, cipherScore: 3800, audienceVotes: 13400, battleStreak: 3,  rank: 4,  previousRank: 5 },
  { id: "bf5",  name: "Vocab.X",         wins: 15, losses: 7,  crowdVotePct: 79, cipherScore: 3500, audienceVotes: 12100, battleStreak: 2,  rank: 5,  previousRank: 4 },
  { id: "bf6",  name: "Cypher.King",     wins: 13, losses: 8,  crowdVotePct: 76, cipherScore: 3200, audienceVotes: 10800, battleStreak: 1,  rank: 6,  previousRank: 6 },
  { id: "bf7",  name: "Hustle.Roc",      wins: 11, losses: 9,  crowdVotePct: 73, cipherScore: 2900, audienceVotes:  9600, battleStreak: 0,  rank: 7,  previousRank: 7 },
  { id: "bf8",  name: "DeepCut.B",       wins:  9, losses: 10, crowdVotePct: 70, cipherScore: 2600, audienceVotes:  8400, battleStreak: 0,  rank: 8,  previousRank: 9 },
  { id: "bf9",  name: "MicDrop.K",       wins:  7, losses: 11, crowdVotePct: 67, cipherScore: 2300, audienceVotes:  7200, battleStreak: 0,  rank: 9,  previousRank: 8 },
  { id: "bf10", name: "Crown.T",         wins:  5, losses: 12, crowdVotePct: 64, cipherScore: 2000, audienceVotes:  6100, battleStreak: 0,  rank: 10, previousRank: 10 },
];

const BATTLE_WINNERS_POOL: BattleRecord[] = [
  { id: "bw1",  name: "Lyric.44",        wins: 32, losses: 2,  crowdVotePct: 94, cipherScore: 5800, audienceVotes: 22400, battleStreak: 11, rank: 1,  previousRank: 2 },
  { id: "bw2",  name: "Nova.Cipher",     wins: 28, losses: 3,  crowdVotePct: 91, cipherScore: 5300, audienceVotes: 20100, battleStreak:  7, rank: 2,  previousRank: 1 },
  { id: "bw3",  name: "StageZero.J",     wins: 25, losses: 4,  crowdVotePct: 88, cipherScore: 4900, audienceVotes: 18400, battleStreak:  6, rank: 3,  previousRank: 3 },
  { id: "bw4",  name: "Shade.T",         wins: 22, losses: 5,  crowdVotePct: 85, cipherScore: 4500, audienceVotes: 16700, battleStreak:  5, rank: 4,  previousRank: 5 },
  { id: "bw5",  name: "WarlordVerse",    wins: 19, losses: 6,  crowdVotePct: 82, cipherScore: 4100, audienceVotes: 15100, battleStreak:  4, rank: 5,  previousRank: 4 },
  { id: "bw6",  name: "PunchKing.R",     wins: 16, losses: 7,  crowdVotePct: 79, cipherScore: 3700, audienceVotes: 13600, battleStreak:  3, rank: 6,  previousRank: 6 },
  { id: "bw7",  name: "BattleArch",      wins: 13, losses: 8,  crowdVotePct: 76, cipherScore: 3300, audienceVotes: 12100, battleStreak:  2, rank: 7,  previousRank: 7 },
  { id: "bw8",  name: "RoundKing.V",     wins: 10, losses: 9,  crowdVotePct: 73, cipherScore: 2900, audienceVotes: 10600, battleStreak:  1, rank: 8,  previousRank: 8 },
  { id: "bw9",  name: "DropZone.M",      wins:  7, losses: 10, crowdVotePct: 70, cipherScore: 2500, audienceVotes:  9200, battleStreak:  0, rank: 9,  previousRank: 9 },
  { id: "bw10", name: "FirstRound.A",    wins:  5, losses: 11, crowdVotePct: 67, cipherScore: 2200, audienceVotes:  7900, battleStreak:  0, rank: 10, previousRank: 10 },
];

function battleToEntry(record: BattleRecord, imgOffset: number): SpreadRankEntry {
  return buildSpreadEntry(
    record.id,
    record.name,
    record.rank,
    record.previousRank,
    battlePrestigeScore(record),
    record.battleStreak,
    imageAt(artistImages, (record.rank + imgOffset) % artistImages.length)
  );
}

export function getTopFreestylers(): SpreadRankEntry[] {
  return FREESTYLER_POOL.map((r) => battleToEntry(r, 1));
}

export function getBattleWinners(): SpreadRankEntry[] {
  return BATTLE_WINNERS_POOL.map((r) => battleToEntry(r, 3));
}

export function getBattleEntryByLabel(label: string): SpreadRankEntry[] {
  switch (label) {
    case "Freestylers":    return getTopFreestylers();
    case "Battle Winners": return getBattleWinners();
    default:               return getTopFreestylers();
  }
}
