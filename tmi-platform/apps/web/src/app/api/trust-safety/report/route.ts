export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isValidReportReason,
  submitTrustSafetyReport,
  type TrustSafetyReportReason,
  type TrustSafetySurface,
} from "@/lib/trustSafety";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!sessionId || !email) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

const SURFACES = new Set<TrustSafetySurface>([
  "fan_lobby",
  "live_room",
  "profile",
  "magazine",
  "marketplace",
  "messaging",
  "dating",
  "other",
]);

/**
 * POST /api/trust-safety/report
 * Auth required. Creates case, preserves evidence, applies Level-1 reporter protections.
 */
export async function POST(req: NextRequest) {
  const reporterId = await resolveUserId(req);
  if (!reporterId) {
    return NextResponse.json({ error: "Sign in required to file a Trust & Safety report" }, { status: 401 });
  }

  let body: {
    accusedId?: string;
    reasons?: string[];
    surface?: string;
    roomId?: string;
    detail?: string;
    blockImmediate?: boolean;
    includeMessages?: boolean;
    messages?: Array<{ id?: string; fromUserId: string; text: string; sentAt?: string }>;
    screenshotUrl?: string;
    contentSnapshot?: string;
    presenceSnapshot?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reasons = (body.reasons ?? []).filter(
    (r): r is TrustSafetyReportReason => typeof r === "string" && isValidReportReason(r),
  );
  if (!reasons.length) {
    return NextResponse.json({ error: "Select at least one valid report reason" }, { status: 400 });
  }

  const surface = (body.surface ?? "other") as TrustSafetySurface;
  if (!SURFACES.has(surface)) {
    return NextResponse.json({ error: "Invalid surface" }, { status: 400 });
  }

  if (body.accusedId && body.accusedId === reporterId) {
    return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
  }

  try {
    const result = await submitTrustSafetyReport({
      reporterId,
      accusedId: body.accusedId ?? null,
      reasons,
      surface,
      roomId: body.roomId ?? null,
      detail: body.detail,
      blockImmediate: body.blockImmediate,
      includeMessages: body.includeMessages,
      messages: body.messages,
      screenshotUrl: body.screenshotUrl ?? null,
      contentSnapshot: body.contentSnapshot ?? null,
      presenceSnapshot: body.presenceSnapshot,
    });

    return NextResponse.json({
      ok: true,
      caseId: result.caseId,
      id: result.id,
      status: result.status,
      enforcementLevel: result.enforcementLevel,
      evidenceCount: result.evidenceCount,
      protections: result.protections,
      message: `Report received. Case ${result.caseId} created. Evidence preserved.`,
    });
  } catch (err) {
    console.error("[trust-safety/report]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create case" },
      { status: 500 },
    );
  }
}
