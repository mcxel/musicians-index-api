import { type NextRequest, NextResponse } from "next/server";
import { getOrCreateLink } from "@/lib/referral/ReferralEngine";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://tmi.berntoutglobal.com";

export async function POST(req: NextRequest) {
  let body: { fanId?: unknown; roomId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fanId = typeof body.fanId === "string" ? body.fanId.trim() : "";
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "world-dance-party";

  if (!fanId) {
    return NextResponse.json({ error: "fanId required" }, { status: 400 });
  }

  const link = getOrCreateLink(fanId, roomId);
  const url = `${BASE_URL}/rooms/${roomId}?ref=${link.token}`;

  return NextResponse.json({ token: link.token, url, expiresAt: link.expiresAt });
}
