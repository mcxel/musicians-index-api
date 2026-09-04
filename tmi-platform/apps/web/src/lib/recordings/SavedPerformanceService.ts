/**
 * SavedPerformanceService
 * Server-side CRUD + lifecycle management for saved performances.
 * ALL limits, caps, and expiry are enforced here — never client-side.
 *
 * Certification: L1 IMPLEMENTED (needs Prisma migration to be L2+)
 */

import prisma from "@/lib/prisma";
import {
  ANNUAL_LIMIT,
  ERROR_CODES,
  capDuration,
  computeExpiresAt,
  computeRenewalExpiresAt,
  rollingWindowStart,
  isExpiringSoon,
  daysUntilExpiry,
} from "./SavedPerformancePolicy";
import type { Role } from "@prisma/client";

// ─── Result types ─────────────────────────────────────────────────────────────

export type SaveResult =
  | { ok: true; record: SavedPerformanceRow }
  | { ok: false; error: string };

export type RenewResult =
  | { ok: true; record: SavedPerformanceRow }
  | { ok: false; error: string };

export type DeleteResult = { ok: true } | { ok: false; error: string };

export interface SavedPerformanceRow {
  id: string;
  ownerId: string;
  liveSessionId: string | null;
  role: Role;
  title: string;
  durationSeconds: number;
  storageBytes: bigint;
  status: string;
  createdAt: Date;
  expiresAt: Date;
  renewalCount: number;
  storageProviderKey: string;
  derivedAssetKeys: string | null;
  transcodingCostCents: number;
  deliveryCostCents: number;
  /** Computed helpers (not DB columns) */
  daysRemaining?: number;
  isExpiringSoon?: boolean;
}

export interface CreateSaveInput {
  userId: string;
  liveSessionId?: string | null;
  role: Role;
  title: string;
  durationSeconds: number;
  storageProviderKey: string;
  storageBytes?: bigint;
  transcodingCostCents?: number;
  deliveryCostCents?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function enrichRow(row: SavedPerformanceRow): SavedPerformanceRow {
  return {
    ...row,
    daysRemaining: daysUntilExpiry(row.expiresAt),
    isExpiringSoon: isExpiringSoon(row.expiresAt),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Check how many saves the user has created in the rolling 12-month window.
 */
export async function checkAnnualLimit(userId: string): Promise<{
  count: number;
  remaining: number;
  limitReached: boolean;
}> {
  const since = rollingWindowStart();
  const count = await prisma.savedPerformance.count({
    where: {
      ownerId: userId,
      status: { not: "DELETED" },
      createdAt: { gte: since },
    },
  });
  return {
    count,
    remaining: Math.max(0, ANNUAL_LIMIT - count),
    limitReached: count >= ANNUAL_LIMIT,
  };
}

/**
 * Create a new saved performance record.
 * Enforces: annual limit, duration cap.
 */
export async function createSave(input: CreateSaveInput): Promise<SaveResult> {
  // Enforce annual limit
  const { limitReached } = await checkAnnualLimit(input.userId);
  if (limitReached) {
    return { ok: false, error: ERROR_CODES.ANNUAL_LIMIT_REACHED };
  }

  const cappedDuration = capDuration(input.durationSeconds);
  const expiresAt = computeExpiresAt();

  const record = await prisma.savedPerformance.create({
    data: {
      ownerId: input.userId,
      // Schema requires string; empty string = no live session (nullable on read via SavedPerformanceRow)
      liveSessionId: input.liveSessionId ?? "",
      role: input.role,
      title: input.title,
      durationSeconds: cappedDuration,
      storageBytes: input.storageBytes ?? BigInt(0),
      status: "ACTIVE",
      expiresAt,
      renewalCount: 0,
      storageProviderKey: input.storageProviderKey,
      transcodingCostCents: input.transcodingCostCents ?? 0,
      deliveryCostCents: input.deliveryCostCents ?? 0,
    },
  });

  return { ok: true, record: enrichRow(record as unknown as SavedPerformanceRow) };
}

/**
 * Get a user's full library (all non-DELETED records).
 */
export async function getLibrary(userId: string): Promise<SavedPerformanceRow[]> {
  const rows = await prisma.savedPerformance.findMany({
    where: {
      ownerId: userId,
      status: { not: "DELETED" },
    },
    orderBy: { createdAt: "desc" },
  });
  return (rows as unknown as SavedPerformanceRow[]).map(enrichRow);
}

/**
 * Get a single save record.
 */
export async function getSave(
  userId: string,
  id: string,
): Promise<SavedPerformanceRow | null> {
  const row = await prisma.savedPerformance.findFirst({
    where: { id, ownerId: userId },
  });
  if (!row) return null;
  return enrichRow(row as unknown as SavedPerformanceRow);
}

/**
 * Renew a saved performance — extends expiresAt by RENEWAL_EXTENSION_DAYS.
 * Same storage asset, no copy created.
 */
export async function renewSave(userId: string, id: string): Promise<RenewResult> {
  const existing = await prisma.savedPerformance.findFirst({
    where: { id, ownerId: userId },
  });

  if (!existing) {
    return { ok: false, error: ERROR_CODES.NOT_FOUND };
  }
  if (
    existing.status === "DELETED" ||
    existing.status === "DELETION_PENDING"
  ) {
    return { ok: false, error: ERROR_CODES.ALREADY_DELETED };
  }

  const updated = await prisma.savedPerformance.update({
    where: { id },
    data: {
      expiresAt: computeRenewalExpiresAt(),
      status: "RENEWED",
      renewalCount: { increment: 1 },
    },
  });

  return { ok: true, record: enrichRow(updated as unknown as SavedPerformanceRow) };
}

/**
 * Mark a record for deletion (DELETION_PENDING).
 * Physical deletion happens via sweep or background job.
 */
export async function deleteSave(userId: string, id: string): Promise<DeleteResult> {
  const existing = await prisma.savedPerformance.findFirst({
    where: { id, ownerId: userId },
  });

  if (!existing) {
    return { ok: false, error: ERROR_CODES.NOT_FOUND };
  }
  if (existing.status === "DELETED") {
    return { ok: false, error: ERROR_CODES.ALREADY_DELETED };
  }

  await prisma.savedPerformance.update({
    where: { id },
    data: { status: "DELETION_PENDING" },
  });

  return { ok: true };
}

/**
 * Sweep expired records: ACTIVE/EXPIRING_SOON past expiresAt → DELETION_PENDING.
 * Marks DELETION_PENDING → DELETED.
 * Returns counts for ops telemetry.
 */
export async function sweepExpired(): Promise<{
  markedForDeletion: number;
  deleted: number;
}> {
  const now = new Date();

  // Step 1: mark expired ACTIVE/EXPIRING_SOON as DELETION_PENDING
  const marked = await prisma.savedPerformance.updateMany({
    where: {
      status: { in: ["ACTIVE", "EXPIRING_SOON", "RENEWED"] },
      expiresAt: { lt: now },
    },
    data: { status: "DELETION_PENDING" },
  });

  // Step 2: mark DELETION_PENDING as DELETED
  const deleted = await prisma.savedPerformance.updateMany({
    where: { status: "DELETION_PENDING" },
    data: { status: "DELETED" },
  });

  return {
    markedForDeletion: marked.count,
    deleted: deleted.count,
  };
}

/**
 * Update status of records nearing expiry to EXPIRING_SOON.
 */
export async function markExpiringSoon(): Promise<number> {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const result = await prisma.savedPerformance.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: thirtyDaysFromNow, gt: new Date() },
    },
    data: { status: "EXPIRING_SOON" },
  });

  return result.count;
}

/**
 * Aggregate telemetry for ops monitoring.
 */
export async function getTelemetry(): Promise<{
  totalActive: number;
  totalExpiringSoon: number;
  totalPendingDeletion: number;
  totalDeleted: number;
  annualLimitReached: number;
}> {
  const [active, expiringSoon, pendingDeletion, deleted] = await Promise.all([
    prisma.savedPerformance.count({ where: { status: "ACTIVE" } }),
    prisma.savedPerformance.count({ where: { status: "EXPIRING_SOON" } }),
    prisma.savedPerformance.count({ where: { status: "DELETION_PENDING" } }),
    prisma.savedPerformance.count({ where: { status: "DELETED" } }),
  ]);

  const since = rollingWindowStart();
  const usersAtLimit = await prisma.savedPerformance.groupBy({
    by: ["ownerId"],
    _count: true,
    where: {
      status: { not: "DELETED" },
      createdAt: { gte: since },
    },
    having: {
      ownerId: { _count: { gte: ANNUAL_LIMIT } },
    },
  });

  return {
    totalActive: active,
    totalExpiringSoon: expiringSoon,
    totalPendingDeletion: pendingDeletion,
    totalDeleted: deleted,
    annualLimitReached: usersAtLimit.length,
  };
}
