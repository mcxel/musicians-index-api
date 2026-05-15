import { type NextRequest, NextResponse } from "next/server";
import { registerArrival, qualifyReferral } from "@/lib/referral/ReferralEngine";

/**
 * POST /api/referral/qualify
 *
 * Called in two phases:
 *   phase=arrive  — register that an invited user has entered the room
 *   phase=qualify — mark them as qualified (≥30s stay + ≥1 action)
 *
 * Body: { token, invitedId, phase, staySeconds?, actionCount? }
 */

export async function POST(req: NextRequest) {
  let body: {
    token?: unknown;
    invitedId?: unknown;
    phase?: unknown;
    staySeconds?: unknown;
    actionCount?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const invitedId = typeof body.invitedId === "string" ? body.invitedId.trim() : "";
  const phase = typeof body.phase === "string" ? body.phase : "arrive";

  if (!token || !invitedId) {
    return NextResponse.json({ error: "token and invitedId required" }, { status: 400 });
  }

  if (phase === "arrive") {
    const result = registerArrival(token, invitedId);
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  }

  if (phase === "qualify") {
    const staySeconds = typeof body.staySeconds === "number" ? body.staySeconds : 0;
    const actionCount = typeof body.actionCount === "number" ? body.actionCount : 0;
    const result = qualifyReferral(token, invitedId, staySeconds, actionCount);
    return NextResponse.json(result, { status: result.qualified ? 200 : 422 });
  }

  return NextResponse.json({ error: "Invalid phase" }, { status: 400 });
}
