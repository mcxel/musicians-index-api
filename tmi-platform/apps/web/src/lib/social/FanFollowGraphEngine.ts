/**
 * FanFollowGraphEngine
 * Fan-to-fan and fan-to-creator social graph.
 * Distinct from FanProfileEngine (which tracks performer/venue follows for show notifications).
 * This engine owns the mutual-follow/fan-friend social connections layer.
 */

export type SocialEdgeType =
  | "fan-follows-fan"
  | "fan-follows-artist"
  | "fan-follows-venue"
  | "fan-follows-sponsor";

export type SocialEdgeState = "active" | "unfollowed" | "blocked";

export type SocialEdge = {
  edgeId: string;
  followerId: string;
  followeeId: string;
  edgeType: SocialEdgeType;
  state: SocialEdgeState;
  createdAtMs: number;
  updatedAtMs: number;
};

export type SocialGraphSnapshot = {
  fanId: string;
  followingCount: number;
  followerCount: number;
  mutualCount: number;
  following: SocialEdge[];
  followers: SocialEdge[];
  mutuals: string[]; // fanIds
};

// --- in-memory store ---
const edges: SocialEdge[] = [];
let edgeCounter = 0;

function findEdge(followerId: string, followeeId: string): SocialEdge | undefined {
  return edges.find(
    (e) => e.followerId === followerId && e.followeeId === followeeId,
  );
}

// --- Write API ---

export function createSocialFollow(
  followerId: string,
  followeeId: string,
  edgeType: SocialEdgeType,
): SocialEdge {
  const existing = findEdge(followerId, followeeId);
  if (existing) {
    if (existing.state !== "active") {
      existing.state = "active";
      existing.updatedAtMs = Date.now();
    }
    return existing;
  }

  const edge: SocialEdge = {
    edgeId: `social-edge-${++edgeCounter}`,
    followerId,
    followeeId,
    edgeType,
    state: "active",
    createdAtMs: Date.now(),
    updatedAtMs: Date.now(),
  };
  edges.push(edge);
  return edge;
}

export function removeSocialFollow(followerId: string, followeeId: string): void {
  const edge = findEdge(followerId, followeeId);
  if (edge && edge.state === "active") {
    edge.state = "unfollowed";
    edge.updatedAtMs = Date.now();
  }
}

export function blockSocialConnection(followerId: string, followeeId: string): void {
  const edge = findEdge(followerId, followeeId);
  if (edge) {
    edge.state = "blocked";
    edge.updatedAtMs = Date.now();
  }
  // Also block reverse edge if present
  const reverse = findEdge(followeeId, followerId);
  if (reverse && reverse.state === "active") {
    reverse.state = "blocked";
    reverse.updatedAtMs = Date.now();
  }
}

// --- Read API ---

export function getSocialFollowing(fanId: string): SocialEdge[] {
  return edges.filter((e) => e.followerId === fanId && e.state === "active");
}

export function getSocialFollowers(fanId: string): SocialEdge[] {
  return edges.filter((e) => e.followeeId === fanId && e.state === "active");
}

export function getSocialMutuals(fanId: string): string[] {
  const followingIds = new Set(
    getSocialFollowing(fanId).map((e) => e.followeeId),
  );
  return getSocialFollowers(fanId)
    .filter((e) => followingIds.has(e.followerId))
    .map((e) => e.followerId);
}

export function isSocialFollowing(followerId: string, followeeId: string): boolean {
  return !!findEdge(followerId, followeeId) &&
    findEdge(followerId, followeeId)?.state === "active";
}

export function getSocialGraphSnapshot(fanId: string): SocialGraphSnapshot {
  const following = getSocialFollowing(fanId);
  const followers = getSocialFollowers(fanId);
  const mutuals = getSocialMutuals(fanId);

  return {
    fanId,
    followingCount: following.length,
    followerCount: followers.length,
    mutualCount: mutuals.length,
    following,
    followers,
    mutuals,
  };
}

export function getSuggestedFollows(
  fanId: string,
  limit = 10,
): string[] {
  // Fans that followers of this fan also follow — second-degree recommendations
  const myFollowingIds = new Set(getSocialFollowing(fanId).map((e) => e.followeeId));
  const candidates = new Map<string, number>();

  for (const followerId of getSocialFollowers(fanId).map((e) => e.followerId)) {
    for (const edge of getSocialFollowing(followerId)) {
      const candidate = edge.followeeId;
      if (candidate === fanId || myFollowingIds.has(candidate)) continue;
      candidates.set(candidate, (candidates.get(candidate) ?? 0) + 1);
    }
  }

  return [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, limit))
    .map(([id]) => id);
}
