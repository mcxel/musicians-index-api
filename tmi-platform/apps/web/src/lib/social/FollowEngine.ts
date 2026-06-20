const followersMap = new Map<string, Set<string>>();

export function followUser(followerId: string, targetId: string): void {
  if (!followersMap.has(targetId)) followersMap.set(targetId, new Set());
  followersMap.get(targetId)?.add(followerId);
}

export function unfollowUser(followerId: string, targetId: string): void {
  followersMap.get(targetId)?.delete(followerId);
}

export function listFollowersForUser(targetId: string): string[] {
  return [...(followersMap.get(targetId) ?? new Set<string>())];
}

/** Who does this user follow — the reverse lookup of listFollowersForUser. */
export function listFollowingForUser(followerId: string): string[] {
  const following: string[] = [];
  for (const [targetId, followers] of followersMap) {
    if (followers.has(followerId)) following.push(targetId);
  }
  return following;
}
