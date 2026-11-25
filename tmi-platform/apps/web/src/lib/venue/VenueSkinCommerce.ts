/**
 * VenueSkinCommerce — durable purchase/ownership/season-pass (server-only).
 * Browser-safe pricing/catalog: VenueSkinCommerceCatalog.ts
 */

import "server-only";

import prisma from "@/lib/prisma";
import { VENUE_SKINS } from "./venueSkinEngine";
import { venueSkinSku } from "@/lib/commerce/CommerceCatalogContract";
import { OwnershipRuntime } from "@/lib/commerce/OwnershipRuntime";
import { resolveBaseVenueSkin, type TierBaseVenueSkin } from "@/lib/venues/TierBaseVenueSkin";
import type { UserTier } from "@/lib/auth/UserStore";
import {
  SEASON_PASS_INCLUDED_SKINS,
  VENUE_SKIN_RARITY,
  getSkinPriceCents,
  listCatalogProducts,
  type SkinRarity,
  SKIN_RARITY_PRICE_CENTS,
} from "@/lib/venue/VenueSkinCommerceCatalog";

export type { SkinRarity };
export {
  SKIN_RARITY_PRICE_CENTS,
  VENUE_SKIN_RARITY,
  SEASON_PASS_INCLUDED_SKINS,
  getSkinPriceCents,
  listCatalogProducts,
};

export interface VenueSkinAccessResult {
  owned: boolean;
  unlockedVia: "purchase" | "season_pass" | "tier_base" | null;
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
    const via = ownership.unlockedVia === "season_pass" ? "season_pass" : "purchase";
    return {
      owned: true,
      unlockedVia: via,
      customColors: (ownership.customColors as Record<string, string> | null) ?? null,
      sku,
      permanent: via === "purchase",
    };
  }

  if (activeSeasonPass && SEASON_PASS_INCLUDED_SKINS.has(skinId)) {
    return { owned: true, unlockedVia: "season_pass", customColors: null, sku, permanent: false };
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
      rarity: VENUE_SKIN_RARITY[skinId as keyof typeof VENUE_SKIN_RARITY] ?? "common",
      unlockedVia: purchased
        ? row?.unlockedVia === "season_pass"
          ? "season_pass"
          : "purchase"
        : seasonListed
          ? "season_pass"
          : null,
      permanent: purchased && row?.unlockedVia !== "season_pass",
    };
  });
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
  const sku = venueSkinSku(skinId);
  await prisma.venueSkinOwnership.upsert({
    where: { userId_skinId: { userId: input.buyerId, skinId } },
    create: {
      userId: input.buyerId,
      skinId,
      customColors: input.customColors,
      unlockedVia: "purchase",
      stripePaymentId: input.stripePaymentId,
    },
    update: { stripePaymentId: input.stripePaymentId },
  });
  OwnershipRuntime.grantEntitlement({
    userId: input.buyerId,
    skuId: sku,
    title: VENUE_SKINS[skinId as keyof typeof VENUE_SKINS]?.name ?? skinId,
    category: "skin",
    provenance: "PURCHASED",
    pricePaidCents: getSkinPriceCents(skinId),
    orderId: input.stripePaymentId,
  });
  return { sku, skinId, permanent: true };
}

/**
 * Points tender → same permanent Venue Skin entitlement as cash (§12335 / §12355).
 * Uses existing venueSkinOwnership + OwnershipRuntime — not a second product.
 * stripePaymentId column stores the points ledger referenceId (nullable-safe).
 */
export async function fulfillVenueSkinWithPoints(input: {
  buyerId: string;
  skinId: string;
  pointsReferenceId: string;
  pointsSpent: number;
  customColors?: object;
}): Promise<{ sku: string; skinId: string; permanent: true; tender: "POINTS" }> {
  const skinId = input.skinId;
  const sku = venueSkinSku(skinId);
  await prisma.venueSkinOwnership.upsert({
    where: { userId_skinId: { userId: input.buyerId, skinId } },
    create: {
      userId: input.buyerId,
      skinId,
      customColors: input.customColors,
      unlockedVia: "purchase",
      stripePaymentId: input.pointsReferenceId,
    },
    update: { stripePaymentId: input.pointsReferenceId },
  });
  OwnershipRuntime.grantEntitlement({
    userId: input.buyerId,
    skuId: sku,
    title: VENUE_SKINS[skinId as keyof typeof VENUE_SKINS]?.name ?? skinId,
    category: "skin",
    provenance: "PURCHASED",
    pricePaidCents: 0,
    orderId: input.pointsReferenceId,
  });
  void input.pointsSpent;
  return { sku, skinId, permanent: true, tender: "POINTS" };
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
  source: "tier_base" | "purchased" | "season_pass";
}> {
  const baseSkin = resolveBaseVenueSkin(input.accountTier);
  if (!input.userId || !input.equippedSkinId) {
    return { baseSkin, equippedPurchasedSkinId: null, source: "tier_base" };
  }
  const access = await hasVenueSkinAccess(input.userId, input.equippedSkinId);
  if (!access.owned) {
    return { baseSkin, equippedPurchasedSkinId: null, source: "tier_base" };
  }
  return {
    baseSkin,
    equippedPurchasedSkinId: input.equippedSkinId,
    source: access.unlockedVia === "purchase" ? "purchased" : "season_pass",
  };
}
