// Fan Prestige Authority Engine
// Tracks fan participation: votes, games, comments, attendance, loyalty.
// Returns ranked fan participant lists for /home/1-2 right column (Fan Champions, Fan Legends, Community MVPs).

import { buildSpreadEntry, type SpreadRankEntry } from "@/engines/home/SpreadRankAuthorityEngine";
import { artistImages, imageAt } from "@/components/cards/content-image-bank";

export interface FanRecord {
  id: string;
  name: string;
  votes: number;
  gamesWon: number;
  comments: number;
  attendance: number;
  achievements: number;
  loyaltyWeeks: number;
  streak: number;
  rank: number;
  previousRank: number;
}

function prestigeScore(fan: Omit<FanRecord, "rank" | "previousRank">): number {
  return (
    fan.votes * 2 +
    fan.gamesWon * 5 +
    fan.comments * 1 +
    fan.attendance * 3 +
    fan.achievements * 8 +
    fan.loyaltyWeeks * 4
  );
}

// Seed fan data pools (deterministic, week-stable)
const FAN_CHAMPIONS_POOL: FanRecord[] = [
  { id: "fc1",  name: "VoteMaster.K",   votes: 4200, gamesWon: 18, comments: 320, attendance: 42, achievements: 12, loyaltyWeeks: 28, streak: 7, rank: 1,  previousRank: 2 },
  { id: "fc2",  name: "Audience.X",     votes: 3800, gamesWon: 14, comments: 280, attendance: 38, achievements:  9, loyaltyWeeks: 22, streak: 4, rank: 2,  previousRank: 1 },
  { id: "fc3",  name: "CrowdQueen.T",   votes: 3400, gamesWon: 12, comments: 260, attendance: 35, achievements:  8, loyaltyWeeks: 20, streak: 5, rank: 3,  previousRank: 4 },
  { id: "fc4",  name: "HypeKing.Z",     votes: 3100, gamesWon: 10, comments: 240, attendance: 32, achievements:  7, loyaltyWeeks: 18, streak: 2, rank: 4,  previousRank: 3 },
  { id: "fc5",  name: "LoyalFan.R",     votes: 2800, gamesWon:  9, comments: 210, attendance: 28, achievements:  6, loyaltyWeeks: 16, streak: 1, rank: 5,  previousRank: 5 },
  { id: "fc6",  name: "ShowUp.V",       votes: 2500, gamesWon:  8, comments: 190, attendance: 26, achievements:  5, loyaltyWeeks: 14, streak: 0, rank: 6,  previousRank: 7 },
  { id: "fc7",  name: "Engage.M",       votes: 2200, gamesWon:  7, comments: 170, attendance: 23, achievements:  4, loyaltyWeeks: 12, streak: 0, rank: 7,  previousRank: 6 },
  { id: "fc8",  name: "CommentLord.B",  votes: 1900, gamesWon:  6, comments: 155, attendance: 20, achievements:  3, loyaltyWeeks: 10, streak: 0, rank: 8,  previousRank: 9 },
  { id: "fc9",  name: "DailyViewer.J",  votes: 1600, gamesWon:  5, comments: 130, attendance: 18, achievements:  2, loyaltyWeeks:  8, streak: 0, rank: 9,  previousRank: 8 },
  { id: "fc10", name: "FirstNight.A",   votes: 1300, gamesWon:  4, comments: 110, attendance: 15, achievements:  1, loyaltyWeeks:  6, streak: 0, rank: 10, previousRank: 10 },
];

const FAN_LEGENDS_POOL: FanRecord[] = [
  { id: "fl1",  name: "Immortal.Fan",   votes: 9800, gamesWon: 42, comments: 720, attendance: 94, achievements: 28, loyaltyWeeks: 72, streak: 12, rank: 1,  previousRank: 1 },
  { id: "fl2",  name: "OG.Viewer.T",    votes: 8600, gamesWon: 38, comments: 640, attendance: 88, achievements: 24, loyaltyWeeks: 64, streak:  8, rank: 2,  previousRank: 3 },
  { id: "fl3",  name: "AllSeason.K",    votes: 7700, gamesWon: 32, comments: 560, attendance: 80, achievements: 20, loyaltyWeeks: 56, streak:  6, rank: 3,  previousRank: 2 },
  { id: "fl4",  name: "NeverMiss.R",    votes: 6900, gamesWon: 28, comments: 490, attendance: 74, achievements: 18, loyaltyWeeks: 50, streak:  5, rank: 4,  previousRank: 5 },
  { id: "fl5",  name: "AlwaysHere.V",   votes: 6200, gamesWon: 24, comments: 420, attendance: 68, achievements: 15, loyaltyWeeks: 44, streak:  4, rank: 5,  previousRank: 4 },
  { id: "fl6",  name: "LegendRow.J",    votes: 5600, gamesWon: 20, comments: 360, attendance: 62, achievements: 12, loyaltyWeeks: 38, streak:  3, rank: 6,  previousRank: 6 },
  { id: "fl7",  name: "TopTier.M",      votes: 5000, gamesWon: 17, comments: 300, attendance: 55, achievements: 10, loyaltyWeeks: 32, streak:  2, rank: 7,  previousRank: 7 },
  { id: "fl8",  name: "PresenceKing.Z", votes: 4400, gamesWon: 14, comments: 250, attendance: 48, achievements:  8, loyaltyWeeks: 26, streak:  1, rank: 8,  previousRank: 8 },
  { id: "fl9",  name: "SteadyVoter.B",  votes: 3800, gamesWon: 11, comments: 200, attendance: 42, achievements:  6, loyaltyWeeks: 20, streak:  0, rank: 9,  previousRank: 9 },
  { id: "fl10", name: "EarlyRiser.A",   votes: 3200, gamesWon:  9, comments: 160, attendance: 36, achievements:  4, loyaltyWeeks: 16, streak:  0, rank: 10, previousRank: 10 },
];

const COMMUNITY_MVPS_POOL: FanRecord[] = [
  { id: "cm1",  name: "Pillars.One",    votes: 5400, gamesWon: 24, comments: 480, attendance: 58, achievements: 18, loyaltyWeeks: 48, streak: 9,  rank: 1,  previousRank: 2 },
  { id: "cm2",  name: "Bridge.K",       votes: 4900, gamesWon: 21, comments: 420, attendance: 54, achievements: 16, loyaltyWeeks: 42, streak: 7,  rank: 2,  previousRank: 1 },
  { id: "cm3",  name: "United.T",       votes: 4400, gamesWon: 18, comments: 370, attendance: 50, achievements: 14, loyaltyWeeks: 36, streak: 5,  rank: 3,  previousRank: 3 },
  { id: "cm4",  name: "Together.V",     votes: 3900, gamesWon: 15, comments: 320, attendance: 45, achievements: 12, loyaltyWeeks: 30, streak: 4,  rank: 4,  previousRank: 5 },
  { id: "cm5",  name: "Roots.M",        votes: 3500, gamesWon: 13, comments: 280, attendance: 40, achievements: 10, loyaltyWeeks: 26, streak: 3,  rank: 5,  previousRank: 4 },
  { id: "cm6",  name: "Culture.J",      votes: 3100, gamesWon: 11, comments: 240, attendance: 36, achievements:  8, loyaltyWeeks: 22, streak: 2,  rank: 6,  previousRank: 6 },
  { id: "cm7",  name: "Energy.R",       votes: 2700, gamesWon:  9, comments: 200, attendance: 32, achievements:  6, loyaltyWeeks: 18, streak: 1,  rank: 7,  previousRank: 8 },
  { id: "cm8",  name: "Frequency.Z",    votes: 2300, gamesWon:  7, comments: 165, attendance: 28, achievements:  5, loyaltyWeeks: 14, streak: 0,  rank: 8,  previousRank: 7 },
  { id: "cm9",  name: "Backbone.B",     votes: 1900, gamesWon:  5, comments: 130, attendance: 24, achievements:  4, loyaltyWeeks: 10, streak: 0,  rank: 9,  previousRank: 9 },
  { id: "cm10", name: "Foundation.A",   votes: 1600, gamesWon:  4, comments: 100, attendance: 20, achievements:  3, loyaltyWeeks:  8, streak: 0,  rank: 10, previousRank: 10 },
];

function fanToEntry(fan: FanRecord, imgOffset: number): SpreadRankEntry {
  return buildSpreadEntry(
    fan.id,
    fan.name,
    fan.rank,
    fan.previousRank,
    prestigeScore(fan),
    fan.streak,
    imageAt(artistImages, (fan.rank + imgOffset) % artistImages.length)
  );
}

export function getFanChampions(): SpreadRankEntry[] {
  return FAN_CHAMPIONS_POOL.map((f) => fanToEntry(f, 0));
}

export function getFanLegends(): SpreadRankEntry[] {
  return FAN_LEGENDS_POOL.map((f) => fanToEntry(f, 2));
}

export function getCommunityMVPs(): SpreadRankEntry[] {
  return COMMUNITY_MVPS_POOL.map((f) => fanToEntry(f, 4));
}

export function getFanPrestigeByLabel(label: string): SpreadRankEntry[] {
  switch (label) {
    case "Fan Champions":   return getFanChampions();
    case "Fan Legends":     return getFanLegends();
    case "Community MVPs":  return getCommunityMVPs();
    default:                return getFanChampions();
  }
}
