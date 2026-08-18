/**
 * Server-side Media Player chassis ownership + equip.
 * Mirrors VenueSkinCommerce pattern. Playlist Artifact ownership is separate.
 */

import prisma from "@/lib/prisma";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  MEDIA_PLAYER_STORE_SKUS,
  canEquipChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";

const FREE_STARTER_CHASSIS: MediaPlayerChassisId[] = [
  FREE_DEFAULT_CHASSIS_ID,
  "tmi_classic",
  "tmi_dark",
  "tmi_neon",
];

export type ChassisUnlockVia = "purchase" | "points" | "free" | "tier";

export interface MediaPlayerOwnershipState {
  userId: string;
  ownedChassisIds: MediaPlayerChassisId[];
  equippedChassisId: MediaPlayerChassisId;
  pointsBalance: number;
}

function isChassisId(id: string): id is MediaPlayerChassisId {
  return id in MEDIA_PLAYER_CHASSIS_REGISTRY;
}

export function getChassisPricePoints(chassisId: MediaPlayerChassisId): number {
  return MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId]?.pricePoints ?? 299;
}

export function getChassisPriceUsdCents(chassisId: MediaPlayerChassisId): number {
  return MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId]?.priceUsdCents ?? 299;
}

export function isStoreListedChassis(chassisId: string): boolean {
  return MEDIA_PLAYER_STORE_SKUS.includes(chassisId as MediaPlayerChassisId);
}

/** Ensure free Standard (+ free starters) exist; equip standard if unset/invalid. */
export async function provisionDefaultMediaPlayer(
  userId: string,
): Promise<MediaPlayerOwnershipState> {
  const existing = await prisma.mediaPlayerChassisOwnership.findMany({
    where: { userId },
    select: { chassisId: true },
  });
  const owned = new Set(existing.map((r) => r.chassisId));

  for (const chassisId of FREE_STARTER_CHASSIS) {
    if (owned.has(chassisId)) continue;
    await prisma.mediaPlayerChassisOwnership.upsert({
      where: { userId_chassisId: { userId, chassisId } },
      create: { userId, chassisId, unlockedVia: "free" },
      update: {},
    });
    owned.add(chassisId);
  }

  // Platinum and Diamond subscription tiers receive Submarine Media Player automatically for free
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, role: true },
  });
  if (user?.tier === "PLATINUM" || user?.tier === "DIAMOND" || user?.role === "ADMIN") {
    if (!owned.has("submarine")) {
      await prisma.mediaPlayerChassisOwnership.upsert({
        where: { userId_chassisId: { userId, chassisId: "submarine" } },
        create: { userId, chassisId: "submarine", unlockedVia: "tier" },
        update: {},
      });
      owned.add("submarine");
    }
  }


  let pref = await prisma.mediaPlayerPreference.findUnique({ where: { userId } });
  let equipped = (pref?.equippedChassisId ?? FREE_DEFAULT_CHASSIS_ID) as MediaPlayerChassisId;

  if (
    equipped === "fish" ||
    (equipped === "submarine" && !owned.has("submarine")) ||
    !isChassisId(equipped) ||
    !owned.has(equipped)
  ) {
    equipped = FREE_DEFAULT_CHASSIS_ID;
  }


  pref = await prisma.mediaPlayerPreference.upsert({
    where: { userId },
    create: { userId, equippedChassisId: equipped },
    update: { equippedChassisId: equipped },
  });

  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { fanCredits: true },
  });

  return {
    userId,
    ownedChassisIds: Array.from(owned).filter(isChassisId),
    equippedChassisId: isChassisId(pref.equippedChassisId)
      ? pref.equippedChassisId
      : FREE_DEFAULT_CHASSIS_ID,
    pointsBalance: wallet?.fanCredits ?? 0,
  };
}

export async function getMediaPlayerOwnership(
  userId: string,
): Promise<MediaPlayerOwnershipState> {
  return provisionDefaultMediaPlayer(userId);
}

export async function grantChassisOwnershipDb(
  userId: string,
  chassisId: MediaPlayerChassisId,
  unlockedVia: ChassisUnlockVia,
  stripePaymentId?: string,
): Promise<void> {
  if (!isChassisId(chassisId)) throw new Error("Unknown chassis");
  await prisma.mediaPlayerChassisOwnership.upsert({
    where: { userId_chassisId: { userId, chassisId } },
    create: {
      userId,
      chassisId,
      unlockedVia,
      stripePaymentId: stripePaymentId ?? null,
    },
    update: {
      ...(stripePaymentId ? { stripePaymentId } : {}),
      unlockedVia,
    },
  });
}

/**
 * Spend Wallet.fanCredits then grant ownership in one transaction (Rule 20).
 * Returns updated state or error message.
 */
export async function purchaseChassisWithPointsDb(
  userId: string,
  chassisId: MediaPlayerChassisId,
): Promise<
  | { ok: true; state: MediaPlayerOwnershipState; spent: number }
  | { ok: false; error: string; balance: number }
> {
  if (!isChassisId(chassisId)) {
    return { ok: false, error: "Unknown chassis", balance: 0 };
  }
  const entry = MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId];
  if (entry.unlockMethod === "free" || entry.freeDefault) {
    const state = await provisionDefaultMediaPlayer(userId);
    return { ok: true, state, spent: 0 };
  }
  if (!isStoreListedChassis(chassisId) && entry.unlockMethod !== "points" && entry.unlockMethod !== "premium") {
    return { ok: false, error: "Chassis not available for points purchase", balance: 0 };
  }

  const cost = getChassisPricePoints(chassisId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const already = await tx.mediaPlayerChassisOwnership.findUnique({
        where: { userId_chassisId: { userId, chassisId } },
      });
      if (already) {
        return { kind: "owned" as const };
      }

      const wallet = await tx.wallet.upsert({
        where: { userId },
        create: { userId, fanCredits: 0 },
        update: {},
      });

      if (wallet.fanCredits < cost) {
        return { kind: "insufficient" as const, balance: wallet.fanCredits };
      }

      await tx.wallet.update({
        where: { userId },
        data: { fanCredits: { decrement: cost } },
      });

      await tx.mediaPlayerChassisOwnership.create({
        data: { userId, chassisId, unlockedVia: "points" },
      });

      return { kind: "ok" as const, spent: cost };
    });

    if (result.kind === "owned") {
      const state = await getMediaPlayerOwnership(userId);
      return { ok: true, state, spent: 0 };
    }
    if (result.kind === "insufficient") {
      return {
        ok: false,
        error: `Not enough points. Need ${cost} · balance ${result.balance}.`,
        balance: result.balance,
      };
    }

    const state = await getMediaPlayerOwnership(userId);
    return { ok: true, state, spent: result.spent };
  } catch (err) {
    console.error("[MediaPlayerOwnership] points purchase failed", err);
    return { ok: false, error: "Purchase failed", balance: 0 };
  }
}

export async function equipChassisDb(
  userId: string,
  chassisId: MediaPlayerChassisId,
  accountTier: "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" = "FREE",
): Promise<{ ok: boolean; error?: string; state?: MediaPlayerOwnershipState }> {
  const state = await provisionDefaultMediaPlayer(userId);
  if (!canEquipChassis(chassisId, accountTier, state.ownedChassisIds)) {
    return { ok: false, error: "Chassis not owned or not unlocked for your tier" };
  }
  await prisma.mediaPlayerPreference.upsert({
    where: { userId },
    create: { userId, equippedChassisId: chassisId },
    update: { equippedChassisId: chassisId },
  });
  return { ok: true, state: await getMediaPlayerOwnership(userId) };
}

/** Unequip → fall back to free Standard Player. */
export async function unequipChassisDb(
  userId: string,
): Promise<MediaPlayerOwnershipState> {
  await provisionDefaultMediaPlayer(userId);
  await prisma.mediaPlayerPreference.upsert({
    where: { userId },
    create: { userId, equippedChassisId: FREE_DEFAULT_CHASSIS_ID },
    update: { equippedChassisId: FREE_DEFAULT_CHASSIS_ID },
  });
  return getMediaPlayerOwnership(userId);
}
