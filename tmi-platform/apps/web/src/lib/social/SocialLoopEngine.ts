/**
 * SocialLoopEngine
 * Interaction loop orchestrator — ties activity feed, graph, and engagement signals
 * together into cohesive fan interaction sequences (follow → engage → share → invite).
 */

import {
  recordFanFollow,
  recordFanVote,
  recordFanArticleRead,
  recordFanEventAttendance,
  recordFanRewardEarned,
  recordFanShare,
  type FanActivityActor,
} from "./FanActivityFeedEngine";

import {
  createSocialFollow,
  getSocialGraphSnapshot,
  getSuggestedFollows,
  type SocialEdgeType,
} from "./FanFollowGraphEngine";

import {
  toggleSocialLike,
  addSocialReaction,
  recordSocialShare,
  getTopEngagedContent,
  type SocialEngagementTarget,
  type SocialReactionType,
} from "./SocialEngagementEngine";

export type SocialLoopAction =
  | "follow"
  | "like"
  | "react"
  | "share"
  | "vote"
  | "read"
  | "attend"
  | "reward-earned";

export type SocialLoopEvent = {
  loopEventId: string;
  fanId: string;
  action: SocialLoopAction;
  targetId: string;
  targetLabel: string;
  triggeredAtMs: number;
  xpEarned: number;
};

// XP per interaction (social-layer rewards separate from FanRewardActivationEngine points)
const ACTION_XP: Record<SocialLoopAction, number> = {
  follow: 10,
  like: 3,
  react: 5,
  share: 15,
  vote: 8,
  read: 6,
  attend: 20,
  "reward-earned": 0, // reward engine handles XP separately
};

const loopEvents: SocialLoopEvent[] = [];
let loopEventCounter = 0;

function emitLoopEvent(
  fanId: string,
  action: SocialLoopAction,
  targetId: string,
  targetLabel: string,
): SocialLoopEvent {
  const event: SocialLoopEvent = {
    loopEventId: `social-loop-${++loopEventCounter}`,
    fanId,
    action,
    targetId,
    targetLabel,
    triggeredAtMs: Date.now(),
    xpEarned: ACTION_XP[action],
  };
  loopEvents.unshift(event);
  if (loopEvents.length > 2000) loopEvents.splice(2000);
  return event;
}

// --- Compound loop actions ---

export function loopFanFollow(
  actor: FanActivityActor,
  targetId: string,
  targetLabel: string,
  targetType: "artist" | "venue" | "show",
): SocialLoopEvent {
  const edgeType: SocialEdgeType =
    targetType === "artist"
      ? "fan-follows-artist"
      : targetType === "venue"
      ? "fan-follows-venue"
      : "fan-follows-fan";

  createSocialFollow(actor.fanId, targetId, edgeType);
  recordFanFollow(actor, targetId, targetLabel, targetType);
  return emitLoopEvent(actor.fanId, "follow", targetId, targetLabel);
}

export function loopFanLike(
  actor: FanActivityActor,
  targetId: string,
  targetLabel: string,
  targetType: SocialEngagementTarget,
): { loopEvent: SocialLoopEvent; liked: boolean } {
  const { liked } = toggleSocialLike(actor.fanId, targetId, targetType);
  const loopEvent = emitLoopEvent(actor.fanId, "like", targetId, targetLabel);
  return { loopEvent, liked };
}

export function loopFanReact(
  actor: FanActivityActor,
  targetId: string,
  targetLabel: string,
  targetType: SocialEngagementTarget,
  reactionType: SocialReactionType,
): SocialLoopEvent {
  addSocialReaction(actor.fanId, targetId, targetType, reactionType);
  return emitLoopEvent(actor.fanId, "react", targetId, targetLabel);
}

export function loopFanShare(
  actor: FanActivityActor,
  targetId: string,
  targetLabel: string,
  targetType: SocialEngagementTarget,
  shareChannel: "copy-link" | "social-dm" | "external",
): SocialLoopEvent {
  recordSocialShare(actor.fanId, targetId, targetType, shareChannel);
  recordFanShare(actor, targetId, targetLabel);
  return emitLoopEvent(actor.fanId, "share", targetId, targetLabel);
}

export function loopFanVote(
  actor: FanActivityActor,
  contestId: string,
  contestLabel: string,
): SocialLoopEvent {
  recordFanVote(actor, contestId, contestLabel);
  return emitLoopEvent(actor.fanId, "vote", contestId, contestLabel);
}

export function loopFanRead(
  actor: FanActivityActor,
  articleId: string,
  articleTitle: string,
): SocialLoopEvent {
  recordFanArticleRead(actor, articleId, articleTitle);
  return emitLoopEvent(actor.fanId, "read", articleId, articleTitle);
}

export function loopFanAttend(
  actor: FanActivityActor,
  eventId: string,
  eventLabel: string,
): SocialLoopEvent {
  recordFanEventAttendance(actor, eventId, eventLabel);
  return emitLoopEvent(actor.fanId, "attend", eventId, eventLabel);
}

export function loopFanRewardEarned(
  actor: FanActivityActor,
  rewardId: string,
  rewardLabel: string,
): SocialLoopEvent {
  recordFanRewardEarned(actor, rewardId, rewardLabel);
  return emitLoopEvent(actor.fanId, "reward-earned", rewardId, rewardLabel);
}

// --- Read API ---

export type SocialLoopSummary = {
  fanId: string;
  totalLoopXP: number;
  actionBreakdown: Record<SocialLoopAction, number>;
  suggestedFollows: string[];
  topContent: Array<{ targetId: string; signalScore: number }>;
  graphSnapshot: ReturnType<typeof getSocialGraphSnapshot>;
};

export function getSocialLoopSummary(
  fanId: string,
  topContentType: SocialEngagementTarget = "article",
): SocialLoopSummary {
  const fanEvents = loopEvents.filter((e) => e.fanId === fanId);

  const actionBreakdown: Record<SocialLoopAction, number> = {
    follow: 0,
    like: 0,
    react: 0,
    share: 0,
    vote: 0,
    read: 0,
    attend: 0,
    "reward-earned": 0,
  };

  let totalLoopXP = 0;
  for (const e of fanEvents) {
    actionBreakdown[e.action]++;
    totalLoopXP += e.xpEarned;
  }

  return {
    fanId,
    totalLoopXP,
    actionBreakdown,
    suggestedFollows: getSuggestedFollows(fanId, 5),
    topContent: getTopEngagedContent(topContentType, 5),
    graphSnapshot: getSocialGraphSnapshot(fanId),
  };
}

export function getLoopLeaderboard(limit = 20): Array<{ fanId: string; totalLoopXP: number }> {
  const xpMap = new Map<string, number>();
  for (const e of loopEvents) {
    xpMap.set(e.fanId, (xpMap.get(e.fanId) ?? 0) + e.xpEarned);
  }
  return [...xpMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(1, limit))
    .map(([fanId, totalLoopXP]) => ({ fanId, totalLoopXP }));
}

export function getRecentLoopEvents(limit = 50): SocialLoopEvent[] {
  return loopEvents.slice(0, Math.max(1, limit));
}
