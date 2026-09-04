export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WriterInterviewService } from "@/lib/interview/WriterInterviewService";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionCookie = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionCookie) return null;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return user?.id ?? null;
}

// POST /api/interview/[id]/publish
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

  if (session.status !== "READY_FOR_REVIEW") {
    return NextResponse.json(
      { ok: false, error: `Cannot publish from status ${session.status}. Must be READY_FOR_REVIEW.` },
      { status: 409 },
    );
  }

  const result = WriterInterviewService.transitionStatus(id, "PUBLISHED");
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 409 });

  return NextResponse.json({ ok: true, session: result.session });
}
