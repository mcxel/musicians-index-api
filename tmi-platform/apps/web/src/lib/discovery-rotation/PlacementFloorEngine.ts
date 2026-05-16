// PlacementFloorEngine
// Guarantees every eligible artist appears within a reasonable issue cycle.
// Prevents artists from being buried "in the thousands."

export interface PlacementFloorRecord {
  artistId: string;
  lastIssueSurfaced?: number;
  totalIssues: number;
  consecutivelySkipped: number;
}

const FLOOR_MAX_SKIP_ISSUES = 6; // must be surfaced within this many issues
const _records = new Map<string, PlacementFloorRecord>();

export function trackArtist(artistId: string): PlacementFloorRecord {
  if (!_records.has(artistId)) {
    _records.set(artistId, { artistId, totalIssues: 0, consecutivelySkipped: 0 });
  }
  return _records.get(artistId)!;
}

export function recordSurfaced(artistId: string, issueNumber: number): void {
  const record = trackArtist(artistId);
  record.lastIssueSurfaced = issueNumber;
  record.consecutivelySkipped = 0;
}

export function recordSkipped(artistId: string): void {
  const record = trackArtist(artistId);
  record.consecutivelySkipped++;
  record.totalIssues++;
}

export function isFloorDue(artistId: string): boolean {
  const record = _records.get(artistId);
  if (!record) return false;
  return record.consecutivelySkipped >= FLOOR_MAX_SKIP_ISSUES;
}

// Returns artists who MUST be surfaced this issue due to floor guarantee
export function getFloorDueArtists<T extends { id: string }>(artists: T[]): T[] {
  return artists.filter(a => isFloorDue(a.id));
}

// Boost weight for overdue artists
export function getFloorBoostWeight(artistId: string): number {
  const record = _records.get(artistId);
  if (!record) return 1;
  // Exponential boost after floor trigger
  if (record.consecutivelySkipped >= FLOOR_MAX_SKIP_ISSUES) {
    return 3 + (record.consecutivelySkipped - FLOOR_MAX_SKIP_ISSUES) * 0.5;
  }
  return 1;
}
