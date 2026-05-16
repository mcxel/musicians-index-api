/**
 * SocialRoutingEngine
 * Route generation for all social layer surfaces:
 * fan profiles, activity feeds, follow graphs, engagement views, leaderboards.
 */

export type SocialRouteSet = {
  fanProfileRoute: string;
  activityFeedRoute: string;
  followingRoute: string;
  followersRoute: string;
  mutualsRoute: string;
  suggestedFollowsRoute: string;
  engagementRoute: (targetId: string, targetType: string) => string;
  socialLoopDashboardRoute: string;
  loopLeaderboardRoute: string;
  inviteRoute: (inviteCode: string) => string;
  shareRoute: (targetType: string, targetId: string) => string;
};

export function buildSocialRoutes(fanId: string): SocialRouteSet {
  return {
    fanProfileRoute: `/fan/${fanId}/profile`,
    activityFeedRoute: `/fan/${fanId}/activity`,
    followingRoute: `/fan/${fanId}/following`,
    followersRoute: `/fan/${fanId}/followers`,
    mutualsRoute: `/fan/${fanId}/mutuals`,
    suggestedFollowsRoute: `/fan/${fanId}/discover`,
    engagementRoute: (targetId, targetType) =>
      `/social/engagement/${targetType}/${targetId}`,
    socialLoopDashboardRoute: `/fan/${fanId}/social`,
    loopLeaderboardRoute: `/social/leaderboard`,
    inviteRoute: (inviteCode) => `/invite/fan/${inviteCode}`,
    shareRoute: (targetType, targetId) =>
      `/share/${targetType}/${targetId}`,
  };
}

export type SocialAdminRouteSet = {
  adminFeedMonitorRoute: string;
  adminGraphRoute: string;
  adminEngagementRoute: string;
  adminLoopLeaderboardRoute: string;
  adminBlockedEdgesRoute: string;
};

export function buildSocialAdminRoutes(): SocialAdminRouteSet {
  return {
    adminFeedMonitorRoute: `/admin/social/feed`,
    adminGraphRoute: `/admin/social/graph`,
    adminEngagementRoute: `/admin/social/engagement`,
    adminLoopLeaderboardRoute: `/admin/social/leaderboard`,
    adminBlockedEdgesRoute: `/admin/social/blocked`,
  };
}

export type SocialEmbedRoutes = {
  inlineFollowButton: (targetId: string, targetType: string) => string;
  inlineLikeButton: (targetId: string, targetType: string) => string;
  inlineReactionBar: (targetId: string, targetType: string) => string;
  inlineShareButton: (targetId: string, targetType: string) => string;
};

export function buildSocialEmbedRoutes(): SocialEmbedRoutes {
  return {
    inlineFollowButton: (targetId, targetType) =>
      `/social/widget/follow/${targetType}/${targetId}`,
    inlineLikeButton: (targetId, targetType) =>
      `/social/widget/like/${targetType}/${targetId}`,
    inlineReactionBar: (targetId, targetType) =>
      `/social/widget/react/${targetType}/${targetId}`,
    inlineShareButton: (targetId, targetType) =>
      `/social/widget/share/${targetType}/${targetId}`,
  };
}
