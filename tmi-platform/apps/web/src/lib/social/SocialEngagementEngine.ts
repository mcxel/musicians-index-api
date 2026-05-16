/**
 * SocialEngagementEngine
 * Likes, reactions, shares, and content signal tracking for the social layer.
 * Distinct from live tip/vote reactions (handled in live layer).
 */

export type SocialEngagementTarget =
  | "article"
  | "artist-post"
  | "event"
  | "beat"
  | "contest-entry"
  | "venue-feature"
  | "fan-post";

export type SocialReactionType =
  | "fire"    // high energy / dope
  | "hype"    // excited / building
  | "love"    // deep appreciation
  | "respect" // craft recognition
  | "clout";  // social signal

export type SocialLike = {
  likeId: string;
  fanId: string;
  targetId: string;
  targetType: SocialEngagementTarget;
  createdAtMs: number;
};

export type SocialReaction = {
  reactionId: string;
  fanId: string;
  targetId: string;
  targetType: SocialEngagementTarget;
  reactionType: SocialReactionType;
  createdAtMs: number;
};

export type SocialShare = {
  shareId: string;
  fanId: string;
  targetId: string;
  targetType: SocialEngagementTarget;
  shareChannel: "copy-link" | "social-dm" | "external";
  createdAtMs: number;
};

export type SocialEngagementSummary = {
  targetId: string;
  targetType: SocialEngagementTarget;
  likeCount: number;
  shareCount: number;
  reactionBreakdown: Record<SocialReactionType, number>;
  totalSignalScore: number; // weighted engagement metric
};

// --- in-memory stores ---
const likes: SocialLike[] = [];
const reactions: SocialReaction[] = [];
const shares: SocialShare[] = [];
let likeCounter = 0;
let reactionCounter = 0;
let shareCounter = 0;

const REACTION_WEIGHT: Record<SocialReactionType, number> = {
  fire: 3,
  hype: 2,
  love: 2,
  respect: 2,
  clout: 4,
};

// --- Write API ---

export function toggleSocialLike(
  fanId: string,
  targetId: string,
  targetType: SocialEngagementTarget,
): { liked: boolean; like?: SocialLike } {
  const existingIndex = likes.findIndex(
    (l) => l.fanId === fanId && l.targetId === targetId,
  );

  if (existingIndex !== -1) {
    likes.splice(existingIndex, 1);
    return { liked: false };
  }

  const like: SocialLike = {
    likeId: `social-like-${++likeCounter}`,
    fanId,
    targetId,
    targetType,
    createdAtMs: Date.now(),
  };
  likes.push(like);
  return { liked: true, like };
}

export function addSocialReaction(
  fanId: string,
  targetId: string,
  targetType: SocialEngagementTarget,
  reactionType: SocialReactionType,
): SocialReaction {
  // Replace existing reaction from this fan on this target
  const existingIdx = reactions.findIndex(
    (r) => r.fanId === fanId && r.targetId === targetId,
  );
  if (existingIdx !== -1) reactions.splice(existingIdx, 1);

  const reaction: SocialReaction = {
    reactionId: `social-reaction-${++reactionCounter}`,
    fanId,
    targetId,
    targetType,
    reactionType,
    createdAtMs: Date.now(),
  };
  reactions.push(reaction);
  return reaction;
}

export function recordSocialShare(
  fanId: string,
  targetId: string,
  targetType: SocialEngagementTarget,
  shareChannel: SocialShare["shareChannel"],
): SocialShare {
  const share: SocialShare = {
    shareId: `social-share-${++shareCounter}`,
    fanId,
    targetId,
    targetType,
    shareChannel,
    createdAtMs: Date.now(),
  };
  shares.push(share);
  return share;
}

// --- Read API ---

export function getSocialEngagementSummary(
  targetId: string,
  targetType: SocialEngagementTarget,
): SocialEngagementSummary {
  const targetLikes = likes.filter(
    (l) => l.targetId === targetId && l.targetType === targetType,
  );
  const targetReactions = reactions.filter(
    (r) => r.targetId === targetId && r.targetType === targetType,
  );
  const targetShares = shares.filter(
    (s) => s.targetId === targetId && s.targetType === targetType,
  );

  const reactionBreakdown: Record<SocialReactionType, number> = {
    fire: 0,
    hype: 0,
    love: 0,
    respect: 0,
    clout: 0,
  };

  let reactionScore = 0;
  for (const r of targetReactions) {
    reactionBreakdown[r.reactionType]++;
    reactionScore += REACTION_WEIGHT[r.reactionType];
  }

  const totalSignalScore =
    targetLikes.length * 1 +
    targetShares.length * 5 +
    reactionScore;

  return {
    targetId,
    targetType,
    likeCount: targetLikes.length,
    shareCount: targetShares.length,
    reactionBreakdown,
    totalSignalScore,
  };
}

export function hasFanLiked(fanId: string, targetId: string): boolean {
  return likes.some((l) => l.fanId === fanId && l.targetId === targetId);
}

export function getFanReaction(
  fanId: string,
  targetId: string,
): SocialReaction | undefined {
  return reactions.find((r) => r.fanId === fanId && r.targetId === targetId);
}

export function getTopEngagedContent(
  targetType: SocialEngagementTarget,
  limit = 10,
): Array<{ targetId: string; signalScore: number }> {
  const targetIds = new Set([
    ...likes.filter((l) => l.targetType === targetType).map((l) => l.targetId),
    ...reactions.filter((r) => r.targetType === targetType).map((r) => r.targetId),
    ...shares.filter((s) => s.targetType === targetType).map((s) => s.targetId),
  ]);

  return [...targetIds]
    .map((id) => ({
      targetId: id,
      signalScore: getSocialEngagementSummary(id, targetType).totalSignalScore,
    }))
    .sort((a, b) => b.signalScore - a.signalScore)
    .slice(0, Math.max(1, limit));
}
