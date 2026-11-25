/**
 * FollowValidityAuthority — the real, batched, transactional follower-count
 * authority for performer ranking (owner-locked, 2026-10-29). The ranking
 * pipeline must never again read ArtistProfile.followers (proven dead —
 * zero write sites anywhere in the codebase, confirmed this session). This
 * is the replacement: COUNT(prisma.follow) grouped by followingId, with
 * the identified integrity gaps closed where safely possible.
 *
 * Reuses the real, canonical Follow model (api/social/follow/route.ts) —
 * never a second follow ledger. Reuses the real, canonical User.accountStatus
 * values ('active'|'suspended'|'banned', ModerationEngine.ts) and isQA flag
 * (already used by queryRankedUsers) — never a second account-status system.
 * Reuses the real UserBlock model for block-relationship exclusion.
 *
 * Integrity gaps closed here: SUSPENDED_FOLLOWER (excluded via
 * accountStatus:'active'), QA/TEST_FOLLOWER (excluded via isQA:false),
 * BLOCK_RELATIONSHIP (excluded via UserBlock, either direction).
 * Integrity gaps NOT closed here (out of this authority's scope — these
 * live in api/social/follow/route.ts itself, the write path, not this
 * read path): a follow created before a block/suspension existed is
 * excluded at READ time by this authority regardless of when it was
 * created, so the read-side protection holds even though the write-side
 * route doesn't proactively clean up stale follows.
 *
 * Self-follow and duplicate-follow are already protected at the write
 * layer (api/social/follow/route.ts) — nothing further needed here.
 *
 * NOT YET RUN AGAINST A REAL DATABASE — same DB_RUNTIME_CERTIFIED=NO
 * constraint as every other Prisma-touching file this session.
 */

import prisma from "@/lib/prisma";

export interface FollowRow {
  followerId: string;
  followingId: string;
}

export interface BlockRow {
  blockerId: string;
  blockedId: string;
}

/**
 * Pure — counts valid follows per performer, excluding any pair with a
 * block relationship in either direction. No Prisma, directly unit-testable.
 * Rows whose followingId isn't one of the requested performerIds are
 * ignored (defensive — callers should already scope the query, but this
 * keeps the function safe to call with an unfiltered row set too).
 */
export function countValidFollowers(
  performerIds: string[],
  follows: FollowRow[],
  blocks: BlockRow[],
): Map<string, number> {
  const blockedPairs = new Set<string>();
  for (const b of blocks) {
    blockedPairs.add(`${b.blockerId}:${b.blockedId}`);
    blockedPairs.add(`${b.blockedId}:${b.blockerId}`);
  }

  const counts = new Map<string, number>(performerIds.map((id) => [id, 0]));
  for (const f of follows) {
    if (!counts.has(f.followingId)) continue;
    if (blockedPairs.has(`${f.followerId}:${f.followingId}`)) continue;
    counts.set(f.followingId, (counts.get(f.followingId) ?? 0) + 1);
  }
  return counts;
}

/**
 * Real, batched fetch — one query for follows (scoped to active, non-QA
 * followers only) + one query for any blocks between those followers and
 * these performers, never one query per performer. NOT YET RUN AGAINST A
 * REAL DATABASE.
 */
export async function fetchValidFollowerCounts(performerIds: string[]): Promise<Map<string, number>> {
  if (performerIds.length === 0) return new Map();

  const follows = await prisma.follow.findMany({
    where: {
      followingId: { in: performerIds },
      follower: { isQA: false, accountStatus: "active" },
    },
    select: { followerId: true, followingId: true },
  });

  if (follows.length === 0) {
    return new Map(performerIds.map((id) => [id, 0]));
  }

  const followerIds = Array.from(new Set(follows.map((f) => f.followerId)));
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [
        { blockerId: { in: performerIds }, blockedId: { in: followerIds } },
        { blockedId: { in: performerIds }, blockerId: { in: followerIds } },
      ],
    },
    select: { blockerId: true, blockedId: true },
  });

  return countValidFollowers(performerIds, follows, blocks);
}

/** Single-performer convenience wrapper over the batched query. */
export async function fetchValidFollowerCount(performerId: string): Promise<number> {
  const map = await fetchValidFollowerCounts([performerId]);
  return map.get(performerId) ?? 0;
}
