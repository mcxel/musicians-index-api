/**
 * MagazineIssueArchiveEngine
 * Archive storage, issue history, lookup, and restore helpers.
 */

export type ArchivedMagazineIssue = {
  issueId: string;
  issueTitle: string;
  metadata: Record<string, string | number | boolean>;
  archivedAtMs: number;
  archiveReason?: string;
};

export type MagazineIssueHistoryEvent = {
  issueId: string;
  event: "archived" | "restored";
  atMs: number;
  note?: string;
};

const archivedIssues = new Map<string, ArchivedMagazineIssue>();
const issueHistory: MagazineIssueHistoryEvent[] = [];

export function archiveMagazineIssueSnapshot(input: {
  issueId: string;
  issueTitle: string;
  metadata: Record<string, string | number | boolean>;
  archiveReason?: string;
}): ArchivedMagazineIssue {
  const archived: ArchivedMagazineIssue = {
    issueId: input.issueId,
    issueTitle: input.issueTitle,
    metadata: { ...input.metadata },
    archivedAtMs: Date.now(),
    archiveReason: input.archiveReason,
  };

  archivedIssues.set(archived.issueId, archived);
  issueHistory.unshift({
    issueId: archived.issueId,
    event: "archived",
    atMs: archived.archivedAtMs,
    note: input.archiveReason,
  });

  return archived;
}

export function listArchivedMagazineIssues(): ArchivedMagazineIssue[] {
  return [...archivedIssues.values()].sort((a, b) => b.archivedAtMs - a.archivedAtMs);
}

export function getArchivedMagazineIssue(issueId: string): ArchivedMagazineIssue | null {
  return archivedIssues.get(issueId) ?? null;
}

export function restoreArchivedMagazineIssue(issueId: string): ArchivedMagazineIssue {
  const archived = archivedIssues.get(issueId);
  if (!archived) throw new Error(`Archived issue ${issueId} not found`);

  issueHistory.unshift({
    issueId,
    event: "restored",
    atMs: Date.now(),
  });

  return {
    ...archived,
    metadata: { ...archived.metadata },
  };
}

export function listMagazineIssueHistory(issueId?: string): MagazineIssueHistoryEvent[] {
  if (!issueId) return [...issueHistory];
  return issueHistory.filter((event) => event.issueId === issueId);
}
