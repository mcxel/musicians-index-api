export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WriterInterviewService } from "@/lib/interview/WriterInterviewService";
import type { InterviewSessionStatus } from "@/lib/interview/WriterInterviewService";

const VALID_ACTIONS: InterviewSessionStatus[] = [
  "WAITING_FOR_GUEST",
  "CONNECTED",
  "RECORDING",
  "PAUSED",
  "ENDED",
  "PROCESSING",
  "READY_FOR_REVIEW",
];

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionCookie = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionCookie) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

// POST /api/interview/[id]/record — transition status
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const session = WriterInterviewService.getSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
  if (session.writerId !== userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });

  let body: { action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { action } = body;
  if (!action || !VALID_ACTIONS.includes(action as InterviewSessionStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  }

  const result = WriterInterviewService.transitionStatus(id, action as InterviewSessionStatus);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 409 });

  return NextResponse.json({ ok: true, session: result.session });
}

// PATCH /api/interview/[id]/record — save notes
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await resolveUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const session = WriterInterviewService.getSession(id);
  if (!session) return NextResponse.json({ ok: false, error: "Session not found" }, { status: 404 });
  if (session.writerId !== userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });

  let body: { notes?: string; consentConfirmed?: boolean; articleTargetSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.notes === "string") {
    WriterInterviewService.saveNotes(id, body.notes);
  }
  if (body.consentConfirmed === true) {
    WriterInterviewService.confirmConsent(id);
  }
  if (typeof body.articleTargetSlug === "string") {
    WriterInterviewService.linkArticle(id, body.articleTargetSlug);
  }

  return NextResponse.json({ ok: true, session: WriterInterviewService.getSession(id) });
}
