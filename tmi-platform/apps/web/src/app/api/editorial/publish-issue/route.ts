/**
 * POST /api/editorial/publish-issue
 *
 * The one real place editorial "publication" is committed. Never called from
 * a reader route — /magazine/issue/current only ever calls the pure
 * buildCanonicalMagazineIssueSlots(). This is an explicit, authorized,
 * on-demand transaction (see MagazineRotationEngine.publishIssueComposition
 * for the scope note on why this isn't a scheduled job yet).
 *
 * Audit: every successful publish writes AuditLog (same prisma.auditLog path
 * as admin contributor-level grants) — no second permission/audit system.
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { publishIssueComposition } from "@/lib/magazine/MagazineRotationEngine";
import { resolveContributorSession } from "@/lib/editorial-economy/resolveContributorSession";

export async function POST(req: NextRequest) {
  try {
    const session = await resolveContributorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sign in to publish an issue." }, { status: 401 });
    }

    const account = await contributorAccountEngine.get(session.contributorId);
    if (!account || (account.level !== "trusted-editor" && account.level !== "staff-editor")) {
      return NextResponse.json({ error: "insufficient-role" }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as { issueKey?: string };
    const issueKey = body.issueKey?.trim() || "current";

    const result = await publishIssueComposition(issueKey);

    await prisma.auditLog
      .create({
        data: {
          actorId: session.contributorId,
          targetId: issueKey,
          action: "USER_ROLE_CHANGED",
          details: {
            kind: "MAGAZINE_ISSUE_PUBLISH",
            issueKey,
            slotCount: result.slots.length,
            publishedSubmissionIds: result.publishedSubmissionIds,
            publisherLevel: account.level,
            publishedAt: new Date().toISOString(),
          },
        },
      })
      .catch(() => {});

    return NextResponse.json({
      ok: true,
      issueKey,
      slotCount: result.slots.length,
      publishedSubmissionIds: result.publishedSubmissionIds,
    });
  } catch {
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }
}
