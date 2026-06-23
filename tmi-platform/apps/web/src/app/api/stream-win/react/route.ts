import { NextResponse } from "next/server";
import { StreamAndWinEngine } from "@/lib/economy/StreamAndWinEngine";
import type { FeedbackReaction } from "@/lib/economy/StreamAndWinEngine";
import { prisma } from "@/lib/prisma";
import { XP_VALUES } from "@/lib/xp/xpEngine";

/**
 * Persist XP to UserStats for a given userId.
 * Non-fatal: falls back silently if DB is unavailable.
 */
async function persistStreamXp(userId: string, source: "stream_listen" | "stream_react" | "stream_vote", amount: number): Promise<void> {
  try {
    await prisma.userStats.upsert({
      where: { userId },
      update: { xp: { increment: amount } },
      create: { userId, xp: amount },
    });
    await prisma.participationLedger.create({
      data: { userId, actionType: source, points: amount },
    });
  } catch (err) {
    console.error("[stream-win/react] XP DB persistence failed:", err);
  }
}

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

  // Persist XP to DB when the engine awarded it
  if (listenOk) {
    await persistStreamXp(userId, "stream_listen", XP_VALUES["stream_listen"]);
  }
  if (reactOk && reaction !== "skip") {
    await persistStreamXp(userId, "stream_react", XP_VALUES["stream_react"]);
  }

  return NextResponse.json({
    ok: true,
    xpAwarded: reactOk,
    xpAmount: reactOk ? XP_VALUES["stream_react"] : 0,
    listenQualified: listenOk,
  });
}
