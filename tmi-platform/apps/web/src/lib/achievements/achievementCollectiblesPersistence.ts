/**
 * Achievement Collectible persistence (thin scaffold)
 *
 * Reads/writes UserAchievementCollectible. Never fabricates grants (Rule 20).
 * Grant path: MemoryLedger WINNER_DECLARED → achievementBridge → FUTURE grant engine.
 * Listing returns honest [] when the owner has no earned rows.
 */

import prisma from "@/lib/prisma";
import type {
  AchievementCollectibleKind,
  AchievementRolePath,
  AchievementShowcaseState,
  UserAchievementCollectibleRecord,
} from "@/core/eos/achievementCollectibleContracts";
import {
  ACHIEVEMENT_COLLECTIBLE_KINDS,
  emptyAchievementShowcase,
} from "@/core/eos/achievementCollectibleContracts";

type Row = {
  id: string;
  userId: string;
  definitionId: string;
  kind: string;
  rolePath: string;
  title: string;
  earnedAt: Date | null;
  featured: boolean;
  seasonKey: string | null;
  sourceLedgerEntryId: string | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function isKind(value: string): value is AchievementCollectibleKind {
  return (ACHIEVEMENT_COLLECTIBLE_KINDS as readonly string[]).includes(value);
}

function isRolePath(value: string): value is AchievementRolePath {
  return value === "FAN" || value === "PERFORMER";
}

function toRecord(row: Row): UserAchievementCollectibleRecord | null {
  if (!isKind(row.kind) || !isRolePath(row.rolePath)) return null;
  return {
    id: row.id,
    userId: row.userId,
    definitionId: row.definitionId,
    kind: row.kind,
    rolePath: row.rolePath,
    title: row.title,
    earnedAt: row.earnedAt ? row.earnedAt.toISOString() : null,
    featured: row.featured,
    seasonKey: row.seasonKey ?? undefined,
    sourceLedgerEntryId: row.sourceLedgerEntryId ?? undefined,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** List earned achievement collectibles. Honest [] when none / table missing. */
export async function listUserAchievementCollectibles(
  userId: string,
  rolePath?: AchievementRolePath,
): Promise<UserAchievementCollectibleRecord[]> {
  const id = userId?.trim();
  if (!id) return [];
  try {
    const rows = await prisma.userAchievementCollectible.findMany({
      where: {
        userId: id,
        ...(rolePath ? { rolePath } : {}),
        earnedAt: { not: null },
      },
      orderBy: { earnedAt: "desc" },
      take: 200,
    });
    return rows
      .map((r) => toRecord(r as Row))
      .filter((r): r is UserAchievementCollectibleRecord => r !== null);
  } catch (err) {
    console.error("[achievementCollectiblesPersistence.list]", err);
    return [];
  }
}

/** Showcase state with featured pin ids — empty owned when none earned. */
export async function getAchievementShowcase(
  userId: string,
  rolePath: AchievementRolePath,
): Promise<AchievementShowcaseState> {
  const id = userId?.trim();
  if (!id) return emptyAchievementShowcase("", rolePath);

  const owned = await listUserAchievementCollectibles(id, rolePath);
  const featuredCollectibleIds = owned
    .filter((o) => o.featured)
    .map((o) => o.definitionId);

  return {
    userId: id,
    rolePath,
    featuredCollectibleIds,
    owned,
  };
}

/**
 * Pin/unpin featured showcase ids. Only updates rows the user already owns.
 * Does not invent grants.
 */
export async function setFeaturedAchievementCollectibles(
  userId: string,
  featuredCollectibleIds: string[],
): Promise<boolean> {
  const id = userId?.trim();
  if (!id) return false;
  const pins = featuredCollectibleIds
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 12);

  try {
    await prisma.userAchievementCollectible.updateMany({
      where: { userId: id },
      data: { featured: false },
    });
    if (pins.length > 0) {
      await prisma.userAchievementCollectible.updateMany({
        where: {
          userId: id,
          definitionId: { in: pins },
          earnedAt: { not: null },
        },
        data: { featured: true },
      });
    }
    return true;
  } catch (err) {
    console.error("[achievementCollectiblesPersistence.setFeatured]", err);
    return false;
  }
}
