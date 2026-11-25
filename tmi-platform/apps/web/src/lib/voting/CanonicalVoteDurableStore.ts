/**
 * CanonicalVoteDurableStore
 * File-backed persistence for CanonicalVotingRuntime.
 *
 * Survives process restart / refresh without requiring a production DB migration.
 * Prisma tables (CanonicalVoteSession / CanonicalVoteBallot) may replace this later;
 * do not invent a second voting authority.
 *
 * PRODUCTION_DB_MUTATIONS=NO — this store writes local JSON only.
 */

import type {
  VoteCast,
  VoteInteractionRecord,
} from "@/lib/voting/CanonicalVotingRuntime";

export type DurableVoteSnapshot = {
  version: 1;
  interactions: VoteInteractionRecord[];
  castsByVoteId: Record<string, VoteCast[]>;
  /** Finalized analytics rows for host/admin dashboards */
  analytics: QuickVoteAnalyticsRecord[];
  updatedAt: number;
};

export type QuickVoteAnalyticsRecord = {
  voteId: string;
  experienceId: string;
  roomId: string;
  hostUserId?: string;
  status: VoteInteractionRecord["status"];
  choiceLabels: string[];
  totalBallots: number;
  uniqueVoters: number;
  rejectedDuplicates: number;
  winnerChoiceId: string | null;
  openedAt: number;
  closedAt: number | null;
  finalizedAt: number | null;
  durationMs: number | null;
  /** ONLINE channel tallies only (verified digital ballots) */
  onlineTally: { choiceId: string; count: number }[];
  /** HOST_REPORTED local audience totals — never claimed as verified digital */
  hostReportedLocal?: {
    source: "HOST_REPORTED";
    totals: { choiceId: string; count: number }[];
    reportedBy: string;
    reportedAt: number;
  };
  ultimateScore?: {
    onlineNormalized: Record<string, number>;
    localNormalized: Record<string, number>;
    judgeNormalized: Record<string, number>;
    combined: Record<string, number>;
    weights: { online: number; local: number; judge: number };
    winnerChoiceId: string | null;
  };
  criteriaVersionId?: string;
};

let storePathOverride: string | null = null;
let rejectedDuplicateCount = new Map<string, number>();

function defaultPath(): string {
  // Lazy require so client bundles that accidentally import types don't crash.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  return path.join(process.cwd(), "data", "canonical-votes.json");
}

export function setCanonicalVoteStorePathForTests(path: string | null): void {
  storePathOverride = path;
}

export function getCanonicalVoteStorePath(): string {
  return storePathOverride ?? defaultPath();
}

export function bumpRejectedDuplicate(voteId: string): void {
  rejectedDuplicateCount.set(voteId, (rejectedDuplicateCount.get(voteId) ?? 0) + 1);
}

export function getRejectedDuplicateCount(voteId: string): number {
  return rejectedDuplicateCount.get(voteId) ?? 0;
}

export function resetRejectedDuplicateCountsForTests(): void {
  rejectedDuplicateCount = new Map();
}

function emptySnapshot(): DurableVoteSnapshot {
  return {
    version: 1,
    interactions: [],
    castsByVoteId: {},
    analytics: [],
    updatedAt: Date.now(),
  };
}

export function loadDurableVoteSnapshot(): DurableVoteSnapshot {
  if (typeof window !== "undefined") return emptySnapshot();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    const filePath = getCanonicalVoteStorePath();
    if (!fs.existsSync(filePath)) return emptySnapshot();
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as DurableVoteSnapshot;
    if (parsed?.version !== 1 || !Array.isArray(parsed.interactions)) {
      return emptySnapshot();
    }
    rejectedDuplicateCount = new Map(
      (parsed.analytics ?? []).map((a) => [a.voteId, a.rejectedDuplicates ?? 0]),
    );
    return {
      version: 1,
      interactions: parsed.interactions,
      castsByVoteId: parsed.castsByVoteId ?? {},
      analytics: parsed.analytics ?? [],
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return emptySnapshot();
  }
}

export function saveDurableVoteSnapshot(snapshot: DurableVoteSnapshot): void {
  if (typeof window !== "undefined") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path") as typeof import("path");
    const filePath = getCanonicalVoteStorePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const next: DurableVoteSnapshot = {
      ...snapshot,
      updatedAt: Date.now(),
    };
    fs.writeFileSync(filePath, JSON.stringify(next, null, 2), "utf-8");
  } catch {
    // Durability best-effort — hot memory remains authoritative for the process.
  }
}

export function upsertAnalyticsRecord(record: QuickVoteAnalyticsRecord): void {
  const snap = loadDurableVoteSnapshot();
  const idx = snap.analytics.findIndex((a) => a.voteId === record.voteId);
  if (idx >= 0) snap.analytics[idx] = record;
  else snap.analytics.push(record);
  saveDurableVoteSnapshot(snap);
}

export function listAnalyticsForHost(hostUserId: string): QuickVoteAnalyticsRecord[] {
  const snap = loadDurableVoteSnapshot();
  return snap.analytics.filter((a) => a.hostUserId === hostUserId);
}

export function listAnalyticsForExperience(experienceId: string): QuickVoteAnalyticsRecord[] {
  const snap = loadDurableVoteSnapshot();
  return snap.analytics.filter((a) => a.experienceId === experienceId);
}

export function listAllAnalytics(): QuickVoteAnalyticsRecord[] {
  return loadDurableVoteSnapshot().analytics;
}
