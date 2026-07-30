import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { packLobbyTheme, unpackLobbyTheme } from "@/lib/lobby/lobbySeatCodec";

const PRESENCE_TTL_MS = 7_000;
const STALE_CLEANUP_MS = 5 * 60_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      roomId,
      userId,
      userName,
      emoji,
      x,
      y,
      propTrigger,
      theme,
      isSpeaking,
      hasCameraOn,
      isSeated,
      seatId,
    } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ error: "Missing roomId or userId" }, { status: 400 });
    }

    // Seating packed into activeTheme until LobbyPresence gets isSeated/seatId columns.
    const unpacked = unpackLobbyTheme(typeof theme === "string" ? theme : "");
    const resolvedSeatId =
      typeof seatId === "string" && seatId.length > 0
        ? seatId
        : isSeated
          ? unpacked.seatId
          : null;
    const resolvedSeated = Boolean(isSeated ?? unpacked.isSeated) && Boolean(resolvedSeatId);
    const skinTheme = unpacked.theme || (typeof theme === "string" ? theme.split("@@")[0] : "lobby-cinema");
    const packedTheme = packLobbyTheme(skinTheme, resolvedSeated ? resolvedSeatId : null);

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
        activeTheme: packedTheme,
        isSpeaking: Boolean(isSpeaking),
        hasCameraOn: Boolean(hasCameraOn),
      },
      update: {
        userName: userName ?? "Anonymous Fan",
        emoji: emoji ?? "👤",
        x: typeof x === "number" ? x : 50,
        y: typeof y === "number" ? y : 70,
        propTrigger: propTrigger ?? "none",
        activeTheme: packedTheme,
        isSpeaking: Boolean(isSpeaking),
        hasCameraOn: Boolean(hasCameraOn),
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

    const activeParticipants = activeRows.map((row) => {
      const seat = unpackLobbyTheme(row.activeTheme);
      return {
        userId: row.userId,
        userName: row.userName,
        emoji: row.emoji,
        x: row.x,
        y: row.y,
        propTrigger: row.propTrigger,
        activeTheme: seat.theme,
        isSpeaking: row.isSpeaking,
        hasCameraOn: row.hasCameraOn,
        isSeated: seat.isSeated,
        seatId: seat.seatId,
        locomotion: seat.isSeated ? "SEATED" : "STANDING",
      };
    });

    return NextResponse.json({
      ok: true,
      participants: activeParticipants,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
