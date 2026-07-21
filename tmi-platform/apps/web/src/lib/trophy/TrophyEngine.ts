import prisma from "@/lib/prisma";

export type TrophyType =
  | "battle-win" | "battle-streak" | "season-champion" | "crowd-favorite"
  | "top-artist" | "top-performer" | "song-battle-champion" | "annual-crown"
  | "venue-legend" | "sponsor-award" | "first-blood" | "perfect-score"
  | "monday-stage-trophy" | "monday-stage-champion";

export type TrophyRarity = "RUBY" | "silver" | "gold" | "platinum" | "crown";

export interface Trophy {
  trophyId: string;
  type: TrophyType;
  rarity: TrophyRarity;
  title: string;
  description: string;
  awardedTo: string;
  awardedBy: string;
  seasonId?: string;
  battleId?: string;
  eventId?: string;
  earnedAt: string;
  transferable: boolean;
  mintedAsNFT: boolean;
  nftTokenId?: string;
}

const trophies = new Map<string, Trophy>();
const ownerIndex = new Map<string, string[]>();

const TROPHY_META: Record<string, { title: string; rarity: TrophyRarity; description: string; transferable: boolean }> = {
  "battle-win":           { title: "Battle Victor",       rarity: "RUBY",   description: "Won a ranked battle",           transferable: false },
  "battle-streak":        { title: "Streak Champion",     rarity: "silver",   description: "Won 5 battles in a row",        transferable: false },
  "season-champion":      { title: "Season Champion",     rarity: "gold",     description: "Top artist of the season",      transferable: false },
  "crowd-favorite":       { title: "Crowd Favorite",      rarity: "silver",   description: "Most crowd votes in one night", transferable: true  },
  "top-artist":           { title: "Top Artist",          rarity: "gold",     description: "Ranked #1 artist this month",   transferable: false },
  "top-performer":        { title: "Top Performer",       rarity: "gold",     description: "Ranked #1 performer this week", transferable: false },
  "song-battle-champion": { title: "Song Battle Champ",   rarity: "platinum", description: "Undefeated Song-for-Song champion", transferable: true },
  "annual-crown":         { title: "Annual Crown",        rarity: "crown",    description: "TMI Artist of the Year",        transferable: false },
  "venue-legend":         { title: "Venue Legend",        rarity: "platinum", description: "Performed at 10+ venues",       transferable: false },
  "sponsor-award":        { title: "Sponsor Award",       rarity: "gold",     description: "Awarded by a platform sponsor", transferable: true  },
  "first-blood":          { title: "First Blood",         rarity: "RUBY",   description: "First battle victory",          transferable: false },
  "perfect-score":        { title: "Perfect Score",       rarity: "platinum", description: "100% crowd approval rating",    transferable: false },
  "monday-stage-trophy":  { title: "Monday Night Trophy", rarity: "gold",     description: "Weekly Monday Night Stage Trophy Winner", transferable: false },
  "monday-stage-champion":{ title: "Monday Stage Crown",  rarity: "crown",    description: "Grand Showcase Hall of Fame Champion", transferable: false },
};

function gen(): string {
  return `trophy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function awardTrophy(
  type: TrophyType,
  awardedTo: string,
  awardedBy: string,
  opts: { seasonId?: string; battleId?: string; eventId?: string; mintedAsNFT?: boolean; nftTokenId?: string } = {},
): Trophy {
  const meta = TROPHY_META[type] ?? { title: "Special Award", rarity: "gold", description: "Platform Award", transferable: false };
  const id = gen();
  const trophy: Trophy = {
    trophyId: id,
    type,
    rarity: meta.rarity,
    title: meta.title,
    description: meta.description,
    awardedTo,
    awardedBy,
    earnedAt: new Date().toISOString(),
    transferable: meta.transferable,
    mintedAsNFT: opts.mintedAsNFT ?? false,
    nftTokenId: opts.nftTokenId,
    seasonId: opts.seasonId,
    battleId: opts.battleId,
    eventId: opts.eventId,
  };
  trophies.set(trophy.trophyId, trophy);
  const list = ownerIndex.get(awardedTo) ?? [];
  list.unshift(trophy.trophyId);
  ownerIndex.set(awardedTo, list);

  // Async Prisma persistence to PostgreSQL
  prisma.trophy.create({
    data: {
      id: trophy.trophyId,
      type: trophy.type,
      rarity: trophy.rarity,
      title: trophy.title,
      description: trophy.description,
      userId: awardedTo,
      awardedBy: awardedBy,
      seasonId: opts.seasonId,
      battleId: opts.battleId,
      eventId: opts.eventId,
      transferable: trophy.transferable,
      mintedAsNFT: trophy.mintedAsNFT,
      nftTokenId: opts.nftTokenId,
    },
  }).catch((err) => {
    console.warn("[TrophyEngine] DB persistence warning (non-blocking fallback to memory):", err?.message);
  });

  return trophy;
}

export function getTrophy(trophyId: string): Trophy | null {
  return trophies.get(trophyId) ?? null;
}

export function getArtistTrophies(artistId: string): Trophy[] {
  return (ownerIndex.get(artistId) ?? []).map((id) => trophies.get(id)!).filter(Boolean);
}

export function getTrophyCount(artistId: string): number {
  return (ownerIndex.get(artistId) ?? []).length;
}

export function getTopTrophy(artistId: string): Trophy | null {
  const rarityOrder: TrophyRarity[] = ["RUBY", "silver", "gold", "platinum", "crown"];
  return getArtistTrophies(artistId)
    .sort((a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity))[0] ?? null;
}

export function getTrophyMeta(type: TrophyType) {
  return TROPHY_META[type] ?? { title: "Special Award", rarity: "gold", description: "Platform Award", transferable: false };
}
