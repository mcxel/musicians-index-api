import prisma from '@/lib/prisma';
import { VENUE_SKINS } from './venueSkinEngine';

/**
 * Commerce + access layer for VENUE_SKINS (venueSkinEngine.ts holds the
 * visual/config data; this file is the missing purchase/ownership/season-
 * pass piece, added 2026-07-19). Pricing is intentionally cheap — "cheap as
 * Fortnite skins" per direction — real money, kept low so buying a skin is
 * an impulse purchase, not a commitment.
 */

export type SkinRarity = 'common' | 'rare' | 'epic';

export const SKIN_RARITY_PRICE_CENTS: Record<SkinRarity, number> = {
  common: 499,   // $4.99
  rare: 799,     // $7.99
  epic: 1199,    // $11.99
};

// Rarity assignment — visual complexity/uniqueness of the skin, not a sales
// lever. Every VENUE_SKINS key must appear here (enforced by the type).
export const VENUE_SKIN_RARITY: Record<keyof typeof VENUE_SKINS, SkinRarity> = {
  'neon-club': 'common',
  'red-theater': 'common',
  'warehouse': 'common',
  'street-corner': 'common',
  'beach': 'rare',
  'luxury-lounge': 'rare',
  'tv-studio': 'rare',
  'underground-battle': 'rare',
  'festival': 'epic',
  'concert-hall': 'epic',
};

export function getSkinPriceCents(skinId: string): number {
  const rarity = VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY];
  return rarity ? SKIN_RARITY_PRICE_CENTS[rarity] : SKIN_RARITY_PRICE_CENTS.common;
}

export interface VenueSkinAccessResult {
  owned: boolean;
  unlockedVia: 'purchase' | 'season_pass' | null;
  customColors: Record<string, string> | null;
}

/**
 * A skin is accessible if the user bought it directly, OR holds any active
 * season pass — matches Fortnite's Battle Pass model (season pass unlocks
 * cosmetics, no separate purchase needed) per direction: "able to be used
 * with our season passes and everything else just the same."
 */
export async function hasVenueSkinAccess(userId: string, skinId: string): Promise<VenueSkinAccessResult> {
  const [ownership, activeSeasonPass] = await Promise.all([
    prisma.venueSkinOwnership.findUnique({ where: { userId_skinId: { userId, skinId } } }),
    prisma.seasonPassOwnership.findFirst({ where: { userId, isActive: true } }),
  ]);

  if (ownership) {
    return {
      owned: true,
      unlockedVia: ownership.unlockedVia as 'purchase' | 'season_pass',
      customColors: (ownership.customColors as Record<string, string> | null) ?? null,
    };
  }

  if (activeSeasonPass) {
    return { owned: true, unlockedVia: 'season_pass', customColors: null };
  }

  return { owned: false, unlockedVia: null, customColors: null };
}

export async function listOwnedVenueSkins(userId: string) {
  const [ownerships, activeSeasonPass] = await Promise.all([
    prisma.venueSkinOwnership.findMany({ where: { userId } }),
    prisma.seasonPassOwnership.findFirst({ where: { userId, isActive: true } }),
  ]);
  const ownedIds = new Set(ownerships.map((o) => o.skinId));
  return Object.keys(VENUE_SKINS).map((skinId) => ({
    skinId,
    owned: ownedIds.has(skinId) || !!activeSeasonPass,
    customColors: (ownerships.find((o) => o.skinId === skinId)?.customColors as Record<string, string> | null) ?? null,
    priceCents: getSkinPriceCents(skinId),
    rarity: VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY] ?? 'common',
  }));
}
