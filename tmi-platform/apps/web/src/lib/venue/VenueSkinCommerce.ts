import prisma from '@/lib/prisma';
import { VENUE_SKINS } from './venueSkinEngine';
import { venueSkinSku } from '@/lib/commerce/CommerceCatalogContract';
import { resolveBaseVenueSkin, type TierBaseVenueSkin } from '@/lib/venues/TierBaseVenueSkin';
import type { UserTier } from '@/lib/auth/UserStore';

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

/**
 * Season-pass entitlement is a listed catalog, not "every skin in the registry".
 * Unlisted epic packs stay purchased-only until a real season catalog row exists.
 */
export const SEASON_PASS_INCLUDED_SKINS: ReadonlySet<string> = new Set([
  'neon-club',
  'street-corner',
]);

export function getSkinPriceCents(skinId: string): number {
  const rarity = VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY];
  return rarity ? SKIN_RARITY_PRICE_CENTS[rarity] : SKIN_RARITY_PRICE_CENTS.common;
}

export interface VenueSkinAccessResult {
  owned: boolean;
  unlockedVia: 'purchase' | 'season_pass' | 'tier_base' | null;
  customColors: Record<string, string> | null;
  sku: string;
  permanent: boolean;
}

/**
 * A skin is accessible if the user bought it directly, OR holds any active
 * season pass that lists it — matches Fortnite's Battle Pass model (season
 * pass unlocks cosmetics, no separate purchase needed) per direction: "able
 * to be used with our season passes and everything else just the same."
 */
export async function hasVenueSkinAccess(userId: string, skinId: string): Promise<VenueSkinAccessResult> {
  const sku = venueSkinSku(skinId);
  const [ownership, activeSeasonPass] = await Promise.all([
    prisma.venueSkinOwnership.findUnique({ where: { userId_skinId: { userId, skinId } } }),
    prisma.seasonPassOwnership.findFirst({ where: { userId, isActive: true } }),
  ]);

  if (ownership) {
    const via = ownership.unlockedVia === 'season_pass' ? 'season_pass' : 'purchase';
    return {
      owned: true,
      unlockedVia: via,
      customColors: (ownership.customColors as Record<string, string> | null) ?? null,
      sku,
      permanent: via === 'purchase',
    };
  }

  if (activeSeasonPass && SEASON_PASS_INCLUDED_SKINS.has(skinId)) {
    return { owned: true, unlockedVia: 'season_pass', customColors: null, sku, permanent: false };
  }

  return { owned: false, unlockedVia: null, customColors: null, sku, permanent: false };
}

export async function listOwnedVenueSkins(userId: string) {
  const [ownerships, activeSeasonPass] = await Promise.all([
    prisma.venueSkinOwnership.findMany({ where: { userId } }),
    prisma.seasonPassOwnership.findFirst({ where: { userId, isActive: true } }),
  ]);
  const ownedIds = new Set(ownerships.map((o) => o.skinId));
  return Object.keys(VENUE_SKINS).map((skinId) => {
    const row = ownerships.find((o) => o.skinId === skinId);
    const purchased = ownedIds.has(skinId);
    const seasonListed = Boolean(activeSeasonPass) && SEASON_PASS_INCLUDED_SKINS.has(skinId);
    return {
      skinId,
      sku: venueSkinSku(skinId),
      owned: purchased || seasonListed,
      customColors: (row?.customColors as Record<string, string> | null) ?? null,
      priceCents: getSkinPriceCents(skinId),
      rarity: VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY] ?? 'common',
      unlockedVia: purchased
        ? (row?.unlockedVia === 'season_pass' ? 'season_pass' : 'purchase')
        : seasonListed
          ? 'season_pass'
          : null,
      permanent: purchased && row?.unlockedVia !== 'season_pass',
    };
  });
}

export function listCatalogProducts() {
  return Object.keys(VENUE_SKINS).map((skinId) => ({
    sku: venueSkinSku(skinId),
    type: 'VENUE_SKIN' as const,
    entitlementId: skinId,
    priceCents: getSkinPriceCents(skinId),
    priceType: 'ONE_TIME' as const,
    name: VENUE_SKINS[skinId].name,
    active: true,
  }));
}

/**
 * Stripe webhook fulfillment — grants durable venue skin ownership after a
 * confirmed checkout.session.completed. Upsert so a webhook retry (Stripe's
 * own idempotency-adjacent retry behavior) never fails on a second delivery.
 */
export async function fulfillPurchasedVenueSkin(input: {
  buyerId: string;
  skinId: string;
  stripePaymentId: string;
  customColors?: object;
}): Promise<{ sku: string; skinId: string; permanent: true }> {
  const skinId = input.skinId;
  await prisma.venueSkinOwnership.upsert({
    where: { userId_skinId: { userId: input.buyerId, skinId } },
    create: {
      userId: input.buyerId,
      skinId,
      customColors: input.customColors,
      unlockedVia: 'purchase',
      stripePaymentId: input.stripePaymentId,
    },
    update: { stripePaymentId: input.stripePaymentId },
  });
  return { sku: venueSkinSku(skinId), skinId, permanent: true };
}

/**
 * Resolves what venue skin should actually render for a given user/tier —
 * their equipped purchased/season-pass skin if they own it, else the
 * account tier's included base skin. Consumed by UniversalVenueRenderer.
 */
export async function resolveVenueAppearance(input: {
  userId: string | null;
  accountTier: UserTier;
  equippedSkinId?: string | null;
}): Promise<{
  baseSkin: TierBaseVenueSkin;
  equippedPurchasedSkinId: string | null;
  source: 'tier_base' | 'purchased' | 'season_pass';
}> {
  const baseSkin = resolveBaseVenueSkin(input.accountTier);
  if (!input.userId || !input.equippedSkinId) {
    return { baseSkin, equippedPurchasedSkinId: null, source: 'tier_base' };
  }
  const access = await hasVenueSkinAccess(input.userId, input.equippedSkinId);
  if (!access.owned) {
    return { baseSkin, equippedPurchasedSkinId: null, source: 'tier_base' };
  }
  return {
    baseSkin,
    equippedPurchasedSkinId: input.equippedSkinId,
    source: access.unlockedVia === 'purchase' ? 'purchased' : 'season_pass',
  };
}
