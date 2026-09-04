import { NextRequest, NextResponse } from "next/server";
import { voteDownWdpTrack } from "@/lib/dance/WorldDancePartyRotationPool";

export const dynamic = "force-dynamic";

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value;
  if (email) return email;
  const sid = req.cookies.get("tmi_session_id")?.value;
  return sid ? sid.slice(0, 32) : null;
}

export async function POST(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "authentication_required" }, { status: 401 });
  }

  let body: { entryId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const entryId = typeof body.entryId === "string" ? body.entryId : "";
  if (!entryId) {
    return NextResponse.json({ ok: false, error: "entryId_required" }, { status: 400 });
  }

  const result = voteDownWdpTrack(entryId, userId);
  if (!result.ok) {
    const status = result.error === "insufficient_coins" ? 402 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({ ok: true, voteDownCount: result.voteDownCount });
}
