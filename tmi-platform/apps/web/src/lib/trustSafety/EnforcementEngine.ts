import prisma from "@/lib/prisma";
import type { EnforcementLevel } from "./types";

export type ApplyReporterFrictionInput = {
  caseDbId: string;
  caseId: string;
  reporterId: string;
  accusedId: string;
  roomId?: string | null;
  blockImmediate?: boolean;
  /** Freeze payment requests from accused → reporter when payment hooks exist later. */
  freezePayments?: boolean;
  roomRejoinBlock?: boolean;
  level?: EnforcementLevel;
};

export type ReporterProtectionView = {
  caseId: string;
  reporterId: string;
  accusedId: string;
  hideContent: boolean;
  blockDms: boolean;
  freezePayments: boolean;
  roomRejoinBlock: boolean;
  roomId: string | null;
};

/**
 * Enforcement ladder — Level 1 friction for the reporter path is implemented.
 * Levels 2–4 are typed and partially stubbed (restrict_rejoin / remove);
 * permanent ban stays human-only via ModerationEngine.applyAdminAction.
 */
export async function applyReporterFriction(
  input: ApplyReporterFrictionInput,
): Promise<ReporterProtectionView> {
  const level: EnforcementLevel = input.level ?? 1;
  const hideContent = level >= 1;
  const blockDms = Boolean(input.blockImmediate) || level >= 1;
  const freezePayments = Boolean(input.freezePayments);
  const roomRejoinBlock = Boolean(input.roomRejoinBlock) || level >= 2;

  const row = await prisma.trustSafetyProtection.upsert({
    where: {
      reporterId_accusedId_roomId: {
        reporterId: input.reporterId,
        accusedId: input.accusedId,
        roomId: input.roomId ?? "",
      },
    },
    create: {
      caseDbId: input.caseDbId,
      caseId: input.caseId,
      reporterId: input.reporterId,
      accusedId: input.accusedId,
      hideContent,
      blockDms,
      freezePayments,
      roomRejoinBlock,
      roomId: input.roomId ?? "",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {
      caseDbId: input.caseDbId,
      caseId: input.caseId,
      hideContent,
      blockDms: blockDms || undefined,
      freezePayments: freezePayments || undefined,
      roomRejoinBlock: roomRejoinBlock || undefined,
    },
  });

  return {
    caseId: row.caseId,
    reporterId: row.reporterId,
    accusedId: row.accusedId,
    hideContent: row.hideContent,
    blockDms: row.blockDms,
    freezePayments: row.freezePayments,
    roomRejoinBlock: row.roomRejoinBlock,
    roomId: row.roomId || null,
  };
}

export async function isContentHiddenForReporter(
  reporterId: string,
  accusedId: string,
): Promise<boolean> {
  const row = await prisma.trustSafetyProtection.findFirst({
    where: { reporterId, accusedId, hideContent: true },
  });
  return Boolean(row);
}

export async function isDmBlocked(reporterId: string, accusedId: string): Promise<boolean> {
  const row = await prisma.trustSafetyProtection.findFirst({
    where: {
      OR: [
        { reporterId, accusedId, blockDms: true },
        { reporterId: accusedId, accusedId: reporterId, blockDms: true },
      ],
    },
  });
  return Boolean(row);
}

/** Prevent immediate re-entry after host remove / restrict. */
export async function isRoomRejoinBlocked(
  userId: string,
  roomId: string,
): Promise<boolean> {
  const row = await prisma.trustSafetyProtection.findFirst({
    where: {
      accusedId: userId,
      roomId,
      roomRejoinBlock: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
  return Boolean(row);
}

export async function listProtectionsForReporter(reporterId: string) {
  return prisma.trustSafetyProtection.findMany({
    where: { reporterId },
    orderBy: { createdAt: "desc" },
  });
}
