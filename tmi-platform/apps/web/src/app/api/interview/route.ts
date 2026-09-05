export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { WriterInterviewService } from "@/lib/interview/WriterInterviewService";

// POST /api/interview — create interview session
export async function POST(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  let body: { guestName?: string; guestEmail?: string; title?: string; articleTargetSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { guestName, guestEmail, title, articleTargetSlug } = body;
  if (!guestName?.trim() || !title?.trim()) {
    return NextResponse.json({ ok: false, error: "guestName and title are required" }, { status: 400 });
  }

  const session = WriterInterviewService.createSession({
    writerId: user.id,
    guestName: guestName.trim(),
    guestEmail: guestEmail?.trim(),
    title: title.trim(),
    articleTargetSlug: articleTargetSlug?.trim(),
  });

  return NextResponse.json({ ok: true, session }, { status: 201 });
}

// GET /api/interview — list sessions for authenticated writer
export async function GET(req: NextRequest) {
  const email = req.cookies.get("tmi_user_email")?.value;
  const sessionId = req.cookies.get("tmi_session_id")?.value;
  if (!email || !sessionId) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const sessions = WriterInterviewService.getSessionsByWriter(user.id);
  return NextResponse.json({ ok: true, sessions });
}
