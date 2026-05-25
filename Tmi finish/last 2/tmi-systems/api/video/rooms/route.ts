/**
 * apps/web/src/app/api/video/rooms/route.ts
 *
 * Drop this file at:
 *   apps/web/src/app/api/video/rooms/route.ts
 *
 * Required env vars (Vercel dashboard → Settings → Environment Variables):
 *   DAILY_API_KEY  = ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7
 *   DAILY_DOMAIN   = themusiciansindex
 *
 * Endpoints:
 *   POST /api/video/rooms          → create/join a room
 *   GET  /api/video/rooms?name=xxx → get room info + presence
 *   GET  /api/video/rooms/list     → all active rooms
 */

import { NextResponse } from "next/server";

const DAILY_API_KEY = process.env.DAILY_API_KEY ?? "";
const DAILY_DOMAIN  = process.env.DAILY_DOMAIN  ?? "themusiciansindex";
const DAILY_BASE    = "https://api.daily.co/v1";

/* ─── Room config presets ── */
const PRESETS: Record<string, object> = {
  battle:    { max_participants: 50,  enable_recording: "cloud", enable_chat: true },
  cypher:    { max_participants: 80,  enable_recording: "cloud", enable_chat: true },
  stage:     { max_participants: 200, enable_recording: "cloud", enable_chat: true, enable_screenshare: true },
  backstage: { max_participants: 10,  enable_recording: "local", enable_chat: true },
  venue:     { max_participants: 500, enable_recording: "cloud", enable_chat: true },
  chat:      { max_participants: 8,   enable_recording: "local", enable_chat: true, enable_screenshare: true },
  admin:     { max_participants: 20,  enable_recording: "cloud", start_video_off: true, start_audio_off: true },
};

function dailyHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${DAILY_API_KEY}`,
  };
}

/* ──────────────────────────────────────────────────────────────────────────
   POST /api/video/rooms
   Body: { type, roomId?, expiryMinutes?, userId, userName, role }
   ────────────────────────────────────────────────────────────────────────── */
export async function POST(request: Request) {
  if (!DAILY_API_KEY) {
    return NextResponse.json(
      {
        error: "DAILY_API_KEY not configured",
        setup: "Add DAILY_API_KEY to Vercel → Settings → Environment Variables",
        key: "Your key: ba0b6df653be1d75a4cf361bb1ac514f8ba5b7e10a5341d9090fe5d958da73d7",
      },
      { status: 503 }
    );
  }

  let body: {
    type?: string;
    roomId?: string;
    expiryMinutes?: number;
    userId: string;
    userName: string;
    role?: "host" | "participant" | "viewer";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.userId || !body.userName) {
    return NextResponse.json({ error: "userId and userName are required" }, { status: 400 });
  }

  const type = body.type ?? "stage";
  const preset = PRESETS[type] ?? PRESETS.stage;
  const expirySeconds = (body.expiryMinutes ?? 120) * 60;
  const exp = Math.floor(Date.now() / 1000) + expirySeconds;
  const roomName =
    body.roomId ??
    `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    /* ── 1. Create or fetch room ── */
    let room: any;
    const checkResp = await fetch(`${DAILY_BASE}/rooms/${roomName}`, {
      headers: dailyHeaders(),
    });

    if (checkResp.ok) {
      room = await checkResp.json();
    } else {
      const createResp = await fetch(`${DAILY_BASE}/rooms`, {
        method: "POST",
        headers: dailyHeaders(),
        body: JSON.stringify({
          name: roomName,
          privacy: "public",
          properties: { ...preset, exp, eject_after_elapsed: expirySeconds },
        }),
      });
      if (!createResp.ok) {
        const errText = await createResp.text();
        return NextResponse.json(
          { error: "Failed to create Daily room", detail: errText },
          { status: 502 }
        );
      }
      room = await createResp.json();
    }

    /* ── 2. Create meeting token ── */
    const isHost = body.role === "host";
    const tokenResp = await fetch(`${DAILY_BASE}/meeting-tokens`, {
      method: "POST",
      headers: dailyHeaders(),
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_id: body.userId,
          user_name: body.userName,
          is_owner: isHost,
          enable_recording: isHost ? "cloud" : undefined,
          start_video_off: body.role === "viewer",
          start_audio_off: body.role === "viewer",
          exp,
        },
      }),
    });

    if (!tokenResp.ok) {
      const errText = await tokenResp.text();
      return NextResponse.json(
        { error: "Failed to create meeting token", detail: errText },
        { status: 502 }
      );
    }

    const tokenData = await tokenResp.json();

    return NextResponse.json({
      success: true,
      room: {
        name: room.name,
        url: room.url ?? `https://${DAILY_DOMAIN}.daily.co/${roomName}`,
        id: room.id,
        createdAt: room.created_at,
      },
      token: tokenData.token,
      joinUrl: `https://${DAILY_DOMAIN}.daily.co/${roomName}?t=${tokenData.token}`,
      expiresAt: exp * 1000,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   GET /api/video/rooms?name=roomName
   ────────────────────────────────────────────────────────────────────────── */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!DAILY_API_KEY) {
    return NextResponse.json({ error: "DAILY_API_KEY not configured" }, { status: 503 });
  }

  /* List all rooms */
  if (!name) {
    const resp = await fetch(`${DAILY_BASE}/rooms`, { headers: dailyHeaders() });
    if (!resp.ok) return NextResponse.json({ rooms: [], error: "Could not list rooms" });
    const data = await resp.json();
    return NextResponse.json({ rooms: data.data ?? [] });
  }

  /* Get specific room + presence */
  const [roomResp, presenceResp] = await Promise.all([
    fetch(`${DAILY_BASE}/rooms/${name}`, { headers: dailyHeaders() }),
    fetch(`${DAILY_BASE}/presence`,      { headers: dailyHeaders() }),
  ]);

  if (!roomResp.ok) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const room = await roomResp.json();
  let participants = 0;

  if (presenceResp.ok) {
    const presData = await presenceResp.json();
    const match = (presData.data ?? []).find((r: any) => r.id === name);
    participants = match?.participants ?? 0;
  }

  return NextResponse.json({
    room: {
      name: room.name,
      url: room.url ?? `https://${DAILY_DOMAIN}.daily.co/${name}`,
      id: room.id,
    },
    participants,
  });
}
