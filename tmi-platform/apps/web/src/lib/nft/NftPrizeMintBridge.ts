// NFT Prize Mint Bridge — maps TMI battle outcomes to NFT mint payloads
// Covers: battle win, cypher win, achievement unlock, session participation
// Pure functions — actual on-chain calls handled by API layer
// SSR-safe: no side effects at import time

import type { SessionType } from "@/engines/performance/RollingCypherBattleEngine";
import type { ProgressionTier } from "@/engines/performance/WinnerProgressionEngine";

// ── NFT rarity tiers ──────────────────────────────────────────────────────────

export type NftRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

// ── NFT categories ────────────────────────────────────────────────────────────

export type NftCategory =
  | "battle_win"
  | "cypher_win"
  | "open_mic_feature"
  | "streak_badge"
  | "crown_achievement"
  | "tournament_tier"
  | "participation"
  | "sponsor_award"
  | "crowd_favorite";

// ── Mint payload (sent to API) ────────────────────────────────────────────────

export type NftMintPayload = {
  recipientId: string;
  recipientWallet?: string;
  category: NftCategory;
  rarity: NftRarity;
  name: string;
  description: string;
  imageUri: string;
  attributes: Record<string, string | number | boolean>;
  sessionId?: string;
  earnedAtMs: number;
  contractAddress?: string;
  tokenId?: string;
};

// ── Rarity resolver uses ProgressionTier directly ─────────────────────────────

export function resolveRarity(
  category: NftCategory,
  tier?: ProgressionTier,
  streak?: number,
): NftRarity {
  if (tier === "legend")                            return "legendary";
  if (tier === "crown_holder")                      return "epic";
  if (tier === "champion" || (streak ?? 0) >= 5)   return "rare";
  if (tier === "qualifier" || (streak ?? 0) >= 3)  return "uncommon";
  if (category === "participation")                 return "common";
  return "uncommon";
}

// ── Image URI convention ─────────────────────────────────────────────────────

function nftImageUri(category: NftCategory, rarity: NftRarity): string {
  return `/nft-assets/${category}/${rarity}.png`;
}

// ── Mint payload builders ─────────────────────────────────────────────────────

export function buildBattleWinNft(
  recipientId: string,
  sessionId: string,
  opponentName: string,
  crowdScore: number,
  streak: number,
  tier: ProgressionTier,
  earnedAtMs: number,
): NftMintPayload {
  const rarity = resolveRarity("battle_win", tier, streak);
  return {
    recipientId,
    category: "battle_win",
    rarity,
    name: `Battle Victory — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier`,
    description: `Defeated ${opponentName} in a head-to-head TMI battle. Crowd score: ${crowdScore}.`,
    imageUri: nftImageUri("battle_win", rarity),
    attributes: { opponent: opponentName, crowdScore, streak, tier },
    sessionId,
    earnedAtMs,
  };
}

export function buildCypherWinNft(
  recipientId: string,
  sessionId: string,
  genre: string,
  crowdScore: number,
  earnedAtMs: number,
): NftMintPayload {
  const rarity = resolveRarity("cypher_win");
  return {
    recipientId,
    category: "cypher_win",
    rarity,
    name: `Cypher Winner — ${genre}`,
    description: `Voted crowd favorite in a ${genre} cypher session on TMI.`,
    imageUri: nftImageUri("cypher_win", rarity),
    attributes: { genre, crowdScore },
    sessionId,
    earnedAtMs,
  };
}

export function buildStreakBadgeNft(
  recipientId: string,
  streak: number,
  tier: ProgressionTier,
  earnedAtMs: number,
): NftMintPayload {
  const rarity = resolveRarity("streak_badge", tier, streak);
  return {
    recipientId,
    category: "streak_badge",
    rarity,
    name: `${streak}-Win Streak`,
    description: `Achieved a ${streak}-win streak in TMI battles at ${tier} tier.`,
    imageUri: nftImageUri("streak_badge", rarity),
    attributes: { streak, tier },
    earnedAtMs,
  };
}

export function buildCrownAchievementNft(
  recipientId: string,
  tier: ProgressionTier,
  totalWins: number,
  earnedAtMs: number,
): NftMintPayload {
  const rarity = resolveRarity("crown_achievement", tier);
  return {
    recipientId,
    category: "crown_achievement",
    rarity,
    name: `TMI ${tier.charAt(0).toUpperCase() + tier.slice(1).replace("_", " ")}`,
    description: `Reached ${tier} status with ${totalWins} total wins on TMI.`,
    imageUri: nftImageUri("crown_achievement", rarity),
    attributes: { tier, totalWins },
    earnedAtMs,
  };
}

export function buildParticipationNft(
  recipientId: string,
  sessionId: string,
  sessionType: SessionType,
  genre: string,
  earnedAtMs: number,
): NftMintPayload {
  return {
    recipientId,
    category: "participation",
    rarity: "common",
    name: `TMI ${sessionType === "battle" ? "Battle" : "Cypher"} — ${genre}`,
    description: `Participated in a live ${sessionType} session on The Musician's Index.`,
    imageUri: nftImageUri("participation", "common"),
    attributes: { sessionType, genre },
    sessionId,
    earnedAtMs,
  };
}

export function buildCrowdFavoriteNft(
  recipientId: string,
  sessionId: string,
  sessionType: SessionType,
  crowdScore: number,
  earnedAtMs: number,
): NftMintPayload {
  const rarity = crowdScore >= 90 ? "epic" : crowdScore >= 70 ? "rare" : "uncommon";
  return {
    recipientId,
    category: "crowd_favorite",
    rarity,
    name: `Crowd Favorite`,
    description: `Earned crowd favorite status with a score of ${crowdScore} in a TMI ${sessionType}.`,
    imageUri: nftImageUri("crowd_favorite", rarity),
    attributes: { sessionType, crowdScore },
    sessionId,
    earnedAtMs,
  };
}

// ── Queue helper ─────────────────────────────────────────────────────────────

export type MintQueue = { payloads: NftMintPayload[]; queuedAtMs: number };

export function createMintQueue(payloads: NftMintPayload[]): MintQueue {
  return { payloads, queuedAtMs: Date.now() };
}

export function addToMintQueue(queue: MintQueue, payload: NftMintPayload): MintQueue {
  return { ...queue, payloads: [...queue.payloads, payload] };
}
