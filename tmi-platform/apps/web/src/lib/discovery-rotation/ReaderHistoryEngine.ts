// ReaderHistoryEngine
// Tracks per-reader exposure to make discovery personal.
// Avoids serving same artist repeatedly to same reader.

export interface ReaderProfile {
  readerId: string;
  seenArtistIds: Set<string>;
  seenArticleIds: Set<string>;
  lastSeenAt: Map<string, number>; // artistId → timestamp
  sessionSeenIds: Set<string>;
}

const _profiles = new Map<string, ReaderProfile>();

export function getOrCreateProfile(readerId: string): ReaderProfile {
  if (!_profiles.has(readerId)) {
    _profiles.set(readerId, {
      readerId,
      seenArtistIds: new Set(),
      seenArticleIds: new Set(),
      lastSeenAt: new Map(),
      sessionSeenIds: new Set(),
    });
  }
  return _profiles.get(readerId)!;
}

export function recordArtistSeen(readerId: string, artistId: string): void {
  const profile = getOrCreateProfile(readerId);
  profile.seenArtistIds.add(artistId);
  profile.sessionSeenIds.add(artistId);
  profile.lastSeenAt.set(artistId, Date.now());
}

export function recordArticleSeen(readerId: string, articleId: string): void {
  const profile = getOrCreateProfile(readerId);
  profile.seenArticleIds.add(articleId);
}

export function hasSeenArtist(readerId: string, artistId: string): boolean {
  return _profiles.get(readerId)?.seenArtistIds.has(artistId) ?? false;
}

export function hasSeenInSession(readerId: string, artistId: string): boolean {
  return _profiles.get(readerId)?.sessionSeenIds.has(artistId) ?? false;
}

export function clearSession(readerId: string): void {
  const profile = _profiles.get(readerId);
  if (profile) profile.sessionSeenIds.clear();
}

export function filterUnseen<T extends { id: string }>(
  readerId: string,
  artists: T[],
  sessionOnly = false,
): T[] {
  const profile = _profiles.get(readerId);
  if (!profile) return artists;
  return artists.filter(a =>
    sessionOnly
      ? !profile.sessionSeenIds.has(a.id)
      : !profile.seenArtistIds.has(a.id),
  );
}
