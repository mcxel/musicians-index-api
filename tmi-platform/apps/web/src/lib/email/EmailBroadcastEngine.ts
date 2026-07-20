/**
 * EmailBroadcastEngine — sends system-wide emails to targeted role/tier groups.
 * Uses TMIEmailSystem.sendEmail under the hood.
 * Role + tier targeting; never sends to unsubscribed users.
 *
 * Target groups:
 *   "ADMIN"   — users with role ADMIN or STAFF
 *   "TEAM"    — users with role WRITER or with isTeam flag
 *   "DIAMOND" — users with tier diamond, platinum, or gold
 *   "ALL"     — every confirmed, non-unsubscribed user
 *
 * Was backed by a 2-entry SEED_USERS array — a real "ALL" broadcast would
 * have only ever reached those 2 hardcoded addresses, never real users.
 * Rewired to a real Prisma query (2026-07-19), excluding isQA test accounts
 * and suspended/banned accounts (see ModerationEngine).
 */

import prisma from "@/lib/prisma";
import { sendEmail, type EmailType } from "@/lib/email/TMIEmailSystem";
import { isUnsubscribed } from "@/lib/email/unsubscribeStore";

export type BroadcastTarget = "ADMIN" | "TEAM" | "DIAMOND" | "PROMOTER" | "SPONSOR" | "ADVERTISER" | "ALL";

export interface BroadcastUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tier?: string;
}

export interface BroadcastResult {
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
  recipientCount: number;
}

const TARGET_ROLES: Record<Exclude<BroadcastTarget, "ALL" | "DIAMOND">, string[]> = {
  ADMIN: ["ADMIN", "STAFF"],
  TEAM: ["STAFF", "WRITER"],
  PROMOTER: ["PROMOTER"],
  SPONSOR: ["SPONSOR"],
  ADVERTISER: ["ADVERTISER"],
};

async function fetchTargetUsers(targets: BroadcastTarget[]): Promise<BroadcastUser[]> {
  const roleSet = new Set<string>();
  let includeDiamond = false;
  for (const t of targets) {
    if (t === "ALL") { roleSet.clear(); includeDiamond = false; break; }
    if (t === "DIAMOND") { includeDiamond = true; continue; }
    TARGET_ROLES[t]?.forEach((r) => roleSet.add(r));
  }
  const all = targets.includes("ALL");

  const users = await prisma.user.findMany({
    where: {
      isQA: false,
      accountStatus: "active",
      email: { not: null },
      ...(all
        ? {}
        : {
            OR: [
              ...(roleSet.size > 0 ? [{ role: { in: [...roleSet] as any } }] : []),
              ...(includeDiamond ? [{ tier: { in: ["DIAMOND", "PLATINUM", "GOLD"] } }] : []),
            ],
          }),
    },
    select: { id: true, email: true, displayName: true, name: true, role: true, tier: true },
    take: 50_000, // Resend Pro plan ceiling — see /admin/integrations for real limits
  });

  return users
    .filter((u): u is typeof u & { email: string } => !!u.email)
    .map((u) => ({ id: u.id, email: u.email, name: u.displayName ?? u.name ?? "there", role: u.role, tier: u.tier?.toLowerCase() }));
}

export async function sendBroadcast(
  type: EmailType,
  targets: BroadcastTarget[],
  data: Record<string, unknown> = {},
): Promise<BroadcastResult> {
  const users = await fetchTargetUsers(targets);
  const result: BroadcastResult = { sent: 0, skipped: 0, failed: 0, errors: [], recipientCount: users.length };

  for (const user of users) {
    if (isUnsubscribed(user.email)) {
      result.skipped++;
      continue;
    }
    try {
      await sendEmail({
        to: user.email,
        type,
        data: { name: user.name, ...data },
      });
      result.sent++;
    } catch (err) {
      result.failed++;
      result.errors.push(`${user.email}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}

/**
 * Convenience: blast welcome_diamond to all diamond/platinum/gold users.
 * Called after a user upgrades their tier.
 */
export async function sendDiamondWelcome(user: BroadcastUser): Promise<void> {
  if (isUnsubscribed(user.email)) return;
  await sendEmail({ to: user.email, type: "welcome_diamond", data: { name: user.name } });
}

/**
 * Convenience: send the weekly digest to all users.
 */
export async function sendWeeklyDigest(data: Record<string, unknown>): Promise<BroadcastResult> {
  return sendBroadcast("weekly_digest", ["ALL"], data);
}

/**
 * Convenience: magazine drop alert.
 */
export async function sendMagazineDrop(issueTitle: string, issueUrl: string): Promise<BroadcastResult> {
  return sendBroadcast("magazine_drop", ["ALL"], { issueTitle, issueUrl });
}
