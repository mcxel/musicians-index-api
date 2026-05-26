import { NextResponse } from "next/server";
import { StreamAndWinEngine } from "@/lib/economy/StreamAndWinEngine";
import type { FeedbackReaction } from "@/lib/economy/StreamAndWinEngine";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { songId, userId, reaction, listenPct } = body as {
    songId: string; userId: string; reaction: FeedbackReaction; listenPct: number;
  };

  if (!songId || !userId || !reaction) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const pct = typeof listenPct === "number" ? listenPct : 0;
  const listenOk = StreamAndWinEngine.recordListen(songId, userId, pct);
  const reactOk = StreamAndWinEngine.recordReaction(songId, userId, reaction);

  return NextResponse.json({
    ok: true,
    xpAwarded: reactOk,
    xpAmount: reactOk ? 10 : 0,
    listenQualified: listenOk,
  });
}
