import prisma from "@/lib/prisma";
import { SavedPerformanceStatus, Role } from "@prisma/client";
import {
  SAVED_PERFORMANCE_POLICY,
  SAVED_PERFORMANCE_ERROR_CODES,
  EXPIRY_WARNING_DAYS,
} from "./SavedPerformancePolicy";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SaveRequest {
  ownerId: string;
  liveSessionId: string;
  role: Role;
  title: string;
  durationSeconds: number;
  storageBytes?: bigint;
  storageProviderKey?: string;
  derivedAssetKeys?: string[];
  transcodingCostCents?: number;
}

export interface SaveResult {
  ok: boolean;
  errorCode?: string;
  recordingId?: string;
}

export interface RenewResult {
  ok: boolean;
  errorCode?: string;
  newExpiresAt?: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rollingYearStart(): Date {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Count completed saves the owner has made in the rolling 12-month window.
 * Only ACTIVE / EXPIRING_SOON / RENEWED / EXPIRED / DELETION_PENDING records
 * count — failed recordings (never reach ACTIVE) do not consume a slot.
 */
export async function getAnnualSaveCount(ownerId: string): Promise<number> {
  return prisma.savedPerformance.count({
    where: {
      ownerId,
      createdAt: { gte: rollingYearStart() },
      status: {
        notIn: [SavedPerformanceStatus.DELETED],
      },
    },
  });
}

/**
 * Save a completed live performance recording.
 *
 * Server enforces:
 * - annual limit (10 per rolling 12 months)
 * - max duration cap (7 200 s / 2 h) — caller must pass the already-capped value
 */
export async function savePerformance(req: SaveRequest): Promise<SaveResult> {
  const count = await getAnnualSaveCount(req.ownerId);

  if (count >= SAVED_PERFORMANCE_POLICY.ANNUAL_LIMIT) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ANNUAL_LIMIT_REACHED };
  }

  // Enforce server-side duration cap — never store beyond allowed maximum
  const cappedDuration = Math.min(
    req.durationSeconds,
    SAVED_PERFORMANCE_POLICY.MAX_DURATION_SECONDS,
  );

  const now = new Date();
  const expiresAt = addDays(now, SAVED_PERFORMANCE_POLICY.RETENTION_DAYS);

  const record = await prisma.savedPerformance.create({
    data: {
      ownerId: req.ownerId,
      liveSessionId: req.liveSessionId,
      role: req.role,
      title: req.title,
      durationSeconds: cappedDuration,
      storageBytes: req.storageBytes ?? BigInt(0),
      storageProviderKey: req.storageProviderKey,
      derivedAssetKeys: JSON.stringify(req.derivedAssetKeys ?? []),
      transcodingCostCents: req.transcodingCostCents ?? 0,
      expiresAt,
      status: SavedPerformanceStatus.ACTIVE,
    },
  });

  const emittedStatus =
    cappedDuration < req.durationSeconds
      ? SAVED_PERFORMANCE_ERROR_CODES.MAX_DURATION_REACHED
      : undefined;

  return { ok: true, recordingId: record.id, errorCode: emittedStatus };
}

/**
 * Renew a saved performance — extends expiresAt by RENEWAL_EXTENSION_DAYS.
 * Does NOT create a new storage object.
 */
export async function renewPerformance(
  ownerId: string,
  recordingId: string,
): Promise<RenewResult> {
  const record = await prisma.savedPerformance.findUnique({
    where: { id: recordingId },
  });

  if (!record) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.NOT_FOUND };
  }
  if (record.ownerId !== ownerId) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.NOT_FOUND };
  }
  if (
    record.status === SavedPerformanceStatus.DELETED ||
    record.status === SavedPerformanceStatus.DELETION_PENDING
  ) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ALREADY_DELETED };
  }

  // Extend from current expiresAt (so partial-window time is not lost)
  const newExpiresAt = addDays(
    record.expiresAt,
    SAVED_PERFORMANCE_POLICY.RENEWAL_EXTENSION_DAYS,
  );

  await prisma.savedPerformance.update({
    where: { id: recordingId },
    data: {
      expiresAt: newExpiresAt,
      renewalCount: { increment: 1 },
      status: SavedPerformanceStatus.RENEWED,
    },
  });

  return { ok: true, newExpiresAt };
}

/** Immediate user-initiated deletion. */
export async function deletePerformance(
  ownerId: string,
  recordingId: string,
): Promise<{ ok: boolean; errorCode?: string }> {
  const record = await prisma.savedPerformance.findUnique({
    where: { id: recordingId },
  });

  if (!record || record.ownerId !== ownerId) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.NOT_FOUND };
  }
  if (record.status === SavedPerformanceStatus.DELETED) {
    return { ok: false, errorCode: SAVED_PERFORMANCE_ERROR_CODES.ALREADY_DELETED };
  }

  await prisma.savedPerformance.update({
    where: { id: recordingId },
    data: { status: SavedPerformanceStatus.DELETION_PENDING },
  });

  return { ok: true };
}

/** List a user's saved performances, newest first. */
export async function listSavedPerformances(ownerId: string) {
  const records = await prisma.savedPerformance.findMany({
    where: {
      ownerId,
      status: {
        notIn: [SavedPerformanceStatus.DELETED],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return records.map((r) => {
    const msRemaining = r.expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86_400_000));
    return {
      ...r,
      derivedAssetKeys: JSON.parse(r.derivedAssetKeys) as string[],
      daysRemaining,
    };
  });
}

/**
 * Scheduled job — run daily.
 * 1. Marks recordings within 30 / 7 / 1 days of expiry as EXPIRING_SOON and fires notifications.
 * 2. Moves expired ACTIVE/EXPIRING_SOON records to DELETION_PENDING.
 */
export async function runExpirationSweep(): Promise<{
  markedExpiringSoon: number;
  markedDeletionPending: number;
}> {
  const now = new Date();

  // Mark EXPIRING_SOON for records within 30 days but not yet expired
  const soonThreshold = addDays(now, 30);
  const expiringSoonResult = await prisma.savedPerformance.updateMany({
    where: {
      status: SavedPerformanceStatus.ACTIVE,
      expiresAt: { lte: soonThreshold, gt: now },
    },
    data: { status: SavedPerformanceStatus.EXPIRING_SOON },
  });

  // Move expired records to DELETION_PENDING
  const pendingResult = await prisma.savedPerformance.updateMany({
    where: {
      status: {
        in: [SavedPerformanceStatus.ACTIVE, SavedPerformanceStatus.EXPIRING_SOON],
      },
      expiresAt: { lte: now },
    },
    data: { status: SavedPerformanceStatus.DELETION_PENDING },
  });

  return {
    markedExpiringSoon: expiringSoonResult.count,
    markedDeletionPending: pendingResult.count,
  };
}

/**
 * Scheduled job — run after runExpirationSweep.
 * Purges DELETION_PENDING records from storage (stub — caller supplies storage driver).
 * Updates status to DELETED after purge.
 */
export async function purgeDeletedRecordings(
  storageDeleter: (key: string) => Promise<void>,
): Promise<number> {
  const pending = await prisma.savedPerformance.findMany({
    where: { status: SavedPerformanceStatus.DELETION_PENDING },
    select: { id: true, storageProviderKey: true, derivedAssetKeys: true },
  });

  let purged = 0;
  for (const record of pending) {
    const keys = JSON.parse(record.derivedAssetKeys) as string[];
    if (record.storageProviderKey) {
      await storageDeleter(record.storageProviderKey);
    }
    for (const key of keys) {
      await storageDeleter(key);
    }
    await prisma.savedPerformance.update({
      where: { id: record.id },
      data: { status: SavedPerformanceStatus.DELETED, storageProviderKey: null },
    });
    purged++;
  }

  return purged;
}

// ─── Cost telemetry ───────────────────────────────────────────────────────────

/** Aggregate storage and cost data for capacity planning — not tier-gated. */
export async function getSavedPerformanceTelemetry() {
  const [totalCount, avgDuration, storageSum, costSum, renewalSum, deletionCount] =
    await Promise.all([
      prisma.savedPerformance.count(),
      prisma.savedPerformance.aggregate({ _avg: { durationSeconds: true } }),
      prisma.savedPerformance.aggregate({ _sum: { storageBytes: true } }),
      prisma.savedPerformance.aggregate({
        _sum: { transcodingCostCents: true, deliveryCostCents: true },
      }),
      prisma.savedPerformance.aggregate({ _sum: { renewalCount: true } }),
      prisma.savedPerformance.count({
        where: {
          status: {
            in: [SavedPerformanceStatus.DELETED, SavedPerformanceStatus.DELETION_PENDING],
          },
        },
      }),
    ]);

  return {
    totalSavedCount: totalCount,
    averageDurationSeconds: avgDuration._avg.durationSeconds ?? 0,
    totalStorageBytes: storageSum._sum.storageBytes ?? BigInt(0),
    totalTranscodingCostCents: costSum._sum.transcodingCostCents ?? 0,
    totalDeliveryCostCents: costSum._sum.deliveryCostCents ?? 0,
    totalRenewals: renewalSum._sum.renewalCount ?? 0,
    deletionCount,
  };
}

// Re-export for convenience in API routes
export { EXPIRY_WARNING_DAYS, SAVED_PERFORMANCE_POLICY, SAVED_PERFORMANCE_ERROR_CODES };
