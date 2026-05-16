/**
 * MagazineIssueEngine
 * Issue lifecycle and metadata management for monthly issue cycles.
 */

import {
  archiveMagazineIssueSnapshot,
  restoreArchivedMagazineIssue,
} from "./MagazineIssueArchiveEngine";

export type MagazineIssueStatus = "draft" | "published" | "archived";

export type MagazineIssueMetadata = {
  issueId: string;
  issueTitle: string;
  issueMonth: number;
  issueYear: number;
  coverTheme: string;
  editorNote?: string;
  tags: string[];
  status: MagazineIssueStatus;
  createdAtMs: number;
  publishedAtMs?: number;
  archivedAtMs?: number;
};

const issues = new Map<string, MagazineIssueMetadata>();
let issueCounter = 0;

function issueKey(month: number, year: number): string {
  const monthKey = String(month).padStart(2, "0");
  return `mag-${year}-${monthKey}`;
}

function getIssueOrThrow(issueId: string): MagazineIssueMetadata {
  const issue = issues.get(issueId);
  if (!issue) throw new Error(`Issue ${issueId} not found`);
  return issue;
}

export function createMagazineIssue(input: {
  issueTitle: string;
  issueMonth: number;
  issueYear: number;
  coverTheme: string;
  editorNote?: string;
  tags?: string[];
}): MagazineIssueMetadata {
  if (input.issueMonth < 1 || input.issueMonth > 12) throw new Error("issueMonth must be 1-12");

  const issueId = `${issueKey(input.issueMonth, input.issueYear)}-${++issueCounter}`;
  const created: MagazineIssueMetadata = {
    issueId,
    issueTitle: input.issueTitle,
    issueMonth: input.issueMonth,
    issueYear: input.issueYear,
    coverTheme: input.coverTheme,
    editorNote: input.editorNote,
    tags: input.tags ?? [],
    status: "draft",
    createdAtMs: Date.now(),
  };

  issues.set(issueId, created);
  return created;
}

export function createMonthlyMagazineIssue(input?: {
  atMs?: number;
  coverTheme?: string;
  editorNote?: string;
}): MagazineIssueMetadata {
  const at = new Date(input?.atMs ?? Date.now());
  const issueMonth = at.getUTCMonth() + 1;
  const issueYear = at.getUTCFullYear();

  return createMagazineIssue({
    issueTitle: `TMI Issue ${issueYear}-${String(issueMonth).padStart(2, "0")}`,
    issueMonth,
    issueYear,
    coverTheme: input?.coverTheme ?? "neon-editorial",
    editorNote: input?.editorNote,
    tags: ["monthly", "automated", "living-issue"],
  });
}

export function publishMagazineIssue(issueId: string): MagazineIssueMetadata {
  const issue = getIssueOrThrow(issueId);
  const published: MagazineIssueMetadata = {
    ...issue,
    status: "published",
    publishedAtMs: Date.now(),
  };

  issues.set(issueId, published);
  return published;
}

export function archiveMagazineIssue(issueId: string, archiveReason?: string): MagazineIssueMetadata {
  const issue = getIssueOrThrow(issueId);
  const archived: MagazineIssueMetadata = {
    ...issue,
    status: "archived",
    archivedAtMs: Date.now(),
  };

  issues.set(issueId, archived);

  archiveMagazineIssueSnapshot({
    issueId: archived.issueId,
    issueTitle: archived.issueTitle,
    metadata: {
      issueMonth: archived.issueMonth,
      issueYear: archived.issueYear,
      coverTheme: archived.coverTheme,
      status: archived.status,
      ...(archived.editorNote ? { editorNote: archived.editorNote } : {}),
    },
    archiveReason,
  });

  return archived;
}

export function restoreMagazineIssue(issueId: string): MagazineIssueMetadata {
  const snapshot = restoreArchivedMagazineIssue(issueId);
  const existing = issues.get(issueId);

  const restored: MagazineIssueMetadata = {
    issueId: snapshot.issueId,
    issueTitle: snapshot.issueTitle,
    issueMonth:
      typeof snapshot.metadata.issueMonth === "number" ? snapshot.metadata.issueMonth : existing?.issueMonth ?? 1,
    issueYear:
      typeof snapshot.metadata.issueYear === "number" ? snapshot.metadata.issueYear : existing?.issueYear ?? new Date().getUTCFullYear(),
    coverTheme:
      typeof snapshot.metadata.coverTheme === "string" ? snapshot.metadata.coverTheme : existing?.coverTheme ?? "neon-editorial",
    editorNote:
      typeof snapshot.metadata.editorNote === "string" ? snapshot.metadata.editorNote : existing?.editorNote,
    tags: existing?.tags ?? ["restored"],
    status: "published",
    createdAtMs: existing?.createdAtMs ?? Date.now(),
    publishedAtMs: Date.now(),
  };

  issues.set(issueId, restored);
  return restored;
}

export function getMagazineIssue(issueId: string): MagazineIssueMetadata | null {
  return issues.get(issueId) ?? null;
}

export function listMagazineIssues(input?: {
  status?: MagazineIssueStatus;
  issueYear?: number;
}): MagazineIssueMetadata[] {
  let list = [...issues.values()];

  if (input?.status) list = list.filter((issue) => issue.status === input.status);
  if (input?.issueYear) list = list.filter((issue) => issue.issueYear === input.issueYear);

  return list.sort((a, b) => {
    const yearDiff = b.issueYear - a.issueYear;
    if (yearDiff !== 0) return yearDiff;
    if (a.issueMonth !== b.issueMonth) return b.issueMonth - a.issueMonth;
    return b.createdAtMs - a.createdAtMs;
  });
}
