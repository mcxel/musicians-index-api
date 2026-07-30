import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { packLobbyTheme, unpackLobbyTheme } from "@/lib/lobby/lobbySeatCodec";
import type { FanLobbyNavigationState } from "@/lib/lobby/FanLobbyPresence";

const PRESENCE_TTL_MS = 7_000;
const STALE_CLEANUP_MS = 5 * 60_000;

/**
 * Fan Lobby presence sync — Phase A.5 certified fields.
 * Persists via LobbyPresence + lobbySeatCodec packing (no parallel registry).
 * Phase B WebRTC must consume this payload shape, not invent another.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      roomId,
      venueId,
      userId,
      avatarId,
      userName,
      emoji,
      x,
      y,
      propTrigger,
      theme,
      isSpeaking,
      hasCameraOn,
      cameraEnabled,
      micEnabled,
      isSeated,
      seatId,
      seatAnchorId,
      navigationState,
      locomotion,
      conversationGroupId,
      activeSpeaker,
      loadoutId,
    } = body;

    if (!roomId || !userId) {
      return NextResponse.json({ error: "Missing roomId or userId" }, { status: 400 });
    }

    const resolvedVenueId =
      typeof venueId === "string" && venueId.length > 0 ? venueId : roomId;

    // Seating + nav/mic/cg packed into activeTheme until dedicated columns exist.
    const unpacked = unpackLobbyTheme(typeof theme === "string" ? theme : "");
    const resolvedSeatId =
      (typeof seatAnchorId === "string" && seatAnchorId.length > 0
        ? seatAnchorId
        : null) ??
      (typeof seatId === "string" && seatId.length > 0 ? seatId : null) ??
      (isSeated ? unpacked.seatId : null);
    const resolvedSeated = Boolean(isSeated ?? unpacked.isSeated) && Boolean(resolvedSeatId);
    const skinTheme =
      unpacked.theme || (typeof theme === "string" ? theme.split("@@")[0] : "lobby-cinema");

    const navRaw = navigationState ?? locomotion ?? unpacked.navigationState;
    const resolvedNav: FanLobbyNavigationState =
      navRaw === "WALKING" || navRaw === "SEATED" || navRaw === "STANDING"
        ? navRaw
        : resolvedSeated
          ? "SEATED"
          : "STANDING";

    const resolvedMic = Boolean(
      micEnabled !== undefined ? micEnabled : unpacked.micEnabled,
    );
    const resolvedCam = Boolean(
      cameraEnabled !== undefined ? cameraEnabled : hasCameraOn,
    );
    const resolvedCg =
      (typeof conversationGroupId === "string" && conversationGroupId.length > 0
        ? conversationGroupId
        : null) ??
      (resolvedSeated ? unpacked.conversationGroupId : null);
    const resolvedSpeaking = Boolean(isSpeaking);
    const resolvedActiveSpeaker =
      activeSpeaker !== undefined ? Boolean(activeSpeaker) : resolvedSpeaking;

    const packedTheme = packLobbyTheme({
      skinId: skinTheme,
      seatId: resolvedSeated ? resolvedSeatId : null,
      navigationState: resolvedNav,
      micEnabled: resolvedMic,
      conversationGroupId: resolvedSeated ? resolvedCg : null,
    });

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
        isSpeaking: resolvedSpeaking,
        hasCameraOn: resolvedCam,
      },
      update: {
        userName: userName ?? "Anonymous Fan",
        emoji: emoji ?? "👤",
        x: typeof x === "number" ? x : 50,
        y: typeof y === "number" ? y : 70,
        propTrigger: propTrigger ?? "none",
        activeTheme: packedTheme,
        isSpeaking: resolvedSpeaking,
        hasCameraOn: resolvedCam,
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
      const seated = seat.isSeated;
      const nav = seat.navigationState;
      const speaking = row.isSpeaking;
      return {
        venueId: resolvedVenueId,
        roomId: row.roomId,
        userId: row.userId,
        avatarId: row.userId === userId && typeof avatarId === "string" ? avatarId : row.userId,
        userName: row.userName,
        emoji: row.emoji,
        x: row.x,
        y: row.y,
        propTrigger: row.propTrigger,
        activeTheme: seat.theme,
        seatAnchorId: seat.seatId,
        seatId: seat.seatId,
        isSeated: seated,
        navigationState: nav,
        locomotion: nav,
        conversationGroupId: seated ? seat.conversationGroupId : null,
        micEnabled: seat.micEnabled,
        cameraEnabled: row.hasCameraOn,
        hasCameraOn: row.hasCameraOn,
        isSpeaking: speaking,
        activeSpeaker:
          row.userId === userId ? resolvedActiveSpeaker : speaking,
        loadoutId:
          row.userId === userId && loadoutId !== undefined ? loadoutId : null,
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
