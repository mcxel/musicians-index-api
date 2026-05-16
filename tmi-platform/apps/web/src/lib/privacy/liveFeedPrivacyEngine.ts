export type FeedPrivacyState = "PUBLIC LIVE" | "MODERATED LIVE" | "PRIVATE BLOCKED" | "CONSENT REQUIRED";

export type FeedVisibility = "public" | "friends-only" | "private" | "dm" | "locked-sponsor";

export type LiveFeed = {
  id: string;
  title: string;
  visibility: FeedVisibility;
  live: boolean;
  platformModerated: boolean;
  consented: boolean;
  eventBroadcast: boolean;
};

export type FeedAccessRequest = {
  feedId: string;
  actor: "admin" | "big-ace" | "mc" | "sentinel" | "viewer";
  explicitPermission?: boolean;
};

export type FeedAccessDecision = {
  allowed: boolean;
  state: FeedPrivacyState;
  reason: string;
  timestamp: number;
};

type FeedAccessLogItem = FeedAccessRequest & FeedAccessDecision;

const feedAccessLog: FeedAccessLogItem[] = [];

export function getFeedPrivacyState(feed: LiveFeed): FeedPrivacyState {
  if (feed.visibility !== "public") {
    return "PRIVATE BLOCKED";
  }

  if (!feed.consented) {
    return "CONSENT REQUIRED";
  }

  if (feed.live && feed.platformModerated && feed.eventBroadcast) {
    return "MODERATED LIVE";
  }

  return "PUBLIC LIVE";
}

export function evaluateFeedAccess(feed: LiveFeed, request: FeedAccessRequest): FeedAccessDecision {
  const state = getFeedPrivacyState(feed);

  if (feed.visibility !== "public") {
    if (!request.explicitPermission) {
      return {
        allowed: false,
        state: "PRIVATE BLOCKED",
        reason: "Private/friends-only/DM/locked sponsor feeds are blocked without explicit permission.",
        timestamp: Date.now(),
      };
    }
  }

  const allowedByFlags = feed.visibility === "public" && feed.live && feed.eventBroadcast && feed.consented;
  if (!allowedByFlags) {
    return {
      allowed: false,
      state,
      reason: "Feed is not eligible for admin monitor visibility under privacy policy.",
      timestamp: Date.now(),
    };
  }

  return {
    allowed: true,
    state: feed.platformModerated ? "MODERATED LIVE" : "PUBLIC LIVE",
    reason: "Feed access granted under privacy-safe live governance.",
    timestamp: Date.now(),
  };
}

export function requestFeedAccess(feed: LiveFeed, request: FeedAccessRequest) {
  const decision = evaluateFeedAccess(feed, request);
  feedAccessLog.unshift({ ...request, ...decision });
  if (feedAccessLog.length > 500) {
    feedAccessLog.length = 500;
  }
  return decision;
}

export function getFeedAccessLog() {
  return [...feedAccessLog];
}

export const DEFAULT_MONITOR_FEEDS: LiveFeed[] = [
  {
    id: "public-lounge",
    title: "Public Lounge Cam",
    visibility: "public",
    live: true,
    platformModerated: false,
    consented: true,
    eventBroadcast: true,
  },
  {
    id: "main-stage",
    title: "Main Stage Broadcast",
    visibility: "public",
    live: true,
    platformModerated: true,
    consented: true,
    eventBroadcast: true,
  },
  {
    id: "consent-pending",
    title: "Consent Pending Stage",
    visibility: "public",
    live: true,
    platformModerated: true,
    consented: false,
    eventBroadcast: true,
  },
  {
    id: "friends-jam",
    title: "Friends Jam Room",
    visibility: "friends-only",
    live: true,
    platformModerated: false,
    consented: true,
    eventBroadcast: false,
  },
  {
    id: "private-rehearsal",
    title: "Private Rehearsal Cam",
    visibility: "private",
    live: true,
    platformModerated: false,
    consented: false,
    eventBroadcast: false,
  },
];
