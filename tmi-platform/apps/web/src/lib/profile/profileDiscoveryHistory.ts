export interface ProfileTrail {
  ids: string[];
  index: number;
}

export function nextUnseenProfile<T extends { id: string; slug?: string }>(
  candidates: T[],
  seenIds: ReadonlySet<string>,
  visitedIds: readonly string[],
): T | null {
  const visited = new Set(visitedIds);
  return candidates.find((person) => {
    const key = person.slug?.trim() || person.id;
    return !seenIds.has(key) && !seenIds.has(person.id) && !visited.has(key) && !visited.has(person.id);
  }) ?? null;
}

export function publicProfileKey(person: { id: string; slug?: string }): string {
  return person.slug?.trim() || person.id;
}

export function moveProfileTrail(trail: ProfileTrail, direction: "previous" | "next", nextId?: string): ProfileTrail | null {
  if (direction === "previous") return trail.index > 0 ? { ...trail, index: trail.index - 1 } : null;
  if (trail.index < trail.ids.length - 1) return { ...trail, index: trail.index + 1 };
  return nextId && !trail.ids.includes(nextId)
    ? { ids: [...trail.ids, nextId], index: trail.ids.length }
    : null;
}

export const seenStorageKey = (viewerId: string) => `tmi:profile-discovery:seen:${viewerId}`;
export const trailStorageKey = (viewerId: string) => `tmi:profile-discovery:trail:${viewerId}`;

export function readSeenProfiles(viewerId: string): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(seenStorageKey(viewerId)) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function readProfileTrail(viewerId: string): ProfileTrail | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(trailStorageKey(viewerId)) ?? "null") as ProfileTrail | null;
    return value && Array.isArray(value.ids) && value.ids.every((id) => typeof id === "string") &&
      Number.isInteger(value.index) && value.index >= 0 && value.index < value.ids.length ? value : null;
  } catch {
    return null;
  }
}

export function saveProfileTrail(viewerId: string, trail: ProfileTrail): void {
  try { sessionStorage.setItem(trailStorageKey(viewerId), JSON.stringify(trail)); } catch { /* browser storage unavailable */ }
}

export function markProfileSeen(viewerId: string, profileId: string): void {
  try {
    const seen = readSeenProfiles(viewerId);
    seen.add(profileId);
    localStorage.setItem(seenStorageKey(viewerId), JSON.stringify([...seen]));
  } catch { /* seen history remains unavailable on this device */ }
}

const magazineSeenKey = (viewerId: string) => `tmi:magazine-discovery:seen:${viewerId}`;

export function readMagazineSeen(viewerId: string): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(magazineSeenKey(viewerId)) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function markMagazineSpreadSeen(viewerId: string, spreadId: string): void {
  if (!spreadId) return;
  try {
    const seen = readMagazineSeen(viewerId);
    seen.add(spreadId);
    localStorage.setItem(magazineSeenKey(viewerId), JSON.stringify([...seen]));
  } catch { /* magazine history remains unavailable on this device */ }
}

/** Unseen spreads first. When every spread was already seen, keep the original order. */
export function firstUnseenIndex<T extends { id: string }>(items: readonly T[], seenIds: ReadonlySet<string>): number | null {
  const index = items.findIndex((item) => item.id && !seenIds.has(item.id));
  return index >= 0 ? index : null;
}

export async function resolveNextPublicProfile(
  seenIds: ReadonlySet<string>,
  visitedIds: readonly string[],
  signal?: AbortSignal,
): Promise<string | null> {
  let offset = 0;
  while (offset <= 100000) {
    const response = await fetch(`/api/users/search?scope=directory&limit=30&offset=${offset}`, {
      cache: "no-store", credentials: "include", signal,
    });
    if (!response.ok) throw new Error(response.status === 401 ? "Sign in to discover profiles." : "Unable to load public profiles.");
    const page = await response.json() as { users?: Array<{ id: string; slug?: string }>; nextOffset?: number | null };
    const next = nextUnseenProfile(page.users ?? [], seenIds, visitedIds);
    if (next) return publicProfileKey(next);
    if (page.nextOffset == null || page.nextOffset <= offset) return null;
    offset = page.nextOffset;
  }
  return null;
}