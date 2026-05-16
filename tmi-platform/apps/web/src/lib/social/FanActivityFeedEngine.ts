/**
 * FanActivityFeedEngine
 * Per-fan social activity feed: follows, votes, articles, events, rewards.
 * Powers the lounge/social rail on the fan hub.
 */

export type FanActivityEventType =
  | "fan-followed"        // fan followed an artist/venue/show
  | "fan-voted"           // fan cast a vote in a contest/battle
  | "fan-read-article"    // fan consumed a magazine article
  | "fan-attended-event"  // fan checked into a live event
  | "fan-earned-reward"   // fan unlocked a reward/achievement
  | "fan-invited"         // fan sent an invite to another fan
  | "fan-joined"          // new fan joined via referral
  | "fan-shared";         // fan shared a content item externally

export type FanActivityActor = {
  fanId: string;
  displayName: string;
};

export type FanActivitySubject = {
  subjectType: "artist" | "venue" | "article" | "event" | "reward" | "fan" | "show" | "content";
  subjectId: string;
  subjectLabel: string;
};

export type FanActivityEntry = {
  entryId: string;
  eventType: FanActivityEventType;
  actor: FanActivityActor;
  subject: FanActivitySubject;
  feedScope: "public" | "followers" | "private";
  createdAtMs: number;
  metadata?: Record<string, string | number | boolean>;
};

// --- in-memory store ---
const feed: FanActivityEntry[] = [];
let activityCounter = 0;

function makeEntry(
  eventType: FanActivityEventType,
  actor: FanActivityActor,
  subject: FanActivitySubject,
  feedScope: FanActivityEntry["feedScope"],
  metadata?: Record<string, string | number | boolean>,
): FanActivityEntry {
  const entry: FanActivityEntry = {
    entryId: `fan-activity-${++activityCounter}`,
    eventType,
    actor,
    subject,
    feedScope,
    createdAtMs: Date.now(),
    metadata,
  };
  feed.unshift(entry);
  // cap global feed at 5000
  if (feed.length > 5000) feed.splice(5000);
  return entry;
}

// --- Public write API ---

export function recordFanFollow(
  actor: FanActivityActor,
  targetId: string,
  targetLabel: string,
  targetType: "artist" | "venue" | "show",
): FanActivityEntry {
  return makeEntry(
    "fan-followed",
    actor,
    { subjectType: targetType, subjectId: targetId, subjectLabel: targetLabel },
    "public",
  );
}

export function recordFanVote(
  actor: FanActivityActor,
  contestId: string,
  contestLabel: string,
): FanActivityEntry {
  return makeEntry(
    "fan-voted",
    actor,
    { subjectType: "event", subjectId: contestId, subjectLabel: contestLabel },
    "public",
  );
}

export function recordFanArticleRead(
  actor: FanActivityActor,
  articleId: string,
  articleTitle: string,
): FanActivityEntry {
  return makeEntry(
    "fan-read-article",
    actor,
    { subjectType: "article", subjectId: articleId, subjectLabel: articleTitle },
    "followers",
  );
}

export function recordFanEventAttendance(
  actor: FanActivityActor,
  eventId: string,
  eventLabel: string,
): FanActivityEntry {
  return makeEntry(
    "fan-attended-event",
    actor,
    { subjectType: "event", subjectId: eventId, subjectLabel: eventLabel },
    "public",
  );
}

export function recordFanRewardEarned(
  actor: FanActivityActor,
  rewardId: string,
  rewardLabel: string,
): FanActivityEntry {
  return makeEntry(
    "fan-earned-reward",
    actor,
    { subjectType: "reward", subjectId: rewardId, subjectLabel: rewardLabel },
    "public",
  );
}

export function recordFanInviteSent(
  actor: FanActivityActor,
  inviteCode: string,
  targetHandle: string,
): FanActivityEntry {
  return makeEntry(
    "fan-invited",
    actor,
    { subjectType: "fan", subjectId: inviteCode, subjectLabel: targetHandle },
    "private",
  );
}

export function recordFanJoined(
  actor: FanActivityActor,
  inviterFanId: string,
  inviterName: string,
): FanActivityEntry {
  return makeEntry(
    "fan-joined",
    actor,
    { subjectType: "fan", subjectId: inviterFanId, subjectLabel: inviterName },
    "public",
  );
}

export function recordFanShare(
  actor: FanActivityActor,
  contentId: string,
  contentLabel: string,
): FanActivityEntry {
  return makeEntry(
    "fan-shared",
    actor,
    { subjectType: "content", subjectId: contentId, subjectLabel: contentLabel },
    "public",
  );
}

// --- Read API ---

export function getFanActivityFeed(
  fanId: string,
  limit = 50,
): FanActivityEntry[] {
  return feed
    .filter((e) => e.actor.fanId === fanId)
    .slice(0, Math.max(1, limit));
}

export function getPublicActivityFeed(limit = 100): FanActivityEntry[] {
  return feed
    .filter((e) => e.feedScope === "public")
    .slice(0, Math.max(1, limit));
}

export function getFollowersFeed(fanIds: string[], limit = 100): FanActivityEntry[] {
  const ids = new Set(fanIds);
  return feed
    .filter((e) => ids.has(e.actor.fanId) && e.feedScope !== "private")
    .slice(0, Math.max(1, limit));
}

export function getActivityByType(
  eventType: FanActivityEventType,
  limit = 50,
): FanActivityEntry[] {
  return feed
    .filter((e) => e.eventType === eventType)
    .slice(0, Math.max(1, limit));
}
