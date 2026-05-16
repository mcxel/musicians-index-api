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
