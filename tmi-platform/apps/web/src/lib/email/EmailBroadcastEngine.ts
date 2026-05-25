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
 * NOTE: User store is in-memory for now (seed data).
 *       Replace fetchTargetUsers() with real DB query when Prisma is wired.
 */

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
}

// Seed users — replace with DB query
const SEED_USERS: BroadcastUser[] = [
  { id: "admin-1",  email: process.env.ADMIN_EMAIL ?? "admin@themusiciansindex.com",  name: "Marcel Dickens",  role: "ADMIN",      tier: "diamond" },
  { id: "team-1",   email: process.env.TEAM_EMAIL  ?? "team@themusiciansindex.com",   name: "TMI Team",        role: "STAFF",       tier: "diamond" },
];

function fetchTargetUsers(targets: BroadcastTarget[]): BroadcastUser[] {
  const all = targets.includes("ALL");
  return SEED_USERS.filter((u) => {
    if (all) return true;
    if (targets.includes("ADMIN") && (u.role === "ADMIN" || u.role === "STAFF")) return true;
    if (targets.includes("TEAM") && (u.role === "STAFF" || u.role === "WRITER")) return true;
    if (targets.includes("DIAMOND") && ["diamond", "platinum", "gold"].includes(u.tier ?? "")) return true;
    if (targets.includes("PROMOTER") && u.role === "PROMOTER") return true;
    if (targets.includes("SPONSOR") && u.role === "SPONSOR") return true;
    if (targets.includes("ADVERTISER") && u.role === "ADVERTISER") return true;
    return false;
  });
}

export async function sendBroadcast(
  type: EmailType,
  targets: BroadcastTarget[],
  data: Record<string, unknown> = {},
): Promise<BroadcastResult> {
  const users = fetchTargetUsers(targets);
  const result: BroadcastResult = { sent: 0, skipped: 0, failed: 0, errors: [] };

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
