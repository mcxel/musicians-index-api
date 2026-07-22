import prisma from '@/lib/prisma';

/**
 * Real trust & safety enforcement, wiring the pre-existing (previously
 * unused) Report/ModerationAction Prisma models to actual account
 * consequences. Default policy (documented here so it's easy to tune —
 * change the constants, not the logic):
 *
 *   - Severe categories auto-suspend the target IMMEDIATELY (protects other
 *     users fast) but NEVER auto-ban permanently — that always requires a
 *     human to confirm in the admin queue. A wrongly-severe auto-suspend is
 *     recoverable; a wrongly-issued permanent ban on an unverified report
 *     is not, so the system never takes that step by itself.
 *   - Lower-severity categories accumulate as strikes. Reaching the strike
 *     threshold within the rolling window triggers the same temporary
 *     auto-suspend-pending-review — "a couple chances" before anything
 *     happens, per direction.
 *   - Every automatic action is a real, visible ModerationAction row
 *     (performedBy: 'system') so a human can reverse it in the queue.
 */

export type ReportCategory =
  | 'violence' | 'self_harm' | 'csam' | 'threats'      // → severity p1, immediate auto-suspend
  | 'harassment' | 'hate_speech' | 'sexual_content'    // → severity p2, strike
  | 'spam' | 'impersonation' | 'scam'                  // → severity p3, strike
  | 'other';                                            // → severity p4, logged only

const SEVERE_CATEGORIES: ReportCategory[] = ['violence', 'self_harm', 'csam', 'threats'];
const STRIKE_CATEGORIES: ReportCategory[] = ['harassment', 'hate_speech', 'sexual_content', 'spam', 'impersonation', 'scam'];

const CATEGORY_SEVERITY: Record<ReportCategory, 'p1' | 'p2' | 'p3' | 'p4'> = {
  violence: 'p1', self_harm: 'p1', csam: 'p1', threats: 'p1',
  harassment: 'p2', hate_speech: 'p2', sexual_content: 'p2',
  spam: 'p3', impersonation: 'p3', scam: 'p3',
  other: 'p4',
};

// Tunable policy constants — "a couple chances" per direction (2026-07-19).
export const STRIKE_THRESHOLD = 3;
export const STRIKE_WINDOW_DAYS = 90;
export const AUTO_SUSPEND_HOLD_DAYS = 7; // how long an auto-suspend lasts before it needs human renewal

export interface SubmitReportInput {
  reporterId: string;
  targetType: 'user' | 'room' | 'content' | 'message';
  targetId: string;
  category: ReportCategory;
  detail?: string;
}

export interface SubmitReportResult {
  reportId: string;
  severity: string;
  autoActionTaken: 'suspended' | 'strike_recorded' | 'logged';
  strikeCount?: number;
}

export async function submitReport(input: SubmitReportInput): Promise<SubmitReportResult> {
  const severity = CATEGORY_SEVERITY[input.category];

  const report = await prisma.report.create({
    data: {
      reporterId: input.reporterId,
      targetType: input.targetType,
      targetId: input.targetId,
      category: input.category,
      detail: input.detail,
      severity,
      status: 'pending',
    },
  });

  // Only user-targeted reports can trigger account-level enforcement.
  if (input.targetType !== 'user') {
    return { reportId: report.id, severity, autoActionTaken: 'logged' };
  }

  if (SEVERE_CATEGORIES.includes(input.category)) {
    await autoSuspend(input.targetId, `Auto-suspended pending review: ${input.category} report`, report.id);
    return { reportId: report.id, severity, autoActionTaken: 'suspended' };
  }

  if (STRIKE_CATEGORIES.includes(input.category)) {
    await prisma.moderationAction.create({
      data: {
        targetUserId: input.targetId,
        actionType: 'strike',
        reason: input.category,
        performedBy: 'system',
        reportId: report.id,
      },
    });
    const strikeCount = await getActiveStrikeCount(input.targetId);
    if (strikeCount >= STRIKE_THRESHOLD) {
      await autoSuspend(input.targetId, `Auto-suspended: ${strikeCount} strikes within ${STRIKE_WINDOW_DAYS} days`, report.id);
      return { reportId: report.id, severity, autoActionTaken: 'suspended', strikeCount };
    }
    return { reportId: report.id, severity, autoActionTaken: 'strike_recorded', strikeCount };
  }

  return { reportId: report.id, severity, autoActionTaken: 'logged' };
}

export async function getActiveStrikeCount(userId: string): Promise<number> {
  const windowStart = new Date(Date.now() - STRIKE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return prisma.moderationAction.count({
    where: { targetUserId: userId, actionType: 'strike', createdAt: { gte: windowStart } },
  });
}

async function autoSuspend(userId: string, reason: string, reportId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + AUTO_SUSPEND_HOLD_DAYS * 24 * 60 * 60 * 1000);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'suspended', accountStatusReason: reason, accountStatusExpiresAt: expiresAt },
    }),
    prisma.moderationAction.create({
      data: {
        targetUserId: userId,
        actionType: 'auto_suspend',
        reason,
        performedBy: 'system',
        reportId,
        duration: AUTO_SUSPEND_HOLD_DAYS * 24 * 60,
        expiresAt,
      },
    }),
  ]);
}

/**
 * Admin-only actions — a human confirming, reversing, or escalating.
 * `ban` is the ONLY action that can be permanent, and it is never issued
 * automatically — only through this function, only by an admin.
 */
export async function applyAdminAction(params: {
  targetUserId: string;
  actionType: 'clear' | 'warn' | 'suspend' | 'ban';
  reason: string;
  performedBy: string;
  reportId?: string;
  durationDays?: number;
}): Promise<void> {
  const { targetUserId, actionType, reason, performedBy, reportId, durationDays } = params;

  const statusUpdate: { accountStatus: string; accountStatusReason: string | null; accountStatusExpiresAt: Date | null } =
    actionType === 'clear' || actionType === 'warn'
      ? { accountStatus: 'active', accountStatusReason: null, accountStatusExpiresAt: null }
      : actionType === 'ban'
        ? { accountStatus: 'banned', accountStatusReason: reason, accountStatusExpiresAt: null }
        : { accountStatus: 'suspended', accountStatusReason: reason, accountStatusExpiresAt: durationDays ? new Date(Date.now() + durationDays * 86400000) : null };

  await prisma.$transaction([
    prisma.user.update({ where: { id: targetUserId }, data: statusUpdate }),
    prisma.moderationAction.create({
      data: {
        targetUserId,
        actionType,
        reason,
        performedBy,
        reportId,
        duration: durationDays ? durationDays * 24 * 60 : null,
        expiresAt: statusUpdate.accountStatusExpiresAt,
      },
    }),
    ...(reportId ? [prisma.report.update({ where: { id: reportId }, data: { status: 'reviewed', reviewedBy: performedBy, reviewedAt: new Date() } })] : []),
  ]);
}

export async function getAccountStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accountStatus: true, accountStatusReason: true, accountStatusExpiresAt: true },
    });
    if (!user) return null;
    // An expired temporary suspension self-clears on next check — never
    // silently extends past what the queue set (auto-suspends still need a
    // human to either clear or convert to a real ban within the hold window).
    if (user.accountStatus === 'suspended' && user.accountStatusExpiresAt && user.accountStatusExpiresAt < new Date()) {
      await prisma.user.update({ where: { id: userId }, data: { accountStatus: 'active', accountStatusReason: null, accountStatusExpiresAt: null } });
      return { accountStatus: 'active', accountStatusReason: null, accountStatusExpiresAt: null };
    }
    return user;
  } catch (err) {
    console.warn('[ModerationEngine] DB check warning (defaulting to active status):', err);
    return { accountStatus: 'active', accountStatusReason: null, accountStatusExpiresAt: null };
  }
}
