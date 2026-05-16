import type { TmiOverlayRarity } from "@/lib/store/tmiOverlayMarketplaceEngine";

const RARITY_WEIGHT: Record<TmiOverlayRarity, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  seasonal: 3,
  founder: 4,
  "sponsor-exclusive": 4,
  "event-winner": 5,
  "diamond-only": 5,
};

export function getOverlayRarityWeight(rarity: TmiOverlayRarity): number {
  return RARITY_WEIGHT[rarity] ?? 1;
}
