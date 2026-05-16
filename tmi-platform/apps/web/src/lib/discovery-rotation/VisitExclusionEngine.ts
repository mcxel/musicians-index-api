// VisitExclusionEngine
// One-appearance-per-visit rule.
// If reader sees Artist A once in an issue visit: do not show them again.

const _visitSeen = new Map<string, Set<string>>(); // visitId → Set<artistId>

export function startVisit(visitId: string): void {
  _visitSeen.set(visitId, new Set());
}

export function endVisit(visitId: string): void {
  _visitSeen.delete(visitId);
}

export function markSeen(visitId: string, artistId: string): void {
  if (!_visitSeen.has(visitId)) startVisit(visitId);
  _visitSeen.get(visitId)!.add(artistId);
}

export function hasBeenSeenThisVisit(visitId: string, artistId: string): boolean {
  return _visitSeen.get(visitId)?.has(artistId) ?? false;
}

export function filterVisitExclusions<T extends { id: string }>(
  visitId: string,
  artists: T[],
): T[] {
  const seen = _visitSeen.get(visitId);
  if (!seen) return artists;
  return artists.filter(a => !seen.has(a.id));
}

export function getVisitSeenCount(visitId: string): number {
  return _visitSeen.get(visitId)?.size ?? 0;
}
