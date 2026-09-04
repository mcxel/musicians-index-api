import { NextRequest, NextResponse } from "next/server";
import { recordWdpReceptionSignal } from "@/lib/dance/WorldDancePartySkipEngine";
import type { WdpReceptionSignal } from "@/lib/dance/WorldDancePartySkipEngine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { roomId?: string; entryId?: string; signal?: WdpReceptionSignal } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const roomId = typeof body.roomId === "string" ? body.roomId : "world-dance-party";
  const entryId = typeof body.entryId === "string" ? body.entryId : "";
  const signal = body.signal;

  if (!entryId || !signal) {
    return NextResponse.json({ ok: false, error: "entryId_and_signal_required" }, { status: 400 });
  }

  const allowed: WdpReceptionSignal[] = [
    "negative_reaction",
    "positive_reaction",
    "dance_engagement",
  ];
  if (!allowed.includes(signal)) {
    return NextResponse.json({ ok: false, error: "invalid_signal" }, { status: 400 });
  }

  const snapshot = recordWdpReceptionSignal(roomId, entryId, signal);
  return NextResponse.json({ ok: true, snapshot });
}
