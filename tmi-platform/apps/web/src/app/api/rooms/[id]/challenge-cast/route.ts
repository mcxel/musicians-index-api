import { NextRequest, NextResponse } from "next/server";

/**
 * Challenge cast — publish selected Media Locker work to the venue for audience.
 * Challenges = completed work vs completed work (Content Picker), not live beat battles.
 * In-memory per room until a Prisma ChallengeCast model ships (Rule 20 honest).
 */

export const dynamic = "force-dynamic";

export type ChallengeCastItem = {
  id: string;
  title: string;
  type: string;
  url?: string | null;
  side: "A" | "B";
  castBy: string;
  at: number;
};

type RoomCast = {
  roomId: string;
  sideA: ChallengeCastItem[];
  sideB: ChallengeCastItem[];
  updatedAt: number;
};

const casts = new Map<string, RoomCast>();

function ensure(roomId: string): RoomCast {
  let r = casts.get(roomId);
  if (!r) {
    r = { roomId, sideA: [], sideB: [], updatedAt: Date.now() };
    casts.set(roomId, r);
  }
  return r;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const room = ensure(params.id);
  return NextResponse.json({
    ok: true,
    roomId: room.roomId,
    sideA: room.sideA,
    sideB: room.sideB,
    updatedAt: room.updatedAt,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const roomId = params.id;
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const action = typeof body.action === "string" ? body.action : "cast";
  const room = ensure(roomId);

  if (action === "clear") {
    const side = body.side === "B" ? "B" : body.side === "A" ? "A" : null;
    if (side === "A") room.sideA = [];
    else if (side === "B") room.sideB = [];
    else {
      room.sideA = [];
      room.sideB = [];
    }
    room.updatedAt = Date.now();
    return NextResponse.json({ ok: true, sideA: room.sideA, sideB: room.sideB });
  }

  const side = body.side === "B" ? "B" : "A";
  const castBy = typeof body.castBy === "string" ? body.castBy : "anon";
  const items = Array.isArray(body.items) ? body.items : [];
  const mapped: ChallengeCastItem[] = [];
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const title = typeof o.title === "string" ? o.title : "";
    if (!id || !title) continue;
    mapped.push({
      id,
      title,
      type: typeof o.type === "string" ? o.type : "work",
      url: typeof o.url === "string" ? o.url : null,
      side,
      castBy,
      at: Date.now(),
    });
  }

  if (mapped.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid work items to cast" }, { status: 400 });
  }

  if (side === "A") room.sideA = mapped;
  else room.sideB = mapped;
  room.updatedAt = Date.now();

  return NextResponse.json({
    ok: true,
    side,
    cast: mapped,
    sideA: room.sideA,
    sideB: room.sideB,
  });
}
