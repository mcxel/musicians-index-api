// lib/diamond/DiamondDistributionService.ts — Assign Diamond tier and deliver notifications

import { trigger } from "@/lib/mail/MailTriggerEngine";

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

// In-memory ledger — replace with DB write in production
const diamondLedger: DiamondAssignmentRecord[] = [];

// In-memory tier store — in production this writes to User.tier in DB
const diamondUsers = new Set<string>();

export function isDiamond(userId: string): boolean {
  return diamondUsers.has(userId);
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

  // 1. Grant tier
  diamondUsers.add(target.userId);

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
