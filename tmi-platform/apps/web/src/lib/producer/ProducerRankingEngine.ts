export type ProducerTier = "underground" | "rising" | "established" | "elite" | "legend";

export interface ProducerRankEntry {
  producerId: string;
  displayName: string;
  tier: ProducerTier;
  rankScore: number;
  totalLicenses: number;
  totalRevenue: number;
  totalBeats: number;
  battleUsages: number;
  rating: number;
  weeklyGain: number;
  lastUpdated: string;
}

const rankings = new Map<string, ProducerRankEntry>();

function tierFromScore(score: number): ProducerTier {
  if (score < 50)   return "underground";
  if (score < 150)  return "rising";
  if (score < 400)  return "established";
  if (score < 1000) return "elite";
  return "legend";
}

function computeScore(entry: Omit<ProducerRankEntry, "tier" | "rankScore" | "lastUpdated">): number {
  return (
    entry.totalLicenses * 5 +
    entry.totalRevenue * 0.1 +
    entry.totalBeats * 2 +
    entry.battleUsages * 8 +
    entry.rating * 10 +
    entry.weeklyGain * 3
  );
}

export function upsertProducerRank(
  input: Omit<ProducerRankEntry, "tier" | "rankScore" | "lastUpdated">,
): ProducerRankEntry {
  const rankScore = computeScore(input);
  const entry: ProducerRankEntry = {
    ...input,
    tier: tierFromScore(rankScore),
    rankScore,
    lastUpdated: new Date().toISOString(),
  };
  rankings.set(input.producerId, entry);
  return entry;
}

export function getProducerRank(producerId: string): ProducerRankEntry | null {
  return rankings.get(producerId) ?? null;
}

export function getLeaderboard(limit = 20): ProducerRankEntry[] {
  return [...rankings.values()].sort((a, b) => b.rankScore - a.rankScore).slice(0, limit);
}

export function getProducersByTier(tier: ProducerTier): ProducerRankEntry[] {
  return [...rankings.values()].filter((r) => r.tier === tier).sort((a, b) => b.rankScore - a.rankScore);
}

export function incrementBattleUsage(producerId: string): ProducerRankEntry | null {
  const entry = rankings.get(producerId);
  if (!entry) return null;
  return upsertProducerRank({ ...entry, battleUsages: entry.battleUsages + 1 });
}

export function addLicense(producerId: string, revenueAmount: number): ProducerRankEntry | null {
  const entry = rankings.get(producerId);
  if (!entry) return null;
  return upsertProducerRank({
    ...entry,
    totalLicenses: entry.totalLicenses + 1,
    totalRevenue: entry.totalRevenue + revenueAmount,
  });
}

export function getRankPosition(producerId: string): number {
  const sorted = getLeaderboard(1000);
  const idx = sorted.findIndex((r) => r.producerId === producerId);
  return idx >= 0 ? idx + 1 : -1;
}
