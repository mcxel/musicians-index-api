import { NextRequest, NextResponse } from "next/server";
import {
  createMeetingToken,
  getDailyRoom,
} from "@/lib/video/DailyVideoEngine";
import { lobbyDailyRoomName } from "@/lib/lobby/lobbyPeerMediaBinding";

/**
 * Lobby wall receive-only preview bind.
 * Joins the SAME Daily room as the live session when it already exists.
 * Never creates a Daily room (no duplicate production / no empty mint).
 * 503 when Daily is not configured — clients keep composed ready motion (Rule 20).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      roomId?: string;
      userId?: string;
    };

    const roomId = typeof body.roomId === "string" && body.roomId.trim() ? body.roomId.trim() : "";
    const userId =
      typeof body.userId === "string" && body.userId.trim()
        ? body.userId.trim()
        : `preview-${Date.now().toString(36)}`;

    if (!roomId) {
      return NextResponse.json({ available: false, reason: "roomId required" }, { status: 400 });
    }

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        {
          available: false,
          reason: "Daily not configured (DAILY_API_KEY). Composed preview only.",
        },
        { status: 503 },
      );
    }

    const domain =
      process.env.DAILY_DOMAIN ?? process.env.NEXT_PUBLIC_DAILY_DOMAIN ?? "themusiciansindex";

    // Prefer exact roomId (Go Live Daily name), then social-lobby deterministic name.
    const candidates = [roomId, lobbyDailyRoomName(roomId)];
    let resolvedName: string | null = null;
    let roomUrl: string | null = null;

    for (const name of candidates) {
      const room = await getDailyRoom(name);
      if (room) {
        resolvedName = room.name;
        roomUrl = room.url;
        break;
      }
    }

    if (!resolvedName || !roomUrl) {
      return NextResponse.json({
        available: false,
        reason: "No live Daily session for this room yet — composed preview",
        tried: candidates,
      });
    }

    const tokenRes = await createMeetingToken(resolvedName, {
      userId: `lobby-preview:${userId}`,
      userName: `Lobby Preview|uid:preview-${userId}`,
      isOwner: false,
      startVideoOff: true,
      startAudioOff: true,
      expiresInMinutes: 60,
    });

    return NextResponse.json({
      available: true,
      roomId: resolvedName,
      roomUrl: roomUrl || `https://${domain}.daily.co/${resolvedName}`,
      token: tokenRes.token,
      receiveOnly: true,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[live/lobby-preview] POST error:", msg);
    return NextResponse.json({ available: false, error: msg, reason: msg }, { status: 500 });
  }
}
