// lib/diamond/DiamondDistributionService.ts — Assign Diamond tier and deliver notifications

import { trigger } from "@/lib/mail/MailTriggerEngine";
import prisma from "@/lib/prisma";

export type DiamondTargetEntry = {
  userId: string;
  email: string;
  displayName?: string;
  reason: string;
};

export type DiamondAssignmentRecord = {
  userId: string;
  email: string;
  displayName: string;
  reason: string;
  assignedAt: number;
  emailSent: boolean;
  inAppSent: boolean;
  error?: string;
};

// Assignment history ledger — in-memory only, resets per serverless
// invocation. This is a request-scoped audit trail for the response payload,
// not the source of truth (that's User.tier in the DB, written below).
const diamondLedger: DiamondAssignmentRecord[] = [];

export async function isDiamond(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } });
  return user?.tier === 'DIAMOND';
}

export function getDiamondLedger(): DiamondAssignmentRecord[] {
  return [...diamondLedger];
}

export async function assignDiamond(
  target: DiamondTargetEntry
): Promise<DiamondAssignmentRecord> {
  const record: DiamondAssignmentRecord = {
    userId: target.userId,
    email: target.email,
    displayName: target.displayName ?? target.email,
    reason: target.reason,
    assignedAt: Date.now(),
    emailSent: false,
    inAppSent: false,
  };

  // 1. Grant tier — real DB write, matched on id OR email (mirrors the
  // userRef fallback pattern used in /api/live/go) so a caller supplying
  // only one of the two still succeeds. Never claim success without a
  // matched row — the previous in-memory version always "succeeded" and
  // sent a real "You're Diamond!" email even for a nonexistent user.
  const updated = await prisma.user.updateMany({
    where: { OR: [{ id: target.userId }, { email: target.email }] },
    data: { tier: 'DIAMOND' },
  });
  if (updated.count === 0) {
    record.error = 'user_not_found';
    diamondLedger.push(record);
    return record;
  }

  // 2. Send email
  try {
    const result = await trigger("DIAMOND_UPGRADED", {
      userId: target.userId,
      email: target.email,
      vars: {
        userName: target.displayName ?? target.email,
        ctaUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com",
        ctaLabel: "Enter the Arena",
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://themusiciansindex.com"}/api/mail/unsubscribe?userId=${target.userId}`,
      },
    });
    record.emailSent = result.sent;
    if (!result.sent) record.error = result.reason;
  } catch (err) {
    record.error = err instanceof Error ? err.message : "email_error";
  }

  // 3. In-app notification (fire-and-forget POST to internal API)
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (appUrl) {
      await fetch(`${appUrl}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: target.userId,
          type: "DIAMOND_UPGRADED",
          title: "You've been upgraded to Diamond 💎",
          body: "Your Diamond perks are now active. Enter the arena and use them now.",
          href: "/dashboard",
        }),
      });
      record.inAppSent = true;
    }
  } catch {
    // non-blocking — email is the primary channel
  }

  diamondLedger.push(record);
  return record;
}

export async function distributeToList(
  targets: DiamondTargetEntry[]
): Promise<{ assigned: number; failed: number; records: DiamondAssignmentRecord[] }> {
  const records: DiamondAssignmentRecord[] = [];
  let assigned = 0;
  let failed = 0;

  for (const target of targets) {
    const record = await assignDiamond(target);
    records.push(record);
    if (record.emailSent || record.inAppSent) {
      assigned++;
    } else {
      failed++;
    }
  }

  return { assigned, failed, records };
}
