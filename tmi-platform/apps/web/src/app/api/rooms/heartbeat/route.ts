import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCanonicalRoomSlug } from "@/lib/world/WorldRuntime";

const SEAT_TTL_MS = 5 * 60 * 1000; // extend reservation 5 min per heartbeat

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawRoomId: string = typeof body.roomId === "string" ? body.roomId : "";
    const userId: string = typeof body.userId === "string" ? body.userId : "";

    if (!rawRoomId || !userId) {
      return NextResponse.json({ ok: false, error: "roomId and userId required" }, { status: 400 });
    }

    const roomId = getCanonicalRoomSlug(rawRoomId);
    const now = new Date();

    const [presence] = await Promise.all([
      prisma.roomPresence.upsert({
        where: { roomId_userId: { roomId, userId } },
        create: { roomId, userId, lastSeenAt: now, connected: true },
        update: { lastSeenAt: now, connected: true },
      }),
      prisma.seatReservation.updateMany({
        where: { roomId, userId },
        data: { expiresAt: new Date(Date.now() + SEAT_TTL_MS) },
      }),
    ]);

    return NextResponse.json({ ok: true, presence });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawRoomId: string = typeof body.roomId === "string" ? body.roomId : "";
    const userId: string = typeof body.userId === "string" ? body.userId : "";

    if (!rawRoomId || !userId) {
      return NextResponse.json({ ok: false, error: "roomId and userId required" }, { status: 400 });
    }

    const roomId = getCanonicalRoomSlug(rawRoomId);

    await prisma.roomPresence.updateMany({
      where: { roomId, userId },
      data: { connected: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
