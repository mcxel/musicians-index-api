import { NextRequest, NextResponse } from "next/server";
import {
  createDailyRoom,
  createMeetingToken,
  getDailyRoom,
} from "@/lib/video/DailyVideoEngine";
import { lobbyDailyRoomName } from "@/lib/lobby/lobbyPeerMediaBinding";

/**
 * Social lobby peer media (Fan Lobby / Playlist Lounge).
 * Get-or-create a Daily room keyed by lobby roomId; token carries user_id = presence userId.
 * 503 when DAILY_API_KEY missing — clients keep local cam + honest empty peers (Rule 20).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      roomId?: string;
      userId?: string;
      userName?: string;
      startVideoOff?: boolean;
      startAudioOff?: boolean;
    };

    const roomId = typeof body.roomId === "string" && body.roomId.trim() ? body.roomId.trim() : "";
    const userId = typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : "";
    if (!roomId || !userId) {
      return NextResponse.json({ error: "roomId and userId required", available: false }, { status: 400 });
    }

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        {
          available: false,
          reason: "Daily not configured (DAILY_API_KEY). Local camera only; peers show honest empty.",
        },
        { status: 503 },
      );
    }

    const roomName = lobbyDailyRoomName(roomId);
    let room = await getDailyRoom(roomName);
    if (!room) {
      try {
        room = await createDailyRoom({
          name: roomName,
          maxParticipants: 40,
          expiresInMinutes: 60 * 12,
        });
      } catch {
        // Race: peer created the room first
        room = await getDailyRoom(roomName);
      }
    }
    if (!room) {
      return NextResponse.json(
        { available: false, reason: "Could not open lobby media room" },
        { status: 502 },
      );
    }

    const tokenRes = await createMeetingToken(roomName, {
      userId,
      userName: body.userName ?? "Fan",
      isOwner: false,
      startVideoOff: body.startVideoOff ?? true,
      startAudioOff: body.startAudioOff ?? true,
      expiresInMinutes: 180,
    });

    return NextResponse.json({
      available: true,
      roomId: roomName,
      roomUrl: room.url,
      token: tokenRes.token,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[rooms/lobby-media] POST error:", msg);
    return NextResponse.json({ available: false, error: msg, reason: msg }, { status: 500 });
  }
}
