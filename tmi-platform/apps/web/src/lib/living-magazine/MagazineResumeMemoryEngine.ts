// MagazineResumeMemoryEngine
// Reader position persistence — resume reading from last page on return.

export interface ReadingPosition {
  readerId: string;
  issueId: string;
  spreadIndex: number;
  lastSeenAt: string;
  completedSpreads: number[];
  bookmarkedSpreads: number[];
  readingProgressPct: number;  // 0–100
}

const _memory = new Map<string, ReadingPosition>();

function posKey(readerId: string, issueId: string): string {
  return `${readerId}::${issueId}`;
}

export function savePosition(
  readerId: string,
  issueId: string,
  spreadIndex: number,
  totalSpreads: number,
): void {
  const key = posKey(readerId, issueId);
  const existing = _memory.get(key);
  const completedSpreads = existing?.completedSpreads ?? [];
  if (!completedSpreads.includes(spreadIndex)) {
    completedSpreads.push(spreadIndex);
  }
  _memory.set(key, {
    readerId,
    issueId,
    spreadIndex,
    lastSeenAt: new Date().toISOString(),
    completedSpreads,
    bookmarkedSpreads: existing?.bookmarkedSpreads ?? [],
    readingProgressPct: Math.round((completedSpreads.length / totalSpreads) * 100),
  });
}

export function getPosition(readerId: string, issueId: string): ReadingPosition | null {
  return _memory.get(posKey(readerId, issueId)) ?? null;
}

export function bookmark(readerId: string, issueId: string, spreadIndex: number): void {
  const key = posKey(readerId, issueId);
  const pos = _memory.get(key);
  if (!pos) return;
  const bookmarkedSpreads = pos.bookmarkedSpreads.includes(spreadIndex)
    ? pos.bookmarkedSpreads
    : [...pos.bookmarkedSpreads, spreadIndex];
  _memory.set(key, { ...pos, bookmarkedSpreads });
}

export function clearPosition(readerId: string, issueId: string): void {
  _memory.delete(posKey(readerId, issueId));
}
