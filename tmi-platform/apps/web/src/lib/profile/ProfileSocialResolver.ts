import { listFollowersForUser } from "@/lib/social/FollowEngine";

export function getProfileSocialSummary(slug: string) {
  const followers = listFollowersForUser(slug);
  return {
    followers: followers.length,
    following: Math.max(0, Math.floor(followers.length * 0.6)),
    onlineFriends: Math.min(6, followers.length),
  };
}
