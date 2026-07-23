import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRESENCE_TTL_MS = 7_000;
const STALE_CLEANUP_MS = 5 * 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { roomId, userId, userName, emoji, x, y, propTrigger, theme } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ error: "Missing roomId or userId" }, { status: 400 });
    }

    // Backed by Postgres (not an in-memory Map) so presence survives across
    // Vercel's multiple serverless instances - a module-level Map only ever
    // reflects the single instance that happened to handle a given request.
    await prisma.lobbyPresence.upsert({
      where: { roomId_userId: { roomId, userId } },
      create: {
        roomId,
        userId,
        userName: userName ?? "Anonymous Fan",
        emoji: emoji ?? "👤",
        x: typeof x === "number" ? x : 50,
        y: typeof y === "number" ? y : 70,
        propTrigger: propTrigger ?? "none",
        activeTheme: theme ?? "MEDIA_LOUNGE",
      },
      update: {
        userName: userName ?? "Anonymous Fan",
        emoji: emoji ?? "👤",
        x: typeof x === "number" ? x : 50,
        y: typeof y === "number" ? y : 70,
        propTrigger: propTrigger ?? "none",
        activeTheme: theme ?? "MEDIA_LOUNGE",
        lastSeenAt: new Date(),
      },
    });

    // Opportunistic cleanup of long-abandoned rows (low probability per
    // request so this doesn't add a delete to every single sync call).
    if (Math.random() < 0.05) {
      await prisma.lobbyPresence.deleteMany({
        where: { lastSeenAt: { lt: new Date(Date.now() - STALE_CLEANUP_MS) } },
      });
    }

    const activeRows = await prisma.lobbyPresence.findMany({
      where: {
        roomId,
        lastSeenAt: { gt: new Date(Date.now() - PRESENCE_TTL_MS) },
      },
    });

    const activeParticipants = activeRows.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      emoji: row.emoji,
      x: row.x,
      y: row.y,
      propTrigger: row.propTrigger,
      activeTheme: row.activeTheme,
    }));

    return NextResponse.json({
      ok: true,
      participants: activeParticipants,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
