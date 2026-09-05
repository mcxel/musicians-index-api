import prisma from "@/lib/prisma";
import { buildEvidenceItems, hashPayload } from "./EvidenceVault";
import { applyReporterFriction, type ReporterProtectionView } from "./EnforcementEngine";
import {
  evaluateContentClaim,
  evaluateImpersonation,
  evaluatePaymentRisk,
  evaluateScamSignals,
  createAppealScaffold,
} from "./scaffoldEngines";
import {
  TRUST_SAFETY_REPORT_REASONS,
  type CaseAction,
  type SubmitTrustReportInput,
  type TrustSafetyCaseStatus,
  type TrustSafetyCaseView,
  type TrustSafetyReportReason,
} from "./types";
import { resolveYouthSocialSubject } from "./resolveYouthSocialSubject";
import { emitYouthSafetyParentNotice } from "./youthSafetyParentNotify";
import { resolveYouthSocialBand } from "./YouthSocialGuard";
import {
  assertDatingExperienceForUserId,
  evaluateDatingExperienceForUserId,
} from "./datingExperienceGuard";

export { assertDatingExperienceForUserId, evaluateDatingExperienceForUserId };

export function isValidReportReason(value: string): value is TrustSafetyReportReason {
  return (TRUST_SAFETY_REPORT_REASONS as readonly string[]).includes(value);
}

/** Case ID format: TMI-YYYY-###### */
export async function generateCaseId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `TMI-${year}-`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.trustSafetyCase.count({
      where: { caseId: { startsWith: prefix } },
    });
    const next = String(count + 1 + attempt).padStart(6, "0");
    const caseId = `${prefix}${next}`;
    const exists = await prisma.trustSafetyCase.findUnique({ where: { caseId } });
    if (!exists) return caseId;
  }
  const fallback = String(Date.now()).slice(-6);
  return `${prefix}${fallback}`;
}

function parseReasons(reasonsJson: string): TrustSafetyReportReason[] {
  try {
    const parsed = JSON.parse(reasonsJson) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r): r is TrustSafetyReportReason => typeof r === "string" && isValidReportReason(r));
  } catch {
    return [];
  }
}

export function toCaseView(
  row: {
    id: string;
    caseId: string;
    reporterId: string;
    accusedId: string | null;
    reasonsJson: string;
    surface: string;
    roomId: string | null;
    status: string;
    enforcementLevel: number;
    outcome: string | null;
    detail: string | null;
    blockImmediate: boolean;
    includeMessages: boolean;
    screenshotUrl: string | null;
    contentHash: string | null;
    createdAt: Date;
    reviewedBy: string | null;
    reviewedAt: Date | null;
    _count?: { evidence: number };
  },
  evidenceCount = 0,
): TrustSafetyCaseView {
  return {
    id: row.id,
    caseId: row.caseId,
    reporterId: row.reporterId,
    accusedId: row.accusedId,
    reasons: parseReasons(row.reasonsJson),
    surface: row.surface,
    roomId: row.roomId,
    status: row.status as TrustSafetyCaseStatus,
    enforcementLevel: Math.min(4, Math.max(0, row.enforcementLevel)) as 0 | 1 | 2 | 3 | 4,
    outcome: row.outcome,
    detail: row.detail,
    blockImmediate: row.blockImmediate,
    includeMessages: row.includeMessages,
    screenshotUrl: row.screenshotUrl,
    contentHash: row.contentHash,
    evidenceCount: row._count?.evidence ?? evidenceCount,
    createdAt: row.createdAt.toISOString(),
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

export type SubmitTrustReportResult = {
  caseId: string;
  id: string;
  status: TrustSafetyCaseStatus;
  enforcementLevel: number;
  protections: ReporterProtectionView | null;
  evidenceCount: number;
  scaffolds: {
    scamSignals: ReturnType<typeof evaluateScamSignals>;
    impersonation: ReturnType<typeof evaluateImpersonation>;
    paymentRisk: ReturnType<typeof evaluatePaymentRisk>;
    contentClaim: ReturnType<typeof evaluateContentClaim>;
    appeals: ReturnType<typeof createAppealScaffold>;
  };
};

async function notifyFamilyParentsOfSafetyReport(
  reporterId: string,
  accusedId?: string | null,
): Promise<void> {
  const ids = [reporterId, accusedId].filter((id): id is string => Boolean(id && id.trim()));
  for (const userId of ids) {
    const subject = await resolveYouthSocialSubject(userId);
    if (resolveYouthSocialBand(subject) !== "YOUTH") continue;
    await emitYouthSafetyParentNotice({
      teen: subject,
      eventType: "report_filed",
      otherUserId: userId === reporterId ? accusedId ?? undefined : reporterId,
    });
  }
}

/**
 * TrustSafetyRuntime — always-on platform engine.
 * Loop: Report → Protect reporter → Preserve evidence → Create case → queue.
 */
export async function submitTrustSafetyReport(
  input: SubmitTrustReportInput,
): Promise<SubmitTrustReportResult> {
  if (!input.reasons.length) {
    throw new Error("At least one report reason is required");
  }
  for (const r of input.reasons) {
    if (!isValidReportReason(r)) throw new Error(`Invalid reason: ${r}`);
  }
  if (input.accusedId && input.accusedId === input.reporterId) {
    throw new Error("Cannot report yourself");
  }

  const caseId = await generateCaseId();
  const evidenceItems = buildEvidenceItems({
    reporterId: input.reporterId,
    accusedId: input.accusedId,
    surface: input.surface,
    roomId: input.roomId,
    contentSnapshot: input.contentSnapshot,
    messages: input.includeMessages ? input.messages : undefined,
    screenshotUrl: input.screenshotUrl,
    presenceSnapshot: input.presenceSnapshot,
    reasons: input.reasons,
    detail: input.detail,
  });

  const primaryHash =
    evidenceItems.find((e) => e.kind === "content_snapshot")?.contentHash ??
    evidenceItems.find((e) => e.kind === "hash_record")?.contentHash ??
    hashPayload({ caseId, at: Date.now() });

  const paymentRisk = evaluatePaymentRisk({ reasons: input.reasons });

  const created = await prisma.trustSafetyCase.create({
    data: {
      caseId,
      reporterId: input.reporterId,
      accusedId: input.accusedId ?? null,
      reasonsJson: JSON.stringify(input.reasons),
      surface: input.surface,
      roomId: input.roomId ?? null,
      status: "open",
      enforcementLevel: 1,
      detail: input.detail?.slice(0, 4000) ?? null,
      blockImmediate: Boolean(input.blockImmediate),
      includeMessages: Boolean(input.includeMessages),
      screenshotUrl: input.screenshotUrl ?? null,
      contentSnapshot: input.contentSnapshot?.slice(0, 20000) ?? null,
      contentHash: primaryHash,
      evidence: {
        create: evidenceItems.map((item) => ({
          kind: item.kind,
          contentHash: item.contentHash,
          payloadJson: item.payloadJson,
        })),
      },
    },
    include: { evidence: true },
  });

  let protections: ReporterProtectionView | null = null;
  if (input.accusedId) {
    protections = await applyReporterFriction({
      caseDbId: created.id,
      caseId,
      reporterId: input.reporterId,
      accusedId: input.accusedId,
      roomId: input.roomId,
      blockImmediate: input.blockImmediate,
      freezePayments: paymentRisk.freezeSuggested && Boolean(input.blockImmediate),
      roomRejoinBlock: false,
      level: 1,
    });
  }

  void notifyFamilyParentsOfSafetyReport(input.reporterId, input.accusedId).catch(() => undefined);

  return {
    caseId,
    id: created.id,
    status: "open",
    enforcementLevel: 1,
    protections,
    evidenceCount: created.evidence.length,
    scaffolds: {
      scamSignals: evaluateScamSignals({ reasons: input.reasons, detail: input.detail }),
      impersonation: evaluateImpersonation({ accusedId: input.accusedId, detail: input.detail }),
      paymentRisk,
      contentClaim: evaluateContentClaim({ contentHash: primaryHash }),
      appeals: createAppealScaffold(caseId),
    },
  };
}

export async function listOpenTrustSafetyCases(limit = 50): Promise<TrustSafetyCaseView[]> {
  const rows = await prisma.trustSafetyCase.findMany({
    where: { status: { in: ["open", "reviewing", "restricted"] } },
    orderBy: { createdAt: "desc" },
    take: Math.min(100, Math.max(1, limit)),
    include: { _count: { select: { evidence: true } } },
  });
  return rows.map((row) => toCaseView(row));
}

export async function getTrustSafetyCaseByCaseId(caseId: string): Promise<TrustSafetyCaseView | null> {
  const row = await prisma.trustSafetyCase.findUnique({
    where: { caseId },
    include: { _count: { select: { evidence: true } }, evidence: true },
  });
  if (!row) return null;
  return toCaseView(row);
}

export async function getTrustSafetyCaseEvidence(caseId: string) {
  const row = await prisma.trustSafetyCase.findUnique({
    where: { caseId },
    include: { evidence: { orderBy: { preservedAt: "asc" } } },
  });
  if (!row) return null;
  return {
    case: toCaseView(row, row.evidence.length),
    evidence: row.evidence.map((e) => ({
      id: e.id,
      kind: e.kind,
      contentHash: e.contentHash,
      preservedAt: e.preservedAt.toISOString(),
      // Payload returned to staff only — callers must gate ADMIN/STAFF.
      payloadJson: e.payloadJson,
    })),
  };
}

/**
 * Staff review actions. hide/block/restrict implemented when safe;
 * escalate/ban defer to existing ModerationEngine admin path.
 */
export async function applyCaseAction(params: {
  caseId: string;
  action: CaseAction;
  performedBy: string;
  note?: string;
}): Promise<TrustSafetyCaseView> {
  const row = await prisma.trustSafetyCase.findUnique({ where: { caseId: params.caseId } });
  if (!row) throw new Error("Case not found");

  let status = row.status;
  let enforcementLevel = row.enforcementLevel;
  let outcome = row.outcome;
  let reviewedBy: string | null = row.reviewedBy;
  let reviewedAt: Date | null = row.reviewedAt;

  switch (params.action) {
    case "start_review":
      status = "reviewing";
      reviewedBy = params.performedBy;
      reviewedAt = new Date();
      break;
    case "hide_content":
      if (row.accusedId) {
        await applyReporterFriction({
          caseDbId: row.id,
          caseId: row.caseId,
          reporterId: row.reporterId,
          accusedId: row.accusedId,
          roomId: row.roomId ?? "",
          blockImmediate: false,
          level: 1,
        });
      }
      enforcementLevel = Math.max(enforcementLevel, 1);
      outcome = appendOutcome(outcome, `hide_content by ${params.performedBy}`);
      break;
    case "block_dms":
      if (row.accusedId) {
        await applyReporterFriction({
          caseDbId: row.id,
          caseId: row.caseId,
          reporterId: row.reporterId,
          accusedId: row.accusedId,
          roomId: row.roomId ?? "",
          blockImmediate: true,
          level: 1,
        });
      }
      enforcementLevel = Math.max(enforcementLevel, 1);
      outcome = appendOutcome(outcome, `block_dms by ${params.performedBy}`);
      break;
    case "restrict_rejoin":
    case "remove_from_room":
      if (row.accusedId && row.roomId) {
        await applyReporterFriction({
          caseDbId: row.id,
          caseId: row.caseId,
          reporterId: row.reporterId,
          accusedId: row.accusedId,
          roomId: row.roomId,
          roomRejoinBlock: true,
          level: 2,
        });
        // Also write a protection keyed for host-initiated remove (reporter may be host).
        await applyReporterFriction({
          caseDbId: row.id,
          caseId: row.caseId,
          reporterId: params.performedBy,
          accusedId: row.accusedId,
          roomId: row.roomId,
          roomRejoinBlock: true,
          level: 2,
        });
      }
      status = "restricted";
      enforcementLevel = Math.max(enforcementLevel, 2);
      outcome = appendOutcome(outcome, `${params.action} by ${params.performedBy}`);
      break;
    case "resolve":
      status = "resolved";
      outcome = appendOutcome(outcome, params.note ?? `resolved by ${params.performedBy}`);
      reviewedBy = params.performedBy;
      reviewedAt = new Date();
      break;
    case "escalate":
      status = "reviewing";
      enforcementLevel = Math.max(enforcementLevel, 3);
      outcome = appendOutcome(
        outcome,
        `escalated by ${params.performedBy} — use /api/admin/moderation for suspend/ban`,
      );
      reviewedBy = params.performedBy;
      reviewedAt = new Date();
      break;
    case "close":
      status = "closed";
      outcome = appendOutcome(outcome, params.note ?? `closed by ${params.performedBy}`);
      reviewedBy = params.performedBy;
      reviewedAt = new Date();
      break;
  }

  const updated = await prisma.trustSafetyCase.update({
    where: { caseId: params.caseId },
    data: { status, enforcementLevel, outcome, reviewedBy, reviewedAt },
    include: { _count: { select: { evidence: true } } },
  });

  return toCaseView(updated);
}

function appendOutcome(existing: string | null, line: string): string {
  return existing ? `${existing}\n${line}` : line;
}

export async function getQueueSummary(): Promise<{
  open: number;
  reviewing: number;
  restricted: number;
  evidencePackages: number;
}> {
  const [open, reviewing, restricted, evidencePackages] = await Promise.all([
    prisma.trustSafetyCase.count({ where: { status: "open" } }),
    prisma.trustSafetyCase.count({ where: { status: "reviewing" } }),
    prisma.trustSafetyCase.count({ where: { status: "restricted" } }),
    prisma.trustSafetyEvidence.count(),
  ]);
  return { open, reviewing, restricted, evidencePackages };
}
