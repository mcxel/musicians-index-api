import { listFollowersForUser, listFollowingForUser } from "@/lib/social/FollowEngine";

export function getProfileSocialSummary(slug: string) {
  const followers = listFollowersForUser(slug);
  const following = listFollowingForUser(slug);
  return {
    followers: followers.length,
    following: following.length,
    // No real presence/online tracking exists yet for this metric — honest
    // zero rather than the previous fabricated `min(6, followers.length)`.
    onlineFriends: 0,
  };
}
