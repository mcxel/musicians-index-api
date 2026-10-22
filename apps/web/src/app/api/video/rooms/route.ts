import { NextRequest, NextResponse } from 'next/server';
import {
  createDailyRoom,
  createMeetingToken,
  getDailyRoom,
} from '@/lib/video/DailyVideoEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userName, roomName, createIfMissing } = body as {
      userName?: string;
      roomName?: string;
      /** When true with roomName: get-or-create Daily room named = registry roomId (hub publisher). */
      createIfMissing?: boolean;
    };

    if (!process.env.DAILY_API_KEY) {
      return NextResponse.json(
        { error: 'Video rooms not configured. Set DAILY_API_KEY in Vercel dashboard.' },
        { status: 503 },
      );
    }

    const domain = process.env.DAILY_DOMAIN ?? process.env.NEXT_PUBLIC_DAILY_DOMAIN ?? 'themusiciansindex';

    // Join existing room — viewer token only, no new room created
    if (roomName && !createIfMissing) {
      const tokenRes = await createMeetingToken(roomName, {
        userName: userName ?? 'TMI Viewer',
        isOwner: false,
      });
      return NextResponse.json({
        roomId: roomName,
        roomUrl: `https://${domain}.daily.co/${roomName}`,
        token: tokenRes.token,
      });
    }

    // Create (or reuse) room + owner token (performer going live).
    // Hub publisher passes createIfMissing + roomName so Daily name === registry roomId
    // (LobbyPreviewBindRuntime / lobby-preview look up by that id).
    let room;
    if (roomName && createIfMissing) {
      const existing = await getDailyRoom(roomName);
      if (existing) {
        room = existing;
      } else {
        try {
          room = await createDailyRoom({ name: roomName, maxParticipants: 50 });
        } catch {
          const raced = await getDailyRoom(roomName);
          if (!raced) throw new Error(`Could not create or fetch Daily room ${roomName}`);
          room = raced;
        }
      }
    } else {
      room = await createDailyRoom({ maxParticipants: 50 });
    }

    const tokenRes = await createMeetingToken(room.name, {
      userName: userName ?? 'TMI Performer',
      isOwner: true,
    });

    return NextResponse.json({
      roomId: room.name,
      roomUrl: room.url,
      token: tokenRes.token,
      inviteLink: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://themusiciansindex.com'}/live/rooms/${room.name}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[video/rooms] POST error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
